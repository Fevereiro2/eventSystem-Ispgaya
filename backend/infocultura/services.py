from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from django.core.cache import cache
from django.db import connection, transaction
from django.utils import timezone

from .models import Club, Registration, RegistrationStatus


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


def _normalized_email(value: str) -> str:
    return value.strip().lower()


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
    allowed_club_id: int | None = None,
) -> list[AdminClubRegistrationRecord]:
    where_clause, params = _build_admin_registration_filters(
        club_id=club_id,
        status=status,
        allowed_club_id=allowed_club_id,
    )

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
            {where_clause}
            ORDER BY r.created_at DESC, r.id_registrations DESC
            """,
            params,
        )
        rows = cursor.fetchall()

    return [_row_to_admin_record(row) for row in rows]


def get_admin_club_registration(
    *,
    registration_id: int,
    allowed_club_id: int | None = None,
) -> AdminClubRegistrationRecord | None:
    where_clause, params = _build_admin_registration_filters(
        club_id=None,
        status=None,
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

    registration.registration_status = registration_status
    registration.status = registration_status.name.strip().lower()
    registration.save(update_fields=["registration_status", "status"])

    updated_record = get_admin_club_registration(
        registration_id=registration_id,
        allowed_club_id=allowed_club_id,
    )
    if updated_record is None:
        raise ClubRegistrationNotFoundError("Inscricao nao encontrada.")

    return updated_record
