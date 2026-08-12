from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from apps.reports.services import ReportService
from apps.accounts.permissions import IsModeratorOrAbove


@api_view(['GET'])
@permission_classes([IsModeratorOrAbove])
def dashboard_summary(request):
    return Response(ReportService.dashboard_summary())
