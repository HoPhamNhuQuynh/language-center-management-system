from django.contrib.auth.models import Group
from users.models import User, Profile
from rest_framework import serializers
from django.db import transaction
import re

def validate_password_common(password):
        if len(password) < 6:
            raise serializers.ValidationError("Mật khẩu phải có ít nhất 6 ký tự")

        if not re.search(r"[A-Z]", password):
            raise serializers.ValidationError("Mật khẩu phải có ít nhất 1 chữ in hoa")

        if not re.search(r"[a-z]", password):
            raise serializers.ValidationError("Mật khẩu phải có ít nhất 1 chữ thường")
        
        if not re.search(r"\d", password):
            raise serializers.ValidationError("Mật khẩu phải có ít nhất 1 chữ số")

        if not re.search(r"[!@#$%^&*(),.?\":{}|<>_\-\\/]", password):
            raise serializers.ValidationError("Mật khẩu phải có ít nhất 1 ký tự đặc biệt")
        return password

class UserSerializer(serializers.ModelSerializer):
    """
    Docstring for AccountRegisterSerializer
    Dùng cho api đăng ký tài khoản, chỉnh sửa thông tin cá nhân
    """
    phone_num = serializers.CharField(write_only=True)
    role = serializers.SerializerMethodField()

    def get_role(self, obj):
        if obj.is_admin:
            return "Admin"
        if obj.is_teacher:
            return "Teacher"
        if obj.is_student:
            return "Student"
        return None

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'username', 'password', 'phone_num', 'role']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }
    
    def validate_phone_num(self, phone_num):
        if not re.match(r"^0\d{9}$", phone_num):
            raise serializers.ValidationError("Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số")
        qs = Profile.objects.filter(phone_num=phone_num)
        if self.instance:
            qs = qs.exclude(user=self.instance)

        if qs.exists():
            raise serializers.ValidationError('Số điện thoại này đã tồn tại')
        return phone_num
    
    def validate_password(self, password):
        return validate_password_common(password)
    
    @transaction.atomic
    def create(self, validated_data):
        phone = validated_data.pop('phone_num')

        user = User(**validated_data)

        user.auth_provider = User.AuthProvider.LOCAL

        user.set_password(user.password)
        user.save()

        user_group, _ = Group.objects.get_or_create(name='Student')
        user.groups.add(user_group)

        Profile.objects.create(user=user, phone_num=phone)
        return user
    
    def update(self, instance, validated_data):
        validated_data.pop("password", None)
        return super().update(instance, validated_data)
    
class PasswordUpdateSerializer(serializers.Serializer):
    """
    Docstring for PasswordUpdateSerializer
    Cập nhật password có kiểm tra password cũ
    """
    old_password = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)

    def validate_password(self, password):
        return validate_password_common(password)

    def validate(self, data):
        user = self.instance

        if not user.check_password(data.get('old_password')):
            raise serializers.ValidationError({
                "old_password": "Mật khẩu cũ không đúng"
            })
        return data

    def update(self, instance, validated_data):
        instance.set_password(validated_data['password'])
        instance.save()
        return instance
    
class AvatarUpdateSerializer(serializers.ModelSerializer):
    """
    Docstring for AvatarUpdateSerializer
    Cập nhật ảnh đại diện 
    """
    class Meta:
        model = Profile
        fields = ['avatar']

    def validate_avatar(self, file):
        if file.size > 2 * 1024 * 1024:
            raise serializers.ValidationError("Ảnh quá lớn (max 2MB)")

        if not file.content_type.startswith('image/'):
            raise serializers.ValidationError("File phải là ảnh")
        return file

    def to_representation(self, instance):
        data = super().to_representation(instance)

        if instance.avatar:
            try:
                data['avatar'] = instance.avatar.url
            except AttributeError:
                data['avatar'] = str(instance.avatar)
        return data
    
class UserDetailSerializer(UserSerializer):
    """
    Docstring for UserDetailSerializer
    Thông tin chi tiết của user
    """
    avatar = serializers.CharField(source='profile.avatar', read_only=True)

    class Meta:
        model = UserSerializer.Meta.model
        fields = UserSerializer.Meta.fields + ['date_joined', 'last_login', 'auth_provider', 'avatar']
        extra_kwargs = UserSerializer.Meta.extra_kwargs
        
    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)

        if password:
            user.set_password(password)
        user.save()

        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated and request.user.is_admin:
            user_group, _ = Group.objects.get_or_create(name='Teacher')
            user.groups.add(user_group)
        return user

    def update(self, instance, validated_data):
        list_attrs_to_drop = ['password', 'avatar', 'date_joined', 'last_login', 'auth_provider']
        for attr in list_attrs_to_drop:
            validated_data.pop(attr, None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

    
