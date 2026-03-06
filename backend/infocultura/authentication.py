import jwt
from rest_framework import authentication, exceptions

from .models import AppUser
from .security import decode_access_token


class InfoCulturaJWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth = authentication.get_authorization_header(request).split()
        if not auth:
            return None

        if len(auth) != 2:
            raise exceptions.AuthenticationFailed('Header de autenticacao invalido.')

        scheme = auth[0].decode('utf-8')
        if scheme not in ('Bearer', 'Token'):
            return None

        token = auth[1].decode('utf-8')

        try:
            payload = decode_access_token(token)
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token expirado.')
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed('Token invalido.')

        user_id = payload.get('sub')
        if not user_id:
            raise exceptions.AuthenticationFailed('Token sem utilizador.')

        user = AppUser.objects.select_related('role').filter(id=user_id, is_active=True).first()
        if not user:
            raise exceptions.AuthenticationFailed('Utilizador nao encontrado ou inativo.')

        return (user, None)
