from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views


r = DefaultRouter()
r.register('users', views.UserViewSet,'user')

urlpatterns = [
    path('', include(r.urls)),
    path('google-exchange/', views.GoogleTokenExchangeViewSet.as_view(), name='google_exchange'),
]