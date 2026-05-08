import pytest
from django.urls import reverse
from rest_framework import status
from users.serializers import UserSerializer
from users.models import User
from model_bakery import baker
from users.utils import generate_auth_token
from enrollments.models import Enrollment, Payment
from oauth2_provider.models import Application


@pytest.mark.django_db
class TestUserModule:

    @pytest.mark.parametrize("pwd", ["123", "password123!", "PASSWORD123!", "Password!", "Password123"])
    def test_UTL_001_password_validation_fails(self, pwd):
        """Kiểm tra tất cả các trường hợp mật khẩu không thỏa mãn định dạng Serializer yêu cầu"""
        data = {
            "username": "newuser",
            "password": pwd,
            "email": "new@gmail.com"
        }
        serializer = UserSerializer(data=data)
        
        assert serializer.is_valid() is False
        assert "password" in serializer.errors

    # =========================== TEST API CHỨC NĂNG =============================

    def test_UTL_002_get_current_user_when_authenticated_returns_user_info(self, api_client, active_user):
        """ Hàm này test API lấy thông tin cá nhân người dùng thành công """
        api_client.force_authenticate(user=active_user) # giả lập user đã chứng thực
        url = reverse('user-current-user') # <base_name>-<action_name> 
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['username'] == active_user.username

    def test_UTL_003_update_current_user_when_authenticated_updates_profile_successfully(self, api_client, active_user):
        """ Hàm này test API cập nhật thành công thông tin cơ bản của người dùng """
        api_client.force_authenticate(user=active_user)
        url = reverse('user-current-user')
        data = {"first_name": "UpdatedName"}
        
        response = api_client.patch(url, data)
        assert response.status_code == status.HTTP_200_OK
        active_user.refresh_from_db() # reload vì active_user trong memory chưa cập nhật
        assert active_user.first_name == "UpdatedName"

    def test_UTL_004_delete_current_user_when_authenticated_soft_deletes_user(self, api_client, active_user):
        """ Hàm này test API người dùng tự xóa tài khoản của mình (xóa mềm) """
        api_client.force_authenticate(user=active_user)
        url = reverse('user-current-user')
        
        response = api_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        active_user.refresh_from_db()
        assert active_user.is_active is False # kiểm tra lại logic xóa mềm tại perform_destroy

    def test_UTL_005_update_password_when_authenticated_updates_password_successfully(self, api_client, active_user):
        """ Hàm này test API cập nhật mật khẩu bởi user có chứng thực """
        api_client.force_authenticate(user=active_user)
        url = reverse('user-update-password')
        data = {
            "old_password": "Password123!",
            "password": "NewValidPassword123!"
            }
        
        response = api_client.patch(url, data, format="json")
        
        assert response.status_code == status.HTTP_200_OK
        active_user.refresh_from_db()
        assert active_user.check_password("NewValidPassword123!") # kiểm tra so khớp mật khẩu với dữ liệu dưới db 

    # ================ TEST PHÂN QUYỀN (Permissions) ===============

    def test_UTL_006_generate_auth_token_util(self, active_user):
        """ Hàm này unit test generate token chứng thực người dùng """
        app = baker.make('oauth2_provider.Application', user=active_user) # giả lập OAuth2 để cấp token
        access_token, refresh_token = generate_auth_token(active_user, app)
        
        assert access_token.token is not None
        assert access_token.user == active_user
        assert refresh_token.application == app
        assert refresh_token.user == active_user 

    def test_UTL_007_get_current_user_when_unauthenticated_returns_401(self, api_client):
        """ Hàm này test nếu user chưa đăng nhập thì không thể xem thông tin cá nhân """
        url = reverse('user-current-user')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_UTL_008_create_user_when_admin_assigns_teacher_group(self, api_client, admin_user, teacher_group):
        """ Hàm này test 1 user mới được tạo bởi admin thì phải thuộc group teacher """
        api_client.force_authenticate(user=admin_user)
        
        url = reverse('user-list')
        data = {
            "username": "new_teacher_unique", 
            "password": "Password123!",
            "email": "teacher_unique@gmail.com",
            "first_name": "Giao",
            "last_name": "Vien"
            # không cần tạo profile vì signals đã tạo sẵn, nếu gửi thêm thì duplicate
        }
        response = api_client.post(url, data, format='json')
        print("STATUS:", response.status_code)
        print("DATA:", getattr(response, "data", None))
        print("CONTENT:", response.content.decode())
        assert response.status_code == status.HTTP_201_CREATED
        new_user = User.objects.get(username="new_teacher_unique")
        assert new_user.groups.filter(id=teacher_group.id).exists()
        assert hasattr(new_user, 'profile')

    def test_UTL_009_update_avatar_when_authenticated_updates_profile_avatar_successfully(self, api_client, active_user):
        """ Hàm này test người dùng cập nhật ảnh đại diện """
        api_client.force_authenticate(user=active_user)
        url = reverse('user-update-avatar')
        data = {"avatar": "new_avatar_public_id"}

        response = api_client.patch(url, data)
        assert response.status_code == status.HTTP_200_OK
        active_user.profile.refresh_from_db()
        assert str(active_user.profile.avatar) == "new_avatar_public_id"
       

    def test_UTL_010_get_enrollments_returns_only_user_enrollments(self, api_client, active_user, classroom):
        """ Hàm này test người dùng lấy ds đăng ký của chính mình """
        api_client.force_authenticate(user=active_user)
        baker.make(Enrollment, student=active_user, classroom=classroom)

        other_user = baker.make(User)
        baker.make(Enrollment, student=other_user)

        res_enroll = api_client.get(reverse('user-get-enrollments'))
        assert res_enroll.status_code == status.HTTP_200_OK
        assert len(res_enroll.data) == 1

    def test_UTL_011_get_payments_returns_only_user_payments(self, api_client, active_user, classroom):
        """ Hàm này test người dùng lấy ds lịch sử thanh toán của chính mình """
        api_client.force_authenticate(user=active_user)
        enroll = baker.make(Enrollment, student=active_user, classroom=classroom)
        baker.make(Payment, enrollment=enroll)

        other_user = baker.make(User)
        other_enroll = baker.make(Enrollment, student=other_user)
        baker.make(Payment, enrollment=other_enroll)

        res_pay = api_client.get(reverse('user-get-payments'))
        assert res_pay.status_code == status.HTTP_200_OK
        assert len(res_pay.data) == 1
    
    def test_UTL_012_social_login_when_missing_data_returns_400_error(self, api_client):
        """ Hàm này test gửi request chứng thực nhưng không gửi data -> phải bị lỗi """
        url = reverse('social_login')
        response = api_client.post(url, data={}) # giả lập data rỗng để báo lỗi 
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data['error'] == 'Missing provider or access_token'
    
    def test_UTL_013_social_login_when_provider_invalid_returns_400_error(self, api_client):
        """ Hàm này test báo lỗi do request provider kh hợp lệ """
        url = reverse('social_login')
        data = {
            "provider": "TIKTOK", # gửi provider lạ, hệ thống không hỗ trợ 
            "access_token": "fake_token"
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data['error'] == 'Unsupported provider'

    def test_UTL_014_toggle_lock_user_when_admin_locks_user_successfully(self, api_client, admin_user):
        """ Test logic admin xóa tài khoản người dùng )"""
        api_client.force_authenticate(user=admin_user)
        
        target = baker.make('users.User', is_active=True)
        url = reverse('user-toggle-lock', kwargs={'pk': target.id})
        
        response = api_client.patch(url)
        assert response.status_code == status.HTTP_200_OK
        target.refresh_from_db()
        assert target.is_active is False # nếu lệnh này chạy đúng thì user vẫn còn ở db 

    def test_UTL_015_delete_user_when_not_admin_returns_403(self, api_client, active_user):
        """ Hàm này test user thường không có quyền xóa tài khoản user khác trong hệ thống """
        api_client.force_authenticate(user=active_user)

        target = baker.make('users.User', is_active=True)

        response = api_client.delete(reverse('user-detail', kwargs={'pk': target.id}))

        assert response.status_code == 403
        target.refresh_from_db()
        assert target.is_active is True    

    def test_UTL_016_social_login_with_google_when_valid_token_creates_user_and_returns_access_token(self, api_client, mocker):
        """ Hàm này test user login bằng tài khoản bên thứ 3 (có mock external service) """
        mock_res = mocker.patch('requests.get') # chặn call thật ra internet 
        mock_res.return_value.status_code = 200 # giả lập bên thứ 3 trả status OK và data user 
        mock_res.return_value.json.return_value = {
            "email": "quynh_ou@gmail.com",
            "name": "Nhu Quynh",
            "avatar": "http://avatar.com/1.jpg"
        }

        baker.make(Application, name='Language Center', 
                   client_type=Application.CLIENT_CONFIDENTIAL,
                   authorization_grant_type=Application.GRANT_PASSWORD)

        url = reverse('social_login')
        data = {"provider": "GOOGLE", "access_token": "valid_token"}
        response = api_client.post(url, data)

        assert response.status_code == 200
        assert "access_token" in response.data
        assert User.objects.filter(email="quynh_ou@gmail.com").exists()

    def test_UTL_017_social_login_google_invalid_token_response(self, api_client, mocker):
        """ Hàm này test đăng nhập bằng account bên thứ 3 nhưng kh nhận được token hợp lệ """
        mock_res = mocker.patch('requests.get')
        mock_res.return_value.status_code = 400
        mock_res.return_value.json.return_value = {"error": "invalid_token"}

        url = reverse('social_login')
        data = {"provider": "GOOGLE", "access_token": "expired_token"}
        response = api_client.post(url, data)

        assert response.status_code == 400
        assert response.data['error'] == 'Invalid Google Token'

    def test_UTL_018_get_user_list_when_admin_returns_correct_users(self, api_client, admin_user):
        """ Hàm này test chỉ admin đuọc phép lấy ds người dùng hệ thống """
        api_client.force_authenticate(user=admin_user)

        user1 = baker.make(User, username="user1")
        user2 = baker.make(User, username="user2")
        
        url = reverse('user-list')
        response = api_client.get(url)
        assert response.status_code == 200
        
        if isinstance(response.data, dict) and 'results' in response.data: # nếu là dict và có results thì có phân trang 
            user_list = response.data['results']
        else:
            user_list = response.data

        returned_ids = [u['id'] for u in user_list]
        assert user1.id in returned_ids
        assert user2.id in returned_ids
            
        assert 'date_joined' in user_list[0]
        assert 'auth_provider' in user_list[0]
        assert 'email' in user_list[0]

    def test_UTL_019_user_list_when_not_admin_returns_403(self, api_client, active_user):
        api_client.force_authenticate(user=active_user)
        response = api_client.get(reverse('user-list'))

        assert response.status_code == 403

    def test_UTL_020_user_list_when_unauthenticated_returns_401(self, api_client):
        response = api_client.get(reverse('user-list'))

        assert response.status_code == 401

    # bổ sung
    @pytest.mark.parametrize("missing_field", ["username", "email", "password"])
    def test_UTL_021_create_user_returns_400_when_required_field_missing(self, api_client, missing_field):
        """Hàm này test đăng ký thiếu dữ liệu"""
        url = reverse("register")
        data = {
        "username": "missing_test",
        "email": "missing_test@gmail.com",
        "password": "Password123!",
        "phone_num": "0912345678"
        }

        data.pop(missing_field)

        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST   

    def test_UTL_022_create_user_returns_400_when_username_already_exists(self, api_client):
        """Hàm này test username bị trùng"""
        baker.make(User, username="duplicated_user", email="old@gmail.com")

        url = reverse("register")
        data = {
        "username": "duplicated_user",
        "email": "new@gmail.com",
        "password": "Password123!"
        }

        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_UTL_023_create_user_returns_400_when_email_already_exists(self, api_client):
        """Hàm này test email bị trùng"""
        baker.make(User, username="old_user", email="duplicated@gmail.com")

        url = reverse("register")
        data = {
        "username": "new_user",
        "email": "duplicated@gmail.com",
        "password": "Password123!"
        }

        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST