from django.urls import path
from .views import BulkSyncScoreView

urlpatterns = [
    path(
        "classes/<int:class_id>/bulk-sync-scores/",
        BulkSyncScoreView.as_view(),
        name="bulk-sync-scores"
    ),
]