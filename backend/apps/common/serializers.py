"""
Serializers for multilingual content and translation API.
"""
from rest_framework import serializers
from .translation_service import TranslationService, SUPPORTED_LANGUAGES


class MultilingualField(serializers.Field):
    """Custom field for handling multilingual content."""
    
    def to_representation(self, value):
        """Convert multilingual field to dictionary."""
        if isinstance(value, dict):
            return value
        elif isinstance(value, str):
            # Convert single string to multilingual format
            return {lang: value for lang in SUPPORTED_LANGUAGES}
        return {lang: '' for lang in SUPPORTED_LANGUAGES}
    
    def to_internal_value(self, data):
        """Convert incoming data to internal representation."""
        if isinstance(data, dict):
            # Validate it has required languages
            result = {}
            for lang in SUPPORTED_LANGUAGES:
                result[lang] = data.get(lang, '')
            return result
        elif isinstance(data, str):
            # If string provided, use it as source and translate
            return TranslationService.ensure_multilingual_field(data)
        return {lang: '' for lang in SUPPORTED_LANGUAGES}


class TranslationRequestSerializer(serializers.Serializer):
    """Serializer for translation requests."""
    
    content = serializers.DictField(
        child=serializers.CharField(),
        help_text="Dictionary with field names and text to translate"
    )
    source_language = serializers.ChoiceField(
        choices=SUPPORTED_LANGUAGES,
        default='uz',
        help_text="Source language code"
    )
    target_languages = serializers.ListField(
        child=serializers.ChoiceField(choices=SUPPORTED_LANGUAGES),
        default=['ru', 'en'],
        help_text="List of target language codes"
    )


class TranslateFieldSerializer(serializers.Serializer):
    """Serializer for single field translation."""
    
    text = serializers.CharField(
        help_text="Text to translate"
    )
    source_language = serializers.ChoiceField(
        choices=SUPPORTED_LANGUAGES,
        default='uz',
        help_text="Source language code"
    )
    target_language = serializers.ChoiceField(
        choices=SUPPORTED_LANGUAGES,
        help_text="Target language code"
    )


class TranslationResponseSerializer(serializers.Serializer):
    """Serializer for translation response."""
    
    original = serializers.CharField()
    translated = serializers.CharField()
    source_language = serializers.CharField()
    target_language = serializers.CharField()


class MultilingualEventSerializer(serializers.Serializer):
    """Serializer for events with multilingual content."""
    
    title = MultilingualField()
    short_description = MultilingualField()
    full_description = MultilingualField()
    venue = MultilingualField()
    
    class Meta:
        fields = ['title', 'short_description', 'full_description', 'venue']


class MultilingualContentSerializer(serializers.Serializer):
    """Generic serializer for multilingual content."""
    
    content = serializers.DictField(
        child=MultilingualField(),
        help_text="Dictionary of multilingual fields"
    )
    language = serializers.ChoiceField(
        choices=SUPPORTED_LANGUAGES,
        default='uz',
        help_text="Language to return content in"
    )
    
    def get_in_language(self, language):
        """Get content in specific language."""
        content = self.validated_data.get('content', {})
        result = {}
        
        for field_name, field_value in content.items():
            result[field_name] = TranslationService.get_field_for_language(
                field_value,
                language
            )
        
        return result
