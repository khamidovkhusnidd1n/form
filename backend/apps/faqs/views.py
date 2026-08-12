from rest_framework import generics, permissions
from .models import FAQ
from .serializers import FAQSerializer
from apps.accounts.permissions import IsModeratorOrAbove


class FAQListView(generics.ListAPIView):
    queryset = FAQ.objects.filter(is_active=True)
    serializer_class = FAQSerializer
    permission_classes = [permissions.AllowAny]


class AdminFAQListCreateView(generics.ListCreateAPIView):
    queryset = FAQ.objects.all().order_by('order')
    serializer_class = FAQSerializer
    permission_classes = [IsModeratorOrAbove]


class AdminFAQDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer
    permission_classes = [IsModeratorOrAbove]
