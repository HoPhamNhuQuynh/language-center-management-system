from django.urls import path, include
from rest_framework.routers import DefaultRouter
from courses.views import CourseViewSet, LevelViewSet, ScoreTypeViewSet, TagViewSet

r = DefaultRouter()
r.register('courses', CourseViewSet, basename='course')
r.register('tags', TagViewSet, basename='tag')


urlpatterns = [
    path('', include(r.urls)),
    path('levels', LevelViewSet.as_view({'get': 'list', 'post': 'create'}), name='level-list-create'),
    path('score-types', ScoreTypeViewSet.as_view({'get': 'list', 'post': 'create'}), name='score-type-list-create'),
    path('tags', TagViewSet.as_view({'get': 'list'}), name='tag-list'),
]
