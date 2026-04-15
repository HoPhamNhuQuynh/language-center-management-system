from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, viewsets, generics, serializers
from classes.models import ClassRoom, Session, TeachingAssignment
from enrollments.models import Enrollment
from grades.models import Attendance
from .serializers import BulkSyncScoreSerializer, BulkSyncAttendanceSerializer
from .service import ScoreService, AttendanceService
from core import core_perms
from django.db.models import OuterRef, Subquery
from rest_framework.exceptions import PermissionDenied

class AttendanceViewSet(viewsets.ViewSet, generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, core_perms.IsTeacher]

    def get_queryset(self):

        session_id = self.request.query_params.get('session_id')

        if not session_id:
            raise serializers.ValidationError("session_id là bắt buộc")

        session = Session.objects.select_related('schedule__classroom').get(pk=session_id)

        if session.user != self.request.user:
            raise PermissionDenied("Bạn không có quyền xem điểm danh cho buổi học này")

        classroom = session.schedule.classroom

        query = Enrollment.objects.filter(classroom=classroom)

        attendance_sub = Attendance.objects.filter(
            enrollment=OuterRef('pk'),
            session=session
        )

        return query.annotate(
            status=Subquery(attendance_sub.values('attendance_status')[:1]),
            note=Subquery(attendance_sub.values('note')[:1]),
        )


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

        result = ScoreService.bulk_sync_scores(
            classroom=classroom,
            scores_date=serializer.validated_data["scores"]
        )

        return Response({
            "message": "OK",
            "data": result
        })
    
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