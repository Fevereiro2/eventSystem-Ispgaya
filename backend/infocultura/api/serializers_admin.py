from rest_framework import serializers

from ..models import RegistrationStatus


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
