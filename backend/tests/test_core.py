import pytest
from django.test import RequestFactory
from model_bakery import baker
from core.core_perms import IsTeacher, IsStudent, IsAdmin
from core.paginators import ClassRoomPaginator
from core.serializers import ItemImageSerializer
from courses.models import Course

@pytest.mark.django_db
class TestCoreModule:

    @pytest.mark.parametrize("user_fixture, perm_class, expected", [
        # --- Quyền Teacher ---
        ("active_teacher", IsTeacher, True),  
        ("active_teacher", IsStudent, False), 
        ("active_teacher", IsAdmin, False), 
        
        # --- Quyền Student ---
        ("active_user", IsStudent, True),     
        ("active_user", IsTeacher, False),    
        ("active_user", IsAdmin, False),      # MỚI: Student tuyệt đối không có quyền Admin

        # --- Quyền Admin ---
        ("admin_user", IsAdmin, True),        
        ("admin_user", IsTeacher, False),     
        ("admin_user", IsStudent, False),     # MỚI: Admin không được xem là Student (trừ khi logic của bạn cho phép)
    ])
    def test_permissions_decision_table(self, request, user_fixture, perm_class, expected):
        """Kiểm tra ma trận phân quyền bao gồm cả các trường hợp phủ định chéo giữa Student và Admin"""
        user = request.getfixturevalue(user_fixture)
        factory = RequestFactory()
        req = factory.get('/')
        req.user = user
        
        assert perm_class().has_permission(req, None) is expected


    def test_item_image_representation(self):
        """ Hàm này unittesst serializer ảnh """
        class TestImageSerializer(ItemImageSerializer):
            class Meta:
                model = Course  
                fields = ('id',) 

        class MockImage:
            def __init__(self, url):
                self.url = url

        class MockInstance:
            def __init__(self, image):
                self.image = image

        serializer = TestImageSerializer()

        instance_obj = MockInstance(MockImage("https://cloudinary.com/test.jpg"))
        data_obj = serializer.to_representation(instance_obj)
        assert data_obj["image"] == "https://cloudinary.com/test.jpg"

        instance_str = MockInstance("image_id_123")
        data_str = serializer.to_representation(instance_str)
        assert "cloudinary.com" in data_str["image"]

        instance_none = MockInstance(None)
        data_none = serializer.to_representation(instance_none)
        assert data_none["image"] is None

    def test_paginator_settings(self):
        """ Hàm này unittest cấu hình phân trang khi trả về ds lớp học """
        paginator = ClassRoomPaginator()
        assert paginator.page_size == 8