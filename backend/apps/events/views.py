from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as filters
from .models import Event
from .serializers import (
    EventListSerializer, EventDetailSerializer,
    EventCreateUpdateSerializer, EventGallerySerializer
)
from apps.accounts.permissions import IsAdminOrAbove, IsModeratorOrAbove


@api_view(['GET'])
@permission_classes([IsModeratorOrAbove])
def certificate_preview(request, pk):
    from django.shortcuts import get_object_or_404
    from django.http import HttpResponse
    from django.utils import timezone
    from apps.certificates.layout import render_certificate
    event = get_object_or_404(Event, pk=pk)
    pdf = render_certificate(
        full_name='Ishtirokchi Ism Familiyasi', event_title=event.title,
        date=timezone.localdate().strftime('%d.%m.%Y'), number='NAMUNA',
        verify_url=f'{request.scheme}://{request.get_host()}/certificate-check',
        partners=[{'name': p.name, 'logo': p.logo} for p in event.partners.all()],
    )
    response = HttpResponse(pdf, content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="sertifikat-namuna.pdf"'
    return response


class EventFilter(filters.FilterSet):
    type = filters.CharFilter(field_name='type')
    status = filters.CharFilter(field_name='status')
    registration_enabled = filters.BooleanFilter(field_name='registration_enabled')

    class Meta:
        model = Event
        fields = ['type', 'status', 'registration_enabled']


class EventListView(generics.ListAPIView):
    queryset = Event.objects.all()
    serializer_class = EventListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_class = EventFilter


class EventDetailView(generics.RetrieveAPIView):
    queryset = Event.objects.all()
    serializer_class = EventDetailSerializer
    permission_classes = [permissions.AllowAny]


class AdminEventListCreateView(generics.ListCreateAPIView):
    queryset = Event.objects.all().order_by('-created_at')
    permission_classes = [IsModeratorOrAbove]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return EventCreateUpdateSerializer
        return EventListSerializer


class AdminEventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    permission_classes = [IsModeratorOrAbove]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return EventCreateUpdateSerializer
        return EventDetailSerializer


@api_view(['POST'])
@permission_classes([IsModeratorOrAbove])
def add_gallery_image(request, pk):
    event = Event.objects.get(pk=pk)
    serializer = EventGallerySerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save(event=event)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsModeratorOrAbove])
def dashboard_stats(request):
    from apps.applications.models import Application
    from django.utils import timezone
    today = timezone.now().date()
    data = {
        'total_events': Event.objects.count(),
        'active_events': Event.objects.filter(status__in=['planned', 'ongoing']).count(),
        'total_applications': Application.objects.count(),
        'today_applications': Application.objects.filter(submitted_at__date=today).count(),
        'approved': Application.objects.filter(status='approved').count(),
        'rejected': Application.objects.filter(status='rejected').count(),
        'pending': Application.objects.filter(status='submitted').count(),
        'under_review': Application.objects.filter(status='under_review').count(),
        'info_required': Application.objects.filter(status='info_required').count(),
    }
    return Response(data)
