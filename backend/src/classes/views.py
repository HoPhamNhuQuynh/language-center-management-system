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
from grades.serializers import ScoreSerializer
from grades.models import Score
from core import core_perms

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
            return [core_perms.IsAdmin()]
        if self.action in ['get_sessions', 'get_students']:
            return [permissions.IsAuthenticated()]
        if self.action == 'get_scores':
            return [(core_perms.IsAdmin | core_perms.IsTeacher)()]
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

    @action(methods=['get'], url_path='scores', detail=True)
    def get_scores(self, request, pk):
        scores = Score.objects.select_related('score_type', 'enrollment').filter(active=True, enrollment__classroom_id=pk)

        return Response(ScoreSerializer(scores, many=True).data, status=status.HTTP_200_OK)