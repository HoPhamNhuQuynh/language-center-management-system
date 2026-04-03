from django.urls import path, include
from rest_framework.routers import DefaultRouter
from courses.views import CourseViewSet, CourseViewSet, TagViewSet

r = DefaultRouter()
r.register('courses', CourseViewSet, basename='course')
r.register('tags', TagViewSet, basename='tag')


urlpatterns = [
    path('', include(r.urls)),
]