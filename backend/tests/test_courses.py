import pytest
from django.urls import reverse
from rest_framework import status
from model_bakery import baker
from courses.models import Course, Tag, Level, ScoreType
from courses.serializers import TagSerializer, CourseSerializer, ScoreTypeSerializer

@pytest.mark.django_db
class TestCourseModule:

    @pytest.mark.parametrize("sessions, expected_status, expected_msg", [
        (9, status.HTTP_400_BAD_REQUEST, "tổng số buổi học phải từ 10 buổi trở lên"), # Sát dưới biên dưới
        (10, status.HTTP_201_CREATED, ""),                                            # Ngay biên dưới
        (30, status.HTTP_201_CREATED, ""),                                            # Ngay biên trên
        (31, status.HTTP_400_BAD_REQUEST, "tối đa là 30 buổi"),                       # Sát trên biên trên
    ])
    def test_create_course_sessions_bva(self, api_client, admin_user, setup_course_data, sessions, expected_status, expected_msg):
        """Kiểm tra giá trị biên cho tổng số buổi học (10-30)"""
        level, _ = setup_course_data
        api_client.force_authenticate(user=admin_user)
        
        data = {"name": f"Course {sessions}", "total_sessions": sessions, "level": level.id}
        response = api_client.post(reverse('course-list'), data)
        
        assert response.status_code == expected_status
        if expected_msg:
            assert expected_msg in str(response.data)

    @pytest.mark.parametrize("price", [1000000, 1999999])
    def test_update_course_price_rejects_below_minimum(self, api_client, admin_user, setup_course_data, price):
        """Kiểm tra học phí dưới mức 2.000.000 VND phải bị từ chối"""
        level, _ = setup_course_data
        course = baker.make('courses.Course', level=level)
        api_client.force_authenticate(user=admin_user)
        
        response = api_client.patch(reverse('course-detail', kwargs={'pk': course.id}), {"price": price})
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Học phí tối thiểu là 2.000.000 VND" in str(response.data)

    def test_tag_serializer_fails_if_name_is_blank(self):
        """Xác nhận Serializer báo lỗi khi trường tên thẻ bị để trống"""
        serializer = TagSerializer(data={"name": ""})
        assert not serializer.is_valid()
        assert "Trường này không được bỏ trống" in str(serializer.errors)

    def test_delete_course_fails_if_protected_by_scores(self, api_client, admin_user):
        """Đảm bảo không thể xóa khóa học nếu đang có ràng buộc dữ liệu với các loại điểm"""
        course = baker.make('courses.Course')
        baker.make('courses.ScoreType', course=course)
        api_client.force_authenticate(user=admin_user)
        
        response = api_client.delete(reverse('course-detail', kwargs={'pk': course.id}))
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Không thể xóa khóa học này" in str(response.data)

    @pytest.mark.parametrize("weight", [-1.0, 0, 3.1, 4.0])
    def test_create_score_type_fails_if_weight_invalid(self, api_client, admin_user, weight):
        """Kiểm tra hệ số điểm nằm ngoài khoảng (0, 3] phải báo lỗi đúng câu thông báo của backend"""
        course = baker.make('courses.Course')
        api_client.force_authenticate(user=admin_user)
        
        data = {"name": "Final", "weight": weight, "course": course.id}
        response = api_client.post(reverse('score-type-list'), data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Hệ số phải lớn hơn 0 và nhỏ hơn hoặc bằng 3" in str(response.data)

    def test_get_course_classes_returns_correct_list(self, api_client, classroom):
        """Kiểm tra action get_classes trả về đúng và đủ danh sách lớp học thuộc khóa học đó"""
        course = classroom.course
        baker.make('classes.ClassRoom', course=course, _quantity=2)
        
        response = api_client.get(reverse('course-get-classes', kwargs={'pk': course.id}))
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 3

    def test_course_serializer_representation_is_correct(self, setup_course_data):
        """Xác nhận dữ liệu trả về của CourseSerializer bao gồm thông tin chi tiết của các thẻ (tags)"""
        level, tag = setup_course_data
        course = baker.make('courses.Course', level=level)
        course.tags.add(tag) 
        
        data = CourseSerializer(instance=course).data
        assert data['tags'][0]['name'] == tag.name

    def test_score_type_serializer_returns_read_only_course_name(self):
        """Kiểm tra trường course_name trong ScoreTypeSerializer hiển thị đúng tên khóa học và là ReadOnly"""
        course = baker.make('courses.Course', name="Math")
        st = baker.make('courses.ScoreType', course=course, name="Quiz")
        
        data = ScoreTypeSerializer(instance=st).data
        assert data['course_name'] == "Math"

    def test_update_course_detail_success_with_multipart(self, api_client, admin_user, setup_course_data):
        """Kiểm tra cập nhật thông tin khóa học thành công khi sử dụng định dạng dữ liệu multipart"""
        level, _ = setup_course_data
        course = baker.make('courses.Course', level=level)
        api_client.force_authenticate(user=admin_user)
        
        response = api_client.patch(
            reverse('course-detail', kwargs={'pk': course.id}), 
            {"name": "New Name", "price": 4000000}, 
            format='multipart'
        )
        
        assert response.status_code == status.HTTP_200_OK

@pytest.mark.django_db
class TestCourseModels:
    def test_model_string_representations(self):
        """Kiểm tra phương thức hiển thị chuỗi str của tất cả các model trong module Course"""
        test_data = [
            ('courses.Course', "Python"),
            ('courses.Level', "Basic"),
            ('courses.Tag', "Hot"),
            ('courses.ScoreType', "Final")
        ]
        for model_path, name in test_data:
            obj = baker.make(model_path, name=name)
            assert str(obj) == name