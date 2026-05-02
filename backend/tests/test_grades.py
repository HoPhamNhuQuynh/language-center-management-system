import pytest
from model_bakery import baker
from grades.models import Score, Attendance
from courses.models import ScoreType
from grades.service import ScoreService, AttendanceService
from classes.models import ClassRoom, TeachingAssignment
from enrollments.models import Enrollment
from django.urls import reverse
from rest_framework import status
from django.utils import timezone
from datetime import timedelta

@pytest.mark.django_db
class TestScoreService:
    def test_bulk_sync_scores_creates_updates_and_skips_invalid_enrollments(self, classroom):
        """ Hàm này kiểm tra bulk nhập điểm cho lớp học trong các trường hợp điểm đã có, chưa có và user không tồn tại trong lớp """
        e1 = baker.make('enrollments.Enrollment', classroom=classroom, enrollment_status=Enrollment.Status.SUCCESS)
        e2 = baker.make('enrollments.Enrollment', classroom=classroom, enrollment_status=Enrollment.Status.SUCCESS)
        score_type = baker.make('courses.ScoreType')
        
        existing_score = baker.make('grades.Score', enrollment=e1, 
                                   score_type=score_type, score_value=5.0)
        scores_data = [
            {"enrollment_id": e1.id, "score_type_id": score_type.id, "score_value": 8.0}, # test update
            {"enrollment_id": e2.id, "score_type_id": score_type.id, "score_value": 9.0}, # test create
            {"enrollment_id": 999, "score_type_id": score_type.id, "score_value": 10.0}  # test skip user not exist
        ]

        result = ScoreService.bulk_sync_scores(classroom, scores_data)

        assert result["updated"] == 1
        assert result["created"] == 1
        
        existing_score.refresh_from_db()
        assert existing_score.score_value == 8.0
        assert Score.objects.filter(enrollment=e2, score_value=9.0).exists()

@pytest.mark.django_db
class TestAttendanceService:
    def test_get_attendances_list_returns_attendances_for_session(self, classroom):
        """ Hàm này unit test service lấy ds điểm danh của buổi học cụ thể """
        session = baker.make('classes.Session', schedule__classroom=classroom,)
        enrollment = baker.make('enrollments.Enrollment', classroom=classroom, enrollment_status=Enrollment.Status.SUCCESS)
        baker.make('grades.Attendance', enrollment=enrollment, session=session, 
                   attendance_status="PRESENT")
        
        result = AttendanceService.get_attendances_list(session)

        assert result[0]['enrollment_id'] == enrollment.id
        assert result[0]['attendance_status'] == "PRESENT"

    def test_bulk_sync_attendances_creates_attendances_and_returns_created_count(self, classroom):
        session = baker.make('classes.Session', schedule__classroom=classroom)
        
        e1 = baker.make('enrollments.Enrollment', classroom=classroom, enrollment_status=Enrollment.Status.SUCCESS)
        e2 = baker.make('enrollments.Enrollment', classroom=classroom, enrollment_status=Enrollment.Status.SUCCESS)

        attendances_data = [
            {
                "enrollment_id": e1.id,
                "attendance_status": "LATE",
                "note": "Đi muộn 15p"
            },
            {
                "enrollment_id": e2.id,
                "attendance_status": "PRESENT",
                "note": "Có mặt"
            }
        ]

        result = AttendanceService.bulk_sync_attendances(session, attendances_data)

        assert result["created"] == 2
        assert Attendance.objects.filter(enrollment=e1, attendance_status="LATE").exists()
        assert Attendance.objects.filter(enrollment=e2, attendance_status="PRESENT").exists()
       
        attendance_e1 = Attendance.objects.get(enrollment=e1, session=session)
        attendance_e2 = Attendance.objects.get(enrollment=e2, session=session)

        assert attendance_e1.note == "Đi muộn 15p"
        assert attendance_e2.note == "Có mặt"

@pytest.mark.django_db
class TestGradesAPI:
    
    def test_attendance_list_auto_creates_attendances_when_not_exist(self, api_client, active_teacher, classroom):
        """ Hàm này test lấy ds điểm danh của một buổi học, nếu lần đầu điểm danh thì tạo bản ghi điểm danh cho cả buổi học đó có phân quyền giáo viên đứng lớp tại buổi học """
        api_client.force_authenticate(user=active_teacher)
        session = baker.make(
            'classes.Session', 
            user=active_teacher, 
            schedule__classroom=classroom
        )
        
        baker.make('enrollments.Enrollment', classroom=classroom, _quantity=3)

        url = reverse('attendance-list') 
        response = api_client.get(f"{url}?session_id={session.id}")
        
        assert response.status_code == status.HTTP_200_OK
        assert Attendance.objects.filter(session=session).count() == 3

    def test_bulk_sync_scores_returns_403_when_user_not_main_teacher(self, api_client, active_teacher, classroom):
        """User nhập điểm không phải giáo viên chính"""
        api_client.force_authenticate(user=active_teacher)

        baker.make(TeachingAssignment, classroom=classroom, teacher=active_teacher, is_main=False)

        url = reverse('bulk-sync-scores', kwargs={'class_id': classroom.id})
        res = api_client.post(url, {"scores": []}, format='json')

        assert res.status_code == status.HTTP_403_FORBIDDEN

    def test_bulk_sync_scores_returns_403_when_past_deadline(self, api_client, active_teacher, classroom):
        """ Test đã quá hạn nhập điểm"""
        api_client.force_authenticate(user=active_teacher)

        baker.make(TeachingAssignment, classroom=classroom, teacher=active_teacher, is_main=True)

        classroom.grade_deadline = timezone.now() - timedelta(days=1)
        classroom.save()

        url = reverse('bulk-sync-scores', kwargs={'class_id': classroom.id})
        res = api_client.post(url, {"scores": []}, format='json')

        assert res.status_code == status.HTTP_403_FORBIDDEN

    def test_bulk_sync_attendances_returns_403_when_session_not_in_classroom(self, api_client, active_teacher, classroom):
        """Session không thuộc classroom"""
        api_client.force_authenticate(user=active_teacher)

        other_classroom = baker.make('classes.ClassRoom')
        wrong_session = baker.make('classes.Session', schedule__classroom=other_classroom)

        url = reverse('bulk-sync-attendances', kwargs={'class_id': classroom.id})
        data = {
            "session_id": wrong_session.id,
            "attendances": []
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_403_FORBIDDEN


    @pytest.mark.parametrize("score_value, expected_valid", [
        (-0.1, False),
        (0, True),
        (0.1, True),
        (9.9, True),
        (10, True),
        (10.1, False),
        ("abc", False),
    ]) # Bổ sung
    def test_score_item_serializer_validates_score_boundary_values(self, score_value, expected_valid):
        """Score phải nằm trong khoảng [0, 10] và phải là số hợp lệ"""
        from grades.serializers import ScoreItemSerializer

        s = ScoreItemSerializer(data={
            "enrollment_id": 1,
            "score_type_id": 1,
            "score_value": score_value
        })

        assert s.is_valid() is expected_valid

    def test_bulk_sync_score_serializer_invalid_when_duplicate_items(self):
        """ Test mỗi cột điểm thì học viên chỉ có 1 số điểm """
        from grades.serializers import BulkSyncScoreSerializer

        data = {
            "scores": [
                {"enrollment_id": 1, "score_type_id": 1, "score_value": 5},
                {"enrollment_id": 1, "score_type_id": 1, "score_value": 8}
            ]
        }

        s = BulkSyncScoreSerializer(data=data)

        assert not s.is_valid()
        assert "Trùng điểm" in str(s.errors)
    
    