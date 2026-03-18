import uuid
from django.db import models


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
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'clubs'
        managed = False
        ordering = ['name']

    def __str__(self):
        return self.name
