import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from datetime import timedelta
from types import SimpleNamespace
from unittest import TestCase
from unittest.mock import patch

from django.utils import timezone

from infocultura.repositories import registrations as repo
from infocultura.service_types import ActivityRegistrationSummary


class RegistrationRepositoryTests(TestCase):
    def test_activity_registration_exists_queries_join_the_registration_table(self):
        with patch(
            "infocultura.repositories.registrations.fetch_all_dict_rows",
            return_value=[],
        ) as fetch_mock:
            self.assertFalse(
                repo.event_registration_exists(event_id=17, email="Test@Email.com")
            )

        sql, params = fetch_mock.call_args.args
        self.assertIn("event_registrations", sql)
        self.assertIn("registrations", sql)
        self.assertIn("id_registrations", sql)
        self.assertEqual(params, (17, "test@email.com"))

        with patch(
            "infocultura.repositories.registrations.fetch_all_dict_rows",
            return_value=[],
        ) as fetch_mock:
            self.assertFalse(
                repo.session_registration_exists(session_id=23, email="Another@Email.com")
            )

        sql, params = fetch_mock.call_args.args
        self.assertIn("session_registrations", sql)
        self.assertIn("registrations", sql)
        self.assertIn("id_registrations", sql)
        self.assertEqual(params, (23, "another@email.com"))

    def test_registration_summary_counts_confirmed_and_waitlist(self):
        event = SimpleNamespace(
            id=11,
            registration_capacity=2,
            enable_registrations=True,
            end_date=timezone.now() + timedelta(days=1),
        )

        with patch(
            "infocultura.repositories.registrations.fetch_all_dict_rows",
            return_value=[
                {"resolved_status": "confirmed", "total_count": 2},
                {"resolved_status": "waitlist", "total_count": 1},
            ],
        ):
            summary = repo.get_event_registration_summary(event=event)

        self.assertIsInstance(summary, ActivityRegistrationSummary)
        self.assertEqual(summary.confirmed_count, 2)
        self.assertEqual(summary.waitlist_count, 1)
        self.assertEqual(summary.remaining_slots, 0)
        self.assertEqual(summary.registration_state, "waitlist")

    def test_admin_club_registration_query_uses_registration_id_projection(self):
        with patch(
            "infocultura.repositories.registrations.fetch_all_dict_rows",
            side_effect=[
                [{"total_count": 1}],
                [
                    {
                        "registration_id": 91,
                        "club_id": 7,
                        "club_name": "Teatro",
                        "name": "Ana",
                        "email": "ana@example.com",
                        "phone": None,
                        "message": None,
                        "status": "pending",
                        "created_at": None,
                    }
                ],
            ],
        ) as fetch_mock:
            page = repo.list_admin_club_registrations(
                allowed_club_id=7,
                page=2,
                page_size=25,
            )

        self.assertEqual(page.total, 1)
        self.assertEqual(page.page, 2)
        self.assertEqual(page.page_size, 25)
        self.assertEqual(page.total_pages, 1)
        self.assertEqual(page.items[0].registration_id, 91)

        count_sql = fetch_mock.call_args_list[0].args[0]
        select_sql = fetch_mock.call_args_list[1].args[0]
        self.assertIn("COUNT(*) AS total_count", count_sql)
        self.assertIn("r.id_registrations AS registration_id", select_sql)
        self.assertIn("cr.id_clubs AS club_id", select_sql)
        self.assertNotIn("r.id ", select_sql)
