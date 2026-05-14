from __future__ import annotations

from ..models import Event, News, Registration
from ..service_types import AdminNotificationRecord


def _get_allowed_club_id(user) -> int | None:
    role_name = getattr(getattr(user, "role", None), "name", None)
    if role_name == "club_admin":
        return user.club_id
    return None


def get_admin_dashboard_metrics(*, user) -> dict:
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


def get_admin_notifications(*, user) -> list[AdminNotificationRecord]:
    return []
