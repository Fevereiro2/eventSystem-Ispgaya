from rest_framework import serializers
from django.utils import timezone

from .models import AppUser, Club, CulturalContent, News, NewsStatus, Role
from .services import (
    ClubRegistrationInput,
    DuplicateClubRegistrationError,
    create_club_registration,
)
from .security import hash_password


class CulturalContentSerializer(serializers.ModelSerializer):
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = CulturalContent
        fields = ['id', 'area', 'title', 'description', 'date', 'status', 'updatedAt']


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()


class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='role.name', read_only=True)
    club_id = serializers.SerializerMethodField()
    club_name = serializers.SerializerMethodField()

    class Meta:
        model = AppUser
        fields = ['id', 'name', 'email', 'role', 'is_active', 'club_id', 'club_name']

    def get_club_id(self, obj):
        return obj.club_id

    def get_club_name(self, obj):
        return obj.club.name if obj.club else None


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name', 'description']


class AdminUserWriteSerializer(serializers.ModelSerializer):
    role = serializers.SlugRelatedField(slug_field='name', queryset=Role.objects.all())
    club_id = serializers.PrimaryKeyRelatedField(
        source='club',
        queryset=Club.objects.all(),
        allow_null=True,
        required=False,
    )
    password = serializers.CharField(write_only=True, required=False, allow_blank=False)

    class Meta:
        model = AppUser
        fields = ['id', 'name', 'email', 'role', 'club_id', 'is_active', 'password']
        read_only_fields = ['id']
        extra_kwargs = {
            'is_active': {'required': False},
        }

    def validate_email(self, value):
        queryset = AppUser.objects.filter(email__iexact=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError('Ja existe um utilizador com este email.')

        return value

    def validate(self, attrs):
        if self.instance is None and not attrs.get('password'):
            raise serializers.ValidationError({'password': 'A password e obrigatoria.'})

        return attrs

    def create(self, validated_data):
        raw_password = validated_data.pop('password')
        validated_data['password_hash'] = hash_password(raw_password)
        validated_data.setdefault('is_active', True)
        user = AppUser.objects.create(**validated_data)
        return user

    def update(self, instance, validated_data):
        raw_password = validated_data.pop('password', None)

        for field, value in validated_data.items():
            setattr(instance, field, value)

        if raw_password:
            instance.password_hash = hash_password(raw_password)

        instance.save()
        return instance

    def to_representation(self, instance):
        return UserSerializer(instance).data


class ClubSerializer(serializers.ModelSerializer):
    class Meta:
        model = Club
        fields = [
            'id',
            'name',
            'description',
            'mission',
            'is_active',
            'enable_registrations',
            'created_at',
        ]


class ClubMemberAssignSerializer(serializers.Serializer):
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=AppUser.objects.select_related('role', 'club').all(),
        source='user',
    )

    def validate_user(self, user):
        if not user.is_active:
            raise serializers.ValidationError('O utilizador tem de estar ativo.')

        if user.club_id:
            raise serializers.ValidationError('O utilizador ja pertence a um clube.')

        return user


class NewsStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsStatus
        fields = ['id', 'name', 'description']


class NewsSerializer(serializers.ModelSerializer):
    news_status_id = serializers.IntegerField(source='news_status_id', read_only=True)
    news_status_name = serializers.CharField(source='news_status.name', read_only=True)
    club_id = serializers.IntegerField(source='club_id', read_only=True)
    club_name = serializers.CharField(source='club.name', read_only=True)

    class Meta:
        model = News
        fields = [
            'id',
            'title',
            'summary',
            'image',
            'content',
            'published_at',
            'created_at',
            'updated_at',
            'news_status_id',
            'news_status_name',
            'club_id',
            'club_name',
        ]


class AdminNewsWriteSerializer(serializers.ModelSerializer):
    news_status = serializers.SlugRelatedField(
        slug_field='name',
        queryset=NewsStatus.objects.all(),
    )
    club_id = serializers.PrimaryKeyRelatedField(
        source='club',
        queryset=Club.objects.all(),
        required=False,
    )

    class Meta:
        model = News
        fields = [
            'id',
            'title',
            'summary',
            'image',
            'content',
            'published_at',
            'news_status',
            'club_id',
        ]
        read_only_fields = ['id']

    def validate(self, attrs):
        request = self.context['request']
        user = request.user
        role_name = getattr(getattr(user, 'role', None), 'name', None)

        if role_name == 'club_admin':
            if not user.club_id:
                raise serializers.ValidationError(
                    {'club_id': 'O club_admin tem de ter um clube associado.'}
                )

            attrs['club'] = user.club

        club = attrs.get('club') or getattr(self.instance, 'club', None)
        if club is None:
            raise serializers.ValidationError({'club_id': 'O clube e obrigatorio.'})

        news_status = attrs.get('news_status') or getattr(self.instance, 'news_status', None)
        if news_status and news_status.name.lower() == 'published' and not attrs.get('published_at'):
            attrs['published_at'] = getattr(self.instance, 'published_at', None) or timezone.now()

        return attrs

    def create(self, validated_data):
        now = timezone.now()
        validated_data.setdefault('created_at', now)
        validated_data['updated_at'] = now
        return News.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for field, value in validated_data.items():
            setattr(instance, field, value)

        instance.updated_at = timezone.now()
        instance.save()
        return instance


class ClubRegistrationCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    email = serializers.EmailField(max_length=150)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    message = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        club = self.context['club']

        if not club.is_active:
            raise serializers.ValidationError('Este clube nao esta ativo.')

        if not club.enable_registrations:
            raise serializers.ValidationError('As inscricoes estao desativadas para este clube.')

        return attrs

    def create(self, validated_data):
        club = self.context['club']
        payload = ClubRegistrationInput(
            name=validated_data['name'],
            email=validated_data['email'],
            phone=validated_data.get('phone'),
            message=validated_data.get('message'),
        )

        try:
            return create_club_registration(club=club, payload=payload)
        except DuplicateClubRegistrationError as error:
            raise serializers.ValidationError({'email': str(error)}) from error
