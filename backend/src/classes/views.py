from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, filters, permissions, status, generics
from . import serializers
from .models import ClassRoom, Session, TeachingAssignment
from core import paginators
from enrollments.serializers import EnrollmentSerializer
from rest_framework.exceptions import ValidationError
from django.db.models.deletion import ProtectedError
from django.db.models import Prefetch, Count, Q, F
from grades.serializers import ScoreSerializer
from grades.models import Score
from core import core_perms


class ClassRoomViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.ClassRoomSerializer
    # pagination_class = paginators.ClassRoomPaginator
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name"]
    ordering_fields = ["-id"]

    def get_queryset(self):
        query = (ClassRoom.objects.filter(active=True).annotate(
            student=Count(
                'enrollment',
                filter=Q(
                    enrollment__active=True,
                    enrollment__enrollment_status__in=['SUCCESS']
                )
            )
        ).prefetch_related(
            Prefetch(
                'teachingassignment_set',
                queryset=TeachingAssignment.objects.select_related('teacher')
            )
        ).select_related('course__level'))

        if self.request.user.is_authenticated and self.request.user.is_student:
            query = query.filter(student__lt=F('capacity'))
        if self.request.user.is_authenticated and self.request.user.is_teacher:
            query = query.filter(
                teachingassignment__teacher=self.request.user,
                teachingassignment__is_main=True
            )
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
        return Response(serializers.SessionSerializer(sessions, many=True, context={"request": request}).data,
                        status=status.HTTP_200_OK)

    @action(methods=['get'], url_path='students', detail=True)
    def get_students(self, request, pk):
        enrollments = self.get_object().enrollment_set.filter(active=True, enrollment_status__in=['SUCCESS']).select_related(
            'student')
        return Response(EnrollmentSerializer(enrollments, many=True, context={"request": request}).data,
                        status=status.HTTP_200_OK)

    @action(methods=['get'], url_path='scores', detail=True)
    def get_scores(self, request, pk):
        enrollments = self.get_object().enrollment_set.filter(
            active=True, 
            enrollment_status__in=['SUCCESS']
        ).select_related('student').prefetch_related('score_set')

        results = []
        for en in enrollments:
            existing_scores = en.score_set.filter(active=True)
            if existing_scores.exists():
                for s in existing_scores:
                    results.append({
                        "enrollment_id": en.id,
                        "score_type_id": s.score_type_id,
                        "score_value": s.score_value,
                        "student": {
                            "id": en.student.id,
                            "first_name": en.student.first_name,
                            "last_name": en.student.last_name,
                        }
                    })
            else:
                results.append({
                    "enrollment_id": en.id,
                    "score_type_id": None,
                    "score_value": None,
                    "student": {
                        "id": en.student.id,
                        "first_name": en.student.first_name,
                        "last_name": en.student.last_name,
                    }
                })    
        return Response(results, status=status.HTTP_200_OK)

    @action(methods=['get'], url_path='score-types', detail=True)
    def get_score_types(self, request, pk):
        classroom = self.get_object()
        from courses.serializers import ScoreTypeSerializer
        score_types = classroom.course.scoretype_set.filter(active=True)
        return Response(ScoreTypeSerializer(score_types, many=True).data, status=status.HTTP_200_OK)

class SessionViewSet(viewsets.ViewSet, generics.ListAPIView):
    serializer_class = serializers.SessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        query = Session.objects.select_related('schedule__classroom', 'user')

        if user.is_teacher:
            return query.filter(user=user)
        
        if user.is_student:
            return query.filter(
                schedule__classroom__enrollment__student=user,
                schedule__classroom__enrollment__active=True,
                # schedule__classroom__enrollment__enrollment_status__in=['SUCCESS', 'PARTIAL_PAYMENT']
            ).distinct()

        return query