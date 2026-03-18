from __future__ import annotations

from datetime import datetime
from typing import ClassVar, Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    text,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    """Base metadata that mirrors the current live MySQL schema."""


class ReprMixin:
    """Simple readable repr for ORM entities."""

    __repr_fields__: ClassVar[tuple[str, ...]] = ()

    def __repr__(self) -> str:
        field_values = ", ".join(
            f"{field}={getattr(self, field)!r}" for field in self.__repr_fields__
        )
        return f"{self.__class__.__name__}({field_values})"


class Role(Base, ReprMixin):
    """Live table `roles`."""

    __tablename__ = "roles"
    __table_args__ = (UniqueConstraint("name", name="name"),)
    __repr_fields__ = ("id", "name")

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    users: Mapped[list[User]] = relationship(back_populates="role")


class Club(Base, ReprMixin):
    """Live table `clubs`."""

    __tablename__ = "clubs"
    __repr_fields__ = ("id_clubs", "name", "is_active")

    id_clubs: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    mission: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default=text("1"),
    )
    created_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
        server_default=text("CURRENT_TIMESTAMP"),
    )
    enable_registrations: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)

    members: Mapped[list[User]] = relationship(back_populates="club")


class User(Base, ReprMixin):
    """Live table `users`."""

    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint("email", name="email"),
        Index("fk_user_role", "role_id"),
        Index("fk_users_clubs", "id_clubs"),
    )
    __repr_fields__ = ("id", "name", "email", "is_active")

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(150), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("roles.id", name="fk_user_role"),
        nullable=False,
    )
    is_active: Mapped[Optional[bool]] = mapped_column(
        Boolean,
        nullable=True,
        server_default=text("1"),
    )
    created_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
        server_default=text("CURRENT_TIMESTAMP"),
    )
    id_clubs: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey(
            "clubs.id_clubs",
            name="fk_users_clubs",
            onupdate="CASCADE",
            ondelete="SET NULL",
        ),
        nullable=True,
    )

    role: Mapped[Role] = relationship(back_populates="users")
    club: Mapped[Optional[Club]] = relationship(back_populates="members")


class Registration(Base, ReprMixin):
    """Live table `registrations`."""

    __tablename__ = "registrations"
    __repr_fields__ = ("id_registrations", "name", "email", "status")

    id_registrations: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(150), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        server_default=text("'pending'"),
    )
    created_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
        server_default=text("CURRENT_TIMESTAMP"),
    )
