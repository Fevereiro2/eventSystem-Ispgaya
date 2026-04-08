from datetime import datetime, timedelta, timezone
import jwt
from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password


def _has_control_characters(value: str) -> bool:
    return any(ord(char) < 32 or ord(char) == 127 for char in value)


def normalize_email_address(value: str) -> str:
    return value.strip().lower()


def normalize_login_identifier(value: str) -> str:
    return value.strip()


def validate_login_identifier(value: str) -> str:
    normalized = normalize_login_identifier(value)
    if not normalized:
        raise ValueError("O utilizador ou email e obrigatorio.")
    if _has_control_characters(normalized):
        raise ValueError("O utilizador contem caracteres invalidos.")
    return normalized


def validate_person_name(value: str) -> str:
    normalized = value.strip()
    if not normalized:
        raise ValueError("O nome e obrigatorio.")
    if _has_control_characters(normalized):
        raise ValueError("O nome contem caracteres invalidos.")
    return normalized


def validate_plaintext_password(value: str, *, min_length: int = 8) -> str:
    if value is None:
        raise ValueError("A password e obrigatoria.")

    if _has_control_characters(value):
        raise ValueError("A password contem caracteres invalidos.")

    if len(value) < min_length:
        raise ValueError(f"A password deve ter pelo menos {min_length} caracteres.")

    if len(value) > 128:
        raise ValueError("A password nao pode exceder 128 caracteres.")

    return value


def hash_password(raw_password: str) -> str:
    return make_password(raw_password)


def check_password_hash(raw_password: str, stored_hash: str) -> bool:
    if not stored_hash:
        return False

    # Accept Django hashes and keep a dev fallback for plain text.
    try:
        if check_password(raw_password, stored_hash):
            return True
    except Exception:
        pass

    return raw_password == stored_hash


def issue_access_token(user_id: int, role_name: str, email: str, name: str) -> str:
    now = datetime.now(tz=timezone.utc)
    exp = now + timedelta(hours=settings.INFOCULTURA_JWT_EXPIRES_HOURS)

    payload = {
        'sub': str(user_id),
        'role': role_name,
        'email': email,
        'name': name,
        'iat': int(now.timestamp()),
        'exp': int(exp.timestamp()),
    }

    return jwt.encode(payload, settings.INFOCULTURA_JWT_SECRET, algorithm='HS256')


def decode_access_token(token: str) -> dict:
    return jwt.decode(token, settings.INFOCULTURA_JWT_SECRET, algorithms=['HS256'])
