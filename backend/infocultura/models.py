import uuid
from functools import lru_cache
from django.db import models
from django.db import connection


@lru_cache(maxsize=32)
def _has_table_column(table_name: str, column_name: str) -> bool:
    with connection.cursor() as cursor:
        columns = {
            info.name
            for info in connection.introspection.get_table_description(cursor, table_name)
        }
    return column_name in columns


class Role(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'roles'
        managed = False

    def __str__(self):
        return self.name


class AppUser(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=150)
    email = models.EmailField(max_length=150, unique=True)
    password_hash = models.CharField(max_length=255)
    role = models.ForeignKey(Role, on_delete=models.DO_NOTHING, db_column='role_id')
    club = models.ForeignKey(
        'Club',
        on_delete=models.DO_NOTHING,
        db_column='id_clubs',
        blank=True,
        null=True,
        related_name='members',
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'users'
        managed = False

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def __str__(self):
        return self.email


class CulturalContent(models.Model):
    AREA_CHOICES = [
        ('tuna', 'Tuna Academica'),
        ('clube-leitura', 'Clube de Leitura'),
        ('teatro', 'Teatro'),
    ]

    STATUS_CHOICES = [
        ('rascunho', 'Rascunho'),
        ('publicado', 'Publicado'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    area = models.CharField(max_length=32, choices=AREA_CHOICES)
    title = models.CharField(max_length=180)
    description = models.TextField()
    date = models.DateField()
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default='rascunho')
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f'{self.title} ({self.area})'


class Club(models.Model):
    id = models.AutoField(primary_key=True, db_column='id_clubs')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    mission = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    enable_registrations = models.BooleanField(blank=True, null=True, default=False)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'clubs'
        managed = False
        ordering = ['name']

    def __str__(self):
        return self.name

    @property
    def image(self) -> str:
        cached_value = getattr(self, '_club_image_cache', None)
        if cached_value is not None:
            return cached_value

        if not _has_table_column('clubs', 'image'):
            self._club_image_cache = ''
            return ''

        with connection.cursor() as cursor:
            cursor.execute(
                'SELECT image FROM clubs WHERE id_clubs = %s LIMIT 1',
                [self.id],
            )
            row = cursor.fetchone()

        self._club_image_cache = str(row[0]) if row and row[0] is not None else ''
        return self._club_image_cache

    @image.setter
    def image(self, value: str) -> None:
        self._club_image_cache = value or ''


class NewsStatus(models.Model):
    id = models.AutoField(primary_key=True, db_column='id_nstatus')
    name = models.CharField(max_length=100)
    description = models.TextField()

    class Meta:
        db_table = 'nstatus'
        managed = False
        ordering = ['name']

    def __str__(self):
        return self.name


class News(models.Model):
    id = models.AutoField(primary_key=True, db_column='id_news')
    title = models.CharField(max_length=255)
    summary = models.TextField()
    image = models.CharField(max_length=500)
    news_status = models.ForeignKey(
        NewsStatus,
        on_delete=models.DO_NOTHING,
        db_column='id_nstatus',
        related_name='news_items',
    )
    published_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    club = models.ForeignKey(
        Club,
        on_delete=models.DO_NOTHING,
        db_column='id_clubs',
        related_name='news_items',
    )
    content = models.TextField()

    class Meta:
        db_table = 'news'
        managed = False
        ordering = ['-published_at', '-created_at', '-id']

    def __str__(self):
        return self.title


class Book(models.Model):
    id = models.AutoField(primary_key=True, db_column='id_books')
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    publisher = models.CharField(max_length=255, blank=True, default='')
    publication_year = models.IntegerField()
    cover_image = models.CharField(max_length=500, blank=True, default='')
    summary = models.TextField()
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(blank=True, null=True)
    club = models.ForeignKey(
        Club,
        on_delete=models.DO_NOTHING,
        db_column='id_club',
        related_name='books',
    )

    class Meta:
        db_table = 'books'
        managed = False
        ordering = ['-is_featured', 'title', '-id']

    def __str__(self):
        return self.title


class Session(models.Model):
    id = models.AutoField(primary_key=True, db_column='id_sessions')
    name = models.CharField(max_length=150)
    title = models.CharField(max_length=255)
    description = models.TextField()
    session_date = models.DateField()
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    club = models.ForeignKey(
        Club,
        on_delete=models.DO_NOTHING,
        db_column='id_club',
        related_name='sessions',
    )
    registrations = models.ManyToManyField(
        'Registration',
        through='SessionRegistration',
        related_name='sessions',
    )

    class Meta:
        db_table = 'sessions'
        managed = False
        ordering = ['session_date', 'start_date', '-id']

    @property
    def enable_registrations(self) -> bool:
        cached_value = getattr(self, '_session_enable_registrations_cache', None)
        if cached_value is not None:
            return bool(cached_value)

        if not _has_table_column('sessions', 'enable_registrations'):
            self._session_enable_registrations_cache = False
            return False

        with connection.cursor() as cursor:
            cursor.execute(
                'SELECT enable_registrations FROM sessions WHERE id_sessions = %s LIMIT 1',
                [self.id],
            )
            row = cursor.fetchone()

        self._session_enable_registrations_cache = bool(row[0]) if row and row[0] is not None else False
        return self._session_enable_registrations_cache

    @enable_registrations.setter
    def enable_registrations(self, value: bool) -> None:
        self._session_enable_registrations_cache = bool(value)

    @property
    def registration_capacity(self) -> int | None:
        cached_value = getattr(self, '_session_registration_capacity_cache', None)
        if cached_value is not None:
            return cached_value

        if not _has_table_column('sessions', 'registration_capacity'):
            self._session_registration_capacity_cache = None
            return None

        with connection.cursor() as cursor:
            cursor.execute(
                'SELECT registration_capacity FROM sessions WHERE id_sessions = %s LIMIT 1',
                [self.id],
            )
            row = cursor.fetchone()

        self._session_registration_capacity_cache = int(row[0]) if row and row[0] is not None else None
        return self._session_registration_capacity_cache

    @registration_capacity.setter
    def registration_capacity(self, value: int | None) -> None:
        self._session_registration_capacity_cache = value if value is None else int(value)

    def __str__(self):
        return self.title


class Category(models.Model):
    id = models.AutoField(primary_key=True, db_column='id_category')
    name = models.CharField(max_length=120)
    description = models.TextField()
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'category'
        managed = False
        ordering = ['name']

    def __str__(self):
        return self.name


class Event(models.Model):
    id = models.AutoField(primary_key=True, db_column='id_event')
    title = models.CharField(max_length=255)
    description = models.TextField()
    event_date = models.DateField()
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    image = models.CharField(max_length=500, blank=True, default='')
    is_external = models.BooleanField(default=False)
    status = models.CharField(max_length=50)
    user = models.ForeignKey(
        AppUser,
        on_delete=models.DO_NOTHING,
        db_column='user_id',
        related_name='events',
    )
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    city = models.CharField(max_length=120, blank=True, default='')
    location = models.CharField(max_length=255, blank=True, default='')
    # Eventbrite integration fields - populated automatically after event creation
    eventbrite_event_id = models.CharField(max_length=64, blank=True, null=True, default=None)
    eventbrite_url = models.CharField(max_length=500, blank=True, null=True, default=None)
    eventbrite_status = models.CharField(max_length=32, blank=True, null=True, default=None)
    eventbrite_last_synced_at = models.DateTimeField(blank=True, null=True)
    eventbrite_last_error = models.TextField(blank=True, null=True, default=None)
    eventbrite_venue_id = models.CharField(max_length=64, blank=True, default='')
    eventbrite_venue = models.JSONField(blank=True, null=True, default=dict)
    eventbrite_ticket_classes = models.JSONField(blank=True, null=True, default=list)
    categories = models.ManyToManyField(
        Category,
        through='EventCategory',
        related_name='events',
    )
    registrations = models.ManyToManyField(
        'Registration',
        through='EventRegistration',
        related_name='events',
    )

    class Meta:
        db_table = 'event'
        managed = False
        ordering = ['event_date', 'start_date', '-id']

    @property
    def enable_registrations(self) -> bool:
        cached_value = getattr(self, '_event_enable_registrations_cache', None)
        if cached_value is not None:
            return bool(cached_value)

        if not _has_table_column('event', 'enable_registrations'):
            self._event_enable_registrations_cache = False
            return False

        with connection.cursor() as cursor:
            cursor.execute(
                'SELECT enable_registrations FROM event WHERE id_event = %s LIMIT 1',
                [self.id],
            )
            row = cursor.fetchone()

        self._event_enable_registrations_cache = bool(row[0]) if row and row[0] is not None else False
        return self._event_enable_registrations_cache

    @enable_registrations.setter
    def enable_registrations(self, value: bool) -> None:
        self._event_enable_registrations_cache = bool(value)

    @property
    def registration_capacity(self) -> int | None:
        cached_value = getattr(self, '_event_registration_capacity_cache', None)
        if cached_value is not None:
            return cached_value

        if not _has_table_column('event', 'registration_capacity'):
            self._event_registration_capacity_cache = None
            return None

        with connection.cursor() as cursor:
            cursor.execute(
                'SELECT registration_capacity FROM event WHERE id_event = %s LIMIT 1',
                [self.id],
            )
            row = cursor.fetchone()

        self._event_registration_capacity_cache = int(row[0]) if row and row[0] is not None else None
        return self._event_registration_capacity_cache

    @registration_capacity.setter
    def registration_capacity(self, value: int | None) -> None:
        self._event_registration_capacity_cache = value if value is None else int(value)

    @property
    def club_id(self):
        return self.user.club_id if self.user_id and self.user else None

    @property
    def club_name(self):
        return self.user.club.name if self.user_id and self.user and self.user.club else None

    def __str__(self):
        return self.title


class EventCategory(models.Model):
    event = models.ForeignKey(
        Event,
        on_delete=models.DO_NOTHING,
        db_column='id_event',
        related_name='event_category_links',
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.DO_NOTHING,
        db_column='id_category',
        related_name='event_category_links',
    )

    class Meta:
        db_table = 'event_category'
        managed = False
        unique_together = ('event', 'category')


class EventRegistration(models.Model):
    event = models.ForeignKey(
        Event,
        on_delete=models.DO_NOTHING,
        db_column='id_event',
        related_name='registration_links',
    )
    registration = models.ForeignKey(
        'Registration',
        on_delete=models.DO_NOTHING,
        db_column='id_registrations',
        related_name='event_links',
    )
    created_at = models.DateTimeField(blank=True, null=True)
    reminder_sent_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'event_registrations'
        managed = False
        unique_together = ('event', 'registration')


class RegistrationStatus(models.Model):
    id = models.AutoField(primary_key=True, db_column='id_rstatus')
    name = models.CharField(max_length=100)
    description = models.TextField()

    class Meta:
        db_table = 'rstatus'
        managed = False
        ordering = ['name']

    def __str__(self):
        return self.name


class Registration(models.Model):
    id = models.AutoField(primary_key=True, db_column='id_registrations')
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=150)
    phone = models.CharField(max_length=20, blank=True, null=True)
    message = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, default='pending')
    created_at = models.DateTimeField(blank=True, null=True)
    registration_status = models.ForeignKey(
        RegistrationStatus,
        on_delete=models.DO_NOTHING,
        db_column='id_rstatus',
        blank=True,
        null=True,
        related_name='registrations',
    )

    class Meta:
        db_table = 'registrations'
        managed = False
        ordering = ['-created_at', '-id']

    def __str__(self):
        return f'{self.name} <{self.email}>'


class SessionRegistration(models.Model):
    session = models.ForeignKey(
        Session,
        on_delete=models.DO_NOTHING,
        db_column='id_sessions',
        related_name='registration_links',
    )
    registration = models.ForeignKey(
        Registration,
        on_delete=models.DO_NOTHING,
        db_column='id_registrations',
        related_name='session_links',
    )
    created_at = models.DateTimeField(blank=True, null=True)
    reminder_sent_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'session_registrations'
        managed = False
        unique_together = ('session', 'registration')
