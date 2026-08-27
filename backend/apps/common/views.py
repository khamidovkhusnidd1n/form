"""
REST API views for translation functionality.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from .translation_service import TranslationService, SUPPORTED_LANGUAGES


class TranslationViewSet(viewsets.ViewSet):
    """ViewSet for translation operations."""
    
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'], url_path='translate')
    def translate(self, request):
        """
        Translate content to multiple languages.
        
        Request body:
        {
            "content": {
                "title": "Xalqaro konferensiya",
                "description": "Birinchi qadamda shu nima..."
            },
            "source_language": "uz",
            "target_languages": ["ru", "en"]
        }
        """
        try:
            data = request.data
            content = data.get('content', {})
            source_language = data.get('source_language', 'uz')
            target_languages = data.get('target_languages', ['ru', 'en'])
            
            if not content:
                return Response(
                    {'error': 'Content is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Translate to all languages
            all_translations = TranslationService.translate_content_to_all_languages(
                content, 
                source_language
            )
            
            # Filter to only requested languages
            result = {}
            for lang in target_languages:
                if lang in all_translations:
                    result[lang] = all_translations[lang]
            
            return Response(result, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'], url_path='translate-field')
    def translate_field(self, request):
        """
        Translate a single field to a specific language.
        
        Request body:
        {
            "text": "Xalqaro konferensiya",
            "source_language": "uz",
            "target_language": "ru"
        }
        """
        try:
            data = request.data
            text = data.get('text', '')
            source_language = data.get('source_language', 'uz')
            target_language = data.get('target_language')
            
            if not text or not target_language:
                return Response(
                    {'error': 'Text and target_language are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            translated = TranslationService.translate_text(
                text,
                target_language,
                source_language
            )
            
            return Response({
                'original': text,
                'translated': translated,
                'source_language': source_language,
                'target_language': target_language
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'], url_path='supported-languages')
    def supported_languages(self, request):
        """Get list of supported languages."""
        return Response({
            'languages': SUPPORTED_LANGUAGES,
            'language_labels': {
                'uz': "O'zbek",
                'ru': 'Русский',
                'en': 'English'
            }
        }, status=status.HTTP_200_OK)


# Alternative function-based view for simple translation endpoint
@require_http_methods(["POST"])
def translate_content_view(request):
    """Simple view for translating content."""
    try:
        import json
        data = json.loads(request.body)
        
        content = data.get('content', {})
        source_language = data.get('source_language', 'uz')
        
        if not content:
            return JsonResponse(
                {'error': 'Content is required'},
                status=400
            )
        
        # Translate to all languages
        result = TranslationService.translate_content_to_all_languages(
            content,
            source_language
        )
        
        return JsonResponse(result, status=200)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@require_http_methods(["GET"])
def run_migrations_view(request):
    """View to run migrations from web (for cPanel)."""
    try:
        from django.core.management import call_command
        import io
        out = io.StringIO()
        call_command('migrate', interactive=False, stdout=out)
        return JsonResponse({
            'status': 'success',
            'output': out.getvalue()
        }, status=200)
    except Exception as e:
        import traceback
        return JsonResponse({
            'status': 'error',
            'error': str(e),
            'traceback': traceback.format_exc()
        }, status=500)

@require_http_methods(["GET"])
def run_makemigrations_view(request):
    """View to run makemigrations from web."""
    try:
        from django.core.management import call_command
        import io
        out = io.StringIO()
        call_command('makemigrations', interactive=False, stdout=out)
        return JsonResponse({
            'status': 'success',
            'output': out.getvalue()
        }, status=200)
    except Exception as e:
        import traceback
        return JsonResponse({
            'status': 'error',
            'error': str(e),
            'traceback': traceback.format_exc()
        }, status=500)
