from django.db.models import Q
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AppUser, CulturalContent
from .permissions import IsClubAdmin
from .serializers import CulturalContentSerializer, LoginSerializer, UserSerializer
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
