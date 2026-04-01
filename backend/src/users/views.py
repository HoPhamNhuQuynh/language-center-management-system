from rest_framework import viewsets, status
from users.models import User
from users import serializers
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from oauth2_provider.models import Application
from .utils import generate_auth_token

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer

class SocialTokenExchangeViewSet(APIView):
    def post(self, request):
        google_token = request.data.get('google_token')

        if not google_token:
            return Response({'error': 'Missing google_toke'}, status=status.HTTP_400_BAD_REQUEST)
        
        google_response = requests.get('https://www.googleapis.com/oauth2/v3/userinfo',
                                    params={'access_token': google_token}
                            )
        if google_response.status_code != 200:
            return Response({'error': 'Invalid Google Token'}, status=status.HTTP_400_BAD_REQUEST)
        
        user_data = google_response.json()
        email = user_data.get('email')

        user, created = User.objects.get_or_create(email=email, defaults={
            'username': email.split('@')[0],
            'auth_provider': User.AuthProvider.GOOGLE
        })

        if created:
            user.set_unuseable_password()
            user.save()

        try: 
            app = Application.objects.get(name='Language Center')
        except:
            return Response({'error': 'OAuth2 application not found in Admin'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        access_token, refresh_token = generate_auth_token(user, app)

        return Response({
            'access_token': access_token.token,
            'refresh_token': refresh_token.token,
            'expires_in': 36000,
            'token_type': 'Bearer',
            'scope': access_token.scope
        })