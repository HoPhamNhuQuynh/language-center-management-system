import pytest
from django.urls import reverse
from rest_framework import status
from model_bakery import baker
from enrollments.models import Enrollment

@pytest.mark.django_db
class TestEnrollmentModule:

    def test_enroll_creates_enrollment_and_returns_201(self, api_client, active_user, classroom):
        """Test đăng ký lớp học thành công"""
        api_client.force_authenticate(user=active_user)
        url = reverse('enrollment-list')
        data = {"classroom": classroom.id}
        
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert Enrollment.objects.filter(student=active_user, classroom=classroom).exists()

    def test_enroll_returns_400_when_student_already_enrolled(self, api_client, active_user, classroom):
        """Test không cho phép đăng ký lại lớp đã học """
        baker.make('enrollments.Enrollment', student=active_user, classroom=classroom)
        api_client.force_authenticate(user=active_user)
        
        url = reverse('enrollment-list')
        data = {"classroom": classroom.id}
        response = api_client.post(url, data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Sinh viên này đã đăng ký lớp học này rồi." in str(response.data)

    def test_enroll_returns_400_when_classroom_is_full(self, api_client, active_user):
        """Test không cho đăng ký khi lớp đã đầy sĩ số """
        full_classroom = baker.make('classes.ClassRoom', capacity=1)
        baker.make('enrollments.Enrollment', classroom=full_classroom)
        
        api_client.force_authenticate(user=active_user)
        url = reverse('enrollment-list')
        data = {"classroom": full_classroom.id}
        response = api_client.post(url, data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Lớp đã đủ sỉ số" in str(response.data)

    def test_enroll_returns_400_when_schedule_overlaps_with_existing_enrollment(self, api_client, active_user):
        """Test không cho phép đăng ký lớp học bị trùng lịch với lớp đã đăng ký """
        class_a = baker.make('classes.ClassRoom', capacity=10)
        baker.make('classes.Schedule', classroom=class_a, day_of_week=2, 
                   start_time="08:00:00", end_time="10:00:00")
        baker.make('enrollments.Enrollment', student=active_user, classroom=class_a, active=True)

        class_b = baker.make('classes.ClassRoom', capacity=10, name="Lớp bị trùng")
        baker.make('classes.Schedule', classroom=class_b, day_of_week=2, 
                   start_time="09:00:00", end_time="11:00:00")

        api_client.force_authenticate(user=active_user)
        url = reverse('enrollment-list')
        data = {"classroom": class_b.id}
        
        response = api_client.post(url, data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Lịch học bị trùng" in str(response.data)

    def test_delete_enrollment_returns_204_and_deletes_record_when_unpaid(self, api_client, active_user, classroom):
        """ Test xóa thành công khi chưa đóng tiền """
        enrollment = baker.make('enrollments.Enrollment', 
                                student=active_user, 
                                classroom=classroom,
                                enrollment_status="PENDING_PAYMENT")
        
        api_client.force_authenticate(user=active_user)
        url = reverse('enrollment-detail', kwargs={'pk': enrollment.id})
        
        response = api_client.delete(url)
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Enrollment.objects.filter(id=enrollment.id).exists()

    def test_delete_enrollment_returns_400_and_keeps_record_when_already_paid(self, api_client, active_user, classroom):
        """Test chặn xóa khi đơn đã được thanh toán (SUCCESS)"""
        enrollment = baker.make('enrollments.Enrollment',
                                student=active_user,
                                classroom=classroom,
                                enrollment_status="SUCCESS") 

        api_client.force_authenticate(user=active_user)
        url = reverse('enrollment-detail', kwargs={'pk': enrollment.id})

        response = api_client.delete(url)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Không thể xóa" in response.data['detail']
        assert Enrollment.objects.filter(id=enrollment.id).exists()

    def test_admin_returns_all_enrollments(self, api_client, admin_user):
        """Test Admin xem được tất cả đăng ký """
        baker.make('enrollments.Enrollment', _quantity=3)
        
        api_client.force_authenticate(user=admin_user)
        url = reverse('enrollment-list')
        response = api_client.get(url)
        
        assert response.status_code == 200
        expected_count = Enrollment.objects.count()
        assert len(response.data) == expected_count

    def test_teacher_returns_enrollments_of_assigned_class(self, api_client, active_teacher, classroom):
        """ Giáo viên chỉ thấy ds đăng ký của lớp được phân công """
        baker.make('classes.TeachingAssignment', teacher=active_teacher, classroom=classroom)
        baker.make('enrollments.Enrollment', classroom=classroom, _quantity=2)
        
        api_client.force_authenticate(user=active_teacher)
        url = reverse('enrollment-list')
        response = api_client.get(url)
        
        assert response.status_code == 200
        assert len(response.data) == 2
        for item in response.data:
            assert item["classroom"]["id"] == classroom.id

    def test_teacher_cannot_view_enrollments_of_other_classes(self, api_client, active_teacher):
        """ Giáo viên kh thể nhìn thấy ds đăng ký của lớp khác """

        class_a = baker.make('classes.ClassRoom')
        class_b = baker.make('classes.ClassRoom')

        baker.make('classes.TeachingAssignment', teacher=active_teacher, classroom=class_a)

        baker.make('enrollments.Enrollment', classroom=class_a, _quantity=2)
        baker.make('enrollments.Enrollment', classroom=class_b, _quantity=3)

        api_client.force_authenticate(user=active_teacher)
        url = reverse('enrollment-list')
        response = api_client.get(url)

        assert response.status_code == 200
        assert len(response.data) == 2

    # Bổ sung
    def test_enroll_returns_400_when_classroom_missing(self, api_client, active_user):
        """Test không cho đăng ký khi chưa chọn lớp học"""
        api_client.force_authenticate(user=active_user)

        url = reverse('enrollment-list')
        data = {}

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_enroll_returns_201_when_schedule_does_not_overlap_existing_enrollment(self, api_client, active_user):
        """Test cho phép đăng ký lớp khác khi lịch học không bị trùng"""
        class_a = baker.make('classes.ClassRoom', capacity=10)
        baker.make('classes.Schedule', classroom=class_a, day_of_week=2, start_time="08:00:00", end_time="10:00:00")
        baker.make('enrollments.Enrollment', student=active_user, classroom=class_a, active=True)

        class_b = baker.make('classes.ClassRoom', capacity=10, name="Lớp không trùng")
        baker.make('classes.Schedule', classroom=class_b, day_of_week=2, start_time="10:30:00", end_time="12:00:00")

        api_client.force_authenticate(user=active_user)
        url = reverse('enrollment-list')
        data = {"classroom": class_b.id}

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert Enrollment.objects.filter(student=active_user, classroom=class_b).exists()