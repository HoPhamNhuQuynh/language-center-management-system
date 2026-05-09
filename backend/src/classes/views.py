from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, filters, permissions, status, generics
from . import serializers
from .models import ClassRoom, Room, Session, TeachingAssignment
from rest_framework.exceptions import ValidationError
from django.db.models.deletion import ProtectedError
from django.db.models import Prefetch, Count, Q, F
from core import core_perms, paginators


class ClassRoomViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.ClassRoomSerializer
    pagination_class = paginators.ItemPaginator
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
        return query.order_by("id")

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
        sessions = Session.objects.select_related('schedule', 'room', 'user', 'schedule__classroom').filter(schedule__classroom_id=pk)
        if request.user.is_authenticated and (request.user.is_teacher):
            sessions = sessions.filter(user=request.user)
        data = serializers.SessionSerializer(sessions, many=True, context={"request": request}).data
        return Response({
            "classroom_name": self.get_object().name, 
            "sessions": data
            }, status=status.HTTP_200_OK,
        )

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
    
    @action(methods=['post'], url_path='generate-sessions', detail=True,
            permission_classes=[core_perms.IsAdmin])
    def generate_sessions(self, request, pk):
        """
        Xóa sessions chưa có điểm danh → sinh lại từ schedules hiện tại.
        Dùng khi admin chỉnh sửa lịch học sau khi lớp đã tạo.
        """
        classroom = self.get_object()

        # Chỉ xóa sessions chưa có điểm danh để bảo toàn lịch sử
        deleted_count, _ = Session.objects.filter(
            schedule__classroom=classroom,
            grades_attendance__isnull=True  # Chưa có attendance
        ).delete()

        created_count = classroom.generate_sessions_from_schedules()

        return Response({
            "message": f"Đã xóa {deleted_count} sessions cũ, tạo mới {created_count} sessions.",
            "deleted": deleted_count,
            "created": created_count,
        }, status=status.HTTP_200_OK)

class SessionViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.UpdateAPIView, generics.DestroyAPIView):
    serializer_class = serializers.SessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        try:
            instance.delete()
        except ProtectedError:
            raise ValidationError("Không thể xóa buổi do ràng buộc dữ liệu.")

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):  # ← thêm dòng này
            return Session.objects.none()
    
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
    
    def create(self, request, *args, **kwargs):
        classroom_id = request.data.get("classroom_id")
        classroom = ClassRoom.objects.filter(id=classroom_id).first()

        if not classroom:
            return Response(
                {"error": "Không tìm thấy lớp học."}, status=status.HTTP_400_BAD_REQUEST
            )

        schedule = classroom.schedule_set.filter(active=True).first()

        if not schedule:
            return Response(
                {"error": "Lớp học chưa có lịch học nào."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(
            data=request.data,
            context={"request": request, "classroom_id": classroom_id},
        )
        serializer.is_valid(raise_exception=True)

        serializer.save(schedule=schedule)  # gán schedule vào khi save
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
class RoomViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Room.objects.filter(active=True)
    serializer_class = serializers.RoomSerializer
    permission_classes = [core_perms.IsAdmin]