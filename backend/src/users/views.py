
from rest_framework import viewsets, parsers, generics, filters

from users.models import User
from users import serializers

class UserViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView, generics.RetrieveAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['id']

    def get_queryset(self):
        query = self.queryset

        user_id = self.request.query_params.get('id')
        if user_id:
            query = query.filter(user_id=user_id)

        return query




