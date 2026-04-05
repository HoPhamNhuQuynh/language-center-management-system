
from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response

from classes.serializers import ClassRoomSerializer
from users.models import User, Profile
from users.serializers import UserSerializer, SimpleUserSerializer, ProfileSerializer


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

