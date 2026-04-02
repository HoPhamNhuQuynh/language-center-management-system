from django.urls import path, include
from rest_framework.routers import DefaultRouter

from courses.views import CourseViewSet, LevelListCreateView, ScoreTypeCreateView, TagListView

r = DefaultRouter()
# r.register('courses', CourseViewSet, 'course')

urlpatterns = [
    path('', include(r.urls)),
    path('levels', LevelListCreateView.as_view(), name='level-list-create'),
    path('score-types', ScoreTypeCreateView.as_view(), name='score-type-create'),
    path('tags', TagListView.as_view(), name='tag-list'),
]
