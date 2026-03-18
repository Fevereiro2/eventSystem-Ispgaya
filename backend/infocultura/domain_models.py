from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime
from enum import Enum
from typing import Optional


def _require_positive_int(value: int, field_name: str) -> None:
    if value <= 0:
        raise ValueError(f"{field_name} must be a positive integer.")


def _require_non_empty(value: str, field_name: str) -> None:
    if not value or not value.strip():
        raise ValueError(f"{field_name} is required.")


def _require_email(value: str, field_name: str = "email") -> None:
    _require_non_empty(value, field_name)
    if "@" not in value or value.startswith("@") or value.endswith("@"):
        raise ValueError(f"{field_name} must be a valid email address.")


def _require_datetime(value: datetime, field_name: str) -> None:
    if not isinstance(value, datetime):
        raise TypeError(f"{field_name} must be a datetime instance.")


def _require_date(value: date, field_name: str) -> None:
    if not isinstance(value, date):
        raise TypeError(f"{field_name} must be a date instance.")


def _require_chronological_datetimes(
    start_value: datetime,
    end_value: datetime,
    start_name: str,
    end_name: str,
) -> None:
    _require_datetime(start_value, start_name)
    _require_datetime(end_value, end_name)
    if end_value < start_value:
        raise ValueError(f"{end_name} must be greater than or equal to {start_name}.")


class EventStatus(str, Enum):
    """Suggested enum for EVENT.status."""

    DRAFT = "draft"
    PUBLISHED = "published"
    CANCELLED = "cancelled"
    ARCHIVED = "archived"


class NewsletterStatus(str, Enum):
    """Suggested enum for NEWSLETTERS.status."""

    DRAFT = "draft"
    SCHEDULED = "scheduled"
    SENT = "sent"
    CANCELLED = "cancelled"


@dataclass(slots=True, kw_only=True)
class CreatedTimestampMixin:
    """Reusable base for tables that store a creation timestamp."""

    created_at: datetime

    def __post_init__(self) -> None:
        _require_datetime(self.created_at, "created_at")


@dataclass(slots=True, kw_only=True)
class AuditTimestampMixin(CreatedTimestampMixin):
    """Reusable base for tables that store creation and update timestamps."""

    updated_at: datetime

    def __post_init__(self) -> None:
        super().__post_init__()
        _require_datetime(self.updated_at, "updated_at")
        if self.updated_at < self.created_at:
            raise ValueError("updated_at must be greater than or equal to created_at.")


@dataclass(slots=True, kw_only=True)
class Role:
    """Table ROLE. Maps `id_role`, `name`, `description`."""

    role_id: int
    name: str
    description: Optional[str] = None

    users: list[User] = field(default_factory=list, repr=False)

    def __post_init__(self) -> None:
        _require_positive_int(self.role_id, "role_id")
        _require_non_empty(self.name, "name")


@dataclass(slots=True, kw_only=True)
class NewsStatus:
    """Table NSTATUS. Maps `id_nstatus`, `name`, `description`."""

    news_status_id: int
    name: str
    description: Optional[str] = None

    news_items: list[News] = field(default_factory=list, repr=False)

    def __post_init__(self) -> None:
        _require_positive_int(self.news_status_id, "news_status_id")
        _require_non_empty(self.name, "name")


@dataclass(slots=True, kw_only=True)
class RegistrationStatus:
    """Table RSTATUS. Maps `id_rstatus`, `name`, `description`."""

    registration_status_id: int
    name: str
    description: Optional[str] = None

    registrations: list[Registration] = field(default_factory=list, repr=False)

    def __post_init__(self) -> None:
        _require_positive_int(self.registration_status_id, "registration_status_id")
        _require_non_empty(self.name, "name")


@dataclass(slots=True, kw_only=True)
class Category(AuditTimestampMixin):
    """Table CATEGORY. Maps `id_category`, `name`, `description`, timestamps."""

    category_id: int
    name: str
    description: Optional[str] = None

    event_links: list[EventCategory] = field(default_factory=list, repr=False)
    events: list[Event] = field(default_factory=list, repr=False)

    def __post_init__(self) -> None:
        super().__post_init__()
        _require_positive_int(self.category_id, "category_id")
        _require_non_empty(self.name, "name")


@dataclass(slots=True, kw_only=True)
class Club(CreatedTimestampMixin):
    """Table CLUBS. Maps `id_clubs`, club metadata and registration settings."""

    club_id: int
    name: str
    description: Optional[str] = None
    mission: Optional[str] = None
    is_active: bool = True
    enable_registrations: bool = True

    members: list[User] = field(default_factory=list, repr=False)
    books: list[Book] = field(default_factory=list, repr=False)
    sessions: list[Session] = field(default_factory=list, repr=False)
    news_items: list[News] = field(default_factory=list, repr=False)
    registration_links: list[ClubRegistration] = field(default_factory=list, repr=False)

    def __post_init__(self) -> None:
        super().__post_init__()
        _require_positive_int(self.club_id, "club_id")
        _require_non_empty(self.name, "name")


@dataclass(slots=True, kw_only=True)
class User(AuditTimestampMixin):
    """Table USER. Maps `id_user`, `id_role`, `id_clubs` and user profile fields."""

    user_id: int
    name: str
    email: str
    password_hash: str
    is_active: bool

    role_id: int
    club_id: Optional[int] = None

    role: Optional[Role] = None
    club: Optional[Club] = None
    events: list[Event] = field(default_factory=list, repr=False)
    newsletters: list[Newsletter] = field(default_factory=list, repr=False)

    def __post_init__(self) -> None:
        super().__post_init__()
        _require_positive_int(self.user_id, "user_id")
        _require_non_empty(self.name, "name")
        _require_email(self.email)
        _require_non_empty(self.password_hash, "password_hash")
        _require_positive_int(self.role_id, "role_id")
        if self.club_id is not None:
            _require_positive_int(self.club_id, "club_id")


@dataclass(slots=True, kw_only=True)
class Event(AuditTimestampMixin):
    """Table EVENT. Maps event details, ownership and location fields."""

    event_id: int
    title: str
    description: Optional[str]
    event_date: date
    start_at: datetime
    end_at: datetime
    image: Optional[str]
    is_external: bool
    status: str
    city: Optional[str]
    location: Optional[str]

    user_id: int

    user: Optional[User] = None
    event_categories: list[EventCategory] = field(default_factory=list, repr=False)
    categories: list[Category] = field(default_factory=list, repr=False)

    def __post_init__(self) -> None:
        super().__post_init__()
        _require_positive_int(self.event_id, "event_id")
        _require_non_empty(self.title, "title")
        _require_date(self.event_date, "event_date")
        _require_chronological_datetimes(self.start_at, self.end_at, "start_at", "end_at")
        _require_non_empty(self.status, "status")
        _require_positive_int(self.user_id, "user_id")


@dataclass(slots=True, kw_only=True)
class EventCategory:
    """Table EVENT_CATEGORY. Join table for EVENT <-> CATEGORY."""

    event_id: int
    category_id: int

    event: Optional[Event] = None
    category: Optional[Category] = None

    def __post_init__(self) -> None:
        _require_positive_int(self.event_id, "event_id")
        _require_positive_int(self.category_id, "category_id")


@dataclass(slots=True, kw_only=True)
class Book(CreatedTimestampMixin):
    """Table BOOKS. Maps books associated with a specific club."""

    book_id: int
    title: str
    author: str
    publisher: Optional[str]
    publication_year: int
    cover_image: Optional[str]
    summary: Optional[str]
    is_featured: bool

    club_id: int

    club: Optional[Club] = None

    def __post_init__(self) -> None:
        super().__post_init__()
        _require_positive_int(self.book_id, "book_id")
        _require_non_empty(self.title, "title")
        _require_non_empty(self.author, "author")
        _require_positive_int(self.publication_year, "publication_year")
        _require_positive_int(self.club_id, "club_id")


@dataclass(slots=True, kw_only=True)
class Session(AuditTimestampMixin):
    """Table SESSIONS. Maps club sessions with schedule information."""

    session_id: int
    name: str
    title: str
    description: Optional[str]
    session_date: date
    start_at: datetime
    end_at: datetime

    club_id: int

    club: Optional[Club] = None

    def __post_init__(self) -> None:
        super().__post_init__()
        _require_positive_int(self.session_id, "session_id")
        _require_non_empty(self.name, "name")
        _require_non_empty(self.title, "title")
        _require_date(self.session_date, "session_date")
        _require_chronological_datetimes(self.start_at, self.end_at, "start_at", "end_at")
        _require_positive_int(self.club_id, "club_id")


@dataclass(slots=True, kw_only=True)
class Registration(CreatedTimestampMixin):
    """Table REGISTRATIONS. Stores contact and workflow status of registrations."""

    registration_id: int
    name: str
    email: str
    phone: Optional[str]
    message: Optional[str]

    registration_status_id: int

    registration_status: Optional[RegistrationStatus] = None
    club_links: list[ClubRegistration] = field(default_factory=list, repr=False)
    clubs: list[Club] = field(default_factory=list, repr=False)

    def __post_init__(self) -> None:
        super().__post_init__()
        _require_positive_int(self.registration_id, "registration_id")
        _require_non_empty(self.name, "name")
        _require_email(self.email)
        _require_positive_int(self.registration_status_id, "registration_status_id")


@dataclass(slots=True, kw_only=True)
class ClubRegistration:
    """Table CLUBS_REGISTRATIONS. Join table for CLUBS <-> REGISTRATIONS."""

    club_id: int
    registration_id: int

    club: Optional[Club] = None
    registration: Optional[Registration] = None

    def __post_init__(self) -> None:
        _require_positive_int(self.club_id, "club_id")
        _require_positive_int(self.registration_id, "registration_id")


@dataclass(slots=True, kw_only=True)
class News(AuditTimestampMixin):
    """Table NEWS. Maps club news, publication status and rich content."""

    news_id: int
    title: str
    summary: Optional[str]
    image: Optional[str]
    published_at: Optional[datetime]
    content: str

    news_status_id: int
    club_id: int

    news_status: Optional[NewsStatus] = None
    club: Optional[Club] = None

    def __post_init__(self) -> None:
        super().__post_init__()
        _require_positive_int(self.news_id, "news_id")
        _require_non_empty(self.title, "title")
        _require_non_empty(self.content, "content")
        _require_positive_int(self.news_status_id, "news_status_id")
        _require_positive_int(self.club_id, "club_id")
        if self.published_at is not None:
            _require_datetime(self.published_at, "published_at")


@dataclass(slots=True, kw_only=True)
class Newsletter(CreatedTimestampMixin):
    """Table NEWSLETTERS. Maps authored newsletter campaigns."""

    newsletter_id: int
    title: str
    subject: str
    content: str
    status: str
    sent_at: Optional[datetime]

    user_id: int

    user: Optional[User] = None

    def __post_init__(self) -> None:
        super().__post_init__()
        _require_positive_int(self.newsletter_id, "newsletter_id")
        _require_non_empty(self.title, "title")
        _require_non_empty(self.subject, "subject")
        _require_non_empty(self.content, "content")
        _require_non_empty(self.status, "status")
        _require_positive_int(self.user_id, "user_id")
        if self.sent_at is not None:
            _require_datetime(self.sent_at, "sent_at")


@dataclass(slots=True, kw_only=True)
class NewsletterSubscriber:
    """Table NEWS_LETTER_SUBSCRIBERS. Stores newsletter subscriber records."""

    newsletter_subscriber_id: int
    email: str
    is_active: bool
    subscribed_at: datetime

    def __post_init__(self) -> None:
        _require_positive_int(self.newsletter_subscriber_id, "newsletter_subscriber_id")
        _require_email(self.email)
        _require_datetime(self.subscribed_at, "subscribed_at")


def build_example_objects() -> dict[str, object]:
    """Small example set showing how the domain models can be instantiated."""

    role = Role(
        role_id=1,
        name="superadmin",
        description="Platform administrator.",
    )

    club = Club(
        club_id=1,
        name="Clube de Leitura",
        description="Academic reading club.",
        mission="Promote reading, discussion and literary mediation.",
        is_active=True,
        enable_registrations=True,
        created_at=datetime(2026, 3, 18, 10, 0, 0),
    )

    user = User(
        user_id=1,
        name="Ana Martins",
        email="ana.martins@ispgaya.pt",
        password_hash="pbkdf2_sha256$example",
        is_active=True,
        created_at=datetime(2026, 3, 18, 10, 5, 0),
        updated_at=datetime(2026, 3, 18, 10, 5, 0),
        role_id=role.role_id,
        club_id=club.club_id,
        role=role,
        club=club,
    )

    category = Category(
        category_id=1,
        name="Culture",
        description="General cultural programming.",
        created_at=datetime(2026, 3, 18, 10, 10, 0),
        updated_at=datetime(2026, 3, 18, 10, 10, 0),
    )

    event = Event(
        event_id=1,
        title="Encontro Literario de Primavera",
        description="Open session with invited speakers and reading circles.",
        event_date=date(2026, 4, 2),
        start_at=datetime(2026, 4, 2, 18, 0, 0),
        end_at=datetime(2026, 4, 2, 20, 0, 0),
        image="/media/events/literario.jpg",
        is_external=False,
        status=EventStatus.PUBLISHED.value,
        city="Vila Nova de Gaia",
        location="Auditorio Principal",
        user_id=user.user_id,
        user=user,
        created_at=datetime(2026, 3, 18, 10, 20, 0),
        updated_at=datetime(2026, 3, 18, 10, 20, 0),
        categories=[category],
    )

    newsletter = Newsletter(
        newsletter_id=1,
        title="Agenda Cultural de Abril",
        subject="Eventos culturais de abril",
        content="Resumo das atividades culturais do mes.",
        status=NewsletterStatus.DRAFT.value,
        sent_at=None,
        user_id=user.user_id,
        user=user,
        created_at=datetime(2026, 3, 18, 10, 30, 0),
    )

    return {
        "role": role,
        "club": club,
        "user": user,
        "category": category,
        "event": event,
        "newsletter": newsletter,
    }


if __name__ == "__main__":
    for key, instance in build_example_objects().items():
        print(f"{key}: {instance!r}")
