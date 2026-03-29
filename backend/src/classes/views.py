
from rest_framework import viewsets, generics
from .serializers import ClassRoomSerializer
from .models import ClassRoom
from .paginators import ClassRoomPaginator

class ClassRoomViewSet(viewsets.ViewSet, generics.ListAPIView):
    serializer_class = ClassRoomSerializer
    pagination_class = ClassRoomPaginator

    def get_queryset(self):
        query = ClassRoom.objects.prefetch_related('teachingassignment_set__teacher').select_related('course').filter(active=True)

        return query
