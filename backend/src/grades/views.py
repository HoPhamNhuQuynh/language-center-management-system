from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, viewsets, generics, serializers
from classes.models import ClassRoom, Session, TeachingAssignment
from courses.models import ScoreType
from enrollments.models import Enrollment
from grades.models import Attendance, AcademicResult, Score
from .serializers import BulkSyncScoreSerializer, BulkSyncAttendanceSerializer, AttendanceSerializer, SubmitScoreSerializer
from .service import ScoreService, AttendanceService
from core import core_perms
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied
from django.db.models import Count, Q
from django.db import transaction
from django.db.models import Prefetch

class AttendanceViewSet(viewsets.ViewSet, generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, core_perms.IsTeacher]
    serializer_class = AttendanceSerializer

    def get_queryset(self):
        session_id = self.request.query_params.get('session_id')
        if not session_id:
            raise serializers.ValidationError("Mã buổi học là bắt buộc")

        session = Session.objects.select_related('schedule__classroom')\
            .get(pk=session_id)

        if session.user != self.request.user:
            raise PermissionDenied("Bạn không có quyền xem điểm danh cho buổi học này")
        return AttendanceService.get_or_initialize_attendances(session)
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)

        session_id = request.query_params.get('session_id')
        session = Session.objects.get(pk=session_id)
        today = timezone.localdate()

        return Response({
            "can_attendance": session.date == today,
            "session_date": session.date,
            "attendances": serializer.data
        })


class BulkSyncScoreView(APIView):
    permission_classes = [permissions.IsAuthenticated, core_perms.IsTeacher]

    def post(self, request, class_id):
        serializer = BulkSyncScoreSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        classroom = generics.get_object_or_404(ClassRoom, pk=class_id)

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
        serializer = SubmitScoreSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

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

        enrollments = Enrollment.objects.filter(classroom=classroom)\
        .select_related('student')\
        .prefetch_related(
            Prefetch('score_set', queryset=Score.objects.select_related('score_type'))
        )\
        .annotate(
            scored_count=Count(
                'score',
                filter=Q(score__score_type__in=required_score_types)
            )
        )

        if not enrollments.exists():
            raise ValidationError("Lớp học hiện không có học viên nào.")

        for enrollment in enrollments:
            if enrollment.scored_count < required_count:
                raise ValidationError(
                    f"Học viên {enrollment.student.get_full_name()} chưa nhập đủ điểm "
                    f"({enrollment.scored_count}/{required_count})."
                )

        remarks_data = serializer.validated_data.get("remarks", [])
        remarks_map = {r["enrollment_id"]: r["comment"] for r in remarks_data}

        with transaction.atomic():
            for enrollment in enrollments:
                scores = Score.objects.filter(enrollment=enrollment)
                score_types = ScoreType.objects.filter(course=classroom.course)

                weighted_sum = sum(
                    s.score_value * s.score_type.weight for s in scores
                )
                total_weight = sum(st.weight for st in score_types)
                avg = round(weighted_sum / total_weight, 1) if total_weight else 0

                AcademicResult.objects.update_or_create(
                    enrollment=enrollment,
                    defaults={
                        "average_score": avg,
                        "comment": remarks_map.get(enrollment.id, "")
                    }
                )

            classroom.grade_status = ClassRoom.Status.SUBMITTED
            classroom.save()

        return Response(
            {"message": "Bảng điểm đã được nộp và khóa thành công."},
            status=status.HTTP_200_OK
        )
    
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
        
        today = timezone.localdate()
        if session.date != today:
            if session.date < today:
                raise ValidationError("Không thể điểm danh cho buổi học đã qua.")
            else:
                raise ValidationError("Không thể điểm danh cho buổi học chưa diễn ra.")
 
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