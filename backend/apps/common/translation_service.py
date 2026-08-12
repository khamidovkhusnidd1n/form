"""
Translation service for multilingual content management.
Supports automatic translation to multiple languages.
"""
from typing import Dict
import logging

logger = logging.getLogger(__name__)

# Language codes
SUPPORTED_LANGUAGES = ['uz', 'ru', 'en']
DEFAULT_LANGUAGE = 'uz'

# Simple translation mapping for common terms (can be extended with real API)
TRANSLATION_MAPPING = {
    # Events
    'Xalqaro konferensiya': {
        'ru': 'Международная конференция',
        'en': 'International Conference',
    },
    'San\'art forumi': {
        'ru': 'Форум искусства',
        'en': 'Art Forum',
    },
    'Milliy ko\'rgazma': {
        'ru': 'Национальная выставка',
        'en': 'National Exhibition',
    },
    'Jahoviy simpozium': {
        'ru': 'Всемирный симпозиум',
        'en': 'World Symposium',
    },
    # Common phrases
    'Tadbir tasvirlanmagan': {
        'ru': 'Событие не описано',
        'en': 'Event description not provided',
    },
}


class TranslationService:
    """Service for translating content to multiple languages."""

    @staticmethod
    def translate_text(text: str, target_language: str, source_language: str = DEFAULT_LANGUAGE) -> str:
        """
        Translate text to target language.
        
        Args:
            text: Text to translate
            target_language: Target language code (uz, ru, en)
            source_language: Source language code
            
        Returns:
            Translated text or original if translation not found
        """
        if not text or target_language == source_language:
            return text
            
        if target_language not in SUPPORTED_LANGUAGES:
            return text
            
        # Check if we have a mapping for this text
        if text in TRANSLATION_MAPPING:
            translation = TRANSLATION_MAPPING[text].get(target_language)
            if translation:
                return translation
        
        # Log warning for missing translation
        logger.warning(f"No translation found for '{text}' to {target_language}")
        
        # Return original text as fallback
        return text

    @staticmethod
    def translate_field(field_value: any, target_language: str, source_language: str = DEFAULT_LANGUAGE) -> any:
        """
        Translate a field value (string or dict).
        
        Args:
            field_value: Field value to translate
            target_language: Target language code
            source_language: Source language code
            
        Returns:
            Translated value
        """
        if isinstance(field_value, str):
            return TranslationService.translate_text(field_value, target_language, source_language)
        elif isinstance(field_value, dict):
            # If it's already a multilingual dict, return the target language version
            if target_language in field_value:
                return field_value[target_language]
            # Try to use the source language or default
            return field_value.get(source_language, field_value.get(DEFAULT_LANGUAGE, ''))
        return field_value

    @staticmethod
    def translate_content_to_all_languages(content: Dict[str, str], source_language: str = DEFAULT_LANGUAGE) -> Dict[str, Dict[str, str]]:
        """
        Translate content to all supported languages.
        
        Args:
            content: Dictionary with field names as keys and text values
            source_language: Source language code
            
        Returns:
            Dictionary with language keys containing translated content
        """
        result = {}
        
        for language in SUPPORTED_LANGUAGES:
            result[language] = {}
            for field_name, field_value in content.items():
                if field_value:
                    result[language][field_name] = TranslationService.translate_text(
                        field_value, language, source_language
                    )
                else:
                    result[language][field_name] = ''
        
        return result

    @staticmethod
    def get_field_for_language(multilingual_field: Dict, language: str, default_language: str = DEFAULT_LANGUAGE) -> str:
        """
        Get field value for a specific language.
        
        Args:
            multilingual_field: Dictionary with language keys
            language: Language code to retrieve
            default_language: Default language to fall back to
            
        Returns:
            Field value for the language or empty string
        """
        if not isinstance(multilingual_field, dict):
            return str(multilingual_field) if multilingual_field else ''
        
        # Try requested language first
        if language in multilingual_field:
            return multilingual_field[language]
        
        # Try default language
        if default_language in multilingual_field:
            return multilingual_field[default_language]
        
        # Try any available language
        for lang in SUPPORTED_LANGUAGES:
            if lang in multilingual_field:
                return multilingual_field[lang]
        
        return ''

    @staticmethod
    def ensure_multilingual_field(field_value: any, source_language: str = DEFAULT_LANGUAGE) -> Dict[str, str]:
        """
        Ensure a field is in multilingual format.
        
        Args:
            field_value: Field value to convert
            source_language: Source language code
            
        Returns:
            Dictionary with multilingual content
        """
        if isinstance(field_value, dict):
            # Already multilingual
            result = {}
            for lang in SUPPORTED_LANGUAGES:
                result[lang] = field_value.get(lang, '')
            return result
        elif isinstance(field_value, str):
            # Convert string to multilingual format
            content = {source_language: field_value}
            # Translate to other languages
            translated = TranslationService.translate_content_to_all_languages(
                {'text': field_value},
                source_language
            )
            result = {}
            for lang in SUPPORTED_LANGUAGES:
                result[lang] = translated[lang]['text']
            return result
        else:
            # Return empty multilingual field
            return {lang: '' for lang in SUPPORTED_LANGUAGES}
