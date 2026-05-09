import pytest
from model_bakery import baker
from django.urls import reverse
from classes.serializers import *
from rest_framework.serializers import ValidationError
import datetime
from classes.serializers import SessionSerializer
from django.test import RequestFactory

@pytest.mark.django_db
class TestClassesModels:

    def test_classroom_str_returns_name(self, classroom):
        """ Hàm này unit test str của model classroom """
        assert str(classroom) == "Lớp Python" 


    def test_classroom_is_auto_active_when_enrollment_reaches_threshold(self, classroom):
        """ Hàm nảy unit test tạo lớp học với 10 học viên thì is_activte phải là True """
        baker.make('enrollments.Enrollment', classroom=classroom, _quantity=10)
        assert classroom.is_auto_active is True

    def test_room_str_returns_name(self):
        """ Hàm này unit test str của model room """
        room = baker.make('classes.Room', name="Lab 101")
        assert str(room) == "Lab 101" 

    def test_schedule_str_returns_formatted_string(self, classroom):
        """ Hàm này unit test str của model schedule """
        schedule = baker.make('classes.Schedule', 
                              classroom=classroom, 
                              day_of_week=2,
                              start_time=datetime.time(8, 0),
                              end_time=datetime.time(10, 0))
        
        expected_str = f"class_{classroom.id}_day_{schedule.day_of_week}_duration: {schedule.start_time} - {schedule.end_time}"
        assert str(schedule) == expected_str

    def test_session_str_returns_class_and_date(self, classroom): 
        """ Hàm này unit test str model session """
        schedule = baker.make('classes.Schedule', classroom=classroom)
        session = baker.make('classes.Session', 
                             schedule=schedule, 
                             date=datetime.date(2026, 4, 23))
        
        expected_str = f"class_{classroom.id}_at:_{session.date}"
        assert str(session) == expected_str

    def test_teaching_assignment_str_returns_teacher_and_classroom(self, classroom, active_teacher):
        """ Hàm này unit test str của model phân công giảng dạy - teachingassignment """
        assignment = baker.make('classes.TeachingAssignment', teacher=active_teacher, classroom=classroom)
        
        expected_str = f"{active_teacher.username}-{classroom.name}"
        assert str(assignment) == expected_str

@pytest.mark.django_db
class TestClassRoomSerializer:
    @pytest.mark.parametrize("start, end, should_fail", [
        ("2026-05-01", "2026-04-30", True),  # Trước biên (Sai)
        ("2026-05-01", "2026-05-01", True),  # Ngay biên - bằng nhau 
        ("2026-05-01", "2026-05-02", False), # Sau biên (Đúng)
    ])
    def test_classroom_date_validation_bva(self, classroom, start, end, should_fail):
        """Kiểm tra giá trị biên: Ngày kết thúc phải sau ngày bắt đầu"""
        data = {
            "name": "Lớp test date",
            "course": classroom.course.id,
            "start_date": start,
            "end_date": end
        }
        serializer = ClassRoomSerializer(data=data)
        
        if should_fail:
            with pytest.raises(ValidationError) as exc:
                serializer.is_valid(raise_exception=True)
            assert "Ngày kết thúc phải lớn hơn ngày bắt đầu." in str(exc.value)
        else:
            assert serializer.is_valid() is True
            
    def test_classroom_serializer_creates_main_teacher_assignment_when_main_teacher_provided(self, classroom):
        """ Hàm này unit test gán giáo viên chính cho lớp """
        teacher = baker.make('users.User')
        data = {
            "name": "Lớp mới có GV",
            "course": classroom.course.id,
            "start_date": "2026-05-01",
            "end_date": "2026-08-01",
            "main_teacher_id": teacher.id
        }
        serializer = ClassRoomSerializer(data=data)
        assert serializer.is_valid()
        classroom = serializer.save()
        assert classroom.teachingassignment_set.count() == 1
        assert classroom.teachingassignment_set.filter(teacher=teacher, is_main=True).exists()

    def test_classroom_serializer_updates_main_teacher_and_switches_assignment(self, classroom):
        """ Hàm này test unit thay thế giáo viên chính cho lớp """
        old_teacher = baker.make('users.User')
        new_teacher = baker.make('users.User')
        baker.make('classes.TeachingAssignment', classroom=classroom, teacher=old_teacher, is_main=True)
        
        data = {"main_teacher_id": new_teacher.id}
        serializer = ClassRoomSerializer(instance=classroom, data=data, partial=True)
        assert serializer.is_valid()
        serializer.save()
        
        assert classroom.teachingassignment_set.get(teacher=new_teacher).is_main is True
        assert classroom.teachingassignment_set.get(teacher=old_teacher).is_main is False

    def test_schedule_serializer_is_valid_when_no_conflict(self, classroom):
        """ Hàm này unit test thêm lịch học không bị trùng lịch """
        room = baker.make('classes.Room')
        data = {
            "classroom": classroom.id,
            "room": room.id,
            "day_of_week": 5,
            "start_time": "18:00:00",
            "end_time": "20:00:00"
        }
        serializer = ScheduleSerializer(data=data)
        assert serializer.is_valid() is True
        assert "errors" not in serializer.errors

@pytest.mark.django_db
class TestScheduleSerializer:
    def test_schedule_serializer_raises_error_when_room_has_overlapping_time(self):
        """ Hàm này unit test phòng học bị trùng lịch """
        room = baker.make('classes.Room')
        baker.make('classes.Schedule', room=room, day_of_week=2, 
                   start_time="08:00:00", end_time="10:00:00")
        
        classroom_2 = baker.make('classes.ClassRoom')
        data = {
            "classroom": classroom_2.id,
            "room": room.id,
            "day_of_week": 2,
            "start_time": "09:00:00",
            "end_time": "11:00:00"
        }
        serializer = ScheduleSerializer(data=data)
        assert not serializer.is_valid()
        assert "Phòng học này đã bị trùng lịch" in str(serializer.errors)

    @pytest.mark.parametrize("start, end, should_fail", [
        ("15:00:00", "17:00:00", True),  # Trùng một phần (Vùng lỗi)
        ("14:30:00", "15:30:00", True),  # Nằm hoàn toàn bên trong (Vùng lỗi)
        ("17:00:00", "18:00:00", False), # Nối tiếp nhau (Vùng đúng)
        ("08:00:00", "10:00:00", False), # Khung giờ khác hoàn toàn (Vùng đúng)
    ])
    def test_schedule_serializer_raises_error_when_teacher_has_overlapping_schedule(self, active_teacher, start, end, should_fail): # cần fix lại logic nghiệp vụ 
        """ Unit test giáo viên chính không được dạy 2 lớp trùng thời gian """
        class_a = baker.make('classes.ClassRoom')
        baker.make('classes.TeachingAssignment', classroom=class_a, teacher=active_teacher, is_main=True)
        baker.make('classes.Schedule', classroom=class_a, day_of_week=3, start_time="14:00:00", end_time="16:00:00")
        
        class_b = baker.make('classes.ClassRoom')
        baker.make('classes.TeachingAssignment', classroom=class_b, teacher=active_teacher, is_main=True)
        
        data = {"classroom": class_b.id, "day_of_week": 3, "start_time": start, "end_time": end, "room": baker.make('classes.Room').id}
        serializer = ScheduleSerializer(data=data)
        
        assert (not serializer.is_valid()) is should_fail


@pytest.mark.django_db
class TestOtherSerializers:
    def test_room_serializer_rejects_invalid_capacity(self):
        """ Unit test sức chứa phòng học bị giới hạn - báo lỗi không hợp lệ """
        serializer = RoomSerializer(data={"name": "R1", "capacity": 150})
        assert not serializer.is_valid()
        assert "Sức chứa phòng học không hợp lệ" in str(serializer.errors)

    def test_session_serializer_includes_extra_fields_for_admin_user(self, admin_user):
        """ Unit test tùy chỉnh hiển thị của serializer đối với quản trị viên """
        session = baker.make('classes.Session', user=admin_user)
        
        
        factory = RequestFactory()
        request = factory.get('/')
        request.user = admin_user
        
        serializer = SessionSerializer(instance=session, context={'request': request})
        assert 'created_at' in serializer.data
        assert 'teacher_fullname' in serializer.data
    
    def test_classroom_get_sessions_returns_200(self, api_client, active_user, classroom):
        """ Test lấy ds buổi học của 1 lớp học cụ thể thành công """
        api_client.force_authenticate(user=active_user)
        baker.make(
            'classes.Session',
            schedule__classroom=classroom,
            user=active_user,
            _quantity=2
        )
        url = reverse('classroom-get-sessions', kwargs={'pk': classroom.id})
        response = api_client.get(url)
        assert response.status_code == 200
        assert len(response.data) == 2
        assert all(
            Session.objects.get(id=item["id"]).schedule.classroom_id == classroom.id
            for item in response.data
        )

    def test_classroom_get_scores_returns_200_for_admin(self, api_client, classroom, admin_user):
        """ Test lấy ds điểm số của một lớp học cụ thể bởi admin """
        api_client.force_authenticate(user=admin_user)

        url = reverse('classroom-get-scores', kwargs={'pk': classroom.id})
        response = api_client.get(url)
        assert response.status_code == 200
        assert isinstance(response.data, (list, dict))
        if isinstance(response.data, list):
            assert all("id" in item for item in response.data)

    def test_classroom_get_students_returns_200(self, api_client, active_user, classroom):
        """ Test lấy ds học viên của lớp học cụ thể """
        api_client.force_authenticate(user=active_user)
        baker.make('enrollments.Enrollment', 
                   classroom=classroom, 
                   enrollment_status='SUCCESS', 
                   active=True)
        
        url = reverse('classroom-get-students', kwargs={'pk': classroom.id})
        response = api_client.get(url)
        assert response.status_code == 200
        assert isinstance(response.data, (list, dict))
        assert all(item["id"] for item in response.data)

    def test_delete_classroom_protected_error_returns_400_by_admin(self, api_client, classroom, admin_user):
        """ Test không cho xóa lớp học do ràng buộc khóa ngoại """
        api_client.force_authenticate(user=admin_user)
        
        baker.make('classes.Session', schedule__classroom=classroom)
        
        url = reverse('classroom-detail', kwargs={'pk': classroom.id})
        response = api_client.delete(url)
        
        assert response.status_code == 400
        assert "Không thể xóa lớp học" in str(response.data)
    
    