from django.urls import path, include
from .views import BulkSyncScoreView, BulkSyncAttendanceView, AttendanceViewSet
from rest_framework.routers import DefaultRouter

r = DefaultRouter()
r.register('attendances', AttendanceViewSet, basename='attendance')

urlpatterns = [
    path(
        "classes/<int:class_id>/bulk-sync-scores/",
        BulkSyncScoreView.as_view(),
        name="bulk-sync-scores"
    ),
    path(
        "classes/<int:class_id>/bulk-sync-attendances/",
        BulkSyncAttendanceView.as_view(),
        name="bulk-sync-scores"
    ),
    path('', include(r.urls))
]