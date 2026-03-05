import uuid
from django.db import models


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
