from django.urls import path, include
from rest_framework.routers import DefaultRouter

from courses.views import CourseViewSet

r = DefaultRouter()
# r.register('courses', CourseViewSet, 'course')

urlpatterns = [
    path('', include(r.urls)),
]