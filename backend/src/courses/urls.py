from django.urls import path, include
from rest_framework.routers import DefaultRouter
from courses.views import CourseViewSet, LevelViewSet, ScoreTypeViewSet, TagViewSet

r = DefaultRouter()
r.register('courses', CourseViewSet, basename='course')
r.register('tags', TagViewSet, basename='tag')
r.register('levels', TagViewSet, basename='level')
r.register('score-types', TagViewSet, basename='score-type')


urlpatterns = [
    path('', include(r.urls)),
]
