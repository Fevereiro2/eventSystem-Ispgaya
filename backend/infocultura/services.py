from __future__ import annotations

from datetime import datetime, timedelta, timezone as dt_timezone
from functools import lru_cache
import json
from urllib.parse import quote

from django.conf import settings
from django.core.cache import cache
from django.core.mail import send_mail
from django.db import connection, transaction, models
from django.db.models import Q, Count, Case, When, Value, CharField, F
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
    ClubRegistration,
)
from .service_types import (
    ActivityRegistrationError,
    ActivityRegistrationRateLimitError,
    ActivityRegistrationSummary,
    AdminAuditLogRecord,
    AdminClubRegistrationPage,
    AdminClubRegistrationRecord,
    AdminNotificationRecord,
    ClubRegistrationInput,
    ClubRegistrationRateLimitError,
    DuplicateActivityRegistrationError,
    DuplicateClubRegistrationError,
    EditorialHistoryRecord,
)


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
    return ClubRegistration.objects.filter(
        club_id=club_id,
        registration__email__iexact=normalized_email
    ).exists()


def event_registration_exists(*, event_id: int, email: str) -> bool:
    normalized_email = _normalized_email(email)
    return EventRegistration.objects.filter(
        event_id=event_id,
        registration__email__iexact=normalized_email
    ).exists()


def session_registration_exists(*, session_id: int, email: str) -> bool:
    normalized_email = _normalized_email(email)
    return SessionRegistration.objects.filter(
        session_id=session_id,
        registration__email__iexact=normalized_email
    ).exists()


def _normalize_capacity(value: int | None) -> int | None:
    if value is None:
        return None
    return max(0, int(value))


def _build_activity_registration_summary(
    *,
    link_model: type[models.Model],
    activity_id_field: str,
    activity_id: int,
    capacity: int | None,
    registrations_enabled: bool,
    is_open_by_date: bool,
) -> ActivityRegistrationSummary:
    # Use ORM aggregation to count registrations by status
    stats = link_model.objects.filter(**{activity_id_field: activity_id}).annotate(
        resolved_status=Case(
            When(registration__registration_status__isnull=False, then=F('registration__registration_status__name')),
            default=F('registration__status'),
            output_field=CharField(),
        )
    ).values('resolved_status').annotate(count=Count('id'))

    confirmed_count = 0
    waitlist_count = 0

    for entry in stats:
        normalized_status = _clean_status(entry['resolved_status'])
        if normalized_status in {"confirmed", "approved"}:
            confirmed_count += entry['count']
        elif normalized_status == "waitlist":
            waitlist_count += entry['count']

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
        link_model=EventRegistration,
        activity_id_field="event_id",
        activity_id=event.id,
        capacity=event.registration_capacity,
        registrations_enabled=bool(event.enable_registrations),
        is_open_by_date=event.end_date >= timezone.now(),
    )


def get_session_registration_summary(*, session: Session) -> ActivityRegistrationSummary:
    return _build_activity_registration_summary(
        link_model=SessionRegistration,
        activity_id_field="session_id",
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
        ClubRegistration.objects.create(club=club, registration=registration)

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
    queryset = ClubRegistration.objects.select_related('club', 'registration', 'registration__registration_status').all()

    if allowed_club_id is not None:
        queryset = queryset.filter(club_id=allowed_club_id)
    if club_id is not None:
        queryset = queryset.filter(club_id=club_id)
    if status:
        queryset = queryset.filter(
            Q(registration__registration_status__name__iexact=status) | 
            Q(registration__status__iexact=status)
        )
    if search:
        queryset = queryset.filter(
            Q(registration__name__icontains=search) | 
            Q(registration__email__icontains=search)
        )
    if date_from:
        queryset = queryset.filter(registration__created_at__date__gte=date_from)
    if date_to:
        queryset = queryset.filter(registration__created_at__date__lte=date_to)

    # Ordering
    ordering_map = {
        "newest": "-registration__created_at",
        "oldest": "registration__created_at",
        "name_asc": "registration__name",
        "name_desc": "-registration__name",
        "email_asc": "registration__email",
        "email_desc": "-registration__email",
        "club_asc": "club__name",
        "club_desc": "-club__name",
    }
    order_by = ordering_map.get(ordering, "-registration__created_at")
    queryset = queryset.order_by(order_by)

    total = queryset.count()
    
    if not export_all:
        offset = (page - 1) * page_size
        queryset = queryset[offset:offset + page_size]

    items = []
    for link in queryset:
        reg = link.registration
        items.append(AdminClubRegistrationRecord(
            registration_id=reg.id,
            club_id=link.club_id,
            club_name=link.club.name,
            name=reg.name,
            email=reg.email,
            phone=reg.phone,
            message=reg.message,
            status=reg.registration_status.name if reg.registration_status else reg.status,
            created_at=reg.created_at
        ))

    total_pages = (total + page_size - 1) // page_size if page_size and not export_all else 1
    
    return AdminClubRegistrationPage(
        items=items,
        total=total,
        page=page,
        page_size=page_size if not export_all else total,
        total_pages=total_pages
    )


def get_admin_club_registration(
    *,
    registration_id: int,
    allowed_club_id: int | None = None,
) -> AdminClubRegistrationRecord | None:
    try:
        link = ClubRegistration.objects.select_related('club', 'registration', 'registration__registration_status').get(
            registration_id=registration_id
        )
        if allowed_club_id is not None and link.club_id != allowed_club_id:
            return None
            
        reg = link.registration
        return AdminClubRegistrationRecord(
            registration_id=reg.id,
            club_id=link.club_id,
            club_name=link.club.name,
            name=reg.name,
            email=reg.email,
            phone=reg.phone,
            message=reg.message,
            status=reg.registration_status.name if reg.registration_status else reg.status,
            created_at=reg.created_at
        )
    except ClubRegistration.DoesNotExist:
        return None


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


def update_admin_club_registration_status(
    *,
    registration_id: int,
    registration_status: str,
    allowed_club_id: int | None = None,
) -> AdminClubRegistrationRecord | None:
    try:
        link = ClubRegistration.objects.select_related('club', 'registration').get(
            registration_id=registration_id
        )
        if allowed_club_id is not None and link.club_id != allowed_club_id:
            return None

        reg = link.registration
        reg.status = registration_status
        # If there's a corresponding RegistrationStatus, update it too
        rstatus = RegistrationStatus.objects.filter(name__iexact=registration_status).first()
        if rstatus:
            reg.registration_status = rstatus
        reg.save()

        record = get_admin_club_registration(registration_id=registration_id)
        if record:
            _send_mail_message(
                subject=_build_registration_status_email_subject(registration_status, link.club.name),
                body=_build_registration_status_email_body(record),
                recipient_list=[reg.email],
            )
        return record
    except ClubRegistration.DoesNotExist:
        return None


def record_admin_audit_action(
    *,
    action: str,
    content_type: str,
    object_id: int | None = None,
    summary: str,
    actor_user: AppUser,
    club_id: int | None = None,
    metadata: dict | None = None,
) -> None:
    from .models import AdminAuditLog
    AdminAuditLog.objects.create(
        action=action,
        content_type=content_type,
        object_id=object_id,
        summary=summary,
        actor_user=actor_user,
        actor_name=actor_user.name,
        club=Club.objects.filter(id=club_id).first() if club_id else None,
        metadata_json=json.dumps(metadata) if metadata else None,
    )


def record_editorial_action(
    *,
    content_type: str,
    object_id: int,
    from_status: str | None,
    to_status: str,
    actor_user: AppUser,
    club_id: int | None = None,
) -> None:
    from .models import EditorialAction
    EditorialAction.objects.create(
        content_type=content_type,
        object_id=object_id,
        from_status=from_status,
        to_status=to_status,
        actor_user=actor_user,
        actor_name=actor_user.name,
        club=Club.objects.filter(id=club_id).first() if club_id else None,
    )


def list_admin_audit_logs(
    *,
    club_id: int | None = None,
    action: str | None = None,
    content_type: str | None = None,
    search: str | None = None,
    page: int = 1,
    page_size: int = 20,
    limit: int | None = None,
) -> list[AdminAuditLogRecord]:
    from .models import AdminAuditLog
    queryset = AdminAuditLog.objects.all()
    if club_id:
        queryset = queryset.filter(club_id=club_id)
    if action:
        queryset = queryset.filter(action=action)
    if content_type:
        queryset = queryset.filter(content_type=content_type)
    if search:
        queryset = queryset.filter(summary__icontains=search)

    if limit is not None:
        queryset = queryset[:max(1, limit)]
    else:
        offset = (page - 1) * page_size
        queryset = queryset[offset:offset + page_size]

    return [
        AdminAuditLogRecord(
            id=log.id,
            action=log.action,
            content_type=log.content_type,
            object_id=log.object_id,
            summary=log.summary,
            actor_user_id=log.actor_user_id,
            actor_name=log.actor_name,
            club_id=log.club_id,
            metadata_json=log.metadata_json,
            created_at=log.created_at,
        )
        for log in queryset
    ]


def get_admin_dashboard_metrics(*, user: AppUser) -> dict:
    from .models import Event, News, Registration, Club
    
    club_id = _get_allowed_club_id(user)
    
    event_qs = Event.objects.all()
    news_qs = News.objects.all()
    reg_qs = Registration.objects.all()
    
    if club_id:
        event_qs = event_qs.filter(user__club_id=club_id)
        news_qs = news_qs.filter(club_id=club_id)
        reg_qs = reg_qs.filter(club_links__club_id=club_id)

    return {
        "total_events": event_qs.count(),
        "total_news": news_qs.count(),
        "total_registrations": reg_qs.count(),
        "pending_registrations": reg_qs.filter(status="pending").count(),
    }


def get_admin_notifications(*, user: AppUser) -> list[AdminNotificationRecord]:
    # Placeholder for notifications logic
    return []


def build_activity_calendar_payload(*, activity_type: str, activity_id: int) -> dict:
    from .models import Event, Session
    if activity_type == "event":
        activity = Event.objects.get(id=activity_id)
        return _build_calendar_links(
            title=activity.title,
            description=activity.description,
            start_date=activity.start_date,
            end_date=activity.end_date,
            location=activity.location or activity.city or "",
        )
    elif activity_type == "session":
        activity = Session.objects.get(id=activity_id)
        return _build_calendar_links(
            title=activity.title,
            description=activity.description,
            start_date=activity.start_date,
            end_date=activity.end_date,
            location=activity.title,
        )
    return {}


def list_editorial_history(*, content_type: str, object_id: int) -> list[EditorialHistoryRecord]:
    from .models import EditorialAction
    queryset = EditorialAction.objects.filter(content_type=content_type, object_id=object_id)
    return [
        EditorialHistoryRecord(
            content_type=action.content_type,
            object_id=action.object_id,
            from_status=action.from_status,
            to_status=action.to_status,
            actor_user_id=action.actor_user_id,
            actor_name=action.actor_name,
            created_at=action.created_at,
        )
        for action in queryset
    ]


def notify_event_workflow_status(*, event: Event, previous_status: str | None, next_status: str) -> None:
    # Logic for workflow notifications
    pass


def notify_news_workflow_status(*, news: News, previous_status: str | None, next_status: str) -> None:
    # Logic for workflow notifications
    pass


# Scheduling Services

def validate_date_interval(start_date: datetime, end_date: datetime) -> None:
    """Validates that the end date is after the start date."""
    if start_date and end_date and start_date >= end_date:
        raise ValueError("A data de fim deve ser posterior a data de inicio.")


def get_upcoming_activities(queryset, limit: int = 5):
    """Returns the next upcoming activities from the queryset."""
    return queryset.filter(end_date__gte=timezone.now()).order_by('start_date')[:limit]


def get_past_activities(queryset, limit: int = 5):
    """Returns the past activities from the queryset."""
    return queryset.filter(end_date__lt=timezone.now()).order_by('-end_date')[:limit]


def filter_activities_by_range(queryset, start_from: datetime | None = None, end_to: datetime | None = None):
    """Filters activities within a specific date range."""
    if start_from:
        queryset = queryset.filter(start_date__gte=start_from)
    if end_to:
        queryset = queryset.filter(end_date__lte=end_to)
    return queryset
