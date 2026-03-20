from rest_framework import serializers
from django.utils import timezone
from django.db import connection

from .models import (
    AppUser,
    Book,
    Category,
    Club,
    CulturalContent,
    Event,
    EventCategory,
    News,
    NewsStatus,
    RegistrationStatus,
    Role,
    Session,
)
from .services import (
    AdminClubRegistrationRecord,
    ClubRegistrationInput,
    DuplicateClubRegistrationError,
    ClubRegistrationRateLimitError,
    create_club_registration,
    list_editorial_history,
    record_editorial_action,
)
from .security import hash_password


NEWS_WORKFLOW_STATUS_ORDER = ("draft", "review", "published", "archived")
EVENT_WORKFLOW_STATUS_ORDER = ("draft", "review", "published", "archived")
EVENT_STATUS_ALIASES = {
    "rascunho": "draft",
    "publicado": "published",
}


def normalize_workflow_status(value: str | None) -> str:
    normalized = (value or "").strip().lower()
    return EVENT_STATUS_ALIASES.get(normalized, normalized)


def get_role_allowed_workflow_statuses(
    *,
    role_name: str | None,
    base_statuses: tuple[str, ...],
    current_status: str | None = None,
) -> set[str]:
    if role_name == "club_admin":
        allowed_statuses = {"draft", "review"}
        if current_status in {"published", "archived"}:
            allowed_statuses.add(current_status)
        return allowed_statuses

    return set(base_statuses)


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
    image = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Club
        fields = [
            'id',
            'name',
            'description',
            'mission',
            'image',
            'is_active',
            'enable_registrations',
            'created_at',
        ]

    def _can_persist_image(self) -> bool:
        return hasattr(Club, 'image') and 'image' not in getattr(Club._meta, 'fields_map', {})

    def _save_image_if_supported(self, club: Club, image_value: str | None) -> None:
        club.image = image_value or ''

        with connection.cursor() as cursor:
            table_columns = {
                info.name
                for info in connection.introspection.get_table_description(cursor, 'clubs')
            }
            if 'image' not in table_columns:
                return

            cursor.execute(
                'UPDATE clubs SET image = %s WHERE id_clubs = %s',
                [club.image, club.id],
            )

    def create(self, validated_data):
        image_value = validated_data.pop('image', '')
        club = Club.objects.create(**validated_data)
        self._save_image_if_supported(club, image_value)
        return club

    def update(self, instance, validated_data):
        image_value = validated_data.pop('image', None)

        for field, value in validated_data.items():
            setattr(instance, field, value)

        instance.save()
        if image_value is not None:
            self._save_image_if_supported(instance, image_value)
        return instance


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


class RegistrationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistrationStatus
        fields = ['id', 'name', 'description']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']


class NewsSerializer(serializers.ModelSerializer):
    news_status_id = serializers.IntegerField(read_only=True)
    news_status_name = serializers.CharField(source='news_status.name', read_only=True)
    club_id = serializers.IntegerField(read_only=True)
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


class EditorialHistorySerializer(serializers.Serializer):
    content_type = serializers.CharField()
    object_id = serializers.IntegerField()
    from_status = serializers.CharField(allow_null=True)
    to_status = serializers.CharField()
    actor_user_id = serializers.IntegerField(allow_null=True)
    actor_name = serializers.CharField()
    created_at = serializers.DateTimeField(allow_null=True)


class AdminBulkStatusUpdateSerializer(serializers.Serializer):
    ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        allow_empty=False,
    )
    status = serializers.CharField(max_length=50)

    def validate_ids(self, value):
        unique_ids = list(dict.fromkeys(value))
        if not unique_ids:
            raise serializers.ValidationError('Seleciona pelo menos um registo.')
        return unique_ids


class AdminBulkIdsSerializer(serializers.Serializer):
    ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        allow_empty=False,
    )

    def validate_ids(self, value):
        unique_ids = list(dict.fromkeys(value))
        if not unique_ids:
            raise serializers.ValidationError('Seleciona pelo menos um registo.')
        return unique_ids


class BookSerializer(serializers.ModelSerializer):
    club_id = serializers.IntegerField(read_only=True)
    club_name = serializers.CharField(source='club.name', read_only=True)

    class Meta:
        model = Book
        fields = [
            'id',
            'title',
            'author',
            'publisher',
            'publication_year',
            'cover_image',
            'summary',
            'is_featured',
            'created_at',
            'club_id',
            'club_name',
        ]


class SessionSerializer(serializers.ModelSerializer):
    club_id = serializers.IntegerField(read_only=True)
    club_name = serializers.CharField(source='club.name', read_only=True)

    class Meta:
        model = Session
        fields = [
            'id',
            'name',
            'title',
            'description',
            'session_date',
            'start_date',
            'end_date',
            'created_at',
            'updated_at',
            'club_id',
            'club_name',
        ]


class EventSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(read_only=True)
    club_id = serializers.SerializerMethodField()
    club_name = serializers.SerializerMethodField()
    owner_name = serializers.CharField(source='user.name', read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    category_ids = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id',
            'title',
            'description',
            'event_date',
            'start_date',
            'end_date',
            'image',
            'is_external',
            'status',
            'created_at',
            'updated_at',
            'city',
            'location',
            'user_id',
            'club_id',
            'club_name',
            'owner_name',
            'categories',
            'category_ids',
        ]

    def get_club_id(self, obj):
        return obj.user.club_id if obj.user_id and obj.user else None

    def get_club_name(self, obj):
        if not obj.user_id or not obj.user or not obj.user.club:
            return None
        return obj.user.club.name

    def get_category_ids(self, obj):
        return list(obj.categories.values_list('id', flat=True))


class AdminNewsReadSerializer(NewsSerializer):
    editorial_history = serializers.SerializerMethodField()

    class Meta(NewsSerializer.Meta):
        fields = NewsSerializer.Meta.fields + ['editorial_history']

    def get_editorial_history(self, obj):
        history = list_editorial_history(content_type='news', object_id=obj.id)
        return EditorialHistorySerializer(history, many=True).data


class AdminEventReadSerializer(EventSerializer):
    editorial_history = serializers.SerializerMethodField()

    class Meta(EventSerializer.Meta):
        fields = EventSerializer.Meta.fields + ['editorial_history']

    def get_editorial_history(self, obj):
        history = list_editorial_history(content_type='event', object_id=obj.id)
        return EditorialHistorySerializer(history, many=True).data


class ClubScopedWriteSerializer(serializers.ModelSerializer):
    club_id = serializers.PrimaryKeyRelatedField(
        source='club',
        queryset=Club.objects.all(),
        required=False,
    )

    def validate_club_scope(self, attrs):
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

        return club


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
        next_status = normalize_workflow_status(getattr(news_status, 'name', None))
        current_status = normalize_workflow_status(
            getattr(getattr(self.instance, 'news_status', None), 'name', None)
        )
        allowed_statuses = get_role_allowed_workflow_statuses(
            role_name=role_name,
            base_statuses=NEWS_WORKFLOW_STATUS_ORDER,
            current_status=current_status,
        )

        if next_status and next_status not in allowed_statuses:
            raise serializers.ValidationError(
                {'news_status': 'Nao tens permissao para colocar esta noticia nesse estado.'}
            )

        if news_status and next_status == 'published' and not attrs.get('published_at'):
            attrs['published_at'] = getattr(self.instance, 'published_at', None) or timezone.now()
        elif next_status in {'draft', 'review'}:
            attrs['published_at'] = None

        return attrs

    def create(self, validated_data):
        now = timezone.now()
        validated_data.setdefault('created_at', now)
        validated_data['updated_at'] = now
        request_user = self.context['request'].user
        news = News.objects.create(**validated_data)
        record_editorial_action(
            content_type='news',
            object_id=news.id,
            from_status=None,
            to_status=getattr(news.news_status, 'name', None) or 'draft',
            actor_user=request_user,
            club_id=news.club_id,
        )
        return news

    def update(self, instance, validated_data):
        request_user = self.context['request'].user
        previous_status = getattr(instance.news_status, 'name', None)
        for field, value in validated_data.items():
            setattr(instance, field, value)

        instance.updated_at = timezone.now()
        instance.save()
        next_status = getattr(instance.news_status, 'name', None)
        if normalize_workflow_status(previous_status) != normalize_workflow_status(next_status):
            record_editorial_action(
                content_type='news',
                object_id=instance.id,
                from_status=previous_status,
                to_status=next_status or 'draft',
                actor_user=request_user,
                club_id=instance.club_id,
            )
        return instance

    def to_representation(self, instance):
        return NewsSerializer(instance).data


class AdminBookWriteSerializer(ClubScopedWriteSerializer):
    class Meta:
        model = Book
        fields = [
            'id',
            'title',
            'author',
            'publisher',
            'publication_year',
            'cover_image',
            'summary',
            'is_featured',
            'club_id',
        ]
        read_only_fields = ['id']

    def validate(self, attrs):
        self.validate_club_scope(attrs)
        return attrs

    def create(self, validated_data):
        validated_data.setdefault('created_at', timezone.now())
        return Book.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for field, value in validated_data.items():
            setattr(instance, field, value)

        instance.save()
        return instance

    def to_representation(self, instance):
        return BookSerializer(instance).data


class AdminSessionWriteSerializer(ClubScopedWriteSerializer):
    class Meta:
        model = Session
        fields = [
            'id',
            'name',
            'title',
            'description',
            'session_date',
            'start_date',
            'end_date',
            'club_id',
        ]
        read_only_fields = ['id']

    def validate(self, attrs):
        self.validate_club_scope(attrs)
        start_date = attrs.get('start_date') or getattr(self.instance, 'start_date', None)
        end_date = attrs.get('end_date') or getattr(self.instance, 'end_date', None)

        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError({'end_date': 'A data final tem de ser posterior.'})

        return attrs

    def create(self, validated_data):
        now = timezone.now()
        validated_data.setdefault('created_at', now)
        validated_data['updated_at'] = now
        return Session.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for field, value in validated_data.items():
            setattr(instance, field, value)

        instance.updated_at = timezone.now()
        instance.save()
        return instance

    def to_representation(self, instance):
        return SessionSerializer(instance).data


class AdminEventWriteSerializer(serializers.ModelSerializer):
    club_id = serializers.PrimaryKeyRelatedField(
        source='club',
        queryset=Club.objects.all(),
        required=False,
    )
    category_ids = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        many=True,
        required=False,
        source='categories_payload',
    )

    class Meta:
        model = Event
        fields = [
            'id',
            'title',
            'description',
            'event_date',
            'start_date',
            'end_date',
            'image',
            'is_external',
            'status',
            'city',
            'location',
            'club_id',
            'category_ids',
        ]
        read_only_fields = ['id']

    def _resolve_owner(self, club: Club):
        request_user = self.context['request'].user
        if request_user.club_id == club.id:
            return request_user

        owner = AppUser.objects.filter(club=club, is_active=True).order_by('id').first()
        if owner is None:
            raise serializers.ValidationError(
                {'club_id': 'O clube precisa de pelo menos um utilizador ativo associado.'}
            )

        return owner

    def validate(self, attrs):
        request = self.context['request']
        user = request.user
        role_name = getattr(getattr(user, 'role', None), 'name', None)

        if role_name == 'club_admin':
            if not user.club_id:
                raise serializers.ValidationError(
                    {'club_id': 'O club_admin tem de ter um clube associado.'}
                )
            club = user.club
        else:
            club = attrs.get('club')
            if club is None and self.instance and self.instance.user_id and self.instance.user:
                club = self.instance.user.club

        if club is None:
            raise serializers.ValidationError({'club_id': 'O clube e obrigatorio.'})

        start_date = attrs.get('start_date') or getattr(self.instance, 'start_date', None)
        end_date = attrs.get('end_date') or getattr(self.instance, 'end_date', None)
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError({'end_date': 'A data final tem de ser posterior.'})

        next_status = normalize_workflow_status(
            attrs.get('status') or getattr(self.instance, 'status', None)
        )
        current_status = normalize_workflow_status(getattr(self.instance, 'status', None))
        allowed_statuses = get_role_allowed_workflow_statuses(
            role_name=role_name,
            base_statuses=EVENT_WORKFLOW_STATUS_ORDER,
            current_status=current_status,
        )
        if next_status not in allowed_statuses:
            raise serializers.ValidationError(
                {'status': 'Nao tens permissao para colocar este evento nesse estado.'}
            )

        attrs['status'] = next_status
        attrs['resolved_club'] = club
        return attrs

    def create(self, validated_data):
        club = validated_data.pop('resolved_club')
        validated_data.pop('club', None)
        categories = validated_data.pop('categories_payload', [])
        owner = self._resolve_owner(club)
        request_user = self.context['request'].user
        now = timezone.now()
        validated_data['user'] = owner
        validated_data.setdefault('created_at', now)
        validated_data['updated_at'] = now
        event = Event.objects.create(**validated_data)
        if categories:
            EventCategory.objects.bulk_create(
                [EventCategory(event=event, category=category) for category in categories]
            )
        record_editorial_action(
            content_type='event',
            object_id=event.id,
            from_status=None,
            to_status=event.status,
            actor_user=request_user,
            club_id=club.id,
        )
        return event

    def update(self, instance, validated_data):
        club = validated_data.pop('resolved_club')
        validated_data.pop('club', None)
        categories = validated_data.pop('categories_payload', None)
        owner = self._resolve_owner(club)
        request_user = self.context['request'].user
        previous_status = instance.status

        for field, value in validated_data.items():
            setattr(instance, field, value)

        instance.user = owner
        instance.updated_at = timezone.now()
        instance.save()
        if categories is not None:
            EventCategory.objects.filter(event=instance).delete()
            EventCategory.objects.bulk_create(
                [EventCategory(event=instance, category=category) for category in categories]
            )
        if normalize_workflow_status(previous_status) != normalize_workflow_status(instance.status):
            record_editorial_action(
                content_type='event',
                object_id=instance.id,
                from_status=previous_status,
                to_status=instance.status,
                actor_user=request_user,
                club_id=club.id,
            )
        return instance

    def to_representation(self, instance):
        return EventSerializer(instance).data


class AdminCategoryWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']
        read_only_fields = ['id']

    def create(self, validated_data):
        now = timezone.now()
        validated_data.setdefault('created_at', now)
        validated_data['updated_at'] = now
        return Category.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for field, value in validated_data.items():
            setattr(instance, field, value)

        instance.updated_at = timezone.now()
        instance.save()
        return instance

    def to_representation(self, instance):
        return CategorySerializer(instance).data


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
        request = self.context.get('request')
        payload = ClubRegistrationInput(
            name=validated_data['name'],
            email=validated_data['email'],
            phone=validated_data.get('phone'),
            message=validated_data.get('message'),
        )
        forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR', '') if request else ''
        client_ip = forwarded_for.split(',')[0].strip() if forwarded_for else None
        if not client_ip and request:
            client_ip = request.META.get('REMOTE_ADDR')

        try:
            return create_club_registration(club=club, payload=payload, client_ip=client_ip)
        except DuplicateClubRegistrationError as error:
            raise serializers.ValidationError({'email': str(error)}) from error
        except ClubRegistrationRateLimitError as error:
            raise serializers.ValidationError({'non_field_errors': [str(error)]}) from error


class AdminClubRegistrationSerializer(serializers.Serializer):
    id = serializers.IntegerField(source='registration_id')
    club_id = serializers.IntegerField()
    club_name = serializers.CharField()
    name = serializers.CharField()
    email = serializers.EmailField()
    phone = serializers.CharField(allow_null=True, required=False)
    message = serializers.CharField(allow_null=True, required=False)
    status = serializers.CharField()
    created_at = serializers.DateTimeField(allow_null=True)

    def to_representation(self, instance: AdminClubRegistrationRecord):
        return super().to_representation(instance)


class AdminRegistrationStatusUpdateSerializer(serializers.Serializer):
    status = serializers.SlugRelatedField(
        slug_field='name',
        queryset=RegistrationStatus.objects.all(),
        source='registration_status',
    )
