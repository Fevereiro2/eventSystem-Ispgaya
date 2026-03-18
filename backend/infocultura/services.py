from __future__ import annotations

from dataclasses import dataclass

from django.db import connection, transaction
from django.utils import timezone

from .models import Club, Registration


class ClubRegistrationError(Exception):
    """Base service error for public club registrations."""


class DuplicateClubRegistrationError(ClubRegistrationError):
    """Raised when the same email is already registered for the same club."""


@dataclass(frozen=True, slots=True)
class ClubRegistrationInput:
    name: str
    email: str
    phone: str | None = None
    message: str | None = None


def _normalized_email(value: str) -> str:
    return value.strip().lower()


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


def create_club_registration(*, club: Club, payload: ClubRegistrationInput) -> Registration:
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
