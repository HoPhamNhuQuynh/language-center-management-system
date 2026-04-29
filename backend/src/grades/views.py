from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, viewsets, generics, serializers
from classes.models import ClassRoom, Session, TeachingAssignment
from courses.models import ScoreType
from enrollments.models import Enrollment
from grades.models import Attendance, Score
from .serializers import BulkSyncScoreSerializer, BulkSyncAttendanceSerializer, AttendanceSerializer
from .service import ScoreService, AttendanceService
from core import core_perms
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied

class AttendanceViewSet(viewsets.ViewSet, generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, core_perms.IsTeacher]
    serializer_class = AttendanceSerializer

    def get_queryset(self):

        session_id = self.request.query_params.get('session_id')

        if not session_id:
            raise serializers.ValidationError("Mã buổi học là bắt buộc")

        session = Session.objects.select_related('schedule__classroom').get(pk=session_id)

        if session.user != self.request.user:
            raise PermissionDenied("Bạn không có quyền xem điểm danh cho buổi học này")

        classroom = session.schedule.classroom

        attendances = Attendance.objects.filter(session=session).select_related('enrollment__student')

        if not attendances.exists():
            enrollments = Enrollment.objects.filter(classroom=classroom).select_related('student')

            attendances = [
                Attendance(
                    session=session,
                    enrollment=e
                )

                for e in enrollments
            ]

            Attendance.objects.bulk_create(attendances)

            attendances = Attendance.objects.filter(session=session).select_related('enrollment__student')

        return attendances


class BulkSyncScoreView(APIView):
    permission_classes = [permissions.IsAuthenticated, core_perms.IsTeacher]

    def post(self, request, class_id):
        serializer = BulkSyncScoreSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        classroom = ClassRoom.objects.get(pk=class_id)

        is_main = TeachingAssignment.objects.filter(
            classroom=classroom,
            teacher=request.user,
            is_main=True
        ).exists()

        if not is_main:
            raise PermissionDenied("Bạn không có quyền nhập điểm cho lớp học này.")

        if classroom.grade_deadline and timezone.now() > classroom.grade_deadline:
            raise PermissionDenied("Đã quá thời hạn nộp điểm.")

        if classroom.grade_status == ClassRoom.Status.SUBMITTED:
            raise PermissionDenied("Bảng điểm đã nộp, vui lòng liên hệ Admin để mở lại nếu cần chỉnh sửa.")

        result = ScoreService.bulk_sync_scores(
            classroom=classroom,
            scores_date=serializer.validated_data["scores"]
        )

        return Response({
            "message": "OK",
            "data": result
        })
    
class SubmitScoreView(APIView):
    permission_classes = [permissions.IsAuthenticated, core_perms.IsTeacher]

    def post(self, request, class_id):
        classroom = generics.get_object_or_404(ClassRoom, pk=class_id)
        
        is_main = TeachingAssignment.objects.filter(
            classroom=classroom, teacher=request.user, is_main=True
        ).exists()
        if not is_main:
            raise PermissionDenied("Hệ thống yêu cầu quyền nộp điểm.")
        
        required_score_types = ScoreType.objects.filter(course=classroom.course)
        required_count = required_score_types.count()

        if required_count == 0:
            raise ValidationError("Chưa cấu hình các loại điểm cho khóa học này.")

        enrollments = Enrollment.objects.filter(classroom=classroom)
        
        if not enrollments.exists():
            raise ValidationError("Lớp học hiện không có học viên nào.")

        for enrollment in enrollments:
            scored_count = Score.objects.filter(
                enrollment=enrollment,
                score_type__in=required_score_types
            ).count()

            if scored_count < required_count:
                raise ValidationError(
                    f"Học viên {enrollment.student.get_full_name()} chưa nhập đủ điểm ({scored_count}/{required_count})."
                )

        classroom.grade_status = ClassRoom.Status.SUBMITTED
        classroom.save()

        return Response({
            "message": "Bảng điểm đã được nộp và khóa thành công."
        }, status=status.HTTP_200_OK)
    
class BulkSyncAttendanceView(APIView):
    permission_classes = [permissions.IsAuthenticated, core_perms.IsTeacher]

    def post(self, request, class_id):
        serializer = BulkSyncAttendanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        session_id = serializer.validated_data["session_id"]
        attendances_data = serializer.validated_data["attendances"]

        try:
            classroom = ClassRoom.objects.get(pk=class_id)
        except ClassRoom.DoesNotExist:
            return Response(
                {"message": "Lớp học không tồn tại."},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            session = Session.objects.select_related('schedule__classroom').get(pk=session_id)
        except Session.DoesNotExist:
            return Response(
                {"message": "Buổi học không tồn tại."},
                status=status.HTTP_404_NOT_FOUND
            )

        if session.schedule.classroom_id != classroom.id:
            raise PermissionDenied("Buổi học không thuộc lớp này")

        is_main = TeachingAssignment.objects.filter(
            classroom=classroom,
            teacher=request.user,
            is_main=True
        ).exists()

        if not is_main:
            raise PermissionDenied("Bạn không có quyền điểm danh cho buổi học này")

        result = AttendanceService.bulk_sync_attendances(
            session=session,
            attendances_data=attendances_data
        )

        return Response(
            {
                "message": "Lưu danh sách điểm danh thành công!",
                "data": result
            },
            status=status.HTTP_200_OK
        )