from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, filters, permissions, status
from . import serializers
from .models import ClassRoom, Session, TeachingAssignment
from core import paginators
from enrollments.serializers import EnrollmentSerializer
from rest_framework.exceptions import ValidationError
from django.db.models.deletion import ProtectedError
from django.db.models import Prefetch

class ClassRoomViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.ClassRoomSerializer
    pagination_class = paginators.ClassRoomPaginator
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name"]
    ordering_fields = ["-id"]

    def get_queryset(self):
        query = ClassRoom.objects.filter(active=True).prefetch_related(
            Prefetch(
                'teachingassignment_set',
                queryset=TeachingAssignment.objects.select_related('teacher')
            )
        ).select_related('course')
        return query
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'destroy', 'partial_update']:
            return [permissions.IsAdminUser()]
        if self.action in ['get_sessions', 'get_students']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]
        
    def get_serializer_class(self, *args, **kwargs):
        user = self.request.user
        if user.is_authenticated and (user.is_admin or user.is_teacher or self.action == 'retrieve'):
            return serializers.ClassRoomDetailSerializer
        return serializers.ClassRoomSerializer
    
    def perform_destroy(self, instance):
        try:
            instance.delete()
        except ProtectedError:
            raise ValidationError("Không thể xóa lớp học do ràng buộc dữ liệu.")

    @action(methods=['get'], url_path='sessions', detail=True)
    def get_sessions(self, request, pk):
        sessions = Session.objects.select_related('schedule', 'room', 'user').filter(schedule__classroom_id=pk)
        return Response(serializers.SessionSerializer(sessions, many=True, context={"request": request}).data, status=status.HTTP_200_OK)
    
    @action(methods=['get'], url_path='students', detail=True)
    def get_students(self, request, pk):
        enrollments = self.get_object().enrollment_set.filter(active=True, enrollment_status__in=['SUCCESS', 'PARTIAL_PAYMENT']).select_related('student')
        return Response(EnrollmentSerializer(enrollments, many=True, context={"request": request}).data, status=status.HTTP_200_OK)
