
from django.urls import path, include
from .views import ClassRoomViewSet
from rest_framework.routers import DefaultRouter

route = DefaultRouter()
route.register('classes', ClassRoomViewSet, basename='classroom')

urlpatterns = [
    path('', include(route.urls)),
]