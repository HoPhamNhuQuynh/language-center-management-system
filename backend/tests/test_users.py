import pytest
from django.urls import reverse
from rest_framework import status
from users.serializers import UserSerializer
from users.models import User
from model_bakery import baker
from users.utils import generate_auth_token
from enrollments.models import Enrollment, Payment
from oauth2_provider.models import Application
from oauth2_provider.models import AccessToken

@pytest.mark.django_db(transaction=True)
class TestUserTransactional:
    def test_UTL_016_social_login_with_google_when_valid_token_creates_user_and_returns_access_token(
        self,
        api_client,
        mocker,
        oauth_application,
    ):
        mock_res = mocker.patch("requests.get")
        mock_res.return_value.status_code = 200
        mock_res.return_value.json.return_value = {
            "email": "quynh_ou@gmail.com",
            "name": "Nhu Quynh",
            "avatar": "http://avatar.com/1.jpg",
        }

        mocker.patch(
            "users.views.Application.objects.get",
            return_value=oauth_application,
        )
        fake_access = mocker.MagicMock()
        fake_access.token = "fake_access_token"
        fake_refresh = mocker.MagicMock()
        fake_refresh.token = "fake_refresh_token"
        mocker.patch(
            "users.views.generate_auth_token", return_value=(fake_access, fake_refresh)
        )

        response = api_client.post(
            reverse("social_login"),
            {"provider": "GOOGLE", "access_token": "valid_token"},
        )

        assert response.status_code == 200
        assert "access_token" in response.data
        assert response.data["access_token"] == "fake_access_token"

    def test_UTL_033_register_successfully_creates_student_and_profile(
        self,
        api_client,
        mocker,
    ):
        mock_token_response = mocker.MagicMock()
        mock_token_response.status_code = 200
        mock_token_response.content = b'{"access_token":"abc","refresh_token":"xyz","expires_in":3600,"token_type":"Bearer"}'
        mocker.patch(
            "users.views.TokenView.as_view",
            return_value=lambda req: mock_token_response,
        )

        response = api_client.post(
            reverse("register"),
            {
                "username": "student_new",
                "email": "student_new@gmail.com",
                "password": "Password123!",
                "phone_num": "0911111111",
            },
            format="json",
        )

        assert response.status_code == 201
        user = User.objects.get(username="student_new")
        assert user.groups.filter(name="Student").exists()
        assert hasattr(user, "profile")

@pytest.mark.django_db
class TestUserModule:
    @pytest.mark.parametrize(
        "pwd", ["123", "password123!", "PASSWORD123!", "Password!", "Password123"]
    )
    def test_UTL_001_password_validation_fails(self, pwd):
        """Kiểm tra tất cả các trường hợp mật khẩu không thỏa mãn định dạng Serializer yêu cầu"""
        data = {"username": "newuser", "password": pwd, "email": "new@gmail.com"}
        serializer = UserSerializer(data=data)

        assert serializer.is_valid() is False
        assert "password" in serializer.errors

    # =========================== TEST API CHỨC NĂNG =============================

    def test_UTL_002_get_current_user_when_authenticated_returns_user_info(
        self, api_client, active_user
    ):
        """Hàm này test API lấy thông tin cá nhân người dùng thành công"""
        api_client.force_authenticate(user=active_user)  # giả lập user đã chứng thực
        url = reverse("user-current-user")  # <base_name>-<action_name>
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["username"] == active_user.username

    def test_UTL_003_update_current_user_when_authenticated_updates_profile_successfully(
        self, api_client, active_user
    ):
        """Hàm này test API cập nhật thành công thông tin cơ bản của người dùng"""
        api_client.force_authenticate(user=active_user)
        url = reverse("user-current-user")
        data = {"first_name": "UpdatedName"}

        response = api_client.patch(url, data)
        assert response.status_code == status.HTTP_200_OK
        active_user.refresh_from_db()  # reload vì active_user trong memory chưa cập nhật
        assert active_user.first_name == "UpdatedName"

    def test_UTL_004_delete_current_user_when_authenticated_soft_deletes_user(
        self, api_client, active_user
    ):
        """Hàm này test API người dùng tự xóa tài khoản của mình (xóa mềm)"""
        api_client.force_authenticate(user=active_user)
        url = reverse("user-current-user")

        response = api_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT

        active_user.refresh_from_db()
        assert (
            active_user.is_active is False
        )  # kiểm tra lại logic xóa mềm tại perform_destroy

    def test_UTL_005_update_password_when_authenticated_updates_password_successfully(
        self, api_client, active_user
    ):
        """Hàm này test API cập nhật mật khẩu bởi user có chứng thực"""
        api_client.force_authenticate(user=active_user)
        url = reverse("user-update-password")
        data = {"old_password": "Password123!", "password": "NewValidPassword123!"}

        response = api_client.patch(url, data, format="json")

        assert response.status_code == status.HTTP_200_OK
        active_user.refresh_from_db()
        assert active_user.check_password(
            "NewValidPassword123!"
        )  # kiểm tra so khớp mật khẩu với dữ liệu dưới db

    # ================ TEST PHÂN QUYỀN (Permissions) ===============

    def test_UTL_006_generate_auth_token_util(self, active_user):
        """Hàm này unit test generate token chứng thực người dùng"""
        app = baker.make(
            "oauth2_provider.Application", user=active_user
        )  # giả lập OAuth2 để cấp token
        access_token, refresh_token = generate_auth_token(active_user, app)

        assert access_token.token is not None
        assert access_token.user == active_user
        assert refresh_token.application == app
        assert refresh_token.user == active_user

    def test_UTL_007_get_current_user_when_unauthenticated_returns_401(
        self, api_client
    ):
        """Hàm này test nếu user chưa đăng nhập thì không thể xem thông tin cá nhân"""
        url = reverse("user-current-user")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_UTL_008_create_user_when_admin_assigns_teacher_group(
        self, api_client, admin_user, teacher_group
    ):
        """Hàm này test 1 user mới được tạo bởi admin thì phải thuộc group teacher"""
        api_client.force_authenticate(user=admin_user)

        url = reverse("user-list")
        data = {
            "username": "new_teacher_unique",
            "password": "Password123!",
            "email": "teacher_unique@gmail.com",
            "first_name": "Giao",
            "last_name": "Vien",
            "phone_num": "0123456789",
        }
        response = api_client.post(url, data, format="json")
        print("STATUS:", response.status_code)
        print("DATA:", getattr(response, "data", None))
        print("CONTENT:", response.content.decode())
        assert response.status_code == status.HTTP_201_CREATED
        new_user = User.objects.get(username="new_teacher_unique")
        assert new_user.groups.filter(id=teacher_group.id).exists()
        assert hasattr(new_user, "profile")

    def test_UTL_009_update_avatar_when_authenticated_updates_profile_avatar_successfully(
        self, api_client, active_user
    ):
        """Hàm này test người dùng cập nhật ảnh đại diện"""
        api_client.force_authenticate(user=active_user)
        url = reverse("user-update-avatar")
        data = {"avatar": "new_avatar_public_id"}

        response = api_client.patch(url, data)
        assert response.status_code == status.HTTP_200_OK
        active_user.profile.refresh_from_db()
        assert str(active_user.profile.avatar) == "new_avatar_public_id"

    def test_UTL_010_get_enrollments_returns_only_user_enrollments(
        self, api_client, active_user, classroom
    ):
        """Hàm này test người dùng lấy ds đăng ký của chính mình"""
        api_client.force_authenticate(user=active_user)
        baker.make(Enrollment, student=active_user, classroom=classroom)

        other_user = baker.make(User)
        baker.make(Enrollment, student=other_user)

        res_enroll = api_client.get(reverse("user-get-enrollments"))
        assert res_enroll.status_code == status.HTTP_200_OK
        assert len(res_enroll.data) == 1

    def test_UTL_011_get_payments_returns_only_user_payments(
        self, api_client, active_user, classroom
    ):
        """Hàm này test người dùng lấy ds lịch sử thanh toán của chính mình"""
        api_client.force_authenticate(user=active_user)
        enroll = baker.make(Enrollment, student=active_user, classroom=classroom)
        baker.make(Payment, enrollment=enroll)

        other_user = baker.make(User)
        other_enroll = baker.make(Enrollment, student=other_user)
        baker.make(Payment, enrollment=other_enroll)

        res_pay = api_client.get(reverse("user-get-payments"))
        assert res_pay.status_code == status.HTTP_200_OK
        assert len(res_pay.data) == 1

    def test_UTL_012_social_login_when_missing_data_returns_400_error(self, api_client):
        """Hàm này test gửi request chứng thực nhưng không gửi data -> phải bị lỗi"""
        url = reverse("social_login")
        response = api_client.post(url, data={})  # giả lập data rỗng để báo lỗi
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["error"] == "Missing provider or access_token"

    def test_UTL_013_social_login_when_provider_invalid_returns_400_error(
        self, api_client
    ):
        """Hàm này test báo lỗi do request provider kh hợp lệ"""
        url = reverse("social_login")
        data = {
            "provider": "TIKTOK",  # gửi provider lạ, hệ thống không hỗ trợ
            "access_token": "fake_token",
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["error"] == "Unsupported provider"

    def test_UTL_014_toggle_lock_user_when_admin_locks_user_successfully(
        self, api_client, admin_user
    ):
        """Test logic admin xóa tài khoản người dùng )"""
        api_client.force_authenticate(user=admin_user)

        target = baker.make("users.User", is_active=True)
        url = reverse("user-toggle-lock", kwargs={"pk": target.id})

        response = api_client.patch(url)
        assert response.status_code == status.HTTP_200_OK
        target.refresh_from_db()
        assert target.is_active is False  # nếu lệnh này chạy đúng thì user vẫn còn ở db

    def test_UTL_015_delete_user_when_not_admin_returns_403(
        self, api_client, active_user
    ):
        """Hàm này test user thường không có quyền xóa tài khoản user khác trong hệ thống"""
        api_client.force_authenticate(user=active_user)

        target = baker.make("users.User", is_active=True)

        response = api_client.delete(reverse("user-detail", kwargs={"pk": target.id}))

        assert response.status_code == 403
        target.refresh_from_db()
        assert target.is_active is True

    
    def test_UTL_017_social_login_google_invalid_token_response(
        self, api_client, mocker
    ):
        """Hàm này test đăng nhập bằng account bên thứ 3 nhưng kh nhận được token hợp lệ"""
        mock_res = mocker.patch("requests.get")
        mock_res.return_value.status_code = 400
        mock_res.return_value.json.return_value = {"error": "invalid_token"}

        url = reverse("social_login")
        data = {"provider": "GOOGLE", "access_token": "expired_token"}
        response = api_client.post(url, data)

        assert response.status_code == 400
        assert response.data["error"] == "Invalid Google Token"

    def test_UTL_018_get_user_list_when_admin_returns_correct_users(
        self, api_client, admin_user
    ):
        """Hàm này test chỉ admin đuọc phép lấy ds người dùng hệ thống"""
        api_client.force_authenticate(user=admin_user)

        user1 = baker.make(User, username="user1")
        user2 = baker.make(User, username="user2")

        url = reverse("user-list")
        response = api_client.get(url)
        assert response.status_code == 200

        if (
            isinstance(response.data, dict) and "results" in response.data
        ):  # nếu là dict và có results thì có phân trang
            user_list = response.data["results"]
        else:
            user_list = response.data

        returned_ids = [u["id"] for u in user_list]
        assert user1.id in returned_ids
        assert user2.id in returned_ids

        assert "date_joined" in user_list[0]
        assert "auth_provider" in user_list[0]
        assert "email" in user_list[0]

    def test_UTL_019_user_list_when_not_admin_returns_403(
        self, api_client, active_user
    ):
        api_client.force_authenticate(user=active_user)
        response = api_client.get(reverse("user-list"))

        assert response.status_code == 403

    def test_UTL_020_user_list_when_unauthenticated_returns_401(self, api_client):
        response = api_client.get(reverse("user-list"))

        assert response.status_code == 401

    # bổ sung
    @pytest.mark.parametrize("missing_field", ["username", "email", "password"])
    def test_UTL_021_create_user_returns_400_when_required_field_missing(
        self, api_client, missing_field
    ):
        """Hàm này test đăng ký thiếu dữ liệu"""
        url = reverse("register")
        data = {
            "username": "missing_test",
            "email": "missing_test@gmail.com",
            "password": "Password123!",
            "phone_num": "0912345678",
        }

        data.pop(missing_field)

        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_UTL_022_create_user_returns_400_when_username_already_exists(
        self, api_client
    ):
        """Hàm này test username bị trùng"""
        baker.make(User, username="duplicated_user", email="old@gmail.com")

        url = reverse("register")
        data = {
            "username": "duplicated_user",
            "email": "new@gmail.com",
            "password": "Password123!",
        }

        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_UTL_023_create_user_returns_400_when_email_already_exists(
        self, api_client
    ):
        """Hàm này test email bị trùng"""
        baker.make(User, username="old_user", email="duplicated@gmail.com")

        url = reverse("register")
        data = {
            "username": "new_user",
            "email": "duplicated@gmail.com",
            "password": "Password123!",
        }

        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestUserExtraAPI:
    def test_UTL_024_change_role_to_teacher_success(
        self, api_client, admin_user, teacher_group
    ):
        api_client.force_authenticate(user=admin_user)

        target = baker.make(User, is_staff=False)

        url = reverse("user-change-role", kwargs={"pk": target.id})

        response = api_client.patch(url, {"role": "Teacher"}, format="json")

        assert response.status_code == 200

        target.refresh_from_db()

        assert target.groups.filter(name="Teacher").exists()
        assert target.is_staff is False

    def test_UTL_025_change_role_invalid_returns_400(self, api_client, admin_user):
        api_client.force_authenticate(user=admin_user)

        target = baker.make(User)

        url = reverse("user-change-role", kwargs={"pk": target.id})

        response = api_client.patch(url, {"role": "INVALID"}, format="json")

        assert response.status_code == 400

    def test_UTL_026_change_role_admin_sets_staff_true(self, api_client, admin_user):
        api_client.force_authenticate(user=admin_user)

        target = baker.make(User)

        url = reverse("user-change-role", kwargs={"pk": target.id})

        response = api_client.patch(url, {"role": "Admin"}, format="json")

        assert response.status_code == 200

        target.refresh_from_db()

        assert target.is_staff is True

    def test_UTL_027_get_results_returns_only_current_user_results(
        self, api_client, active_user, classroom
    ):
        api_client.force_authenticate(user=active_user)

        enrollment = baker.make(Enrollment, student=active_user, classroom=classroom)

        baker.make("grades.AcademicResult", enrollment=enrollment, active=True)

        other_user = baker.make(User)

        other_enrollment = baker.make(Enrollment, student=other_user)

        baker.make("grades.AcademicResult", enrollment=other_enrollment, active=True)

        response = api_client.get(reverse("user-get-results"))

        assert response.status_code == 200
        assert len(response.data) == 1

    def test_UTL_028_social_login_existing_user_wrong_provider_returns_400(
        self, api_client, mocker
    ):
        baker.make(User, email="test@gmail.com", auth_provider="FACEBOOK")

        mock_res = mocker.patch("requests.get")

        mock_res.return_value.status_code = 200
        mock_res.return_value.json.return_value = {
            "email": "test@gmail.com",
            "name": "Test User",
        }

        response = api_client.post(
            reverse("social_login"), {"provider": "GOOGLE", "access_token": "valid"}
        )

        assert response.status_code == 400
        assert "registed by FACEBOOK" in response.data["error"]

    def test_UTL_029_social_login_google_without_email_returns_400(
        self, api_client, mocker
    ):
        mock_res = mocker.patch("requests.get")

        mock_res.return_value.status_code = 200
        mock_res.return_value.json.return_value = {"name": "No Email"}

        response = api_client.post(
            reverse("social_login"), {"provider": "GOOGLE", "access_token": "valid"}
        )

        assert response.status_code == 400
        assert response.data["error"] == "Email not provided by social network"

    def test_UTL_030_social_login_application_not_found_returns_500(
        self, api_client, mocker
    ):
        mock_res = mocker.patch("requests.get")

        mock_res.return_value.status_code = 200
        mock_res.return_value.json.return_value = {
            "email": "new@gmail.com",
            "name": "New User",
        }

        response = api_client.post(
            reverse("social_login"), {"provider": "GOOGLE", "access_token": "valid"}
        )

        assert response.status_code == 500
        assert response.data["error"] == "OAuth2 application not found"

    def test_UTL_031_list_teachers_returns_only_teachers(
        self, api_client, admin_user, teacher_group
    ):
        api_client.force_authenticate(user=admin_user)

        teacher = baker.make(User)
        teacher.groups.add(teacher_group)

        baker.make(User)

        response = api_client.get(reverse("teachers-list"))

        assert response.status_code == 200

        returned_ids = [u["id"] for u in response.data]

        assert teacher.id in returned_ids

    def test_UTL_032_toggle_lock_removes_access_tokens(self, api_client, admin_user):
        api_client.force_authenticate(user=admin_user)

        target = baker.make(User)

        app = baker.make(Application, user=admin_user)

        access_token, _ = generate_auth_token(target, app)

        assert access_token is not None

        response = api_client.patch(
            reverse("user-toggle-lock", kwargs={"pk": target.id})
        )

        assert response.status_code == 200

        assert not AccessToken.objects.filter(user=target).exists()

    
    def test_UTL_034_update_password_wrong_old_password_returns_400(
        self, api_client, active_user
    ):
        api_client.force_authenticate(user=active_user)

        response = api_client.patch(
            reverse("user-update-password"),
            {
                "old_password": "WrongPassword123!",
                "password": "NewPassword123!",
            },
            format="json",
        )

        assert response.status_code == 400
        assert "old_password" in response.data

    @pytest.mark.parametrize(
        "phone",
        [
            "123456789",
            "abcdefghij",
            "11111111111",
            "09123",
        ],
    )
    def test_UTL_035_register_invalid_phone_returns_400(self, api_client, phone):
        response = api_client.post(
            reverse("register"),
            {
                "username": f"user_{phone}",
                "email": f"{phone}@gmail.com",
                "password": "Password123!",
                "phone_num": phone,
            },
            format="json",
        )

        assert response.status_code == 400
        assert "phone_num" in response.data

    def test_UTL_036_register_duplicate_phone_returns_400(self, api_client):
        user = baker.make(User)
        baker.make(
            "users.Profile",
            user=user,
            phone_num="0912345678",
        )

        response = api_client.post(
            reverse("register"),
            {
                "username": "new_phone_user",
                "email": "new_phone@gmail.com",
                "password": "Password123!",
                "phone_num": "0912345678",
            },
            format="json",
        )

        assert response.status_code == 400
        assert "phone_num" in response.data

    def test_UTL_037_update_current_user_duplicate_phone_returns_400(
        self, api_client, active_user
    ):
        other_user = baker.make(User)

        baker.make(
            "users.Profile",
            user=other_user,
            phone_num="0999999999",
        )

        api_client.force_authenticate(user=active_user)

        response = api_client.patch(
            reverse("user-current-user"),
            {"phone_num": "0999999999"},
            format="json",
        )

        assert response.status_code == 400
        assert "phone_num" in response.data

    def test_UTL_038_change_role_when_not_admin_returns_403(
        self, api_client, active_user
    ):
        api_client.force_authenticate(user=active_user)

        target = baker.make(User)

        response = api_client.patch(
            reverse("user-change-role", kwargs={"pk": target.id}),
            {"role": "Teacher"},
            format="json",
        )

        assert response.status_code == 403

    def test_UTL_039_toggle_lock_when_not_admin_returns_403(
        self, api_client, active_user
    ):
        api_client.force_authenticate(user=active_user)

        target = baker.make(User)

        response = api_client.patch(
            reverse("user-toggle-lock", kwargs={"pk": target.id})
        )

        assert response.status_code == 403

    def test_UTL_040_get_results_when_unauthenticated_returns_401(self, api_client):
        response = api_client.get(reverse("user-get-results"))

        assert response.status_code == 401

    def test_UTL_041_update_avatar_when_unauthenticated_returns_401(self, api_client):
        response = api_client.patch(
            reverse("user-update-avatar"),
            {"avatar": "avatar_public_id"},
        )

        assert response.status_code == 401

    def test_UTL_042_social_login_facebook_invalid_token_returns_400(
        self, api_client, mocker
    ):
        mock_res = mocker.patch("requests.get")

        mock_res.return_value.status_code = 400

        response = api_client.post(
            reverse("social_login"),
            {
                "provider": "FACEBOOK",
                "access_token": "invalid_token",
            },
        )

        assert response.status_code == 400
        assert response.data["error"] == "Invalid Facebook Token"
