import pytest
from model_bakery import baker
from django.urls import reverse
from classes.models import Session
from classes.serializers import ClassRoomSerializer, RoomSerializer, ScheduleSerializer, ClassRoomDetailSerializer
from rest_framework.serializers import ValidationError
import datetime
from classes.serializers import SessionSerializer
from django.test import RequestFactory

from users.serializers import UserSerializer

@pytest.mark.django_db
class TestClassesModels:

    def test_UTL_001_classroom_str_returns_name(self, classroom):
        """ Hàm này unit test str của model classroom """
        assert str(classroom) == "Lớp Python" 


    def test_UTL_002_classroom_is_auto_active_when_enrollment_reaches_threshold(self, classroom):
        """ Hàm nảy unit test tạo lớp học với 10 học viên thì is_activte phải là True """
        baker.make('enrollments.Enrollment', classroom=classroom, _quantity=10)
        assert classroom.is_auto_active is True

    def test_UTL_003_room_str_returns_name(self):
        """ Hàm này unit test str của model room """
        room = baker.make('classes.Room', name="Lab 101")
        assert str(room) == "Lab 101" 

    def test_UTL_004_schedule_str_returns_formatted_string(self, classroom):
        """ Hàm này unit test str của model schedule """
        schedule = baker.make('classes.Schedule', 
                              classroom=classroom, 
                              day_of_week=2,
                              start_time=datetime.time(8, 0),
                              end_time=datetime.time(10, 0))
        
        expected_str = f"class_{classroom.id}_day_{schedule.day_of_week}_duration: {schedule.start_time} - {schedule.end_time}"
        assert str(schedule) == expected_str

    def test_UTL_005_session_str_returns_class_and_date(self, classroom): 
        """ Hàm này unit test str model session """
        schedule = baker.make('classes.Schedule', classroom=classroom)
        session = baker.make('classes.Session', 
                             schedule=schedule, 
                             date=datetime.date(2026, 4, 23))
        
        expected_str = f"class_{classroom.id}_at:_{session.date}"
        assert str(session) == expected_str

    def test_UTL_006_teaching_assignment_str_returns_teacher_and_classroom(self, classroom, active_teacher):
        """ Hàm này unit test str của model phân công giảng dạy - teachingassignment """
        assignment = baker.make('classes.TeachingAssignment', teacher=active_teacher, classroom=classroom)
        
        expected_str = f"{active_teacher.username}-{classroom.name}"
        assert str(assignment) == expected_str

    def test_UTL_007_classroom_does_not_auto_activate_when_less_than_10_students(self, classroom):
        """BR-13: dưới 10 học viên thì không auto active"""
        baker.make('enrollments.Enrollment', classroom=classroom, _quantity=9)
        assert classroom.is_auto_active is False

@pytest.mark.django_db
class TestClassRoomSerializer:
    @pytest.mark.parametrize("start, end, should_fail", [
        ("2026-05-01", "2026-04-30", True),  # Trước biên (Sai)
        ("2026-05-01", "2026-05-01", True),  # Ngay biên - bằng nhau 
        ("2026-05-01", "2026-05-02", False), # Sau biên (Đúng)
    ])
    def test_UTL_008_classroom_date_validation_bva(self, classroom, start, end, should_fail):
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
            
    def test_UTL_009_classroom_serializer_creates_main_teacher_assignment_when_main_teacher_provided(self, classroom):
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

    def test_UTL_010_classroom_serializer_updates_main_teacher_and_switches_assignment(self, classroom):
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

    def test_UTL_011_schedule_serializer_is_valid_when_no_conflict(self, classroom):
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

    def test_UTL_012_classroom_cannot_be_deleted_when_has_enrollments(self, api_client, classroom, admin_user):
        """BR-12: Không cho xóa lớp có học viên"""
        api_client.force_authenticate(user=admin_user)

        baker.make('enrollments.Enrollment', classroom=classroom)

        url = reverse('classroom-detail', kwargs={'pk': classroom.id})
        response = api_client.delete(url)

        assert response.status_code == 400
        assert "Không thể xóa lớp học" in str(response.data)

    def test_UTL_013_classroom_rejects_invalid_date_range(self, classroom):
        """BR validate ngày"""
        data = {
            "name": "Test",
            "course": classroom.course.id,
            "start_date": "2026-05-10",
            "end_date": "2026-05-01"
        }

        serializer = ClassRoomSerializer(data=data)

        assert not serializer.is_valid()
        assert "Ngày kết thúc phải lớn hơn ngày bắt đầu." in str(serializer.errors)

    def test_UTL_014_switch_main_teacher_removes_old_flag(self, classroom):
        old = baker.make('users.User')
        new = baker.make('users.User')

        baker.make('classes.TeachingAssignment',
                classroom=classroom,
                teacher=old,
                is_main=True)

        serializer = ClassRoomSerializer(
            instance=classroom,
            data={"main_teacher_id": new.id},
            partial=True
        )

        assert serializer.is_valid()
        serializer.save()

        assert not classroom.teachingassignment_set.get(teacher=old).is_main

    def test_UTL_036_classroom_capacity_validation(self, classroom):
        """Sửa lỗi bằng cách cung cấp đủ các trường bắt buộc"""
        base_data = {
            "name": "TOEIC 700 Intensive",
            "course": 5,
            "start_date": "2026-05-01",
            "end_date": "2026-08-01",
        }

        data_low = {**base_data, "capacity": 5}
        serializer_low = ClassRoomSerializer(data=data_low)
        assert not serializer_low.is_valid()
        assert "capacity" in serializer_low.errors
        assert "Sĩ số lớp học không hợp lệ." in str(serializer_low.errors["capacity"])

        data_high = {**base_data, "capacity": 60}
        serializer_high = ClassRoomSerializer(data=data_high)
        assert not serializer_high.is_valid()
        assert "capacity" in serializer_high.errors
        assert "Sĩ số lớp học không hợp lệ." in str(serializer_high.errors["capacity"])

    def test_UTL_037_classroom_validate_session_count_mismatch(self, classroom):
        """Cover logic kiểm tra số buổi học dự kiến (abs(count - planned) > 2)"""
        course = classroom.course
        course.total_sessions = 20 
        course.save()

        data = {
            "name": "DELF cơ bản",
            "course": course.id,
            "start_date": "2026-05-01",
            "end_date": "2026-05-05",
            "capacity": 20,
            "schedules_input": [
                {"day_of_week": 0, "start_time": "08:00:00", "end_time": "10:00:00", "room": baker.make('classes.Room').id}
            ]
        }
        serializer = ClassRoomSerializer(data=data)
        assert not serializer.is_valid()
        assert "nhưng khóa học yêu cầu 20 buổi" in str(serializer.errors["non_field_errors"])

    def test_UTL_038_classroom_update_prevented_when_attendance_exists(self, classroom):
        """Cover logic update: Không cho đổi lịch khi đã có điểm danh"""
        schedule = baker.make('classes.Schedule', classroom=classroom)
        session = baker.make('classes.Session', schedule=schedule)
        baker.make('grades.Attendance', session=session)

        data = {
            "schedules_input": [
                {
                    "day_of_week": 1,
                    "start_time": "09:00:00",
                    "end_time": "11:00:00",
                    "room": baker.make('classes.Room').id
                }
            ]
        }

        serializer = ClassRoomSerializer(
            instance=classroom,
            data=data,
            partial=True
        )

        assert serializer.is_valid()

        with pytest.raises(ValidationError) as exc:
            serializer.save()

        assert "Không thể thay đổi lịch học vì đã có dữ liệu điểm danh." in str(exc.value)

    def test_UTL_045_classroom_update_schedules_delete_old_sessions(self, classroom):
        """Phủ dòng 203-210: Xóa session cũ và tạo mới khi update schedule"""
        # 1. Tạo schedule và session hiện tại
        old_schedule = baker.make('classes.Schedule', classroom=classroom)
        baker.make('classes.Session', schedule=old_schedule)
        
        # 2. Update schedule mới (không có điểm danh nên thành công)
        new_room = baker.make('classes.Room')
        data = {
            "schedules_input": [
                {"day_of_week": 4, "start_time": "08:00:00", "end_time": "10:00:00", "room": new_room.id}
            ]
        }
        serializer = ClassRoomSerializer(instance=classroom, data=data, partial=True)
        assert serializer.is_valid()
        serializer.save()
        
        # 3. Kiểm tra session cũ đã bị xóa (dòng 203)
        assert Session.objects.filter(schedule=old_schedule).count() == 0

    def test_UTL_053_classroom_detail_serializer_fields(self, classroom):
        serializer = ClassRoomDetailSerializer(classroom)
        data = serializer.data

        assert "created_at" in data
        assert "grade_deadline" in data
        assert "grade_status" in data


    def test_UTL_054_classroom_remaining_slots_calculation(self, classroom):
        baker.make('enrollments.Enrollment', classroom=classroom, _quantity=3)

        serializer = ClassRoomSerializer(classroom)

        assert "remaining_slots" in serializer.data
        assert serializer.data["remaining_slots"] == classroom.capacity - 3

@pytest.mark.django_db
class TestScheduleSerializer:
    def test_UTL_015_schedule_serializer_raises_error_when_room_has_overlapping_time(self):
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
    def test_UTL_016_schedule_serializer_raises_error_when_teacher_has_overlapping_schedule(self, active_teacher, start, end, should_fail): # cần fix lại logic nghiệp vụ 
        """ Unit test giáo viên chính không được dạy 2 lớp trùng thời gian """
        class_a = baker.make('classes.ClassRoom')
        baker.make('classes.TeachingAssignment', classroom=class_a, teacher=active_teacher, is_main=True)
        baker.make('classes.Schedule', classroom=class_a, day_of_week=3, start_time="14:00:00", end_time="16:00:00")
        
        class_b = baker.make('classes.ClassRoom')
        baker.make('classes.TeachingAssignment', classroom=class_b, teacher=active_teacher, is_main=True)
        
        data = {"classroom": class_b.id, "day_of_week": 3, "start_time": start, "end_time": end, "room": baker.make('classes.Room').id}
        serializer = ScheduleSerializer(data=data)
        
        assert (not serializer.is_valid()) is should_fail

    def test_UTL_017_teacher_schedule_conflict_across_classes(self, active_teacher):
        """BR-14: giáo viên không được trùng lịch nhiều lớp"""

        class1 = baker.make('classes.ClassRoom')
        class2 = baker.make('classes.ClassRoom')

        baker.make('classes.TeachingAssignment',
                classroom=class1,
                teacher=active_teacher,
                is_main=True)

        baker.make('classes.Schedule',
                classroom=class1,
                day_of_week=2,
                start_time="14:00:00",
                end_time="16:00:00")

        baker.make('classes.TeachingAssignment',
                classroom=class2,
                teacher=active_teacher,
                is_main=True)

        data = {
            "classroom": class2.id,
            "room": baker.make('classes.Room').id,
            "day_of_week": 2,
            "start_time": "15:00:00",
            "end_time": "17:00:00"
        }

        serializer = ScheduleSerializer(data=data)

        assert not serializer.is_valid()
        assert "Giảng viên chính" in str(serializer.errors)

    def test_UTL_018_room_schedule_conflict_blocks_creation(self):
        room = baker.make('classes.Room')

        baker.make('classes.Schedule',
                room=room,
                day_of_week=2,
                start_time="08:00:00",
                end_time="10:00:00")

        data = {
            "classroom": baker.make('classes.ClassRoom').id,
            "room": room.id,
            "day_of_week": 2,
            "start_time": "09:30:00",
            "end_time": "11:00:00"
        }

        serializer = ScheduleSerializer(data=data)

        assert not serializer.is_valid()

@pytest.mark.django_db
class TestOtherSerializers:
    def test_UTL_019_room_serializer_rejects_invalid_capacity(self):
        """ Unit test sức chứa phòng học bị giới hạn - báo lỗi không hợp lệ """
        serializer = RoomSerializer(data={"name": "R1", "capacity": 150})
        assert not serializer.is_valid()
        assert "Sức chứa phòng học không hợp lệ" in str(serializer.errors)

    def test_UTL_020_session_serializer_includes_extra_fields_for_admin_user(self, admin_user):
        """ Unit test tùy chỉnh hiển thị của serializer đối với quản trị viên """
        session = baker.make('classes.Session', user=admin_user)
        
        
        factory = RequestFactory()
        request = factory.get('/')
        request.user = admin_user
        
        serializer = SessionSerializer(instance=session, context={'request': request})
        assert 'created_at' in serializer.data
        assert 'teacher_fullname' in serializer.data
    
    def test_UTL_021_classroom_get_sessions_returns_200(self, api_client, active_user, classroom):
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
        sessions_data = response.data.get("sessions", [])
        assert len(sessions_data) == 2
        assert all(
            Session.objects.get(id=item["id"]).schedule.classroom_id == classroom.id
            for item in sessions_data
        )

    def test_UTL_022_classroom_get_scores_returns_200_for_admin(self, api_client, classroom, admin_user):
        """ Test lấy ds điểm số của một lớp học cụ thể bởi admin """
        api_client.force_authenticate(user=admin_user)

        url = reverse('classroom-get-scores', kwargs={'pk': classroom.id})
        response = api_client.get(url)
        assert response.status_code == 200
        assert isinstance(response.data, (list, dict))
        if isinstance(response.data, list):
            assert all("id" in item for item in response.data)

    def test_UTL_023_classroom_get_students_returns_200(self, api_client, active_user, classroom):
        """ Test lấy ds học viên của lớp học cụ thể """
        api_client.force_authenticate(user=active_user)
        
        baker.make('enrollments.Enrollment', 
                    classroom=classroom, 
                    enrollment_status='SUCCESS', 
                    active=True)
        
        url = reverse('classroom-get-students', kwargs={'pk': classroom.id})
        response = api_client.get(url)
        
        assert response.status_code == 200
        assert isinstance(response.data, list)
        assert len(response.data) > 0
        assert all("id" in item for item in response.data)

    def test_UTL_024_delete_classroom_protected_error_returns_400_by_admin(self, api_client, classroom, admin_user):
        """ Test không cho xóa lớp học do ràng buộc khóa ngoại """
        api_client.force_authenticate(user=admin_user)
        
        baker.make('classes.Session', schedule__classroom=classroom)
        
        url = reverse('classroom-detail', kwargs={'pk': classroom.id})
        response = api_client.delete(url)
        
        assert response.status_code == 400
        assert "Không thể xóa lớp học" in str(response.data)

    def test_UTL_025_user_password_not_exposed(self, admin_user):
        serializer = UserSerializer(instance=admin_user)
        assert "password" not in serializer.data

    def test_UTL_026_session_admin_extra_fields_only_for_admin(self, admin_user):
        session = baker.make('classes.Session', user=admin_user)

        factory = RequestFactory()
        request = factory.get('/')
        request.user = admin_user

        serializer = SessionSerializer(instance=session, context={'request': request})

        assert "created_at" in serializer.data

    def test_UTL_027_queryset_student_filters_capacity(self, api_client, active_user, classroom):
        api_client.force_authenticate(user=active_user)

        response = api_client.get(reverse('classroom-list'))

        assert response.status_code == 200

    def test_UTL_028_classroom_create_permission_denied_for_student(self, api_client, active_user):
        api_client.force_authenticate(user=active_user)

        response = api_client.post(reverse('classroom-list'), {})

        assert response.status_code == 403

    def test_UTL_029_retrieve_uses_detail_serializer(self, api_client, admin_user, classroom):
        api_client.force_authenticate(user=admin_user)

        response = api_client.get(reverse('classroom-detail', kwargs={'pk': classroom.id}))

        assert "main_teacher" in response.data or "course" in response.data

    def test_UTL_030_teacher_can_access_scores(self, api_client, active_teacher, classroom):
        """ Test giáo viên có thể truy cập điểm của lớp mình được phân công """
        baker.make('classes.TeachingAssignment', 
                classroom=classroom, 
                teacher=active_teacher, 
                is_main=True)
                
        api_client.force_authenticate(user=active_teacher)

        url = reverse('classroom-get-scores', kwargs={'pk': classroom.id})
        response = api_client.get(url)

        assert response.status_code == 200

    def test_UTL_031_teacher_session_queryset(self, api_client, active_teacher):
        api_client.force_authenticate(user=active_teacher)

        response = api_client.get(reverse('session-list'))

        assert response.status_code == 200

    def test_UTL_032_session_queryset_for_student(self, api_client, active_user):
        api_client.force_authenticate(user=active_user)
        active_user.role = "student"
        active_user.save()


        response = api_client.get(reverse('session-list'))

        assert response.status_code == 200

    def test_UTL_033_session_queryset_default_branch(self, api_client, admin_user):
        api_client.force_authenticate(user=admin_user)

        response = api_client.get(reverse('session-list'))

        assert response.status_code == 200

    def test_UTL_034_room_capacity_valid_returns_value(self):
        serializer = RoomSerializer(data={"name": "R1", "capacity": 50})

        assert serializer.is_valid() is True
        assert serializer.validated_data["capacity"] == 50

    def test_UTL_035_session_validate_valid_time(self):
        serializer = SessionSerializer(data={
            "date": "2026-05-01",
            "start_time": "08:00:00",
            "end_time": "10:00:00",
            "user": baker.make('users.User').id
        })

        assert serializer.is_valid() is True

    def test_UTL_036_session_validate_invalid_time(self):
        serializer = SessionSerializer(data={
            "date": "2026-05-01",
            "start_time": "10:00:00",
            "end_time": "08:00:00",
            "user": baker.make('users.User').id
        })

        assert not serializer.is_valid()
        assert "end_time" in serializer.errors

    def test_UTL_037_session_serializer_planned_sessions_exceeded(self, classroom):
        """Cover logic: Không cho tạo thêm buổi khi đã đủ số lượng theo kế hoạch"""
        course = classroom.course
        course.total_sessions = 1
        course.save()

        schedule = baker.make('classes.Schedule', classroom=classroom)
        baker.make('classes.Session', schedule=schedule)

        data = {
            "date": "2026-05-10",
            "start_time": "08:00:00",
            "end_time": "10:00:00",
            "classroom_id": classroom.id,
            "user": baker.make('users.User').id
        }
        serializer = SessionSerializer(data=data)
        assert not serializer.is_valid()
        assert "Đã đủ 1 buổi theo kế hoạch" in str(serializer.errors["non_field_errors"])

    def test_UTL_038_session_validate_returns_early_when_classroom_none(self):
        serializer = SessionSerializer(data={
            "date": "2026-05-01",
            "start_time": "08:00:00",
            "end_time": "10:00:00",
            "classroom_id": 99999,
            "user": baker.make('users.User').id
        })

        assert serializer.is_valid() is True

    def test_UTL_039_session_validate_actual_minus_instance_branch(self, classroom):
        schedule = baker.make('classes.Schedule', classroom=classroom)
        session = baker.make('classes.Session', schedule=schedule)

        classroom.course.total_sessions = 1
        classroom.course.save()

        serializer = SessionSerializer(
            instance=session,
            data={
                "date": "2026-05-01",
                "start_time": "08:00:00",
                "end_time": "10:00:00",
            },
            partial=True
        )

        assert serializer.is_valid() is True

@pytest.mark.django_db
class TestClassesViews:
    def test_UTL_040_get_score_types_action(self, api_client, classroom, active_user):
        """Cover action get_score_types"""
        api_client.force_authenticate(user=active_user)
        url = reverse('classroom-get-score-types', kwargs={'pk': classroom.id})
        response = api_client.get(url)
        assert response.status_code == 200

    def test_UTL_041_session_create_view_no_schedule(self, api_client, admin_user):
        """Cover SessionViewSet.create khi lớp chưa có schedule"""
        api_client.force_authenticate(user=admin_user)
        classroom = baker.make('classes.ClassRoom')
        
        url = reverse('session-list')
        data = {"classroom_id": classroom.id, "date": "2026-01-01", "start_time": "08:00", "end_time": "09:00"}
        response = api_client.post(url, data)
        
        assert response.status_code == 400
        assert "Lớp học chưa có lịch học nào" in str(response.data["error"])

    def test_UTL_042_session_create_not_found_classroom(self, api_client, admin_user):
        """Cover SessionViewSet.create khi classroom_id không tồn tại"""
        api_client.force_authenticate(user=admin_user)
        url = reverse('session-list')
        data = {"classroom_id": 9999, "date": "2026-01-01"}
        response = api_client.post(url, data)
        assert response.status_code == 400
        assert "Không tìm thấy lớp học" in str(response.data["error"])

    def test_UTL_043_session_perform_destroy_protected_error(self, api_client, admin_user):
        """Xử lý lỗi ProtectedError khi xóa Session"""
        api_client.force_authenticate(user=admin_user)
        session = baker.make('classes.Session')
        baker.make('grades.Attendance', session=session)
        
        url = reverse('session-detail', kwargs={'pk': session.id})
        response = api_client.delete(url)
        
        assert response.status_code == 400
        assert "Không thể xóa buổi" in str(response.data)

    def test_UTL_044_session_create_no_active_schedule(self, api_client, admin_user):
        api_client.force_authenticate(user=admin_user)

        classroom = baker.make('classes.ClassRoom')
        baker.make('classes.Schedule', classroom=classroom, active=False)

        url = reverse('session-list')
        data = {
            "classroom_id": classroom.id,
            "date": "2026-01-01",
            "start_time": "08:00",
            "end_time": "09:00"
        }

        response = api_client.post(url, data)

        assert response.status_code == 400
        assert "Lớp học chưa có lịch học nào" in str(response.data)
