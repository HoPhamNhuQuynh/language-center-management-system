from rest_framework.views import APIView
from rest_framework.response import Response
from core import core_perms
from .services import DashboardService

class DashboardSummaryView(APIView):
    permission_classes = [core_perms.IsAdmin]

    def get(self, request):
        year = request.query_params.get("year", 2026)
        quarter = request.query_params.get("quarter", 1)

        data = DashboardService.get_dashboard(year, quarter)
        return Response(data)