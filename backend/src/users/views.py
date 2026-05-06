from django.http import JsonResponse
from rest_framework import viewsets, status, permissions, generics
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from oauth2_provider.models import Application
from users.models import User, Profile
from users import serializers
from enrollments.serializers import EnrollmentSerializer, PaymentSerializer
from enrollments.models import Payment, Enrollment
from .utils import generate_auth_token, parse_token_response
import requests
from config import settings
from core import core_perms, paginators
from oauth2_provider.models import AccessToken
from rest_framework.throttling import AnonRateThrottle
from oauth2_provider.views import TokenView, RevokeTokenView
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import Group
from grades.models import AcademicResult
from grades.serializers import AcademicResultSerializer



class SocialLoginThrottle(AnonRateThrottle):
    scope = "social_login"


@method_decorator(csrf_exempt, name="dispatch")
class LoginView(TokenView):
    def post(self, request, *args, **kwargs):
        post_data = request.POST.copy()
        post_data["client_id"] = settings.CLIENT_ID
        post_data["client_secret"] = settings.CLIENT_SECRET
        post_data["grant_type"] = "password"
        request.POST = post_data

        response = super().post(request, *args, **kwargs)

        if response.status_code != 200:
            return response

        token_data = parse_token_response(response)

        username = request.POST.get("username")
        user = User.objects.filter(username=username).first()
        user_data = serializers.UserSerializer(user).data if user else None

        return JsonResponse(
            {**token_data, "user": user_data}, status=status.HTTP_200_OK
        )


@method_decorator(csrf_exempt, name="dispatch")
class LogoutView(RevokeTokenView):
    def dispatch(self, request, *args, **kwargs):
        if request.method == "POST":
            post_data = request.POST.copy()
            post_data["client_id"] = settings.CLIENT_ID
            post_data["client_secret"] = settings.CLIENT_SECRET
            request.POST = post_data
        return super().dispatch(request, *args, **kwargs)


class RefreshTokenView(APIView):
    def post(self, request):
        request._request.POST = request.data.copy()
        request._request.POST["grant_type"] = "refresh_token"
        request._request.POST["client_id"] = settings.CLIENT_ID
        request._request.POST["client_secret"] = settings.CLIENT_SECRET
        return TokenView.as_view()(request._request)


class RegisterView(APIView):
    def post(self, request):
        s = serializers.UserSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        u = s.save()

        data = {
            "grant_type": "password",
            "username": request.data["username"],
            "password": request.data["password"],
            "client_id": settings.CLIENT_ID,
            "client_secret": settings.CLIENT_SECRET,
        }

        request._request.POST = data
        response = TokenView.as_view()(request._request)

        if response.status_code != 200:
            u.delete()
            return Response(
                {
                    "detail": "Tạo tài khoản thành công nhưng không thể đăng nhập tự động."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        token_data = parse_token_response(response)

        return Response(
            {**token_data, "user": serializers.UserSerializer(u).data},
            status=status.HTTP_201_CREATED,
        )


class ListTeachersView(APIView):
    permission_classes = [core_perms.IsAdmin]

    def get(self, request):
        teachers = User.objects.filter(groups__name="Teacher").all()
        return Response(
            serializers.UserSerializer(teachers, many=True).data,
            status=status.HTTP_200_OK,
        )


class SocialTokenExchangeViewSet(APIView):
    def post(self, request):
        provider = request.data.get("provider", "").upper()
        social_access_token = request.data.get("access_token")

        if not provider or not social_access_token:
            return Response(
                {"error": "Missing provider or access_token"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if provider not in User.AuthProvider.values:
            return Response(
                {"error": "Unsupported provider"}, status=status.HTTP_400_BAD_REQUEST
            )

        email = None
        user_info = {}

        if provider == User.AuthProvider.GOOGLE:
            google_response = requests.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                params={"access_token": social_access_token},
                verify=False,
            )
            if google_response.status_code != 200:
                return Response(
                    {"error": "Invalid Google Token"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user_info = google_response.json()
            email = user_info.get("email")
        elif provider == User.AuthProvider.FACEBOOK:
            fb_response = requests.get(
                "https://graph.facebook.com/me",
                params={"fields": "id,name,email", "access_token": social_access_token},
            )
            if fb_response.status_code != 200:
                return Response(
                    {"error": "Invalid Facebook Token"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user_info = fb_response.json()
            email = user_info.get("email")
        else:
            return Response(
                {"error": "Unsupported provider"}, status=status.HTTP_400_BAD_REQUEST
            )

        if not email:
            return Response(
                {"error": "Email not provided by social network"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(email=email).first()
        if user:
            if user.auth_provider != provider:
                return Response(
                    {
                        "error": f"This email is registed by {user.auth_provider}. Please use the right way to login in system."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            user = User.objects.create(
                email=email,
                username=email.split("@")[0],
                first_name=user_info.get("name", "").split(" ")[0],
                auth_provider=provider,
            )
            user.set_unusable_password()
            user.save()

        user_group, _ = Group.objects.get_or_create(name="Student")
        user.groups.add(user_group)

        try:
            app = Application.objects.get(name="Language Center")
        except:
            return Response(
                {"error": "OAuth2 application not found"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        access_token, refresh_token = generate_auth_token(user, app)

        oauth2_settings = getattr(settings, "OAUTH2_PROVIDER", {})
        expires_in = oauth2_settings.get("ACCESS_TOKEN_EXPIRE_SECONDS", 3600)

        return Response(
            {
                "access_token": access_token.token,
                "refresh_token": refresh_token.token,
                "expires_in": expires_in,
                "token_type": "Bearer",
                "user": serializers.UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class UserViewSet(
    viewsets.ViewSet,
    generics.DestroyAPIView,
    generics.ListCreateAPIView,
    generics.UpdateAPIView,
):
    queryset = User.objects.all()
    serializer_class = serializers.UserDetailSerializer
    pagination_class = paginators.ItemPaginator

    def get_permissions(self):
        if self.action in ['current_user', 'update_avatar', 'update_password', 'get_payments', 'get_enrollments', 'get_results']:
            return [permissions.IsAuthenticated()]
        return [core_perms.IsAdmin()]

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()
        AccessToken.objects.filter(user=instance).delete()

    @action(methods=["get", "patch", "delete"], url_path="me", detail=False)
    def current_user(self, request):
        u = request.user
        if request.method.__eq__("PATCH"):
            s = serializers.UserSerializer(u, data=request.data, partial=True)
            s.is_valid(raise_exception=True)
            s.save()
            return Response(s.data, status=status.HTTP_200_OK)
        elif request.method.__eq__("DELETE"):
            u.is_active = False
            u.save()
            AccessToken.objects.filter(user=u).delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        return Response(
            serializers.UserDetailSerializer(u).data, status=status.HTTP_200_OK
        )

    @action(methods=["patch"], url_path="me/avatar", detail=False)
    def update_avatar(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)

        s = serializers.AvatarUpdateSerializer(profile, data=request.data, partial=True)
        s.is_valid(raise_exception=True)
        s.save()
        return Response(s.data, status=status.HTTP_200_OK)

    @action(methods=["patch"], url_path="me/reset-password", detail=False)
    def update_password(self, request):
        u = request.user
        s = serializers.PasswordUpdateSerializer(u, data=request.data, partial=True)
        s.is_valid(raise_exception=True)
        u = s.save()
        return Response(serializers.UserSerializer(u).data, status=status.HTTP_200_OK)

    @action(
        methods=["patch"],
        url_path="role",
        detail=True,
        permission_classes=[core_perms.IsAdmin],
    )
    def change_role(self, request, pk=None):
        user = self.get_object()
        role = request.data.get("role")

        if role not in ["Student", "Teacher", "Admin"]:
            return Response(
                {"message": "Vai trò không hợp lệ"}, status=status.HTTP_400_BAD_REQUEST
            )

        user.groups.clear()
        if role != "Admin":
            group, _ = Group.objects.get_or_create(name=role)
            user.groups.add(group)
            user.is_staff = False
        else:
            user.is_staff = True
        user.save()

        return Response(
            serializers.UserSerializer(user).data, status=status.HTTP_200_OK
        )
    
    @action(methods=['patch'], url_path='toggle-lock', detail=True, permission_classes=[core_perms.IsAdmin])
    def toggle_lock(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        if not user.is_active:
            AccessToken.objects.filter(user=user).delete()
        return Response(serializers.UserSerializer(user).data, status=status.HTTP_200_OK)

    @action(methods=["get"], url_path="me/enrollments", detail=False)
    def get_enrollments(self, request):
        user = request.user
        enrollments = Enrollment.objects.filter(student=user).select_related(
            "classroom"
        )
        return Response(
            EnrollmentSerializer(enrollments, many=True).data, status=status.HTTP_200_OK
        )

    @action(methods=["get"], url_path="me/payments", detail=False)
    def get_payments(self, request):
        payments = Payment.objects.filter(
            enrollment__student=request.user
        ).select_related("enrollment__classroom")
        return Response(PaymentSerializer(payments, many=True).data, status=status.HTTP_200_OK)

    @action(methods=['get'], url_path="me/results", detail=False)
    def get_results(self, request):
        results = AcademicResult.objects.filter(
            enrollment__student=request.user,
            active=True
        ).select_related(
            'enrollment__classroom__course__level',
        ).prefetch_related(
            'enrollment__classroom__teachingassignment_set__teacher'
        )
        return Response(AcademicResultSerializer(results, many=True).data, status=status.HTTP_200_OK)

