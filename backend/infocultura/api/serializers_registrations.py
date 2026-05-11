from rest_framework import serializers

from ..core.utils import get_client_ip
from ..models import RegistrationStatus
from ..service_types import (
    ActivityRegistrationError,
    ActivityRegistrationRateLimitError,
    ClubRegistrationInput,
    ClubRegistrationRateLimitError,
    DuplicateActivityRegistrationError,
    DuplicateClubRegistrationError,
)
from ..services import (
    create_club_registration,
    create_event_registration,
    create_session_registration,
    get_event_registration_summary,
    get_session_registration_summary,
)


class RegistrationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistrationStatus
        fields = ['id', 'name', 'description']


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
