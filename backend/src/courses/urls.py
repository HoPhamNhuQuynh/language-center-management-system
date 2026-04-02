from django.urls import path, include
from rest_framework.routers import DefaultRouter

from courses.views import CourseViewSet, CourseCreateView, TagCreateView

r = DefaultRouter()
# r.register('courses', CourseViewSet, 'course')

urlpatterns = [
    path('', include(r.urls)),
    path('courses', CourseCreateView.as_view(), name='course-create'),
    path('tags', TagCreateView.as_view(), name='tag-create'),
]