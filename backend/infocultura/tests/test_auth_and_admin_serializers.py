import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.test import RequestFactory
from unittest import TestCase

from infocultura.api.serializers_admin import AdminBulkIdsSerializer
from infocultura.api.serializers_auth import LoginSerializer


class LoginSerializerTests(TestCase):
    def test_valid_login_identifier_is_trimmed(self):
        serializer = LoginSerializer(
            data={
                "username": "  maria@example.com  ",
                "password": "Secret123!",
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["username"], "maria@example.com")

    def test_login_identifier_rejects_control_characters(self):
        serializer = LoginSerializer(
            data={
                "username": "bad\nvalue",
                "password": "Secret123!",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("invalidos", str(serializer.errors["username"][0]).lower())


class AdminBulkIdsSerializerTests(TestCase):
    def test_ids_are_deduplicated_preserving_order(self):
        serializer = AdminBulkIdsSerializer(data={"ids": [3, 1, 3, 2, 1]})

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["ids"], [3, 1, 2])

    def test_empty_ids_are_rejected(self):
        serializer = AdminBulkIdsSerializer(data={"ids": []})

        self.assertFalse(serializer.is_valid())
        self.assertIn("vazia", str(serializer.errors["ids"][0]).lower())
