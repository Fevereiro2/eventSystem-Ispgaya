from django.contrib.auth.models import User
from rest_framework import serializers
from .models import CulturalContent


class CulturalContentSerializer(serializers.ModelSerializer):
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = CulturalContent
        fields = ['id', 'area', 'title', 'description', 'date', 'status', 'updatedAt']


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'is_staff']
