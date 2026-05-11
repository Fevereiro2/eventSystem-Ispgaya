from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email as django_validate_email
from rest_framework import serializers

from ..core.security import hash_password, normalize_email_address, validate_person_name, validate_plaintext_password
from ..models import AppUser, Club, Role


class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='role.name', read_only=True)
    club_id = serializers.SerializerMethodField()
    club_name = serializers.SerializerMethodField()

    class Meta:
        model = AppUser
        fields = ['id', 'name', 'email', 'role', 'is_active', 'club_id', 'club_name', 'created_at']

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
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField(max_length=150)
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
        normalized_email = normalize_email_address(value)

        try:
            django_validate_email(normalized_email)
        except DjangoValidationError as error:
            raise serializers.ValidationError('Indica um email valido.') from error

        queryset = AppUser.objects.filter(email__iexact=normalized_email)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError('Ja existe um utilizador com este email.')

        return normalized_email

    def validate_name(self, value):
        try:
            return validate_person_name(value)
        except ValueError as error:
            raise serializers.ValidationError(str(error)) from error

    def validate_password(self, value):
        try:
            return validate_plaintext_password(value, min_length=8)
        except ValueError as error:
            raise serializers.ValidationError(str(error)) from error

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
