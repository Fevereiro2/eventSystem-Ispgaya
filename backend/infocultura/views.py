from pathlib import Path
from uuid import uuid4
import csv

from django.core.files.storage import default_storage
from django.db.models import Q
from django.http import HttpResponse
from django.core.paginator import Paginator
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AppUser, Book, Category, Club, CulturalContent, Event, News, NewsStatus, RegistrationStatus, Role, Session
from .permissions import IsClubAdmin, IsSuperAdmin
from .serializers import (
    AdminBookWriteSerializer,
    AdminCategoryWriteSerializer,
    AdminClubRegistrationSerializer,
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
    ClubMemberAssignSerializer,
    ClubSerializer,
    CulturalContentSerializer,
    EventSerializer,
    LoginSerializer,
    NewsSerializer,
    NewsStatusSerializer,
    RegistrationStatusSerializer,
    RoleSerializer,
    SessionSerializer,
    UserSerializer,
)
from .services import (
    ClubRegistrationNotFoundError,
    get_admin_dashboard_metrics,
    list_admin_club_registrations,
    update_admin_club_registration_status,
)
from .security import check_password_hash, issue_access_token


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        identifier = serializer.validated_data['username'].strip()
        password = serializer.validated_data['password']

        user = (
            AppUser.objects.select_related('role', 'club')
            .filter(Q(email__iexact=identifier) | Q(name__iexact=identifier))
            .first()
        )

        if not user or not user.is_active:
            return Response({'message': 'Credenciais invalidas.'}, status=401)

        if not check_password_hash(password, user.password_hash):
            return Response({'message': 'Credenciais invalidas.'}, status=401)

        token = issue_access_token(
            user_id=user.id,
            role_name=user.role.name,
            email=user.email,
            name=user.name,
        )

        return Response(
            {
                'token': token,
                'user': UserSerializer(user).data,
            }
        )
        


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({'user': UserSerializer(request.user).data})


class AdminRoleListView(generics.ListAPIView):
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]

    def get_queryset(self):
        return Role.objects.all().order_by('name')


class AdminUserListCreateView(generics.ListCreateAPIView):
    queryset = AppUser.objects.select_related('role', 'club').all()

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
        return AppUser.objects.select_related('role', 'club').order_by('-is_active', 'name', 'email')


class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    queryset = AppUser.objects.select_related('role', 'club').all()

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

        if club_id:
            queryset = queryset.filter(club_id=club_id)

        return queryset.order_by('session_date', 'start_date', '-id')


class PublicSessionDetailView(generics.RetrieveAPIView):
    serializer_class = SessionSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Session.objects.select_related('club').filter(club__is_active=True)


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

        if club_id:
            queryset = queryset.filter(user__club_id=club_id)
        if category_id and category_id.isdigit():
            queryset = queryset.filter(categories__id=int(category_id))

        return queryset.order_by('event_date', 'start_date', '-id')


class PublicEventDetailView(generics.RetrieveAPIView):
    serializer_class = EventSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Event.objects.select_related('user__club').prefetch_related('categories').filter(
            user__club__is_active=True
        ).filter(Q(status__iexact='published') | Q(status__iexact='publicado'))


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


def build_csv_response(*, rows: list[list[str]], headers: list[str], filename: str) -> HttpResponse:
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    writer = csv.writer(response)
    writer.writerow(headers)
    writer.writerows(rows)
    return response


class AdminRegistrationStatusListView(generics.ListAPIView):
    serializer_class = RegistrationStatusSerializer
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]

    def get_queryset(self):
        return RegistrationStatus.objects.all().order_by('name')


class AdminDashboardSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]

    def get(self, request):
        return Response(get_admin_dashboard_metrics(user=request.user))


class AdminRegistrationListView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]

    def get(self, request):
        club_id_raw = request.query_params.get('club_id')
        status = request.query_params.get('status')
        search = request.query_params.get('search')
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
            allowed_club_id=get_allowed_registration_club_id(request.user),
            page=page,
            page_size=page_size,
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

        output = AdminClubRegistrationSerializer(updated_record)
        return Response({'registration': output.data})


class AdminContentListCreateView(generics.ListCreateAPIView):
    serializer_class = CulturalContentSerializer
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]

    def get_queryset(self):
        queryset = CulturalContent.objects.all()
        area = self.request.query_params.get('area')
        status = self.request.query_params.get('status')

        if area:
            queryset = queryset.filter(area=area)
        if status:
            queryset = queryset.filter(status=status)

        return queryset


class AdminContentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CulturalContent.objects.all()
    serializer_class = CulturalContentSerializer
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]


class AdminNewsStatusListView(generics.ListAPIView):
    serializer_class = NewsStatusSerializer
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]

    def get_queryset(self):
        return NewsStatus.objects.all().order_by('name')


class AdminNewsListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]

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

        return queryset.order_by('-published_at', '-created_at', '-id')

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


class AdminNewsDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]

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


class AdminBookListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]

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

        return queryset.order_by('-is_featured', 'title', '-id')

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


class AdminBookDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]

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


class AdminSessionListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]

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

        return queryset.order_by('session_date', 'start_date', '-id')

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


class AdminSessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]

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


class AdminEventListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]

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

        return queryset.order_by('event_date', 'start_date', '-id').distinct()

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


class AdminEventDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]

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


class AdminCategoryListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]

    def get_queryset(self):
        return Category.objects.all().order_by('name')

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return CategorySerializer
        return AdminCategoryWriteSerializer


class AdminCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]
    queryset = Category.objects.all().order_by('name')

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return CategorySerializer
        return AdminCategoryWriteSerializer


class AdminClubListCreateView(generics.ListCreateAPIView):
    serializer_class = ClubSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]

    def get_queryset(self):
        return Club.objects.all().order_by('name')


class AdminClubDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Club.objects.all()
    serializer_class = ClubSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]

    def destroy(self, request, *args, **kwargs):
        club = self.get_object()
        if AppUser.objects.filter(club=club).exists():
            return Response(
                {'message': 'Nao podes apagar um clube com utilizadores associados.'},
                status=400,
            )

        return super().destroy(request, *args, **kwargs)


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
        return Response({'user': UserSerializer(user).data})
