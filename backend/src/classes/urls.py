
from django.urls import path, include
from .views import ClassRoomViewSet, SessionViewSet
from rest_framework.routers import DefaultRouter

route = DefaultRouter()
route.register('classes', ClassRoomViewSet, basename='classroom')
route.register('sessions', SessionViewSet, basename='session')

urlpatterns = [
    path('', include(route.urls)),
]