from rest_framework import serializers
from .models import Event, EventGallery


class EventGallerySerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = EventGallery
        fields = ['id', 'image_url', 'caption', 'order']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class EventListSerializer(serializers.ModelSerializer):
    banner_url = serializers.SerializerMethodField()
    applications_count = serializers.IntegerField(read_only=True)
    is_registration_open = serializers.BooleanField(read_only=True)

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'type', 'status', 'short_description', 'full_description',
            'start_date', 'end_date', 'registration_deadline', 'venue',
            'banner_url', 'registration_enabled', 'is_registration_open',
            'participant_limit', 'applications_count', 'created_at',
        ]

    def get_banner_url(self, obj):
        request = self.context.get('request')
        if obj.banner and request:
            return request.build_absolute_uri(obj.banner.url)
        return None


class EventDetailSerializer(EventListSerializer):
    gallery = EventGallerySerializer(many=True, read_only=True)
    program_pdf_url = serializers.SerializerMethodField()

    class Meta(EventListSerializer.Meta):
        fields = EventListSerializer.Meta.fields + ['full_description', 'gallery', 'program_pdf_url']

    def get_program_pdf_url(self, obj):
        request = self.context.get('request')
        if obj.program_pdf and request:
            return request.build_absolute_uri(obj.program_pdf.url)
        return None


class EventCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            'title', 'type', 'status', 'short_description', 'full_description',
            'start_date', 'end_date', 'registration_deadline', 'venue',
            'banner', 'program_pdf', 'participant_limit', 'registration_enabled',
        ]

    def validate(self, data):
        if data.get('start_date') and data.get('end_date'):
            if data['start_date'] > data['end_date']:
                raise serializers.ValidationError("Boshlanish sanasi tugash sanasidan katta bo'lishi mumkin emas")
        return data
