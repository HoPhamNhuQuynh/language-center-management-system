
from rest_framework import viewsets

from users.models import User
from users import serializers


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
