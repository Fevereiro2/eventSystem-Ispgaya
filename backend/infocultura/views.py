from pathlib import Path
from uuid import uuid4

from django.core.files.storage import default_storage
from django.db.models import Q
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AppUser, Book, Club, CulturalContent, Event, News, NewsStatus, RegistrationStatus, Role, Session
from .permissions import IsClubAdmin, IsSuperAdmin
from .serializers import (
    AdminBookWriteSerializer,
    AdminClubRegistrationSerializer,
    AdminEventWriteSerializer,
    AdminRegistrationStatusUpdateSerializer,
    AdminSessionWriteSerializer,
    AdminUserWriteSerializer,
    AdminNewsWriteSerializer,
    BookSerializer,
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


class PublicSessionListView(generics.ListAPIView):
    serializer_class = SessionSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Session.objects.select_related('club').filter(club__is_active=True)
        club_id = self.request.query_params.get('club_id')

        if club_id:
            queryset = queryset.filter(club_id=club_id)

        return queryset.order_by('session_date', 'start_date', '-id')


class PublicEventListView(generics.ListAPIView):
    serializer_class = EventSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Event.objects.select_related('user__club').filter(
            user__club__is_active=True
        ).filter(Q(status__iexact='published') | Q(status__iexact='publicado'))
        club_id = self.request.query_params.get('club_id')

        if club_id:
            queryset = queryset.filter(user__club_id=club_id)

        return queryset.order_by('event_date', 'start_date', '-id')


class AdminImageUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]

    allowed_folders = {'news', 'events', 'books'}

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


class AdminRegistrationStatusListView(generics.ListAPIView):
    serializer_class = RegistrationStatusSerializer
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]

    def get_queryset(self):
        return RegistrationStatus.objects.all().order_by('name')


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

        if role_name == 'club_admin':
            return queryset.filter(club_id=self.request.user.club_id).order_by(
                '-published_at', '-created_at', '-id'
            )

        if club_id and club_id.isdigit():
            queryset = queryset.filter(club_id=int(club_id))

        return queryset.order_by('-published_at', '-created_at', '-id')

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return NewsSerializer
        return AdminNewsWriteSerializer


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
            return NewsSerializer
        return AdminNewsWriteSerializer


class AdminBookListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]

    def get_queryset(self):
        queryset = Book.objects.select_related('club')
        allowed_club_id = get_allowed_club_id(self.request.user)
        club_id = self.request.query_params.get('club_id')

        if allowed_club_id is not None:
            return queryset.filter(club_id=allowed_club_id).order_by('-is_featured', 'title', '-id')

        if club_id and club_id.isdigit():
            queryset = queryset.filter(club_id=int(club_id))

        return queryset.order_by('-is_featured', 'title', '-id')

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return BookSerializer
        return AdminBookWriteSerializer


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

        if allowed_club_id is not None:
            return queryset.filter(club_id=allowed_club_id).order_by('session_date', 'start_date', '-id')

        if club_id and club_id.isdigit():
            queryset = queryset.filter(club_id=int(club_id))

        return queryset.order_by('session_date', 'start_date', '-id')

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return SessionSerializer
        return AdminSessionWriteSerializer


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
        queryset = Event.objects.select_related('user__club')
        allowed_club_id = get_allowed_club_id(self.request.user)
        club_id = self.request.query_params.get('club_id')

        if allowed_club_id is not None:
            return queryset.filter(user__club_id=allowed_club_id).order_by('event_date', 'start_date', '-id')

        if club_id and club_id.isdigit():
            queryset = queryset.filter(user__club_id=int(club_id))

        return queryset.order_by('event_date', 'start_date', '-id')

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return EventSerializer
        return AdminEventWriteSerializer


class AdminEventDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsClubAdmin]

    def get_queryset(self):
        queryset = Event.objects.select_related('user__club')
        allowed_club_id = get_allowed_club_id(self.request.user)

        if allowed_club_id is not None:
            return queryset.filter(user__club_id=allowed_club_id)

        return queryset

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return EventSerializer
        return AdminEventWriteSerializer


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
