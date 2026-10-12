from rest_framework import serializers
from .models import Event, EventGallery, EventPartner
from django.db import transaction


class EventPartnerSerializer(serializers.ModelSerializer):
    logo_url = serializers.ImageField(source='logo', read_only=True)

    class Meta:
        model = EventPartner
        fields = ['id', 'name', 'logo_url', 'order']


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
    partners = EventPartnerSerializer(many=True, read_only=True)
    banner_url = serializers.SerializerMethodField()
    applications_count = serializers.IntegerField(read_only=True)
    is_registration_open = serializers.BooleanField(read_only=True)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        from django.utils import timezone
        if instance.end_date and instance.end_date < timezone.now().date():
            data['status'] = 'completed'
        return data

    class Meta:
        model = Event
        fields = [
            'id', 'partners', 'title', 'type', 'format', 'status', 'short_description', 'full_description',
            'start_date', 'end_date', 'registration_deadline', 'venue',
            'banner_url', 'registration_enabled', 'is_registration_open',
            'participant_limit', 'applications_count', 'created_at', 'translations',
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
    partner_data = serializers.JSONField(write_only=True, required=False)

    def validate_partner_data(self, value):
        if not isinstance(value, list) or len(value) > 12:
            raise serializers.ValidationError('Ko‘pi bilan 12 ta hamkor kiriting.')
        existing = {p.id: p for p in self.instance.partners.all()} if self.instance else {}
        seen = set()
        clean = []
        files = self.context['request'].FILES
        for index, item in enumerate(value):
            if not isinstance(item, dict):
                raise serializers.ValidationError('Hamkor ma’lumotlari noto‘g‘ri.')
            name = item.get('name', '')
            if not isinstance(name, str) or not name.strip() or len(name) > 255:
                raise serializers.ValidationError('Hamkor nomini kiriting (255 belgigacha).')
            partner_id = item.get('id')
            if partner_id is not None:
                if not isinstance(partner_id, int) or partner_id not in existing or partner_id in seen:
                    raise serializers.ValidationError('Hamkor ushbu tadbirga tegishli emas.')
                seen.add(partner_id)
            logo = files.get(f'partner_logo_{index}')
            if logo:
                if logo.size > 5 * 1024 * 1024:
                    raise serializers.ValidationError('Logo hajmi 5 MB dan oshmasin.')
                logo = serializers.ImageField().run_validation(logo)
                if logo.image.format not in ('PNG', 'JPEG', 'WEBP'):
                    raise serializers.ValidationError('PNG, JPEG yoki WebP logo yuklang.')
            elif partner_id is None:
                raise serializers.ValidationError('Har bir yangi hamkor uchun logo yuklang.')
            clean.append({'id': partner_id, 'name': name.strip(), 'logo': logo, 'order': index})
        return clean

    def _save_partners(self, event, partners):
        if partners is None:
            return
        kept = []
        for item in partners:
            partner_id = item.pop('id')
            logo = item.pop('logo')
            partner = event.partners.get(pk=partner_id) if partner_id else EventPartner(event=event)
            partner.name, partner.order = item['name'], item['order']
            if logo:
                partner.logo = logo
            partner.save()
            kept.append(partner.pk)
        event.partners.exclude(pk__in=kept).delete()

    @transaction.atomic
    def create(self, validated_data):
        partners = validated_data.pop('partner_data', None)
        event = super().create(validated_data)
        self._save_partners(event, partners)
        return event

    @transaction.atomic
    def update(self, instance, validated_data):
        partners = validated_data.pop('partner_data', None)
        event = super().update(instance, validated_data)
        self._save_partners(event, partners)
        return event

    class Meta:
        model = Event
        fields = [
            'title', 'type', 'format', 'status', 'short_description', 'full_description',
            'start_date', 'end_date', 'registration_deadline', 'venue',
            'banner', 'program_pdf', 'participant_limit', 'registration_enabled',
            'translations', 'partner_data',
        ]

    def validate_translations(self, value):
        if isinstance(value, str):
            import json
            try:
                return json.loads(value)
            except Exception:
                pass
        return value

    def validate(self, data):
        if data.get('start_date') and data.get('end_date'):
            if data['start_date'] > data['end_date']:
                raise serializers.ValidationError("Boshlanish sanasi tugash sanasidan katta bo'lishi mumkin emas")
        return data
