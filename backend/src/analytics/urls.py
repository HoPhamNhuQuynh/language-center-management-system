from django.urls import path
from .views import DashboardSummaryView

urlpatterns = [
    path("analytics/dashboard/", DashboardSummaryView.as_view()),
]