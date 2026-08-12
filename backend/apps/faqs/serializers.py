from rest_framework import serializers
from .models import FAQ


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ['id', 'question', 'answer', 'order', 'is_active', 'created_at', 'translations']
        read_only_fields = ['id', 'created_at', 'translations']
