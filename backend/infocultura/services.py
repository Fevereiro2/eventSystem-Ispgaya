from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone as dt_timezone
from functools import lru_cache
import json
from urllib.parse import quote

from django.conf import settings
from django.core.cache import cache
from django.core.mail import send_mail
from django.db import connection, transaction
from django.db.models import Q
from django.utils import timezone

from .models import (
    AppUser,
    Book,
    Club,
    Event,
    EventRegistration,
    News,
    Registration,
    RegistrationStatus,
    Session,
    SessionRegistration,
)


class ClubRegistrationError(Exception):
    """Base service error for public club registrations."""


class DuplicateClubRegistrationError(ClubRegistrationError):
    """Raised when the same email is already registered for the same club."""


class ClubRegistrationRateLimitError(ClubRegistrationError):
    """Raised when the registration endpoint is being hit too often."""


class ClubRegistrationNotFoundError(ClubRegistrationError):
    """Raised when an admin-facing registration cannot be found in scope."""


class ActivityRegistrationError(Exception):
    """Base service error for event/session registrations."""


class DuplicateActivityRegistrationError(ActivityRegistrationError):
    """Raised when the same email is already registered for the same activity."""


class ActivityRegistrationRateLimitError(ActivityRegistrationError):
    """Raised when the registration endpoint is being hit too often."""


@dataclass(frozen=True, slots=True)
class ClubRegistrationInput:
    name: str
    email: str
    phone: str | None = None
    message: str | None = None


@dataclass(frozen=True, slots=True)
class AdminClubRegistrationRecord:
    registration_id: int
    club_id: int
    club_name: str
    name: str
    email: str
    phone: str | None
    message: str | None
    status: str
    created_at: datetime | None


@dataclass(frozen=True, slots=True)
class AdminClubRegistrationPage:
    items: list[AdminClubRegistrationRecord]
    total: int
    page: int
    page_size: int
    total_pages: int


@dataclass(frozen=True, slots=True)
class AdminDashboardRecord:
    id: int
    title: str
    club_name: str | None
    date: datetime | None
    status: str | None = None


@dataclass(frozen=True, slots=True)
class EditorialHistoryRecord:
    content_type: str
    object_id: int
    from_status: str | None
    to_status: str
    actor_user_id: int | None
    actor_name: str
    created_at: datetime | None


@dataclass(frozen=True, slots=True)
class ActivityRegistrationSummary:
    confirmed_count: int
    waitlist_count: int
    remaining_slots: int | None
    registration_state: str


@dataclass(frozen=True, slots=True)
class AdminNotificationRecord:
    id: str
    kind: str
    level: str
    title: str
    message: str
    href: str
    created_at: datetime | None


@dataclass(frozen=True, slots=True)
class AdminAuditLogRecord:
    id: int
    action: str
    content_type: str
    object_id: int | None
    summary: str
    actor_user_id: int | None
    actor_name: str
    club_id: int | None
    metadata_json: str | None
    created_at: datetime | None


_ACTIVITY_SQL_TARGETS = {
    "event": ("event_registrations", "id_event"),
    "session": ("session_registrations", "id_sessions"),
}


def _normalized_email(value: str) -> str:
    return value.strip().lower()


def _clean_status(value: str | None) -> str:
    return (value or "").strip().lower()


def _format_dt(value: datetime | None) -> str:
    if value is None:
        return "Data por definir"

    localized = timezone.localtime(value) if timezone.is_aware(value) else value
    return localized.strftime("%d/%m/%Y %H:%M")


def _build_google_calendar_url(*, title: str, description: str, start_date: datetime, end_date: datetime, location: str) -> str:
    def normalize_calendar_dt(value: datetime) -> str:
        aware_value = timezone.make_aware(value, timezone.get_current_timezone()) if timezone.is_naive(value) else value
        return timezone.localtime(aware_value, dt_timezone.utc).strftime("%Y%m%dT%H%M%SZ")

    query = (
        f"action=TEMPLATE&text={quote(title)}"
        f"&dates={normalize_calendar_dt(start_date)}/{normalize_calendar_dt(end_date)}"
        f"&details={quote(description)}"
        f"&location={quote(location)}"
    )
    return f"https://calendar.google.com/calendar/render?{query}"


def _build_outlook_calendar_url(*, title: str, description: str, start_date: datetime, end_date: datetime, location: str) -> str:
    def normalize_outlook_dt(value: datetime) -> str:
        aware_value = timezone.make_aware(value, timezone.get_current_timezone()) if timezone.is_naive(value) else value
        return timezone.localtime(aware_value, dt_timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    query = (
        f"path=/calendar/action/compose&rru=addevent"
        f"&subject={quote(title)}"
        f"&startdt={quote(normalize_outlook_dt(start_date))}"
        f"&enddt={quote(normalize_outlook_dt(end_date))}"
        f"&body={quote(description)}"
        f"&location={quote(location)}"
    )
    return f"https://outlook.office.com/calendar/0/deeplink/compose?{query}"


def _build_calendar_links(*, title: str, description: str, start_date: datetime, end_date: datetime, location: str) -> dict[str, str]:
    return {
        "google_url": _build_google_calendar_url(
            title=title,
            description=description,
            start_date=start_date,
            end_date=end_date,
            location=location,
        ),
        "outlook_url": _build_outlook_calendar_url(
            title=title,
            description=description,
            start_date=start_date,
            end_date=end_date,
            location=location,
        ),
    }


def _get_club_recipient_emails(*, club_id: int | None) -> list[str]:
    if club_id is None:
        return []

    return list(
        AppUser.objects.filter(club_id=club_id, is_active=True)
        .exclude(email__isnull=True)
        .exclude(email__exact="")
        .values_list("email", flat=True)
        .distinct()
    )


def _send_mail_message(*, subject: str, body: str, recipient_list: list[str]) -> None:
    if not recipient_list:
        return

    send_mail(
        subject=subject,
        message=body,
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@ispgaya.pt"),
        recipient_list=recipient_list,
        fail_silently=True,
    )


def _get_allowed_club_id(user) -> int | None:
    role_name = getattr(getattr(user, "role", None), "name", None)
    if role_name == "club_admin":
        return user.club_id
    return None


@lru_cache(maxsize=32)
def _table_exists(table_name: str) -> bool:
    with connection.cursor() as cursor:
        return table_name in connection.introspection.table_names(cursor)


def _registration_rate_limit_key(*, club_id: int, client_ip: str) -> str:
    return f"infocultura:club_registration:{club_id}:{client_ip}"


def enforce_club_registration_rate_limit(*, club_id: int, client_ip: str | None) -> None:
    if not client_ip:
        return

    key = _registration_rate_limit_key(club_id=club_id, client_ip=client_ip)
    max_attempts = 3
    window_seconds = 15 * 60

    added = cache.add(key, 1, timeout=window_seconds)
    if added:
        return

    current_attempts = cache.get(key, 0)
    if current_attempts >= max_attempts:
        raise ClubRegistrationRateLimitError(
            "Demasiadas tentativas de inscricao. Tenta novamente dentro de alguns minutos."
        )

    try:
        cache.incr(key)
    except ValueError:
        cache.set(key, current_attempts + 1, timeout=window_seconds)


def _activity_registration_rate_limit_key(*, activity_type: str, activity_id: int, client_ip: str) -> str:
    return f"infocultura:{activity_type}_registration:{activity_id}:{client_ip}"


def enforce_activity_registration_rate_limit(
    *,
    activity_type: str,
    activity_id: int,
    client_ip: str | None,
) -> None:
    if not client_ip:
        return

    key = _activity_registration_rate_limit_key(
        activity_type=activity_type,
        activity_id=activity_id,
        client_ip=client_ip,
    )
    max_attempts = 3
    window_seconds = 15 * 60

    added = cache.add(key, 1, timeout=window_seconds)
    if added:
        return

    current_attempts = cache.get(key, 0)
    if current_attempts >= max_attempts:
        raise ActivityRegistrationRateLimitError(
            "Demasiadas tentativas de inscricao. Tenta novamente dentro de alguns minutos."
        )

    try:
        cache.incr(key)
    except ValueError:
        cache.set(key, current_attempts + 1, timeout=window_seconds)


def club_registration_exists(*, club_id: int, email: str) -> bool:
    normalized_email = _normalized_email(email)

    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT 1
            FROM clubs_registrations AS cr
            INNER JOIN registrations AS r
              ON r.id_registrations = cr.id_registrations
            WHERE cr.id_clubs = %s
              AND LOWER(TRIM(r.email)) = %s
            LIMIT 1
            """,
            [club_id, normalized_email],
        )
        return cursor.fetchone() is not None


def _get_activity_sql_target(activity_kind: str) -> tuple[str, str]:
    try:
        return _ACTIVITY_SQL_TARGETS[activity_kind]
    except KeyError as error:
        raise ValueError("Invalid activity kind for SQL target.") from error


def _activity_registration_exists(*, activity_kind: str, activity_id: int, email: str) -> bool:
    table_name, foreign_key = _get_activity_sql_target(activity_kind)
    if not _table_exists(table_name):
        return False

    normalized_email = _normalized_email(email)

    with connection.cursor() as cursor:
        cursor.execute(
            f"""
            SELECT 1
            FROM {table_name} AS ar
            INNER JOIN registrations AS r
              ON r.id_registrations = ar.id_registrations
            WHERE ar.{foreign_key} = %s
              AND LOWER(TRIM(r.email)) = %s
            LIMIT 1
            """,
            [activity_id, normalized_email],
        )
        return cursor.fetchone() is not None


def event_registration_exists(*, event_id: int, email: str) -> bool:
    return _activity_registration_exists(
        activity_kind="event",
        activity_id=event_id,
        email=email,
    )


def session_registration_exists(*, session_id: int, email: str) -> bool:
    return _activity_registration_exists(
        activity_kind="session",
        activity_id=session_id,
        email=email,
    )


def _normalize_capacity(value: int | None) -> int | None:
    if value is None:
        return None
    return max(0, int(value))


def _build_activity_registration_summary(
    *,
    activity_kind: str,
    activity_id: int,
    capacity: int | None,
    registrations_enabled: bool,
    is_open_by_date: bool,
) -> ActivityRegistrationSummary:
    table_name, foreign_key = _get_activity_sql_target(activity_kind)
    confirmed_count = 0
    waitlist_count = 0

    if not _table_exists(table_name):
        return ActivityRegistrationSummary(
            confirmed_count=0,
            waitlist_count=0,
            remaining_slots=None if capacity is None else max(0, _normalize_capacity(capacity) or 0),
            registration_state="closed" if not registrations_enabled or not is_open_by_date else "open",
        )

    with connection.cursor() as cursor:
        cursor.execute(
            f"""
            SELECT LOWER(COALESCE(rs.name, r.status)) AS resolved_status, COUNT(*)
            FROM {table_name} AS ar
            INNER JOIN registrations AS r
              ON r.id_registrations = ar.id_registrations
            LEFT JOIN rstatus AS rs
              ON rs.id_rstatus = r.id_rstatus
            WHERE ar.{foreign_key} = %s
            GROUP BY LOWER(COALESCE(rs.name, r.status))
            """,
            [activity_id],
        )
        rows = cursor.fetchall()

    for status_name, count in rows:
        normalized_status = _clean_status(status_name)
        if normalized_status in {"confirmed", "approved"}:
            confirmed_count += int(count)
        elif normalized_status == "waitlist":
            waitlist_count += int(count)

    normalized_capacity = _normalize_capacity(capacity)
    remaining_slots = None if normalized_capacity is None else max(0, normalized_capacity - confirmed_count)

    if not registrations_enabled or not is_open_by_date:
        registration_state = "closed"
    elif normalized_capacity is not None and confirmed_count >= normalized_capacity:
        registration_state = "waitlist"
    else:
        registration_state = "open"

    return ActivityRegistrationSummary(
        confirmed_count=confirmed_count,
        waitlist_count=waitlist_count,
        remaining_slots=remaining_slots,
        registration_state=registration_state,
    )


def get_event_registration_summary(*, event: Event) -> ActivityRegistrationSummary:
    return _build_activity_registration_summary(
        activity_kind="event",
        activity_id=event.id,
        capacity=event.registration_capacity,
        registrations_enabled=bool(event.enable_registrations),
        is_open_by_date=event.end_date >= timezone.now(),
    )


def get_session_registration_summary(*, session: Session) -> ActivityRegistrationSummary:
    return _build_activity_registration_summary(
        activity_kind="session",
        activity_id=session.id,
        capacity=session.registration_capacity,
        registrations_enabled=bool(session.enable_registrations),
        is_open_by_date=session.end_date >= timezone.now(),
    )


def create_club_registration(
    *,
    club: Club,
    payload: ClubRegistrationInput,
    client_ip: str | None = None,
) -> Registration:
    enforce_club_registration_rate_limit(club_id=club.id, client_ip=client_ip)

    if club_registration_exists(club_id=club.id, email=payload.email):
        raise DuplicateClubRegistrationError(
            "Ja existe uma inscricao submetida com este email para este clube."
        )

    with transaction.atomic():
        registration = Registration.objects.create(
            name=payload.name.strip(),
            email=payload.email.strip(),
            phone=(payload.phone or "").strip() or None,
            message=(payload.message or "").strip() or None,
            status="pending",
            created_at=timezone.now(),
        )

        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO clubs_registrations (id_clubs, id_registrations)
                VALUES (%s, %s)
                """,
                [club.id, registration.id],
            )

    notify_new_club_registration(club=club, registration=registration)

    return registration


def _build_activity_registration_subject(*, label: str, activity_title: str, status: str) -> str:
    if status == "waitlist":
        return f"Lista de espera na {label} {activity_title}"
    return f"Inscricao confirmada na {label} {activity_title}"


def _build_activity_registration_body(
    *,
    attendee_name: str,
    label: str,
    activity_title: str,
    club_name: str,
    location: str,
    start_date: datetime,
    status: str,
) -> str:
    if status == "waitlist":
        decision_line = "A tua inscricao ficou em lista de espera."
    else:
        decision_line = "A tua inscricao foi confirmada automaticamente."

    lines = [
        f"Ola {attendee_name},",
        "",
        decision_line,
        f"{label}: {activity_title}",
        f"Clube: {club_name}",
        f"Data: {_format_dt(start_date)}",
        f"Local: {location or 'Local por definir'}",
        "",
        "Obrigado pelo teu interesse.",
        "InfoCultura",
    ]
    return "\n".join(lines)


def _build_admin_registration_notification_body(
    *,
    attendee_name: str,
    attendee_email: str,
    phone: str | None,
    message: str | None,
    scope_label: str,
) -> str:
    lines = [
        "Foi recebida uma nova inscricao.",
        "",
        f"Destino: {scope_label}",
        f"Nome: {attendee_name}",
        f"Email: {attendee_email}",
        f"Telefone: {phone or 'Sem telefone'}",
        f"Mensagem: {message or 'Sem mensagem adicional'}",
        "",
        "InfoCultura",
    ]
    return "\n".join(lines)


def notify_new_club_registration(*, club: Club, registration: Registration) -> None:
    recipients = _get_club_recipient_emails(club_id=club.id)
    _send_mail_message(
        subject=f"Nova inscricao no clube {club.name}",
        body=_build_admin_registration_notification_body(
            attendee_name=registration.name,
            attendee_email=registration.email,
            phone=registration.phone,
            message=registration.message,
            scope_label=club.name,
        ),
        recipient_list=recipients,
    )


def notify_new_activity_registration(
    *,
    club_id: int | None,
    activity_label: str,
    activity_title: str,
    registration: Registration,
) -> None:
    recipients = _get_club_recipient_emails(club_id=club_id)
    _send_mail_message(
        subject=f"Nova inscricao em {activity_label.lower()}: {activity_title}",
        body=_build_admin_registration_notification_body(
            attendee_name=registration.name,
            attendee_email=registration.email,
            phone=registration.phone,
            message=registration.message,
            scope_label=f"{activity_label} {activity_title}",
        ),
        recipient_list=recipients,
    )


def send_activity_registration_email(
    *,
    recipient_email: str,
    attendee_name: str,
    label: str,
    activity_title: str,
    club_name: str,
    location: str,
    start_date: datetime,
    status: str,
) -> None:
    _send_mail_message(
        subject=_build_activity_registration_subject(
            label=label,
            activity_title=activity_title,
            status=status,
        ),
        body=_build_activity_registration_body(
            attendee_name=attendee_name,
            label=label,
            activity_title=activity_title,
            club_name=club_name,
            location=location,
            start_date=start_date,
            status=status,
        ),
        recipient_list=[recipient_email],
    )


def _create_activity_registration(
    *,
    activity_type: str,
    activity_id: int,
    activity_label: str,
    activity_title: str,
    club_id: int | None,
    club_name: str,
    location: str,
    start_date: datetime,
    registrations_enabled: bool,
    registration_capacity: int | None,
    is_open_by_date: bool,
    payload: ClubRegistrationInput,
    client_ip: str | None,
    exists_fn,
    summary_fn,
    link_model,
    link_field: str,
) -> Registration:
    if not _table_exists(link_model._meta.db_table):
        raise ActivityRegistrationError(
            "As inscricoes para esta atividade ainda nao estao disponiveis na base de dados."
        )

    if not registrations_enabled or not is_open_by_date:
        raise ActivityRegistrationError("As inscricoes para esta atividade estao encerradas.")

    enforce_activity_registration_rate_limit(
        activity_type=activity_type,
        activity_id=activity_id,
        client_ip=client_ip,
    )

    if exists_fn(activity_id=activity_id, email=payload.email):
        raise DuplicateActivityRegistrationError(
            "Ja existe uma inscricao submetida com este email para esta atividade."
        )

    summary = summary_fn()
    registration_status = "confirmed"
    normalized_capacity = _normalize_capacity(registration_capacity)
    if normalized_capacity is not None and summary.confirmed_count >= normalized_capacity:
        registration_status = "waitlist"

    with transaction.atomic():
        registration = Registration.objects.create(
            name=payload.name.strip(),
            email=payload.email.strip(),
            phone=(payload.phone or "").strip() or None,
            message=(payload.message or "").strip() or None,
            status=registration_status,
            created_at=timezone.now(),
        )

        link_model.objects.create(
            **{
                link_field: activity_id,
                "registration": registration,
                "created_at": timezone.now(),
            }
        )

    send_activity_registration_email(
        recipient_email=registration.email,
        attendee_name=registration.name,
        label=activity_label,
        activity_title=activity_title,
        club_name=club_name,
        location=location,
        start_date=start_date,
        status=registration_status,
    )
    notify_new_activity_registration(
        club_id=club_id,
        activity_label=activity_label,
        activity_title=activity_title,
        registration=registration,
    )
    return registration


def create_event_registration(
    *,
    event: Event,
    payload: ClubRegistrationInput,
    client_ip: str | None = None,
) -> Registration:
    return _create_activity_registration(
        activity_type="event",
        activity_id=event.id,
        activity_label="Evento",
        activity_title=event.title,
        club_id=event.club_id,
        club_name=event.club_name or "Clube sem nome",
        location=event.location or event.city or "Local por definir",
        start_date=event.start_date,
        registrations_enabled=bool(event.enable_registrations),
        registration_capacity=event.registration_capacity,
        is_open_by_date=event.end_date >= timezone.now(),
        payload=payload,
        client_ip=client_ip,
        exists_fn=lambda activity_id, email: event_registration_exists(event_id=activity_id, email=email),
        summary_fn=lambda: get_event_registration_summary(event=event),
        link_model=EventRegistration,
        link_field="event_id",
    )


def create_session_registration(
    *,
    session: Session,
    payload: ClubRegistrationInput,
    client_ip: str | None = None,
) -> Registration:
    return _create_activity_registration(
        activity_type="session",
        activity_id=session.id,
        activity_label="Sessao",
        activity_title=session.title,
        club_id=session.club_id,
        club_name=session.club.name if session.club_id and session.club else "Clube sem nome",
        location=session.title,
        start_date=session.start_date,
        registrations_enabled=bool(session.enable_registrations),
        registration_capacity=session.registration_capacity,
        is_open_by_date=session.end_date >= timezone.now(),
        payload=payload,
        client_ip=client_ip,
        exists_fn=lambda activity_id, email: session_registration_exists(session_id=activity_id, email=email),
        summary_fn=lambda: get_session_registration_summary(session=session),
        link_model=SessionRegistration,
        link_field="session_id",
    )


def _build_admin_registration_filters(
    *,
    club_id: int | None,
    status: str | None,
    search: str | None,
    date_from: str | None = None,
    date_to: str | None = None,
    allowed_club_id: int | None,
) -> tuple[str, list[object]]:
    clauses: list[str] = []
    params: list[object] = []

    if allowed_club_id is not None:
        clauses.append("c.id_clubs = %s")
        params.append(allowed_club_id)

    if club_id is not None:
        clauses.append("c.id_clubs = %s")
        params.append(club_id)

    if status:
        clauses.append("LOWER(COALESCE(rs.name, r.status)) = %s")
        params.append(status.strip().lower())

    if search:
        search_term = f"%{search.strip().lower()}%"
        clauses.append("(LOWER(r.name) LIKE %s OR LOWER(r.email) LIKE %s)")
        params.extend([search_term, search_term])

    if date_from:
        clauses.append("DATE(r.created_at) >= %s")
        params.append(date_from)

    if date_to:
        clauses.append("DATE(r.created_at) <= %s")
        params.append(date_to)

    if not clauses:
        return "", params

    return "WHERE " + " AND ".join(clauses), params


def _row_to_admin_record(row: tuple[object, ...]) -> AdminClubRegistrationRecord:
    return AdminClubRegistrationRecord(
        registration_id=int(row[0]),
        club_id=int(row[1]),
        club_name=str(row[2]),
        name=str(row[3]),
        email=str(row[4]),
        phone=str(row[5]) if row[5] is not None else None,
        message=str(row[6]) if row[6] is not None else None,
        status=str(row[7]),
        created_at=row[8],
    )


def _get_registration_ordering_clause(ordering: str | None) -> str:
    ordering_map = {
        "newest": "r.created_at DESC, r.id_registrations DESC",
        "oldest": "r.created_at ASC, r.id_registrations ASC",
        "name_asc": "r.name ASC, r.id_registrations DESC",
        "name_desc": "r.name DESC, r.id_registrations DESC",
        "email_asc": "r.email ASC, r.id_registrations DESC",
        "email_desc": "r.email DESC, r.id_registrations DESC",
        "club_asc": "c.name ASC, r.id_registrations DESC",
        "club_desc": "c.name DESC, r.id_registrations DESC",
        "status_asc": "resolved_status ASC, r.id_registrations DESC",
        "status_desc": "resolved_status DESC, r.id_registrations DESC",
    }
    return ordering_map.get((ordering or "").strip().lower(), ordering_map["newest"])


def list_admin_club_registrations(
    *,
    club_id: int | None = None,
    status: str | None = None,
    search: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    allowed_club_id: int | None = None,
    page: int = 1,
    page_size: int = 10,
    ordering: str | None = None,
    export_all: bool = False,
) -> AdminClubRegistrationPage:
    normalized_page = max(1, page)
    normalized_page_size = None if export_all else min(max(1, page_size), 100)
    where_clause, params = _build_admin_registration_filters(
        club_id=club_id,
        status=status,
        search=search,
        date_from=date_from,
        date_to=date_to,
        allowed_club_id=allowed_club_id,
    )
    ordering_clause = _get_registration_ordering_clause(ordering)

    with connection.cursor() as cursor:
        cursor.execute(
            f"""
            SELECT COUNT(*)
            FROM registrations AS r
            INNER JOIN clubs_registrations AS cr
              ON cr.id_registrations = r.id_registrations
            INNER JOIN clubs AS c
              ON c.id_clubs = cr.id_clubs
            LEFT JOIN rstatus AS rs
              ON rs.id_rstatus = r.id_rstatus
            {where_clause}
            """,
            params,
        )
        total = int(cursor.fetchone()[0])

        base_query = f"""
            SELECT
                r.id_registrations,
                c.id_clubs,
                c.name,
                r.name,
                r.email,
                r.phone,
                r.message,
                COALESCE(rs.name, r.status) AS resolved_status,
                r.created_at
            FROM registrations AS r
            INNER JOIN clubs_registrations AS cr
              ON cr.id_registrations = r.id_registrations
            INNER JOIN clubs AS c
              ON c.id_clubs = cr.id_clubs
            LEFT JOIN rstatus AS rs
              ON rs.id_rstatus = r.id_rstatus
            {where_clause}
            ORDER BY {ordering_clause}
        """

        if export_all:
            cursor.execute(base_query, params)
        else:
            offset = (normalized_page - 1) * normalized_page_size
            cursor.execute(
                f"{base_query}\nLIMIT %s OFFSET %s",
                [*params, normalized_page_size, offset],
            )
        rows = cursor.fetchall()

    if export_all:
        total_pages = 1 if total else 0
        resolved_page_size = total
    else:
        total_pages = (total + normalized_page_size - 1) // normalized_page_size if total else 0
        resolved_page_size = normalized_page_size

    return AdminClubRegistrationPage(
        items=[_row_to_admin_record(row) for row in rows],
        total=total,
        page=normalized_page,
        page_size=resolved_page_size,
        total_pages=total_pages,
    )


def get_admin_club_registration(
    *,
    registration_id: int,
    allowed_club_id: int | None = None,
) -> AdminClubRegistrationRecord | None:
    where_clause, params = _build_admin_registration_filters(
        club_id=None,
        status=None,
        search=None,
        date_from=None,
        date_to=None,
        allowed_club_id=allowed_club_id,
    )
    clauses = [where_clause.replace("WHERE ", "", 1)] if where_clause else []
    clauses.append("r.id_registrations = %s")
    params.append(registration_id)
    final_where = "WHERE " + " AND ".join(filter(None, clauses))

    with connection.cursor() as cursor:
        cursor.execute(
            f"""
            SELECT
                r.id_registrations,
                c.id_clubs,
                c.name,
                r.name,
                r.email,
                r.phone,
                r.message,
                COALESCE(rs.name, r.status) AS resolved_status,
                r.created_at
            FROM registrations AS r
            INNER JOIN clubs_registrations AS cr
              ON cr.id_registrations = r.id_registrations
            INNER JOIN clubs AS c
              ON c.id_clubs = cr.id_clubs
            LEFT JOIN rstatus AS rs
              ON rs.id_rstatus = r.id_rstatus
            {final_where}
            ORDER BY c.id_clubs ASC
            LIMIT 1
            """,
            params,
        )
        row = cursor.fetchone()

    return _row_to_admin_record(row) if row else None


def _build_registration_status_email_subject(status: str, club_name: str) -> str:
    if status == "approved":
        return f"Inscricao aprovada no clube {club_name}"
    if status == "rejected":
        return f"Inscricao rejeitada no clube {club_name}"
    return f"Atualizacao da inscricao no clube {club_name}"


def _build_registration_status_email_body(record: AdminClubRegistrationRecord) -> str:
    if record.status == "approved":
        decision_line = "A tua inscricao foi aprovada."
    elif record.status == "rejected":
        decision_line = "A tua inscricao foi rejeitada."
    else:
        decision_line = f"O estado da tua inscricao foi atualizado para {record.status}."

    return (
        f"Ola {record.name},\n\n"
        f"{decision_line}\n"
        f"Clube: {record.club_name}\n"
        f"Estado atual: {record.status}\n\n"
        "Obrigado pelo teu interesse.\n"
        "InfoCultura"
    )


def send_registration_status_email(record: AdminClubRegistrationRecord) -> None:
    if record.status not in {"approved", "rejected"}:
        return

    _send_mail_message(
        subject=_build_registration_status_email_subject(record.status, record.club_name),
        body=_build_registration_status_email_body(record),
        recipient_list=[record.email],
    )


def build_activity_calendar_payload(
    *,
    title: str,
    description: str,
    start_date: datetime,
    end_date: datetime,
    location: str,
) -> dict[str, str]:
    description_text = description.strip() or "Atividade InfoCultura"
    location_text = location.strip() or "Local por definir"
    links = _build_calendar_links(
        title=title,
        description=description_text,
        start_date=start_date,
        end_date=end_date,
        location=location_text,
    )
    return {
        "title": title,
        "description": description_text,
        "location": location_text,
        "google_url": links["google_url"],
        "outlook_url": links["outlook_url"],
    }


def notify_news_workflow_status(*, news: News, previous_status: str | None, next_status: str | None) -> None:
    normalized_status = _clean_status(next_status)
    if normalized_status not in {"published", "archived"}:
        return

    recipients = _get_club_recipient_emails(club_id=news.club_id)
    if not recipients:
        return

    action_label = "aprovada e publicada" if normalized_status == "published" else "arquivada"
    previous_label = previous_status or "sem estado anterior"
    body = (
        f'A noticia "{news.title}" foi {action_label}.\n\n'
        f"Clube: {news.club.name if news.club_id and news.club else 'Sem clube'}\n"
        f"Estado anterior: {previous_label}\n"
        f"Estado atual: {next_status or normalized_status}\n\n"
        "InfoCultura"
    )
    _send_mail_message(
        subject=f"Atualizacao editorial da noticia: {news.title}",
        body=body,
        recipient_list=recipients,
    )


def notify_event_workflow_status(*, event: Event, previous_status: str | None, next_status: str | None) -> None:
    normalized_status = _clean_status(next_status)
    if normalized_status != "published":
        return

    recipients = _get_club_recipient_emails(club_id=event.club_id)
    if not recipients:
        return

    body = (
        f'O evento "{event.title}" foi publicado.\n\n'
        f"Clube: {event.club_name or 'Sem clube'}\n"
        f"Estado anterior: {previous_status or 'sem estado anterior'}\n"
        f"Inicio: {_format_dt(event.start_date)}\n"
        f"Local: {event.location or event.city or 'Local por definir'}\n\n"
        "InfoCultura"
    )
    _send_mail_message(
        subject=f"Evento publicado: {event.title}",
        body=body,
        recipient_list=recipients,
    )


def _build_upcoming_activity_reminder_body(
    *,
    attendee_name: str,
    label: str,
    title: str,
    club_name: str,
    start_date: datetime,
    location: str,
) -> str:
    return (
        f"Ola {attendee_name},\n\n"
        f"Lembrete: a tua inscricao em {label.lower()} esta prestes a decorrer.\n"
        f"{label}: {title}\n"
        f"Clube: {club_name}\n"
        f"Inicio: {_format_dt(start_date)}\n"
        f"Local: {location or 'Local por definir'}\n\n"
        "InfoCultura"
    )


def send_upcoming_activity_reminders(*, hours_ahead: int = 24, include_sessions: bool = True) -> dict[str, int]:
    now = timezone.now()
    window_end = now + timedelta(hours=max(1, hours_ahead))
    sent_events = 0
    sent_sessions = 0

    if not _table_exists("event_registrations"):
        return {
            "events": 0,
            "sessions": 0,
        }

    event_links = (
        EventRegistration.objects.select_related("event__user__club", "registration")
        .filter(
            reminder_sent_at__isnull=True,
            event__start_date__gte=now,
            event__start_date__lte=window_end,
            registration__status__iexact="confirmed",
        )
    )
    for link in event_links:
        event = link.event
        registration = link.registration
        _send_mail_message(
            subject=f"Lembrete do evento {event.title}",
            body=_build_upcoming_activity_reminder_body(
                attendee_name=registration.name,
                label="Evento",
                title=event.title,
                club_name=event.club_name or "Clube sem nome",
                start_date=event.start_date,
                location=event.location or event.city or "Local por definir",
            ),
            recipient_list=[registration.email],
        )
        link.reminder_sent_at = timezone.now()
        link.save(update_fields=["reminder_sent_at"])
        sent_events += 1

    if include_sessions and _table_exists("session_registrations"):
        session_links = (
            SessionRegistration.objects.select_related("session__club", "registration")
            .filter(
                reminder_sent_at__isnull=True,
                session__start_date__gte=now,
                session__start_date__lte=window_end,
                registration__status__iexact="confirmed",
            )
        )
        for link in session_links:
            session = link.session
            registration = link.registration
            _send_mail_message(
                subject=f"Lembrete da sessao {session.title}",
                body=_build_upcoming_activity_reminder_body(
                    attendee_name=registration.name,
                    label="Sessao",
                    title=session.title,
                    club_name=session.club.name if session.club_id and session.club else "Clube sem nome",
                    start_date=session.start_date,
                    location=session.title,
                ),
                recipient_list=[registration.email],
            )
            link.reminder_sent_at = timezone.now()
            link.save(update_fields=["reminder_sent_at"])
            sent_sessions += 1

    return {
        "events": sent_events,
        "sessions": sent_sessions,
    }


def list_editorial_history(*, content_type: str, object_id: int, limit: int = 10) -> list[EditorialHistoryRecord]:
    if not _table_exists("editorial_actions"):
        return []

    normalized_limit = min(max(1, limit), 50)
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT
                content_type,
                object_id,
                from_status,
                to_status,
                actor_user_id,
                actor_name,
                created_at
            FROM editorial_actions
            WHERE content_type = %s
              AND object_id = %s
            ORDER BY created_at DESC, id DESC
            LIMIT %s
            """,
            [content_type.strip().lower(), object_id, normalized_limit],
        )
        rows = cursor.fetchall()

    return [
        EditorialHistoryRecord(
            content_type=str(row[0]),
            object_id=int(row[1]),
            from_status=str(row[2]) if row[2] is not None else None,
            to_status=str(row[3]),
            actor_user_id=int(row[4]) if row[4] is not None else None,
            actor_name=str(row[5]) if row[5] is not None else "Sistema",
            created_at=row[6],
        )
        for row in rows
    ]


def record_editorial_action(
    *,
    content_type: str,
    object_id: int,
    from_status: str | None,
    to_status: str,
    actor_user,
    club_id: int | None = None,
) -> None:
    if not _table_exists("editorial_actions"):
        return

    actor_name = getattr(actor_user, "name", None) or getattr(actor_user, "email", None) or "Sistema"
    actor_user_id = getattr(actor_user, "id", None)
    resolved_club_id = club_id if club_id is not None else getattr(actor_user, "club_id", None)

    with connection.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO editorial_actions (
                content_type,
                object_id,
                from_status,
                to_status,
                actor_user_id,
                actor_name,
                club_id,
                created_at
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            [
                content_type.strip().lower(),
                object_id,
                from_status,
                to_status,
                actor_user_id,
                actor_name,
                resolved_club_id,
                timezone.now(),
            ],
        )


def record_admin_audit_action(
    *,
    action: str,
    content_type: str,
    summary: str,
    actor_user,
    object_id: int | None = None,
    club_id: int | None = None,
    metadata: dict[str, object] | None = None,
) -> None:
    if not _table_exists("admin_audit_logs"):
        return

    actor_name = getattr(actor_user, "name", None) or getattr(actor_user, "email", None) or "Sistema"
    actor_user_id = getattr(actor_user, "id", None)
    resolved_club_id = club_id if club_id is not None else getattr(actor_user, "club_id", None)
    serialized_metadata = json.dumps(metadata, ensure_ascii=True, sort_keys=True) if metadata else None

    with connection.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO admin_audit_logs (
                action,
                content_type,
                object_id,
                summary,
                actor_user_id,
                actor_name,
                club_id,
                metadata_json,
                created_at
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            [
                action.strip().lower(),
                content_type.strip().lower(),
                object_id,
                summary.strip(),
                actor_user_id,
                actor_name,
                resolved_club_id,
                serialized_metadata,
                timezone.now(),
            ],
        )


def list_admin_audit_logs(*, limit: int = 50) -> list[AdminAuditLogRecord]:
    if not _table_exists("admin_audit_logs"):
        return []

    normalized_limit = min(max(1, limit), 200)
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT
                id,
                action,
                content_type,
                object_id,
                summary,
                actor_user_id,
                actor_name,
                club_id,
                metadata_json,
                created_at
            FROM admin_audit_logs
            ORDER BY created_at DESC, id DESC
            LIMIT %s
            """,
            [normalized_limit],
        )
        rows = cursor.fetchall()

    return [
        AdminAuditLogRecord(
            id=int(row[0]),
            action=str(row[1]),
            content_type=str(row[2]),
            object_id=int(row[3]) if row[3] is not None else None,
            summary=str(row[4]),
            actor_user_id=int(row[5]) if row[5] is not None else None,
            actor_name=str(row[6]),
            club_id=int(row[7]) if row[7] is not None else None,
            metadata_json=str(row[8]) if row[8] is not None else None,
            created_at=row[9],
        )
        for row in rows
    ]


def _get_registration_status_counts(*, allowed_club_id: int | None) -> dict[str, int]:
    params: list[object] = []
    where_clause = ""

    if allowed_club_id is not None:
        where_clause = "WHERE c.id_clubs = %s"
        params.append(allowed_club_id)

    with connection.cursor() as cursor:
        cursor.execute(
            f"""
            SELECT LOWER(COALESCE(rs.name, r.status)) AS resolved_status, COUNT(*)
            FROM registrations AS r
            INNER JOIN clubs_registrations AS cr
              ON cr.id_registrations = r.id_registrations
            INNER JOIN clubs AS c
              ON c.id_clubs = cr.id_clubs
            LEFT JOIN rstatus AS rs
              ON rs.id_rstatus = r.id_rstatus
            {where_clause}
            GROUP BY LOWER(COALESCE(rs.name, r.status))
            """,
            params,
        )
        rows = cursor.fetchall()

    return {str(status or "").strip().lower(): int(count) for status, count in rows}


def _to_dashboard_record(instance, *, club_name: str | None, date, status: str | None = None) -> dict[str, object | None]:
    return {
        "id": instance.id,
        "title": instance.title,
        "club_name": club_name,
        "date": date,
        "status": status,
    }


def get_admin_dashboard_metrics(*, user) -> dict[str, object]:
    allowed_club_id = _get_allowed_club_id(user)
    now = timezone.now()

    users_queryset = AppUser.objects.select_related("club")
    if allowed_club_id is not None:
        users_queryset = users_queryset.filter(club_id=allowed_club_id)

    clubs_queryset = Club.objects.all()
    if allowed_club_id is not None:
        clubs_queryset = clubs_queryset.filter(id=allowed_club_id)

    news_queryset = News.objects.select_related("news_status", "club")
    if allowed_club_id is not None:
        news_queryset = news_queryset.filter(club_id=allowed_club_id)

    books_queryset = Book.objects.select_related("club")
    if allowed_club_id is not None:
        books_queryset = books_queryset.filter(club_id=allowed_club_id)

    sessions_queryset = Session.objects.select_related("club")
    if allowed_club_id is not None:
        sessions_queryset = sessions_queryset.filter(club_id=allowed_club_id)

    events_queryset = Event.objects.select_related("user__club").prefetch_related("categories")
    if allowed_club_id is not None:
        events_queryset = events_queryset.filter(user__club_id=allowed_club_id)

    registration_status_counts = _get_registration_status_counts(allowed_club_id=allowed_club_id)
    latest_news = news_queryset.order_by("-published_at", "-created_at", "-id").first()
    next_session = sessions_queryset.filter(start_date__gte=now).order_by("start_date", "id").first()
    next_event = (
        events_queryset.filter(start_date__gte=now)
        .order_by("start_date", "id")
        .first()
    )

    scope_label = "Todos os clubes"
    if allowed_club_id is not None:
        scope_label = getattr(getattr(user, "club", None), "name", None) or "Clube associado"

    return {
        "scope_label": scope_label,
        "users_total": users_queryset.count(),
        "active_users": users_queryset.filter(is_active=True).count(),
        "clubs_total": clubs_queryset.count(),
        "active_clubs": clubs_queryset.filter(is_active=True).count(),
        "clubs_with_registrations_open": clubs_queryset.filter(enable_registrations=True).count(),
        "news_total": news_queryset.count(),
        "news_draft": news_queryset.filter(news_status__name__iexact="draft").count(),
        "news_review": news_queryset.filter(news_status__name__iexact="review").count(),
        "news_published": news_queryset.filter(news_status__name__iexact="published").count(),
        "books_total": books_queryset.count(),
        "featured_books": books_queryset.filter(is_featured=True).count(),
        "sessions_total": sessions_queryset.count(),
        "upcoming_sessions": sessions_queryset.filter(start_date__gte=now).count(),
        "events_total": events_queryset.count(),
        "events_draft": events_queryset.filter(
            Q(status__iexact="draft") | Q(status__iexact="rascunho")
        ).count(),
        "events_review": events_queryset.filter(status__iexact="review").count(),
        "events_published": events_queryset.filter(
            Q(status__iexact="published") | Q(status__iexact="publicado")
        ).count(),
        "registrations_total": sum(registration_status_counts.values()),
        "registrations_pending": registration_status_counts.get("pending", 0),
        "registrations_approved": registration_status_counts.get("approved", 0),
        "registrations_rejected": registration_status_counts.get("rejected", 0)
        + registration_status_counts.get("cancelled", 0),
        "latest_news": (
            _to_dashboard_record(
                latest_news,
                club_name=latest_news.club.name if latest_news and latest_news.club_id else None,
                date=latest_news.published_at or latest_news.created_at if latest_news else None,
                status=latest_news.news_status.name if latest_news else None,
            )
            if latest_news
            else None
        ),
        "next_session": (
            _to_dashboard_record(
                next_session,
                club_name=next_session.club.name if next_session and next_session.club_id else None,
                date=next_session.start_date if next_session else None,
            )
            if next_session
            else None
        ),
        "next_event": (
            _to_dashboard_record(
                next_event,
                club_name=next_event.user.club.name
                if next_event and next_event.user_id and next_event.user and next_event.user.club
                else None,
                date=next_event.start_date if next_event else None,
                status=next_event.status if next_event else None,
            )
            if next_event
            else None
        ),
    }


def _notification_timestamp(value: datetime | None) -> float:
    if value is None:
        return 0.0

    resolved = value
    if timezone.is_naive(resolved):
        resolved = timezone.make_aware(resolved, timezone.get_current_timezone())

    return resolved.timestamp()


def get_admin_notifications(*, user) -> list[AdminNotificationRecord]:
    role_name = getattr(getattr(user, "role", None), "name", None)
    if role_name == "club_admin" and not getattr(user, "club_id", None):
        return []

    allowed_club_id = _get_allowed_club_id(user)
    now = timezone.now()
    notifications: list[AdminNotificationRecord] = []

    pending_registrations = list_admin_club_registrations(
        status="pending",
        allowed_club_id=allowed_club_id,
        ordering="newest",
        page=1,
        page_size=4,
    )
    for registration in pending_registrations.items:
        notifications.append(
            AdminNotificationRecord(
                id=f"registration-pending-{registration.registration_id}",
                kind="registration",
                level="warning",
                title="Nova inscricao por validar",
                message=(
                    f"{registration.name} submeteu um pedido para "
                    f"{registration.club_name}."
                ),
                href="/infocultura/inscricoes",
                created_at=registration.created_at,
            )
        )

    news_queryset = News.objects.select_related("news_status", "club")
    if allowed_club_id is not None:
        news_queryset = news_queryset.filter(club_id=allowed_club_id)

    review_news = news_queryset.filter(news_status__name__iexact="review").order_by(
        "-updated_at",
        "-created_at",
        "-id",
    )[:4]
    for item in review_news:
        notifications.append(
            AdminNotificationRecord(
                id=f"news-review-{item.id}",
                kind="editorial",
                level="warning",
                title="Noticia em revisao",
                message=(
                    f"{item.title} aguarda validacao editorial"
                    f"{f' · {item.club.name}' if item.club_id else ''}."
                ),
                href="/infocultura/noticias",
                created_at=item.updated_at or item.created_at,
            )
        )

    recent_news = news_queryset.filter(news_status__name__iexact="published").order_by(
        "-published_at",
        "-created_at",
        "-id",
    )[:2]
    for item in recent_news:
        notifications.append(
            AdminNotificationRecord(
                id=f"news-published-{item.id}",
                kind="publication",
                level="success",
                title="Noticia publicada",
                message=(
                    f"{item.title} esta publicada"
                    f"{f' · {item.club.name}' if item.club_id else ''}."
                ),
                href="/infocultura/noticias",
                created_at=item.published_at or item.created_at,
            )
        )

    sessions_queryset = Session.objects.select_related("club").filter(start_date__gte=now)
    if allowed_club_id is not None:
        sessions_queryset = sessions_queryset.filter(club_id=allowed_club_id)

    next_session = sessions_queryset.order_by("start_date", "id").first()
    if next_session is not None:
        notifications.append(
            AdminNotificationRecord(
                id=f"session-upcoming-{next_session.id}",
                kind="schedule",
                level="info",
                title="Proxima sessao agendada",
                message=(
                    f"{next_session.title}"
                    f"{f' · {next_session.club.name}' if next_session.club_id else ''}"
                    f" em {_format_dt(next_session.start_date)}."
                ),
                href="/infocultura/atividades",
                created_at=next_session.start_date,
            )
        )

    events_queryset = Event.objects.select_related("user__club")
    if allowed_club_id is not None:
        events_queryset = events_queryset.filter(user__club_id=allowed_club_id)

    review_events = events_queryset.filter(status__iexact="review").order_by(
        "-updated_at",
        "-created_at",
        "-id",
    )[:4]
    for item in review_events:
        notifications.append(
            AdminNotificationRecord(
                id=f"event-review-{item.id}",
                kind="editorial",
                level="warning",
                title="Evento em revisao",
                message=(
                    f"{item.title} aguarda validacao"
                    f"{f' · {item.user.club.name}' if item.user_id and item.user and item.user.club else ''}."
                ),
                href="/infocultura/atividades",
                created_at=item.updated_at or item.created_at,
            )
        )

    next_event = (
        events_queryset.filter(start_date__gte=now)
        .order_by("start_date", "id")
        .first()
    )
    if next_event is not None:
        notifications.append(
            AdminNotificationRecord(
                id=f"event-upcoming-{next_event.id}",
                kind="schedule",
                level="info",
                title="Proximo evento agendado",
                message=(
                    f"{next_event.title}"
                    f"{f' · {next_event.user.club.name}' if next_event.user_id and next_event.user and next_event.user.club else ''}"
                    f" em {_format_dt(next_event.start_date)}."
                ),
                href="/infocultura/atividades",
                created_at=next_event.start_date,
            )
        )

    return sorted(
        notifications,
        key=lambda item: (
            {"warning": 0, "info": 1, "success": 2}.get(item.level, 3),
            -_notification_timestamp(item.created_at),
            item.id,
        ),
    )


def update_admin_club_registration_status(
    *,
    registration_id: int,
    registration_status: RegistrationStatus,
    allowed_club_id: int | None = None,
) -> AdminClubRegistrationRecord:
    current_record = get_admin_club_registration(
        registration_id=registration_id,
        allowed_club_id=allowed_club_id,
    )
    if current_record is None:
        raise ClubRegistrationNotFoundError("Inscricao nao encontrada.")

    registration = Registration.objects.filter(pk=registration_id).first()
    if registration is None:
        raise ClubRegistrationNotFoundError("Inscricao nao encontrada.")

    previous_status = current_record.status.strip().lower()
    registration.registration_status = registration_status
    registration.status = registration_status.name.strip().lower()
    registration.save(update_fields=["registration_status", "status"])

    updated_record = get_admin_club_registration(
        registration_id=registration_id,
        allowed_club_id=allowed_club_id,
    )
    if updated_record is None:
        raise ClubRegistrationNotFoundError("Inscricao nao encontrada.")

    if updated_record.status != previous_status:
        send_registration_status_email(updated_record)

    return updated_record
