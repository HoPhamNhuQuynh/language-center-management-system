from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from oauth2_provider.views import TokenView, RevokeTokenView
from .views import SocialTokenExchangeViewSet
from django.views.decorators.csrf import csrf_exempt


r = DefaultRouter()
r.register('users', views.UserViewSet,'user')

auth_patterns = [
    path('login/', csrf_exempt(TokenView.as_view()), name='login'),
    path('logout/', csrf_exempt(RevokeTokenView.as_view()), name='logout'),
    path('social-login/', SocialTokenExchangeViewSet.as_view(), name='social_login'),
    # path('register/', RegisterView.as_view(), name='register'),
]

urlpatterns = [
    path('', include(r.urls)),
    path('auth/', include(auth_patterns)),
]