from rest_framework import viewsets, status, permissions, generics
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from oauth2_provider.models import Application
from users.models import User, Profile
from users.serializers import UserSerializer, SimpleUserSerializer, ProfileSerializer
from classes.serializers import ClassRoomSerializer
from .utils import generate_auth_token
import requests

User = get_user_model()

class UserViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView, generics.RetrieveAPIView, generics.DestroyAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_serializer_class(self):
        if self.action == 'list':
            return SimpleUserSerializer
        if self.action == 'update_avatar':
            return ProfileSerializer
        return UserSerializer


    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['get', 'patch'], url_path="me", detail=False,
            permission_classes=[permissions.IsAuthenticated])
    def current_user(self, request):
        u = request.user
        if request.method.__eq__("PATCH"):
            s = self.get_serializer(u, data= request.data, partial=True)
            s.is_valid(raise_exception=True)
            s.save()
            return Response(s.data, status=status.HTTP_200_OK)

        return Response(self.get_serializer(u).data, status=status.HTTP_200_OK)

    @action(methods=['patch'], url_path="me/avatar", detail=False,
            permission_classes=[permissions.IsAuthenticated])
    def update_avatar(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)

        s = ProfileSerializer(profile, data= request.data, partial=True, context={'request': request})
        s.is_valid(raise_exception=True)
        s.save()
        return Response(s.data, status=status.HTTP_200_OK)

    @action(methods=['get'], url_path="me/enrollments", detail=False,
            permission_classes=[permissions.IsAuthenticated])
    def get_enrollments(self, request):
        classrooms = request.user.enrollments.all()

        serializer = ClassRoomSerializer(classrooms, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

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
            'expires_in': 900,
            'token_type': 'Bearer',
            'scope': access_token.scope
        })
    

