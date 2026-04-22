from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from oauth2_provider.views import RevokeTokenView, TokenView
from .views import SocialTokenExchangeViewSet
from oauth2_provider import urls as oauth2_urls


r = DefaultRouter()
r.register('users', views.UserViewSet,'user')

auth_patterns = [
    path('login/', views.LoginView.as_view(), name='login'),
    path('token/', (TokenView.as_view()), name='token'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('revoke/', (RevokeTokenView.as_view()), name='revoke'),
    path('social-login/', (SocialTokenExchangeViewSet.as_view()), name='social_login'),
    path('refresh/', (views.RefreshTokenView.as_view()), name='logout'),
    path('register/', views.RegisterView.as_view(), name='register'),
]

urlpatterns = [
    path('', include(r.urls)),
    path('auth/', include(auth_patterns)),
    # path('o/', include(oauth2_urls)),
]