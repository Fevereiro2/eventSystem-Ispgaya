from django.db.models import Q
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AppUser, CulturalContent, Role
from .permissions import IsClubAdmin, IsSuperAdmin
from .serializers import (
    AdminUserWriteSerializer,
    CulturalContentSerializer,
    LoginSerializer,
    RoleSerializer,
    UserSerializer,
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
            AppUser.objects.select_related('role')
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
    queryset = AppUser.objects.select_related('role').all()

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
        return AppUser.objects.select_related('role').order_by('-is_active', 'name', 'email')


class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    queryset = AppUser.objects.select_related('role').all()

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
        user = AppUser.objects.select_related('role').filter(pk=pk).first()
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
