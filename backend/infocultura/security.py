from datetime import datetime, timedelta, timezone
import jwt
from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password


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
