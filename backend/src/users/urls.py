from django.urls import path, include
from rest_framework.routers import DefaultRouter
from users import views


r = DefaultRouter()
r.register('users', views.UserViewSet,'user')

urlpatterns = [
    path('', include(r.urls)),
]