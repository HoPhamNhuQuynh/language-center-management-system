from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, filters, permissions, status
from . import serializers
from .models import ClassRoom, Session
from .paginators import ClassRoomPaginator
from enrollments.serializers import EnrollmentSerializer

class ClassRoomViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.ClassRoomSerializer
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
        if self.action in ['create', 'update', 'destroy', 'partial_update']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]
        
    def get_serializer_class(self, *args, **kwargs):
        if self.request.user.is_staff or self.action == 'retrieve':
            return serializers.ClassRoomDetailSerializer
        return serializers.ClassRoomSerializer
    
    # /classes/id/sessions/
    @action(methods=['get'], url_path='sessions', detail=True)
    def get_sessions(self, request, pk):
        sessions = Session.objects.select_related('schedule').filter(schedule__classroom=self.get_object())
        return Response(serializers.SessionSerializer(sessions, many=True, context={"request": request}).data, status=status.HTTP_200_OK)
    
    @action(methods=['get'], url_path='students', detail=True)
    def get_students(self, request, pk):
        enrollments = self.get_object().enrollment_set.filter(active=True, enrollment_status__in=['SUCCESS', 'PARTIAL_PAYMENT']).select_related('user')

        return Response(EnrollmentSerializer(enrollments, many=True, context={"request": request}).data, status=status.HTTP_200_OK)
