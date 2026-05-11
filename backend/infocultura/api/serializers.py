from .serializers_activities import (
    AdminBookWriteSerializer,
    AdminCategoryWriteSerializer,
    AdminEventReadSerializer,
    AdminEventWriteSerializer,
    AdminSessionWriteSerializer,
    BookSerializer,
    CategorySerializer,
    EventSerializer,
    SessionSerializer,
)
from .serializers_admin import (
    AdminAuditLogSerializer,
    AdminBulkIdsSerializer,
    AdminBulkStatusUpdateSerializer,
    AdminClubRegistrationSerializer,
    AdminNotificationSerializer,
    AdminRegistrationStatusUpdateSerializer,
)
from .serializers_auth import LoginSerializer
from .serializers_clubs import ClubMemberAssignSerializer, ClubSerializer
from .serializers_content import CulturalContentSerializer
from .serializers_news import (
    AdminNewsReadSerializer,
    AdminNewsWriteSerializer,
    EditorialHistorySerializer,
    NewsSerializer,
    NewsStatusSerializer,
)
from .serializers_registrations import (
    ClubRegistrationCreateSerializer,
    EventRegistrationCreateSerializer,
    RegistrationStatusSerializer,
    SessionRegistrationCreateSerializer,
)
from .serializers_users import AdminUserWriteSerializer, RoleSerializer, UserSerializer
from .serializers_workflow import (
    EVENT_WORKFLOW_STATUS_ORDER,
    NEWS_WORKFLOW_STATUS_ORDER,
    get_role_allowed_workflow_statuses,
    normalize_workflow_status,
)

__all__ = [
    'AdminAuditLogSerializer',
    'AdminBookWriteSerializer',
    'AdminBulkIdsSerializer',
    'AdminBulkStatusUpdateSerializer',
    'AdminCategoryWriteSerializer',
    'AdminClubRegistrationSerializer',
    'AdminEventReadSerializer',
    'AdminEventWriteSerializer',
    'AdminNewsReadSerializer',
    'AdminNewsWriteSerializer',
    'AdminNotificationSerializer',
    'AdminRegistrationStatusUpdateSerializer',
    'AdminSessionWriteSerializer',
    'AdminUserWriteSerializer',
    'BookSerializer',
    'CategorySerializer',
    'ClubMemberAssignSerializer',
    'ClubRegistrationCreateSerializer',
    'ClubSerializer',
    'CulturalContentSerializer',
    'EditorialHistorySerializer',
    'EventRegistrationCreateSerializer',
    'EventSerializer',
    'LoginSerializer',
    'NewsSerializer',
    'NewsStatusSerializer',
    'RegistrationStatusSerializer',
    'RoleSerializer',
    'SessionRegistrationCreateSerializer',
    'SessionSerializer',
    'UserSerializer',
    'EVENT_WORKFLOW_STATUS_ORDER',
    'NEWS_WORKFLOW_STATUS_ORDER',
    'get_role_allowed_workflow_statuses',
    'normalize_workflow_status',
]

"""
from rest_framework import serializers


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
    username = serializers.CharField(trim_whitespace=True, max_length=150)
    password = serializers.CharField(trim_whitespace=False, max_length=128)

    def validate_username(self, value):
        try:
            return validate_login_identifier(value)
        except ValueError as error:
            raise serializers.ValidationError(str(error)) from error

    def validate_password(self, value):
        if not value:
            raise serializers.ValidationError('A password e obrigatoria.')
        if any(ord(char) < 32 or ord(char) == 127 for char in value):
            raise serializers.ValidationError('A password contem caracteres invalidos.')
        return value


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

    def create(self, validated_data):
        return Club.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
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
    club_id = serializers.IntegerField(read_only=True, allow_null=True)
    club_name = serializers.CharField(source='club.name', read_only=True, allow_null=True)

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


class AdminNotificationSerializer(serializers.Serializer):
    id = serializers.CharField()
    kind = serializers.CharField()
    level = serializers.CharField()
    title = serializers.CharField()
    message = serializers.CharField()
    href = serializers.CharField()
    created_at = serializers.DateTimeField(allow_null=True)


class AdminAuditLogSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    action = serializers.CharField()
    content_type = serializers.CharField()
    object_id = serializers.IntegerField(allow_null=True)
    summary = serializers.CharField()
    actor_user_id = serializers.IntegerField(allow_null=True)
    actor_name = serializers.CharField()
    club_id = serializers.IntegerField(allow_null=True)
    metadata_json = serializers.CharField(allow_null=True)
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
    club_id = serializers.IntegerField(read_only=True, allow_null=True)
    club_name = serializers.CharField(source='club.name', read_only=True, allow_null=True)

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
    club_id = serializers.IntegerField(read_only=True, allow_null=True)
    club_name = serializers.CharField(source='club.name', read_only=True, allow_null=True)
    enable_registrations = serializers.BooleanField(read_only=True)
    registration_capacity = serializers.IntegerField(read_only=True, allow_null=True)
    confirmed_registrations = serializers.SerializerMethodField()
    waitlist_registrations = serializers.SerializerMethodField()
    remaining_slots = serializers.SerializerMethodField()
    registration_state = serializers.SerializerMethodField()
    google_calendar_url = serializers.SerializerMethodField()
    outlook_calendar_url = serializers.SerializerMethodField()

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
            'enable_registrations',
            'registration_capacity',
            'created_at',
            'updated_at',
            'club_id',
            'club_name',
            'confirmed_registrations',
            'waitlist_registrations',
            'remaining_slots',
            'registration_state',
            'google_calendar_url',
            'outlook_calendar_url',
        ]

    def _get_summary(self, obj):
        cached = getattr(obj, '_registration_summary_cache', None)
        if cached is None:
            cached = get_session_registration_summary(session=obj)
            setattr(obj, '_registration_summary_cache', cached)
        return cached

    def get_confirmed_registrations(self, obj):
        return self._get_summary(obj).confirmed_count

    def get_waitlist_registrations(self, obj):
        return self._get_summary(obj).waitlist_count

    def get_remaining_slots(self, obj):
        return self._get_summary(obj).remaining_slots

    def get_registration_state(self, obj):
        return self._get_summary(obj).registration_state

    def get_google_calendar_url(self, obj):
        payload = build_activity_calendar_payload(
            activity_type='session',
            activity_id=obj.id
        )
        return payload.get('google_url')

    def get_outlook_calendar_url(self, obj):
        payload = build_activity_calendar_payload(
            activity_type='session',
            activity_id=obj.id
        )
        return payload.get('outlook_url')


class EventSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(read_only=True)
    club_id = serializers.SerializerMethodField()
    club_name = serializers.SerializerMethodField()
    owner_name = serializers.CharField(source='user.name', read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    category_ids = serializers.SerializerMethodField()
    enable_registrations = serializers.BooleanField(read_only=True)
    registration_capacity = serializers.IntegerField(read_only=True, allow_null=True)
    confirmed_registrations = serializers.SerializerMethodField()
    waitlist_registrations = serializers.SerializerMethodField()
    remaining_slots = serializers.SerializerMethodField()
    registration_state = serializers.SerializerMethodField()
    google_calendar_url = serializers.SerializerMethodField()
    outlook_calendar_url = serializers.SerializerMethodField()

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
            'enable_registrations',
            'registration_capacity',
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
            'confirmed_registrations',
            'waitlist_registrations',
            'remaining_slots',
            'registration_state',
            'google_calendar_url',
            'outlook_calendar_url',
        ]

    def get_club_id(self, obj):
        return obj.user.club_id if obj.user_id and obj.user else None

    def get_club_name(self, obj):
        if not obj.user_id or not obj.user or not obj.user.club:
            return None
        return obj.user.club.name

    def get_category_ids(self, obj):
        return list(obj.categories.values_list('id', flat=True))

    def _get_summary(self, obj):
        cached = getattr(obj, '_registration_summary_cache', None)
        if cached is None:
            cached = get_event_registration_summary(event=obj)
            setattr(obj, '_registration_summary_cache', cached)
        return cached

    def get_confirmed_registrations(self, obj):
        return self._get_summary(obj).confirmed_count

    def get_waitlist_registrations(self, obj):
        return self._get_summary(obj).waitlist_count

    def get_remaining_slots(self, obj):
        return self._get_summary(obj).remaining_slots

    def get_registration_state(self, obj):
        return self._get_summary(obj).registration_state

    def get_google_calendar_url(self, obj):
        payload = build_activity_calendar_payload(
            activity_type='event',
            activity_id=obj.id
        )
        return payload.get('google_url')

    def get_outlook_calendar_url(self, obj):
        payload = build_activity_calendar_payload(
            activity_type='event',
            activity_id=obj.id
        )
        return payload.get('outlook_url')


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

        current_published_at = getattr(self.instance, 'published_at', None) if self.instance else None
        if news_status and next_status == 'published' and not attrs.get('published_at'):
            attrs['published_at'] = current_published_at or timezone.now()
        elif next_status in {'draft', 'review'}:
            attrs['published_at'] = None

        return attrs

    def create(self, validated_data):
        now = timezone.now()
        validated_data.setdefault('created_at', now)
        validated_data['updated_at'] = now
        request_user = self.context['request'].user
        news = News.objects.create(**validated_data)
        next_status = getattr(news.news_status, 'name', None) or 'draft'
        record_editorial_action(
            content_type='news',
            object_id=news.id,
            from_status=None,
            to_status=next_status,
            actor_user=request_user,
            club_id=news.club_id,
        )
        notify_news_workflow_status(news=news, previous_status=None, next_status=next_status)
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
            notify_news_workflow_status(
                news=instance,
                previous_status=previous_status,
                next_status=next_status,
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
    enable_registrations = serializers.BooleanField(required=False)
    registration_capacity = serializers.IntegerField(required=False, allow_null=True)

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
            'enable_registrations',
            'registration_capacity',
            'club_id',
        ]
        read_only_fields = ['id']

    def validate(self, attrs):
        self.validate_club_scope(attrs)
        start_date = attrs.get('start_date') or getattr(self.instance, 'start_date', None)
        end_date = attrs.get('end_date') or getattr(self.instance, 'end_date', None)

        try:
            validate_date_interval(start_date, end_date)
        except ValueError as error:
            raise serializers.ValidationError({'end_date': str(error)})

        enable_registrations = attrs.get(
            'enable_registrations',
            getattr(self.instance, 'enable_registrations', False),
        )
        registration_capacity = attrs.get(
            'registration_capacity',
            getattr(self.instance, 'registration_capacity', None),
        )
        if registration_capacity is not None and registration_capacity <= 0:
            raise serializers.ValidationError(
                {'registration_capacity': 'A capacidade tem de ser superior a zero.'}
            )
        if enable_registrations and registration_capacity is None:
            raise serializers.ValidationError(
                {'registration_capacity': 'Define a lotacao para ativar inscricoes.'}
            )

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
    enable_registrations = serializers.BooleanField(required=False)
    registration_capacity = serializers.IntegerField(required=False, allow_null=True)
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
            'enable_registrations',
            'registration_capacity',
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
        
        try:
            validate_date_interval(start_date, end_date)
        except ValueError as error:
            raise serializers.ValidationError({'end_date': str(error)})

        enable_registrations = attrs.get(
            'enable_registrations',
            getattr(self.instance, 'enable_registrations', False),
        )
        registration_capacity = attrs.get(
            'registration_capacity',
            getattr(self.instance, 'registration_capacity', None),
        )
        if registration_capacity is not None and registration_capacity <= 0:
            raise serializers.ValidationError(
                {'registration_capacity': 'A capacidade tem de ser superior a zero.'}
            )
        if enable_registrations and registration_capacity is None:
            raise serializers.ValidationError(
                {'registration_capacity': 'Define a lotacao para ativar inscricoes.'}
            )

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
        next_status = event.status
        record_editorial_action(
            content_type='event',
            object_id=event.id,
            from_status=None,
            to_status=next_status,
            actor_user=request_user,
            club_id=club.id,
        )
        notify_event_workflow_status(event=event, previous_status=None, next_status=next_status)
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
            notify_event_workflow_status(
                event=instance,
                previous_status=previous_status,
                next_status=instance.status,
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


class AdminClubRegistrationSerializer(serializers.Serializer):
    registration_id = serializers.IntegerField()
    club_id = serializers.IntegerField()
    club_name = serializers.CharField()
    name = serializers.CharField()
    email = serializers.EmailField()
    phone = serializers.CharField(allow_null=True)
    message = serializers.CharField(allow_null=True)
    status = serializers.CharField()
    created_at = serializers.DateTimeField(allow_null=True)


class AdminRegistrationStatusUpdateSerializer(serializers.Serializer):
    registration_status = serializers.SlugRelatedField(
        slug_field='name',
        queryset=RegistrationStatus.objects.all(),
    )


class ClubRegistrationCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    email = serializers.EmailField(max_length=150)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    message = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        club = self.context.get('club')
        if not club:
            raise serializers.ValidationError({'message': 'Clube nao encontrado.'})

        if not club.is_active or not club.enable_registrations:
            raise serializers.ValidationError({'message': 'As inscricoes para este clube estao encerradas.'})

        return attrs

    def create(self, validated_data):
        club = self.context['club']
        request = self.context['request']
        client_ip = get_client_ip(request)

        try:
            return create_club_registration(
                club=club,
                payload=ClubRegistrationInput(
                    name=validated_data['name'],
                    email=validated_data['email'],
                    phone=validated_data.get('phone'),
                    message=validated_data.get('message'),
                ),
                client_ip=client_ip,
            )
        except DuplicateClubRegistrationError as error:
            raise serializers.ValidationError({'email': str(error)})
        except ClubRegistrationRateLimitError as error:
            raise serializers.ValidationError({'message': str(error)})


class EventRegistrationCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    email = serializers.EmailField(max_length=150)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    message = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        event = self.context.get('event')
        if not event:
            raise serializers.ValidationError({'message': 'Evento nao encontrado.'})

        summary = get_event_registration_summary(event=event)
        if summary.registration_state == 'closed':
            raise serializers.ValidationError({'message': 'As inscricoes para este evento estao encerradas.'})

        return attrs

    def create(self, validated_data):
        event = self.context['event']
        request = self.context['request']
        client_ip = get_client_ip(request)

        try:
            return create_event_registration(
                event=event,
                payload=ClubRegistrationInput(
                    name=validated_data['name'],
                    email=validated_data['email'],
                    phone=validated_data.get('phone'),
                    message=validated_data.get('message'),
                ),
                client_ip=client_ip,
            )
        except (DuplicateActivityRegistrationError, ActivityRegistrationError) as error:
            raise serializers.ValidationError({'email': str(error)})
        except ActivityRegistrationRateLimitError as error:
            raise serializers.ValidationError({'message': str(error)})

"""


class SessionRegistrationCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    email = serializers.EmailField(max_length=150)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    message = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        session = self.context.get('session')
        if not session:
            raise serializers.ValidationError({'message': 'Sessao nao encontrada.'})

        summary = get_session_registration_summary(session=session)
        if summary.registration_state == 'closed':
            raise serializers.ValidationError({'message': 'As inscricoes para esta sessao estao encerradas.'})

        return attrs

    def create(self, validated_data):
        session = self.context['session']
        request = self.context['request']
        client_ip = get_client_ip(request)

        try:
            return create_session_registration(
                session=session,
                payload=ClubRegistrationInput(
                    name=validated_data['name'],
                    email=validated_data['email'],
                    phone=validated_data.get('phone'),
                    message=validated_data.get('message'),
                ),
                client_ip=client_ip,
            )
        except (DuplicateActivityRegistrationError, ActivityRegistrationError) as error:
            raise serializers.ValidationError({'email': str(error)})
        except ActivityRegistrationRateLimitError as error:
            raise serializers.ValidationError({'message': str(error)})
