from django.urls import path
from grades.views import ClassScoreListAPIView

urlpatterns = [
    path('classes/<int:class_id>/scores', ClassScoreListAPIView.as_view(), name='class-score-list'),

]