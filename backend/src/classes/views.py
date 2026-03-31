
from rest_framework import viewsets, generics, filters, permissions
from .serializers import ClassRoomSerializer, ClassRoomDetailSerializer
from .models import ClassRoom
from .paginators import ClassRoomPaginator

class ClassRoomViewSet(viewsets.ModelViewSet):
    serializer_class = ClassRoomSerializer
    pagination_class = ClassRoomPaginator
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name"]
    ordering_fields = ["-id"]

    def get_queryset(self):
        query = ClassRoom.objects.filter(active=True).all()

        if self.request.user.is_staff or self.action == 'retrieve':
            return query.prefetch_related('teachingassignment_set__teacher').select_related('course')

        return query
    
    def get_permissions(self):
        # if self.action in ['create', 'update', 'destroy', 'partial_update']:
        #     return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]
        
    def get_serializer_class(self, *args, **kwargs):
        if self.request.user.is_staff or self.action == 'retrieve':
            return ClassRoomDetailSerializer
        return ClassRoomSerializer
