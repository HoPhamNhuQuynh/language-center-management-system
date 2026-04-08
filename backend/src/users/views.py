from rest_framework import viewsets, status, permissions, generics
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from oauth2_provider.models import Application
from users.models import User
from users import serializers
from enrollments.serializers import EnrollmentSerializer, PaymentSerializer
from enrollments.models import Payment, Enrollment
from .utils import generate_auth_token
import requests
from config import settings
from core import core_perms
from oauth2_provider.models import AccessToken
from rest_framework.throttling import AnonRateThrottle
from core import core_perms

class SocialLoginThrottle(AnonRateThrottle):
    scope = 'social_login'

User = get_user_model()

class UserViewSet(viewsets.ViewSet, generics.DestroyAPIView, generics.ListCreateAPIView):
    queryset = User.objects.all()

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        if self.action in ['current_user', 'update_avatar', 'update_password', 'get_payments', 'get_enrollments']:
            return [permissions.IsAuthenticated()]
        return [core_perms.IsAdmin()]

    def get_serializer_class(self):
        if self.action in ['current_user'] or self.request.user.is_admin:
            return serializers.UserDetailSerializer
        return serializers.UserSerializer

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()
        AccessToken.objects.filter(user=instance).delete()

    @action(methods=['get', 'patch', 'delete'], url_path="me", detail=False)
    def current_user(self, request):
        u = request.user
        if request.method.__eq__("PATCH"):
            s = self.get_serializer(u, data= request.data, partial=True)
            s.is_valid(raise_exception=True)
            s.save()
            return Response(s.data, status=status.HTTP_200_OK)
        elif request.method.__eq__("DELETE"):
            u.is_active = False
            u.save()
            AccessToken.objects.filter(user=u).delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        return Response(self.get_serializer(u).data, status=status.HTTP_200_OK)

    @action(methods=['patch'], url_path="me/avatar", detail=False)
    def update_avatar(self, request):
        profile = request.user.profile

        s = serializers.ProfileSerializer(profile, data= request.data, partial=True)
        s.is_valid(raise_exception=True)
        s.save()
        return Response(s.data, status=status.HTTP_200_OK)
    
    @action(methods=['patch'], url_path="me/password", detail=False)
    def update_password(self, request):
        u = request.user
        s = serializers.PasswordUpdateSerializer(u, data=request.data, partial=True)
        s.is_valid(raise_exception=True)
        u = s.save()
        return Response(serializers.UserSerializer(u).data, status=status.HTTP_200_OK)

    @action(methods=['get'], url_path="me/enrollments", detail=False)
    def get_enrollments(self, request):
        user = request.user
        enrollments = Enrollment.objects.filter(student=user).select_related('classroom')
        return Response(EnrollmentSerializer(enrollments, many=True).data, status=status.HTTP_200_OK)
    
    @action(methods=['get'], url_path="me/payments", detail=False)
    def get_payments(self, request):
        payments = Payment.objects.filter(enrollment__student=request.user).select_related('enrollment__classroom')

        return Response(PaymentSerializer(payments, many=True).data, status=status.HTTP_200_OK)

class SocialTokenExchangeViewSet(APIView):
    throttle_classes = [SocialLoginThrottle]
    def post(self, request):
        provider = request.data.get('provider', '').upper()
        social_access_token = request.data.get('access_token')

        if not provider or not social_access_token:
            return Response({'error': 'Missing provider or access_token'}, status=status.HTTP_400_BAD_REQUEST)
        
        if provider not in User.AuthProvider.values:
            return Response({'error': 'Unsupported provider'}, status=status.HTTP_400_BAD_REQUEST)
        
        email = None
        user_info = {}

        if provider == User.AuthProvider.GOOGLE:
            google_response = requests.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                params={'access_token': social_access_token}
            )
            if google_response.status_code != 200:
                return Response({'error': 'Invalid Google Token'}, status=status.HTTP_400_BAD_REQUEST)
            user_info = google_response.json()
            email = user_info.get('email')
        elif provider == User.AuthProvider.FACEBOOK:
            fb_response = requests.get(
                'https://graph.facebook.com/me',
                params={
                    'fields': 'id,name,email',
                    'access_token': social_access_token
                }
            )
            if fb_response.status_code != 200:
                return Response({'error': 'Invalid Facebook Token'}, status=status.HTTP_400_BAD_REQUEST)
            user_info = fb_response.json()
            email = user_info.get('email')
        else:
            return Response({'error': 'Unsupported provider'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not email:
            return Response({'error': 'Email not provided by social network'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.filter(email=email).first()
        if user:
            if user.auth_provider != provider:
                return Response({
                    'error': f'This email is registed by {user.auth_provider}. Please use the right way to login in system.'},
                    status=status.HTTP_400_BAD_REQUEST)
        else:
            user = User.objects.create(
                email=email,
                username=email.split('@')[0],
                first_name=user_info.get('name', '').split(' ')[0],
                auth_provider=provider
            )
            user.set_unusable_password()
            user.save()

        try: 
            app = Application.objects.get(name='Language Center')
        except:
            return Response({'error': 'OAuth2 application not found'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        access_token, refresh_token = generate_auth_token(user, app)

        oauth2_settings = getattr(settings, 'OAUTH2_PROVIDER', {})
        expires_in = oauth2_settings.get('ACCESS_TOKEN_EXPIRE_SECONDS', 3600)

        return Response({
            'access_token': access_token.token,
            'refresh_token': refresh_token.token,
            'expires_in': expires_in,
            'token_type': 'Bearer',
            'user': {
                'email': user.email,
                'provider': user.auth_provider
            }
        })
