from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from django.conf import settings
from django.core.cache import cache
from django.core.mail import send_mail
from django.db import connection, transaction
from django.db.models import Q
from django.utils import timezone

from .models import AppUser, Book, Club, Event, News, Registration, RegistrationStatus, Session


class ClubRegistrationError(Exception):
    """Base service error for public club registrations."""


class DuplicateClubRegistrationError(ClubRegistrationError):
    """Raised when the same email is already registered for the same club."""


class ClubRegistrationRateLimitError(ClubRegistrationError):
    """Raised when the registration endpoint is being hit too often."""


class ClubRegistrationNotFoundError(ClubRegistrationError):
    """Raised when an admin-facing registration cannot be found in scope."""


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


def _normalized_email(value: str) -> str:
    return value.strip().lower()


def _get_allowed_club_id(user) -> int | None:
    role_name = getattr(getattr(user, "role", None), "name", None)
    if role_name == "club_admin":
        return user.club_id
    return None


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

    return registration


def _build_admin_registration_filters(
    *,
    club_id: int | None,
    status: str | None,
    search: str | None,
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


def list_admin_club_registrations(
    *,
    club_id: int | None = None,
    status: str | None = None,
    search: str | None = None,
    allowed_club_id: int | None = None,
    page: int = 1,
    page_size: int = 10,
) -> AdminClubRegistrationPage:
    normalized_page = max(1, page)
    normalized_page_size = min(max(1, page_size), 100)
    where_clause, params = _build_admin_registration_filters(
        club_id=club_id,
        status=status,
        search=search,
        allowed_club_id=allowed_club_id,
    )

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

        offset = (normalized_page - 1) * normalized_page_size
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
            {where_clause}
            ORDER BY r.created_at DESC, r.id_registrations DESC
            LIMIT %s OFFSET %s
            """,
            [*params, normalized_page_size, offset],
        )
        rows = cursor.fetchall()

    total_pages = (total + normalized_page_size - 1) // normalized_page_size if total else 0

    return AdminClubRegistrationPage(
        items=[_row_to_admin_record(row) for row in rows],
        total=total,
        page=normalized_page,
        page_size=normalized_page_size,
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

    send_mail(
        subject=_build_registration_status_email_subject(record.status, record.club_name),
        message=_build_registration_status_email_body(record),
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@ispgaya.pt"),
        recipient_list=[record.email],
        fail_silently=True,
    )


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
