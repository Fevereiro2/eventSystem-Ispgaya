from datetime import timezone as dt_timezone
from pathlib import Path
from uuid import uuid4
import csv
import hashlib

from django.conf import settings
from django.core.cache import cache
from django.core.files.storage import default_storage
from django.db import DatabaseError
from django.db.models import Q
from django.http import HttpResponse
from django.core.paginator import Paginator
from django.utils import timezone
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AppUser, Book, Category, Club, CulturalContent, Event, News, NewsStatus, RegistrationStatus, Role, Session
from .permissions import IsClubAdmin, IsSuperAdmin
from .serializers import (
    AdminBulkIdsSerializer,
    AdminBulkStatusUpdateSerializer,
    AdminBookWriteSerializer,
    AdminCategoryWriteSerializer,
    AdminAuditLogSerializer,
    AdminClubRegistrationSerializer,
    AdminNotificationSerializer,
    AdminEventWriteSerializer,
    AdminEventReadSerializer,
    AdminRegistrationStatusUpdateSerializer,
    AdminSessionWriteSerializer,
    AdminUserWriteSerializer,
    AdminNewsWriteSerializer,
    AdminNewsReadSerializer,
    BookSerializer,
    CategorySerializer,
    ClubRegistrationCreateSerializer,
    EventRegistrationCreateSerializer,
    ClubMemberAssignSerializer,
    ClubSerializer,
    CulturalContentSerializer,
    EventSerializer,
    LoginSerializer,
    NewsSerializer,
    NewsStatusSerializer,
    RegistrationStatusSerializer,
    RoleSerializer,
    SessionRegistrationCreateSerializer,
    SessionSerializer,
    UserSerializer,
    EVENT_WORKFLOW_STATUS_ORDER,
    NEWS_WORKFLOW_STATUS_ORDER,
    get_role_allowed_workflow_statuses,
    normalize_workflow_status,
)
from .services import (
    ClubRegistrationNotFoundError,
    build_activity_calendar_payload,
    get_admin_dashboard_metrics,
    list_admin_audit_logs,
    get_admin_notifications,
    notify_event_workflow_status,
    list_admin_club_registrations,
    record_admin_audit_action,
    record_editorial_action,
    notify_news_workflow_status,
    update_admin_club_registration_status,
)
from .security import (
    check_password_hash,
    decode_refresh_token,
    is_refresh_token_revoked,
    issue_token_pair,
    revoke_refresh_token,
)


def _get_client_ip(request) -> str:
    forwarded_for = (request.META.get('HTTP_X_FORWARDED_FOR') or '').strip()
    if forwarded_for:
        return forwarded_for.split(',')[0].strip() or 'unknown'

    return (request.META.get('REMOTE_ADDR') or '').strip() or 'unknown'


def _get_login_rate_limit_config() -> tuple[int, int, int]:
    max_attempts = max(1, int(getattr(settings, 'INFOCULTURA_LOGIN_MAX_ATTEMPTS', 5)))
    window_seconds = max(60, int(getattr(settings, 'INFOCULTURA_LOGIN_WINDOW_SECONDS', 900)))
    lockout_seconds = max(60, int(getattr(settings, 'INFOCULTURA_LOGIN_LOCKOUT_SECONDS', 900)))
    return max_attempts, window_seconds, lockout_seconds


def _build_login_cache_key(*, prefix: str, client_ip: str, identifier: str) -> str:
    identifier_hash = hashlib.sha256(identifier.lower().encode('utf-8')).hexdigest()
    return f'infocultura:login:{prefix}:{client_ip}:{identifier_hash}'


def _get_login_lockout_message(lockout_seconds: int) -> str:
    minutes = max(1, lockout_seconds // 60)
    if minutes == 1:
        return 'Login temporariamente bloqueado. Tenta novamente dentro de 1 minuto.'
    return f'Login temporariamente bloqueado. Tenta novamente dentro de {minutes} minutos.'


def _is_login_locked(*, client_ip: str, identifier: str) -> bool:
    lock_key = _build_login_cache_key(prefix='lock', client_ip=client_ip, identifier=identifier)
    return bool(cache.get(lock_key))


def _clear_login_failures(*, client_ip: str, identifier: str) -> None:
    fail_key = _build_login_cache_key(prefix='fail', client_ip=client_ip, identifier=identifier)
    lock_key = _build_login_cache_key(prefix='lock', client_ip=client_ip, identifier=identifier)
    cache.delete_many([fail_key, lock_key])


def _record_failed_login_attempt(*, client_ip: str, identifier: str) -> bool:
    max_attempts, window_seconds, lockout_seconds = _get_login_rate_limit_config()
    fail_key = _build_login_cache_key(prefix='fail', client_ip=client_ip, identifier=identifier)
    lock_key = _build_login_cache_key(prefix='lock', client_ip=client_ip, identifier=identifier)

    added = cache.add(fail_key, 1, timeout=window_seconds)
    if added:
        attempts = 1
    else:
        attempts = cache.get(fail_key, 0)
        try:
            attempts = cache.incr(fail_key)
        except ValueError:
            attempts = int(attempts) + 1
            cache.set(fail_key, attempts, timeout=window_seconds)

    if int(attempts) >= max_attempts:
        cache.set(lock_key, True, timeout=lockout_seconds)
        cache.delete(fail_key)
        return True

    return False


def _get_auth_cookie_settings() -> dict[str, object]:
    return {
        'httponly': True,
        'secure': bool(getattr(settings, 'INFOCULTURA_AUTH_COOKIE_SECURE', False)),
        'samesite': getattr(settings, 'INFOCULTURA_AUTH_COOKIE_SAMESITE', 'Lax'),
        'path': '/',
    }


def _attach_auth_cookies(response: Response, *, access_token: str, refresh_token: str) -> None:
    cookie_settings = _get_auth_cookie_settings()
    access_cookie_name = getattr(settings, 'INFOCULTURA_ACCESS_COOKIE_NAME', 'infocultura_access')
    refresh_cookie_name = getattr(settings, 'INFOCULTURA_REFRESH_COOKIE_NAME', 'infocultura_refresh')
    response.set_cookie(
        access_cookie_name,
        access_token,
        max_age=max(60, int(getattr(settings, 'INFOCULTURA_ACCESS_TOKEN_MINUTES', 30)) * 60),
        **cookie_settings,
    )
    response.set_cookie(
        refresh_cookie_name,
        refresh_token,
        max_age=max(3600, int(getattr(settings, 'INFOCULTURA_REFRESH_TOKEN_DAYS', 7)) * 24 * 60 * 60),
        **cookie_settings,
    )


def _clear_auth_cookies(response: Response) -> None:
    cookie_settings = _get_auth_cookie_settings()
    access_cookie_name = getattr(settings, 'INFOCULTURA_ACCESS_COOKIE_NAME', 'infocultura_access')
    refresh_cookie_name = getattr(settings, 'INFOCULTURA_REFRESH_COOKIE_NAME', 'infocultura_refresh')
    response.delete_cookie(access_cookie_name, path='/', samesite=cookie_settings['samesite'])
    response.delete_cookie(refresh_cookie_name, path='/', samesite=cookie_settings['samesite'])


def _describe_audit_target(instance) -> str:
    for field_name in ('title', 'name', 'email'):
        value = getattr(instance, field_name, None)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return f'id={getattr(instance, "pk", None)}'


def _resolve_audit_club_id(instance) -> int | None:
    direct_club_id = getattr(instance, 'club_id', None)
    if direct_club_id is not None:
        return direct_club_id

    user = getattr(instance, 'user', None)
    if user is not None:
        return getattr(user, 'club_id', None)

    return None


class AdminAuditMixin:
    audit_content_type = 'resource'

    def write_audit_entry(self, request, *, action: str, instance=None, summary: str | None = None, object_id: int | None = None, metadata: dict[str, object] | None = None) -> None:
        target_instance = instance
        resolved_object_id = object_id if object_id is not None else getattr(target_instance, 'pk', None)
        resolved_summary = summary or _describe_audit_target(target_instance)
        record_admin_audit_action(
            action=action,
            content_type=self.audit_content_type,
            object_id=resolved_object_id,
            summary=resolved_summary,
            actor_user=request.user,
            club_id=_resolve_audit_club_id(target_instance) if target_instance is not None else None,
            metadata=metadata,
        )

    def perform_create(self, serializer):
        instance = serializer.save()
        self.write_audit_entry(self.request, action='create', instance=instance)

    def perform_update(self, serializer):
        instance = serializer.save()
        self.write_audit_entry(self.request, action='update', instance=instance)


class AdminAuditDestroyMixin(AdminAuditMixin):
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.write_audit_entry(request, action='delete', instance=instance)
        return super().destroy(request, *args, **kwargs)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        identifier = serializer.validated_data['username']
        password = serializer.validated_data['password']
        client_ip = _get_client_ip(request)
        _, _, lockout_seconds = _get_login_rate_limit_config()

        if _is_login_locked(client_ip=client_ip, identifier=identifier):
            return Response(
                {'message': _get_login_lockout_message(lockout_seconds)},
                status=429,
            )

        user = (
            AppUser.objects.select_related('role', 'club')
            .filter(Q(email__iexact=identifier) | Q(name__iexact=identifier))
            .first()
        )

        if not user or not user.is_active:
            locked = _record_failed_login_attempt(client_ip=client_ip, identifier=identifier)
            if locked:
                return Response(
                    {'message': _get_login_lockout_message(lockout_seconds)},
                    status=429,
                )
            return Response({'message': 'Credenciais invalidas.'}, status=401)

        if not check_password_hash(password, user.password_hash):
            locked = _record_failed_login_attempt(client_ip=client_ip, identifier=identifier)
            if locked:
                return Response(
                    {'message': _get_login_lockout_message(lockout_seconds)},
                    status=429,
                )
            return Response({'message': 'Credenciais invalidas.'}, status=401)

        _clear_login_failures(client_ip=client_ip, identifier=identifier)

        access_token, refresh_token = issue_token_pair(
            user_id=user.id,
            role_name=user.role.name,
            email=user.email,
            name=user.name,
        )

        response = Response(
            {
                'token': access_token,
                'user': UserSerializer(user).data,
            }
        )
        _attach_auth_cookies(response, access_token=access_token, refresh_token=refresh_token)
        return response


class RefreshTokenView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_cookie_name = getattr(settings, 'INFOCULTURA_REFRESH_COOKIE_NAME', 'infocultura_refresh')
        refresh_token = request.COOKIES.get(refresh_cookie_name)
        if not refresh_token:
            return Response({'message': 'Refresh token em falta.'}, status=401)

        try:
            payload = decode_refresh_token(refresh_token)
        except Exception:
            response = Response({'message': 'Refresh token invalido.'}, status=401)
            _clear_auth_cookies(response)
            return response

        if is_refresh_token_revoked(payload):
            response = Response({'message': 'Refresh token revogado.'}, status=401)
            _clear_auth_cookies(response)
            return response

        user_id = payload.get('sub')
        user = AppUser.objects.select_related('role', 'club').filter(id=user_id, is_active=True).first()
        if not user:
            response = Response({'message': 'Utilizador nao encontrado ou inativo.'}, status=401)
            _clear_auth_cookies(response)
            return response

        revoke_refresh_token(payload)
        access_token, next_refresh_token = issue_token_pair(
            user_id=user.id,
            role_name=user.role.name,
            email=user.email,
            name=user.name,
        )
        response = Response({'token': access_token, 'user': UserSerializer(user).data})
        _attach_auth_cookies(response, access_token=access_token, refresh_token=next_refresh_token)
        return response


class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_cookie_name = getattr(settings, 'INFOCULTURA_REFRESH_COOKIE_NAME', 'infocultura_refresh')
        refresh_token = request.COOKIES.get(refresh_cookie_name)
        if refresh_token:
            try:
                revoke_refresh_token(decode_refresh_token(refresh_token))
            except Exception:
                pass

        response = Response({'message': 'Sessao terminada.'}, status=200)
        _clear_auth_cookies(response)
        return response


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({'user': UserSerializer(request.user).data})


class AdminRoleListView(generics.ListAPIView):
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]

    def get_queryset(self):
        return Role.objects.all().order_by('name')


class AdminUserListCreateView(AdminAuditMixin, generics.ListCreateAPIView):
    queryset = AppUser.objects.select_related('role', 'club').all()
    audit_content_type = 'user'

    def get_permissions(self):
        if self.request.method == 'GET':
            permission_classes = [permissions.IsAuthenticated, IsClubAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]

        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return UserSerializer
        return AdminUserWriteSerializer

    def get_queryset(self):
        queryset = AppUser.objects.select_related('role', 'club')
        search = (self.request.query_params.get('search') or '').strip()

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(email__icontains=search)
                | Q(role__name__icontains=search)
                | Q(club__name__icontains=search)
            )

        queryset = apply_date_range_filters(queryset, self.request, date_field='created_at__date')
        return queryset.order_by('-is_active', 'name', 'email')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        if request.query_params.get('export') == 'csv':
            rows = [
                [
                    item.id,
                    item.name,
                    item.email,
                    item.role.name if item.role_id else '',
                    item.club.name if item.club_id and item.club else '',
                    'sim' if item.is_active else 'nao',
                    item.created_at.isoformat() if item.created_at else '',
                ]
                for item in queryset
            ]
            return build_csv_response(
                rows=rows,
                headers=['id', 'name', 'email', 'role', 'club', 'is_active', 'created_at'],
                filename='infocultura_users.csv',
            )

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class AdminUserDetailView(AdminAuditMixin, generics.RetrieveUpdateAPIView):
    queryset = AppUser.objects.select_related('role', 'club').all()
    audit_content_type = 'user'

    def get_permissions(self):
        if self.request.method == 'GET':
            permission_classes = [permissions.IsAuthenticated, IsClubAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]

        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return UserSerializer
        return AdminUserWriteSerializer

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        next_is_active = request.data.get('is_active')

        if user.id == request.user.id and next_is_active in (False, 'false', 'False', 0, '0'):
            return Response(
                {'message': 'Nao podes desativar o teu proprio utilizador.'},
                status=400,
            )

        return super().update(request, *args, **kwargs)


class AdminUserDeactivateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]

    def post(self, request, pk):
        user = AppUser.objects.select_related('role', 'club').filter(pk=pk).first()
        if not user:
            return Response({'message': 'Utilizador nao encontrado.'}, status=404)

        if user.id == request.user.id:
            return Response(
                {'message': 'Nao podes desativar o teu proprio utilizador.'},
                status=400,
            )

        user.is_active = False
        user.save(update_fields=['is_active'])
        record_admin_audit_action(
            action='deactivate',
            content_type='user',
            object_id=user.id,
            summary=user.email,
            actor_user=request.user,
            club_id=user.club_id,
        )
        return Response({'user': UserSerializer(user).data})


class PublicContentListView(generics.ListAPIView):
    serializer_class = CulturalContentSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = CulturalContent.objects.all()
        area = self.request.query_params.get('area')
        status = self.request.query_params.get('status', 'publicado')

        if area:
            queryset = queryset.filter(area=area)
        if status:
            queryset = queryset.filter(status=status)

        return queryset


class PublicClubListView(generics.ListAPIView):
    serializer_class = ClubSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Club.objects.filter(is_active=True).order_by('name')


class PublicClubDetailView(generics.RetrieveAPIView):
    serializer_class = ClubSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Club.objects.filter(is_active=True)


class PublicClubRegistrationCreateView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        club = Club.objects.filter(pk=pk, is_active=True).first()
        if not club:
            return Response({'message': 'Clube nao encontrado.'}, status=404)

        serializer = ClubRegistrationCreateSerializer(
            data=request.data,
            context={'club': club, 'request': request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {'message': 'Inscricao submetida com sucesso. Aguarda validacao.'},
            status=201,
        )


class PublicNewsStatusListView(generics.ListAPIView):
    serializer_class = NewsStatusSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return NewsStatus.objects.all().order_by('name')


class PublicNewsListView(generics.ListAPIView):
    serializer_class = NewsSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = News.objects.select_related('news_status', 'club').filter(
            news_status__name__iexact='published'
        )
        club_id = self.request.query_params.get('club_id')

        if club_id:
            queryset = queryset.filter(club_id=club_id)

        return queryset.order_by('-published_at', '-created_at', '-id')


class PublicNewsDetailView(generics.RetrieveAPIView):
    serializer_class = NewsSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return News.objects.select_related('news_status', 'club').filter(
            news_status__name__iexact='published'
        )


class PublicBookListView(generics.ListAPIView):
    serializer_class = BookSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Book.objects.select_related('club').filter(club__is_active=True)
        club_id = self.request.query_params.get('club_id')

        if club_id:
            queryset = queryset.filter(club_id=club_id)

        return queryset.order_by('-is_featured', 'title', '-id')


class PublicBookDetailView(generics.RetrieveAPIView):
    serializer_class = BookSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Book.objects.select_related('club').filter(club__is_active=True)


class PublicSessionListView(generics.ListAPIView):
    serializer_class = SessionSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Session.objects.select_related('club').filter(club__is_active=True)
        club_id = self.request.query_params.get('club_id')
        date_from = (self.request.query_params.get('date_from') or '').strip()
        date_to = (self.request.query_params.get('date_to') or '').strip()

        if club_id:
            queryset = queryset.filter(club_id=club_id)
        if date_from:
            queryset = queryset.filter(session_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(session_date__lte=date_to)

        return queryset.order_by('session_date', 'start_date', '-id')


class PublicSessionDetailView(generics.RetrieveAPIView):
    serializer_class = SessionSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Session.objects.select_related('club').filter(club__is_active=True)


class PublicSessionRegistrationCreateView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        session = Session.objects.select_related('club').filter(pk=pk, club__is_active=True).first()
        if not session:
            return Response({'message': 'Sessao nao encontrada.'}, status=404)

        serializer = SessionRegistrationCreateSerializer(
            data=request.data,
            context={'session': session, 'request': request},
        )
        serializer.is_valid(raise_exception=True)
        registration = serializer.save()

        return Response(
            {
                'message': 'Inscricao submetida com sucesso.',
                'status': registration.status,
                'registration_id': registration.id,
            },
            status=201,
        )


class PublicSessionCalendarView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        session = Session.objects.select_related('club').filter(pk=pk, club__is_active=True).first()
        if not session:
            return Response({'message': 'Sessao nao encontrada.'}, status=404)

        payload = build_activity_calendar_payload(
            title=session.title,
            description=session.description,
            start_date=session.start_date,
            end_date=session.end_date,
            location=session.title,
        )
        return build_calendar_ics_response(
            uid_prefix=f'session-{session.id}@infocultura',
            title=payload['title'],
            description=payload['description'],
            start_date=session.start_date,
            end_date=session.end_date,
            location=payload['location'],
            filename=f'sessao-{session.id}.ics',
        )


class PublicCategoryListView(generics.ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Category.objects.all().order_by('name')


class PublicEventListView(generics.ListAPIView):
    serializer_class = EventSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Event.objects.select_related('user__club').prefetch_related('categories').filter(
            user__club__is_active=True
        ).filter(Q(status__iexact='published') | Q(status__iexact='publicado'))
        club_id = self.request.query_params.get('club_id')
        category_id = self.request.query_params.get('category_id')
        city = (self.request.query_params.get('city') or '').strip()
        date_from = (self.request.query_params.get('date_from') or '').strip()
        date_to = (self.request.query_params.get('date_to') or '').strip()
        state = (self.request.query_params.get('state') or '').strip().lower()
        now = timezone.now()

        if club_id:
            queryset = queryset.filter(user__club_id=club_id)
        if category_id and category_id.isdigit():
            queryset = queryset.filter(categories__id=int(category_id))
        if city:
            queryset = queryset.filter(Q(city__icontains=city) | Q(location__icontains=city))
        if date_from:
            queryset = queryset.filter(event_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(event_date__lte=date_to)
        if state == 'upcoming':
            queryset = queryset.filter(start_date__gt=now)
        elif state == 'ongoing':
            queryset = queryset.filter(start_date__lte=now, end_date__gte=now)
        elif state == 'past':
            queryset = queryset.filter(end_date__lt=now)

        return queryset.order_by('event_date', 'start_date', '-id')


class PublicEventDetailView(generics.RetrieveAPIView):
    serializer_class = EventSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Event.objects.select_related('user__club').prefetch_related('categories').filter(
            user__club__is_active=True
        ).filter(Q(status__iexact='published') | Q(status__iexact='publicado'))


class PublicEventRegistrationCreateView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        event = (
            Event.objects.select_related('user__club')
            .prefetch_related('categories')
            .filter(pk=pk)
            .filter(user__club__is_active=True)
            .filter(Q(status__iexact='published') | Q(status__iexact='publicado'))
            .first()
        )
        if not event:
            return Response({'message': 'Evento nao encontrado.'}, status=404)

        serializer = EventRegistrationCreateSerializer(
            data=request.data,
            context={'event': event, 'request': request},
        )
        serializer.is_valid(raise_exception=True)
        registration = serializer.save()

        return Response(
            {
                'message': 'Inscricao submetida com sucesso.',
                'status': registration.status,
                'registration_id': registration.id,
            },
            status=201,
        )


class PublicEventCalendarView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        event = (
            Event.objects.select_related('user__club')
            .prefetch_related('categories')
            .filter(pk=pk)
            .filter(user__club__is_active=True)
            .filter(Q(status__iexact='published') | Q(status__iexact='publicado'))
            .first()
        )
        if not event:
            return Response({'message': 'Evento nao encontrado.'}, status=404)

        payload = build_activity_calendar_payload(
            title=event.title,
            description=event.description,
            start_date=event.start_date,
            end_date=event.end_date,
            location=event.location or event.city or 'Local por definir',
        )
        return build_calendar_ics_response(
            uid_prefix=f'event-{event.id}@infocultura',
            title=payload['title'],
            description=payload['description'],
            start_date=event.start_date,
            end_date=event.end_date,
            location=payload['location'],
            filename=f'evento-{event.id}.ics',
        )


class AdminImageUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]

    allowed_folders = {'news', 'events', 'books', 'clubs'}

    def post(self, request):
        uploaded_file = request.FILES.get('file')
        folder = (request.data.get('folder') or 'news').strip().lower()

        if folder not in self.allowed_folders:
            return Response({'message': 'Pasta de upload invalida.'}, status=400)

        if uploaded_file is None:
            return Response({'message': 'Seleciona um ficheiro para upload.'}, status=400)

        suffix = Path(uploaded_file.name).suffix.lower()
        if suffix not in {'.jpg', '.jpeg', '.png', '.webp', '.gif'}:
            return Response({'message': 'Formato de imagem nao suportado.'}, status=400)

        relative_path = f'infocultura/{folder}/{uuid4().hex}{suffix}'
        stored_path = default_storage.save(relative_path, uploaded_file)
        public_path = default_storage.url(stored_path)
        record_admin_audit_action(
            action='upload',
            content_type='image',
            summary=public_path,
            actor_user=request.user,
            metadata={'folder': folder, 'filename': uploaded_file.name},
        )
        return Response({'path': public_path}, status=201)


def get_allowed_registration_club_id(user) -> int | None:
    role_name = getattr(getattr(user, 'role', None), 'name', None)
    if role_name == 'club_admin':
        return user.club_id
    return None


def get_allowed_club_id(user) -> int | None:
    role_name = getattr(getattr(user, 'role', None), 'name', None)
    if role_name == 'club_admin':
        return user.club_id
    return None


def get_query_page(request) -> int:
    try:
        return max(1, int(request.query_params.get('page', '1')))
    except (TypeError, ValueError):
        return 1


def get_query_page_size(request, *, default: int = 10, maximum: int = 100) -> int:
    try:
        value = int(request.query_params.get('page_size', str(default)))
    except (TypeError, ValueError):
        return default
    return min(max(1, value), maximum)


def paginate_queryset(queryset, *, request, serializer_class, context=None):
    page = get_query_page(request)
    page_size = get_query_page_size(request)
    paginator = Paginator(queryset, page_size)
    page_obj = paginator.get_page(page)
    serializer = serializer_class(page_obj.object_list, many=True, context=context or {})
    return Response(
        {
            'items': serializer.data,
            'total': paginator.count,
            'page': page_obj.number,
            'page_size': page_size,
            'total_pages': paginator.num_pages,
        }
    )


def apply_date_range_filters(queryset, request, *, date_field: str):
    date_from = (request.query_params.get('date_from') or '').strip()
    date_to = (request.query_params.get('date_to') or '').strip()

    if date_from:
        queryset = queryset.filter(**{f'{date_field}__gte': date_from})
    if date_to:
        queryset = queryset.filter(**{f'{date_field}__lte': date_to})

    return queryset


def build_csv_response(*, rows: list[list[str]], headers: list[str], filename: str) -> HttpResponse:
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    writer = csv.writer(response)
    writer.writerow(headers)
    writer.writerows(rows)
    return response


def _format_ics_datetime(value):
    if timezone.is_naive(value):
        value = timezone.make_aware(value, timezone.get_current_timezone())
    return timezone.localtime(value, dt_timezone.utc).strftime('%Y%m%dT%H%M%SZ')


def _escape_ics_text(value: str) -> str:
    return (
        (value or '')
        .replace('\\', '\\\\')
        .replace(';', r'\;')
        .replace(',', r'\,')
        .replace('\n', r'\n')
    )


def build_calendar_ics_response(*, uid_prefix: str, title: str, description: str, start_date, end_date, location: str, filename: str) -> HttpResponse:
    content = '\r\n'.join(
        [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//ISPGAYA//InfoCultura//PT',
            'CALSCALE:GREGORIAN',
            'BEGIN:VEVENT',
            f'UID:{uid_prefix}',
            f'DTSTAMP:{_format_ics_datetime(timezone.now())}',
            f'DTSTART:{_format_ics_datetime(start_date)}',
            f'DTEND:{_format_ics_datetime(end_date)}',
            f'SUMMARY:{_escape_ics_text(title)}',
            f'DESCRIPTION:{_escape_ics_text(description)}',
            f'LOCATION:{_escape_ics_text(location)}',
            'END:VEVENT',
            'END:VCALENDAR',
            '',
        ]
    )
    response = HttpResponse(content, content_type='text/calendar; charset=utf-8')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response


def apply_admin_ordering(queryset, request, *, default_ordering: tuple[str, ...], ordering_map: dict[str, tuple[str, ...]]):
    ordering_key = (request.query_params.get('ordering') or '').strip().lower()
    ordering = ordering_map.get(ordering_key, default_ordering)
    return queryset.order_by(*ordering)


class AdminRegistrationStatusListView(generics.ListAPIView):
    serializer_class = RegistrationStatusSerializer
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]

    def get_queryset(self):
        return RegistrationStatus.objects.all().order_by('name')


class AdminDashboardSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]

    def get(self, request):
        return Response(get_admin_dashboard_metrics(user=request.user))


class AdminAuditLogListView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]

    def get(self, request):
        logs = list_admin_audit_logs(limit=100)
        serializer = AdminAuditLogSerializer(logs, many=True)
        return Response(serializer.data)


class AdminDashboardNotificationsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]

    def get(self, request):
        notifications = get_admin_notifications(user=request.user)
        serializer = AdminNotificationSerializer(notifications, many=True)
        return Response(serializer.data)


class AdminRegistrationListView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]

    def get(self, request):
        club_id_raw = request.query_params.get('club_id')
        status = request.query_params.get('status')
        search = request.query_params.get('search')
        ordering = (request.query_params.get('ordering') or '').strip() or None
        date_from = (request.query_params.get('date_from') or '').strip() or None
        date_to = (request.query_params.get('date_to') or '').strip() or None
        page_raw = request.query_params.get('page', '1')
        page_size_raw = request.query_params.get('page_size', '10')
        role_name = getattr(getattr(request.user, 'role', None), 'name', None)
        page = int(page_raw) if page_raw.isdigit() else 1
        page_size = int(page_size_raw) if page_size_raw.isdigit() else 10

        if role_name == 'club_admin' and not request.user.club_id:
            return Response(
                {
                    'items': [],
                    'total': 0,
                    'page': page,
                    'page_size': page_size,
                    'total_pages': 0,
                },
                status=200,
            )

        if role_name == 'club_admin':
            club_id = request.user.club_id
        else:
            club_id = int(club_id_raw) if club_id_raw and club_id_raw.isdigit() else None

        registration_page = list_admin_club_registrations(
            club_id=club_id,
            status=status if status and status != 'all' else None,
            search=search,
            ordering=ordering,
            date_from=date_from,
            date_to=date_to,
            allowed_club_id=get_allowed_registration_club_id(request.user),
            page=page,
            page_size=page_size,
        )

        if request.query_params.get('export') == 'csv':
            export_page = list_admin_club_registrations(
                club_id=club_id,
                status=status if status and status != 'all' else None,
                search=search,
                ordering=ordering,
                date_from=date_from,
                date_to=date_to,
                allowed_club_id=get_allowed_registration_club_id(request.user),
                export_all=True,
            )
            rows = [
                [
                    item.registration_id,
                    item.club_name,
                    item.name,
                    item.email,
                    item.phone or '',
                    item.message or '',
                    item.status,
                    item.created_at.isoformat() if item.created_at else '',
                ]
                for item in export_page.items
            ]
            return build_csv_response(
                rows=rows,
                headers=['id', 'club', 'name', 'email', 'phone', 'message', 'status', 'created_at'],
                filename='infocultura_registrations.csv',
            )

        serializer = AdminClubRegistrationSerializer(registration_page.items, many=True)
        return Response(
            {
                'items': serializer.data,
                'total': registration_page.total,
                'page': registration_page.page,
                'page_size': registration_page.page_size,
                'total_pages': registration_page.total_pages,
            }
        )


class AdminRegistrationStatusUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]

    def patch(self, request, pk):
        serializer = AdminRegistrationStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            updated_record = update_admin_club_registration_status(
                registration_id=pk,
                registration_status=serializer.validated_data['registration_status'],
                allowed_club_id=get_allowed_registration_club_id(request.user),
            )
        except ClubRegistrationNotFoundError:
            return Response({'message': 'Inscricao nao encontrada.'}, status=404)

        record_admin_audit_action(
            action='update_status',
            content_type='registration',
            object_id=updated_record.registration_id,
            summary=updated_record.email,
            actor_user=request.user,
            club_id=updated_record.club_id,
            metadata={'status': updated_record.status},
        )
        output = AdminClubRegistrationSerializer(updated_record)
        return Response({'registration': output.data})


class AdminRegistrationBulkStatusUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]

    def post(self, request):
        serializer = AdminBulkStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        status_serializer = AdminRegistrationStatusUpdateSerializer(
            data={'status': serializer.validated_data['status']}
        )
        status_serializer.is_valid(raise_exception=True)

        updated_items = []
        for registration_id in serializer.validated_data['ids']:
            try:
                updated_record = update_admin_club_registration_status(
                    registration_id=registration_id,
                    registration_status=status_serializer.validated_data['registration_status'],
                    allowed_club_id=get_allowed_registration_club_id(request.user),
                )
            except ClubRegistrationNotFoundError:
                continue

            updated_items.append(updated_record)

        if updated_items:
            record_admin_audit_action(
                action='bulk_update_status',
                content_type='registration',
                summary=f'{len(updated_items)} inscricoes atualizadas',
                actor_user=request.user,
                metadata={'ids': [item.registration_id for item in updated_items]},
            )
        output = AdminClubRegistrationSerializer(updated_items, many=True)
        return Response({'items': output.data, 'updated': len(updated_items)})


class AdminContentListCreateView(AdminAuditMixin, generics.ListCreateAPIView):
    serializer_class = CulturalContentSerializer
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]
    audit_content_type = 'content'

    def get_queryset(self):
        queryset = CulturalContent.objects.all()
        area = self.request.query_params.get('area')
        status = self.request.query_params.get('status')

        if area:
            queryset = queryset.filter(area=area)
        if status:
            queryset = queryset.filter(status=status)

        return queryset


class AdminContentDetailView(AdminAuditDestroyMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = CulturalContent.objects.all()
    serializer_class = CulturalContentSerializer
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]
    audit_content_type = 'content'


class AdminNewsStatusListView(generics.ListAPIView):
    serializer_class = NewsStatusSerializer
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]

    def get_queryset(self):
        return NewsStatus.objects.all().order_by('name')


class AdminNewsListCreateView(AdminAuditMixin, generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]
    audit_content_type = 'news'

    ordering_map = {
        'newest': ('-published_at', '-created_at', '-id'),
        'oldest': ('published_at', 'created_at', 'id'),
        'title_asc': ('title', '-id'),
        'title_desc': ('-title', '-id'),
        'club_asc': ('club__name', '-id'),
        'club_desc': ('-club__name', '-id'),
        'status_asc': ('news_status__name', '-id'),
        'status_desc': ('-news_status__name', '-id'),
    }

    def get_queryset(self):
        queryset = News.objects.select_related('news_status', 'club')
        role_name = getattr(getattr(self.request.user, 'role', None), 'name', None)
        club_id = self.request.query_params.get('club_id')
        status = (self.request.query_params.get('status') or '').strip().lower()
        search = (self.request.query_params.get('search') or '').strip()

        if role_name == 'club_admin':
            queryset = queryset.filter(club_id=self.request.user.club_id)
        elif club_id and club_id.isdigit():
            queryset = queryset.filter(club_id=int(club_id))

        if status and status != 'all':
            queryset = queryset.filter(news_status__name__iexact=status)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(summary__icontains=search)
                | Q(content__icontains=search)
                | Q(club__name__icontains=search)
            )

        queryset = apply_date_range_filters(queryset, self.request, date_field='created_at__date')
        return apply_admin_ordering(
            queryset,
            self.request,
            default_ordering=('-published_at', '-created_at', '-id'),
            ordering_map=self.ordering_map,
        )

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return AdminNewsReadSerializer
        return AdminNewsWriteSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        if request.query_params.get('export') == 'csv':
            rows = [
                [
                    item.id,
                    item.title,
                    item.club.name if item.club_id else '',
                    item.news_status.name if item.news_status_id else '',
                    item.published_at.isoformat() if item.published_at else '',
                    item.created_at.isoformat() if item.created_at else '',
                ]
                for item in queryset
            ]
            return build_csv_response(
                rows=rows,
                headers=['id', 'title', 'club', 'status', 'published_at', 'created_at'],
                filename='infocultura_news.csv',
            )

        return paginate_queryset(
            queryset,
            request=request,
            serializer_class=self.get_serializer_class(),
            context=self.get_serializer_context(),
        )


class AdminNewsDetailView(AdminAuditDestroyMixin, generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]
    audit_content_type = 'news'

    def get_queryset(self):
        queryset = News.objects.select_related('news_status', 'club')
        role_name = getattr(getattr(self.request.user, 'role', None), 'name', None)

        if role_name == 'club_admin':
            return queryset.filter(club_id=self.request.user.club_id)

        return queryset

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return AdminNewsReadSerializer
        return AdminNewsWriteSerializer


class AdminNewsBulkStatusUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]

    def post(self, request):
        serializer = AdminBulkStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        target_status = normalize_workflow_status(serializer.validated_data['status'])
        role_name = getattr(getattr(request.user, 'role', None), 'name', None)
        queryset = News.objects.select_related('news_status', 'club').filter(
            id__in=serializer.validated_data['ids']
        )

        if role_name == 'club_admin':
            queryset = queryset.filter(club_id=request.user.club_id)

        news_status = NewsStatus.objects.filter(name__iexact=target_status).first()
        if news_status is None:
            return Response({'message': 'Estado editorial invalido.'}, status=400)

        items = list(queryset)
        for item in items:
            allowed_statuses = get_role_allowed_workflow_statuses(
                role_name=role_name,
                base_statuses=NEWS_WORKFLOW_STATUS_ORDER,
                current_status=normalize_workflow_status(item.news_status.name),
            )
            if target_status not in allowed_statuses:
                return Response(
                    {'message': 'Um ou mais registos nao podem passar para esse estado.'},
                    status=400,
                )

        updated_items = []
        for item in items:
            previous_status = item.news_status.name
            item.news_status = news_status
            item.updated_at = timezone.now()
            if target_status == 'published' and not item.published_at:
                item.published_at = timezone.now()
            elif target_status in {'draft', 'review'}:
                item.published_at = None
            item.save(update_fields=['news_status', 'updated_at', 'published_at'])
            record_editorial_action(
                content_type='news',
                object_id=item.id,
                from_status=previous_status,
                to_status=news_status.name,
                actor_user=request.user,
                club_id=item.club_id,
            )
            notify_news_workflow_status(
                news=item,
                previous_status=previous_status,
                next_status=news_status.name,
            )
            updated_items.append(item)

        output = AdminNewsReadSerializer(updated_items, many=True)
        if updated_items:
            record_admin_audit_action(
                action='bulk_update_status',
                content_type='news',
                summary=f'{len(updated_items)} noticias atualizadas',
                actor_user=request.user,
                metadata={'ids': [item.id for item in updated_items], 'status': news_status.name},
            )
        return Response({'items': output.data, 'updated': len(updated_items)})


class AdminNewsBulkDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]

    def post(self, request):
        serializer = AdminBulkIdsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        queryset = News.objects.filter(id__in=serializer.validated_data['ids'])
        role_name = getattr(getattr(request.user, 'role', None), 'name', None)
        if role_name == 'club_admin':
            queryset = queryset.filter(club_id=request.user.club_id)

        deleted_ids = list(queryset.values_list('id', flat=True))
        deleted_count = len(deleted_ids)
        queryset.delete()
        if deleted_count:
            record_admin_audit_action(
                action='bulk_delete',
                content_type='news',
                summary=f'{deleted_count} noticias removidas',
                actor_user=request.user,
                metadata={'ids': deleted_ids},
            )
        return Response({'deleted': deleted_count})


class AdminBookListCreateView(AdminAuditMixin, generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]
    audit_content_type = 'book'

    ordering_map = {
        'featured': ('-is_featured', 'title', '-id'),
        'newest': ('-created_at', '-id'),
        'oldest': ('created_at', 'id'),
        'title_asc': ('title', '-id'),
        'title_desc': ('-title', '-id'),
        'year_desc': ('-publication_year', '-id'),
        'year_asc': ('publication_year', '-id'),
        'club_asc': ('club__name', '-id'),
        'club_desc': ('-club__name', '-id'),
    }

    def get_queryset(self):
        queryset = Book.objects.select_related('club')
        allowed_club_id = get_allowed_club_id(self.request.user)
        club_id = self.request.query_params.get('club_id')
        search = (self.request.query_params.get('search') or '').strip()

        if allowed_club_id is not None:
            queryset = queryset.filter(club_id=allowed_club_id)
        elif club_id and club_id.isdigit():
            queryset = queryset.filter(club_id=int(club_id))
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(author__icontains=search)
                | Q(summary__icontains=search)
                | Q(publisher__icontains=search)
                | Q(club__name__icontains=search)
            )

        queryset = apply_date_range_filters(queryset, self.request, date_field='created_at__date')
        return apply_admin_ordering(
            queryset,
            self.request,
            default_ordering=('-is_featured', 'title', '-id'),
            ordering_map=self.ordering_map,
        )

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return BookSerializer
        return AdminBookWriteSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        if request.query_params.get('export') == 'csv':
            rows = [
                [
                    item.id,
                    item.title,
                    item.author,
                    item.club.name if item.club_id else '',
                    item.publication_year,
                    'sim' if item.is_featured else 'nao',
                ]
                for item in queryset
            ]
            return build_csv_response(
                rows=rows,
                headers=['id', 'title', 'author', 'club', 'publication_year', 'is_featured'],
                filename='infocultura_books.csv',
            )

        return paginate_queryset(
            queryset,
            request=request,
            serializer_class=self.get_serializer_class(),
            context=self.get_serializer_context(),
        )


class AdminBookDetailView(AdminAuditDestroyMixin, generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]
    audit_content_type = 'book'

    def get_queryset(self):
        queryset = Book.objects.select_related('club')
        allowed_club_id = get_allowed_club_id(self.request.user)

        if allowed_club_id is not None:
            return queryset.filter(club_id=allowed_club_id)

        return queryset

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return BookSerializer
        return AdminBookWriteSerializer


class AdminBookBulkDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]

    def post(self, request):
        serializer = AdminBulkIdsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        queryset = Book.objects.filter(id__in=serializer.validated_data['ids'])
        allowed_club_id = get_allowed_club_id(request.user)
        if allowed_club_id is not None:
            queryset = queryset.filter(club_id=allowed_club_id)

        deleted_ids = list(queryset.values_list('id', flat=True))
        deleted_count = len(deleted_ids)
        queryset.delete()
        if deleted_count:
            record_admin_audit_action(
                action='bulk_delete',
                content_type='book',
                summary=f'{deleted_count} livros removidos',
                actor_user=request.user,
                metadata={'ids': deleted_ids},
            )
        return Response({'deleted': deleted_count})


class AdminSessionListCreateView(AdminAuditMixin, generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]
    audit_content_type = 'session'

    ordering_map = {
        'date_asc': ('session_date', 'start_date', '-id'),
        'date_desc': ('-session_date', '-start_date', '-id'),
        'newest': ('-created_at', '-id'),
        'oldest': ('created_at', 'id'),
        'title_asc': ('title', '-id'),
        'title_desc': ('-title', '-id'),
        'club_asc': ('club__name', '-id'),
        'club_desc': ('-club__name', '-id'),
    }

    def get_queryset(self):
        queryset = Session.objects.select_related('club')
        allowed_club_id = get_allowed_club_id(self.request.user)
        club_id = self.request.query_params.get('club_id')
        search = (self.request.query_params.get('search') or '').strip()

        if allowed_club_id is not None:
            queryset = queryset.filter(club_id=allowed_club_id)
        elif club_id and club_id.isdigit():
            queryset = queryset.filter(club_id=int(club_id))
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(title__icontains=search)
                | Q(description__icontains=search)
                | Q(club__name__icontains=search)
            )

        queryset = apply_date_range_filters(queryset, self.request, date_field='session_date')
        return apply_admin_ordering(
            queryset,
            self.request,
            default_ordering=('session_date', 'start_date', '-id'),
            ordering_map=self.ordering_map,
        )

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return SessionSerializer
        return AdminSessionWriteSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        if request.query_params.get('export') == 'csv':
            rows = [
                [
                    item.id,
                    item.title,
                    item.name,
                    item.club.name if item.club_id else '',
                    item.session_date.isoformat() if item.session_date else '',
                    item.start_date.isoformat() if item.start_date else '',
                    item.end_date.isoformat() if item.end_date else '',
                ]
                for item in queryset
            ]
            return build_csv_response(
                rows=rows,
                headers=['id', 'title', 'name', 'club', 'session_date', 'start_date', 'end_date'],
                filename='infocultura_sessions.csv',
            )

        return paginate_queryset(
            queryset,
            request=request,
            serializer_class=self.get_serializer_class(),
            context=self.get_serializer_context(),
        )


class AdminSessionDetailView(AdminAuditDestroyMixin, generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]
    audit_content_type = 'session'

    def get_queryset(self):
        queryset = Session.objects.select_related('club')
        allowed_club_id = get_allowed_club_id(self.request.user)

        if allowed_club_id is not None:
            return queryset.filter(club_id=allowed_club_id)

        return queryset

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return SessionSerializer
        return AdminSessionWriteSerializer


class AdminEventListCreateView(AdminAuditMixin, generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]
    audit_content_type = 'event'

    ordering_map = {
        'date_asc': ('event_date', 'start_date', '-id'),
        'date_desc': ('-event_date', '-start_date', '-id'),
        'newest': ('-created_at', '-id'),
        'oldest': ('created_at', 'id'),
        'title_asc': ('title', '-id'),
        'title_desc': ('-title', '-id'),
        'club_asc': ('user__club__name', '-id'),
        'club_desc': ('-user__club__name', '-id'),
        'status_asc': ('status', '-id'),
        'status_desc': ('-status', '-id'),
    }

    def get_queryset(self):
        queryset = Event.objects.select_related('user__club').prefetch_related('categories')
        allowed_club_id = get_allowed_club_id(self.request.user)
        club_id = self.request.query_params.get('club_id')
        category_id = self.request.query_params.get('category_id')
        status = (self.request.query_params.get('status') or '').strip().lower()
        search = (self.request.query_params.get('search') or '').strip()

        if allowed_club_id is not None:
            queryset = queryset.filter(user__club_id=allowed_club_id)
        elif club_id and club_id.isdigit():
            queryset = queryset.filter(user__club_id=int(club_id))

        if category_id and category_id.isdigit():
            queryset = queryset.filter(categories__id=int(category_id))
        if status and status != 'all':
            queryset = queryset.filter(status__iexact=status)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(description__icontains=search)
                | Q(city__icontains=search)
                | Q(location__icontains=search)
                | Q(user__club__name__icontains=search)
            )

        queryset = apply_date_range_filters(queryset, self.request, date_field='event_date')
        queryset = apply_admin_ordering(
            queryset,
            self.request,
            default_ordering=('event_date', 'start_date', '-id'),
            ordering_map=self.ordering_map,
        )
        return queryset.distinct()

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return AdminEventReadSerializer
        return AdminEventWriteSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        if request.query_params.get('export') == 'csv':
            rows = [
                [
                    item.id,
                    item.title,
                    item.user.club.name if item.user_id and item.user and item.user.club else '',
                    item.status,
                    item.event_date.isoformat() if item.event_date else '',
                    item.start_date.isoformat() if item.start_date else '',
                    item.location,
                    ', '.join(item.categories.values_list('name', flat=True)),
                ]
                for item in queryset
            ]
            return build_csv_response(
                rows=rows,
                headers=['id', 'title', 'club', 'status', 'event_date', 'start_date', 'location', 'categories'],
                filename='infocultura_events.csv',
            )

        return paginate_queryset(
            queryset,
            request=request,
            serializer_class=self.get_serializer_class(),
            context=self.get_serializer_context(),
        )


class AdminEventDetailView(AdminAuditDestroyMixin, generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]
    audit_content_type = 'event'

    def get_queryset(self):
        queryset = Event.objects.select_related('user__club').prefetch_related('categories')
        allowed_club_id = get_allowed_club_id(self.request.user)

        if allowed_club_id is not None:
            return queryset.filter(user__club_id=allowed_club_id)

        return queryset

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return AdminEventReadSerializer
        return AdminEventWriteSerializer


class AdminEventBulkStatusUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]

    def post(self, request):
        serializer = AdminBulkStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        target_status = normalize_workflow_status(serializer.validated_data['status'])
        role_name = getattr(getattr(request.user, 'role', None), 'name', None)
        queryset = Event.objects.select_related('user__club').prefetch_related('categories').filter(
            id__in=serializer.validated_data['ids']
        )

        if role_name == 'club_admin':
            queryset = queryset.filter(user__club_id=request.user.club_id)

        items = list(queryset)
        for item in items:
            allowed_statuses = get_role_allowed_workflow_statuses(
                role_name=role_name,
                base_statuses=EVENT_WORKFLOW_STATUS_ORDER,
                current_status=normalize_workflow_status(item.status),
            )
            if target_status not in allowed_statuses:
                return Response(
                    {'message': 'Um ou mais eventos nao podem passar para esse estado.'},
                    status=400,
                )

        updated_items = []
        for item in items:
            previous_status = item.status
            item.status = target_status
            item.updated_at = timezone.now()
            item.save(update_fields=['status', 'updated_at'])
            record_editorial_action(
                content_type='event',
                object_id=item.id,
                from_status=previous_status,
                to_status=target_status,
                actor_user=request.user,
                club_id=item.user.club_id if item.user_id and item.user else None,
            )
            notify_event_workflow_status(
                event=item,
                previous_status=previous_status,
                next_status=target_status,
            )
            updated_items.append(item)

        output = AdminEventReadSerializer(updated_items, many=True)
        if updated_items:
            record_admin_audit_action(
                action='bulk_update_status',
                content_type='event',
                summary=f'{len(updated_items)} eventos atualizados',
                actor_user=request.user,
                metadata={'ids': [item.id for item in updated_items], 'status': target_status},
            )
        return Response({'items': output.data, 'updated': len(updated_items)})


class AdminEventBulkDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]

    def post(self, request):
        serializer = AdminBulkIdsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        queryset = Event.objects.filter(id__in=serializer.validated_data['ids'])
        role_name = getattr(getattr(request.user, 'role', None), 'name', None)
        if role_name == 'club_admin':
            queryset = queryset.filter(user__club_id=request.user.club_id)

        deleted_ids = list(queryset.values_list('id', flat=True))
        deleted_count = len(deleted_ids)
        queryset.delete()
        if deleted_count:
            record_admin_audit_action(
                action='bulk_delete',
                content_type='event',
                summary=f'{deleted_count} eventos removidos',
                actor_user=request.user,
                metadata={'ids': deleted_ids},
            )
        return Response({'deleted': deleted_count})


class AdminCategoryListCreateView(AdminAuditMixin, generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]
    audit_content_type = 'category'

    def get_queryset(self):
        return Category.objects.all().order_by('name')

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return CategorySerializer
        return AdminCategoryWriteSerializer


class AdminCategoryDetailView(AdminAuditDestroyMixin, generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]
    queryset = Category.objects.all().order_by('name')
    audit_content_type = 'category'

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return CategorySerializer
        return AdminCategoryWriteSerializer


class AdminClubListCreateView(AdminAuditMixin, generics.ListCreateAPIView):
    serializer_class = ClubSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]
    audit_content_type = 'club'

    def get_queryset(self):
        queryset = Club.objects.all()
        search = (self.request.query_params.get('search') or '').strip()

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(description__icontains=search)
                | Q(mission__icontains=search)
            )

        queryset = apply_date_range_filters(queryset, self.request, date_field='created_at__date')
        return queryset.order_by('name')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        if request.query_params.get('export') == 'csv':
            rows = [
                [
                    item.id,
                    item.name,
                    item.description or '',
                    item.mission or '',
                    'sim' if item.is_active else 'nao',
                    'sim' if item.enable_registrations else 'nao',
                    item.created_at.isoformat() if item.created_at else '',
                ]
                for item in queryset
            ]
            return build_csv_response(
                rows=rows,
                headers=[
                    'id',
                    'name',
                    'description',
                    'mission',
                    'is_active',
                    'enable_registrations',
                    'created_at',
                ],
                filename='infocultura_clubs.csv',
            )

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class AdminClubDetailView(AdminAuditDestroyMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Club.objects.all()
    serializer_class = ClubSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]
    audit_content_type = 'club'

    def destroy(self, request, *args, **kwargs):
        club = self.get_object()
        if AppUser.objects.filter(club=club).exists():
            return Response(
                {'message': 'Nao podes apagar um clube com utilizadores associados.'},
                status=400,
            )

        if News.objects.filter(club=club).exists() or Book.objects.filter(club=club).exists() or Session.objects.filter(club=club).exists():
            return Response(
                {
                    'message':
                        'Nao podes apagar um clube com conteúdos ou atividades associadas. Remove noticias, livros e sessoes primeiro.'
                },
                status=400,
            )

        try:
            return super().destroy(request, *args, **kwargs)
        except DatabaseError:
            return Response(
                {
                    'message':
                        'Erro ao apagar o clube. Verifica se existem dependências na base de dados e tenta novamente.'
                },
                status=400,
            )


class AdminClubMemberAssignView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]

    def post(self, request, pk):
        club = Club.objects.filter(pk=pk).first()
        if not club:
            return Response({'message': 'Clube nao encontrado.'}, status=404)

        serializer = ClubMemberAssignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        user.club = club
        user.save(update_fields=['club'])
        record_admin_audit_action(
            action='assign_member',
            content_type='club',
            object_id=club.id,
            summary=club.name,
            actor_user=request.user,
            club_id=club.id,
            metadata={'user_id': user.id, 'user_email': user.email},
        )

        return Response({'user': UserSerializer(user).data, 'club': ClubSerializer(club).data})


class AdminClubMemberRemoveView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]

    def delete(self, request, pk, user_pk):
        club = Club.objects.filter(pk=pk).first()
        if not club:
            return Response({'message': 'Clube nao encontrado.'}, status=404)

        user = AppUser.objects.select_related('role', 'club').filter(pk=user_pk).first()
        if not user:
            return Response({'message': 'Utilizador nao encontrado.'}, status=404)

        if user.club_id != club.id:
            return Response(
                {'message': 'O utilizador nao pertence a este clube.'},
                status=400,
            )

        user.club = None
        user.save(update_fields=['club'])
        record_admin_audit_action(
            action='remove_member',
            content_type='club',
            object_id=club.id,
            summary=club.name,
            actor_user=request.user,
            club_id=club.id,
            metadata={'user_id': user.id, 'user_email': user.email},
        )
        return Response({'user': UserSerializer(user).data})
