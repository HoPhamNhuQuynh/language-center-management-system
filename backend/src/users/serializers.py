from django.contrib.auth.models import Group
from users.models import User, Profile
from rest_framework import serializers
from django.db import transaction
import re

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['phone_num','avatar']
        extra_kwargs = {
            'avatar': {'required': False},
            'phone_num': {'required': False}
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)

        if instance.avatar:
            try:
                data['avatar'] = instance.avatar.url
            except AttributeError:
                data['avatar'] = str(instance.avatar)

        return data

    def validate_phone_num(self, phone):
        qs = Profile.objects.filter(phone_num=phone)

        if self.instance:
            qs = qs.exclude(user=self.instance.user)

        if qs.exists():
            raise serializers.ValidationError('Phone number already exists')

        return phone
    
    def update(self, instance, validated_data):
        validated_data.pop('phone_num', None)
        return super().update(instance, validated_data)

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ['id','first_name','last_name','email','username', 'password', 'auth_provider']
        extra_kwargs = {
            'password': {
                'write_only': True
            },
            'auth_provider': {
                'write_only': True
            }
        }
    
    def validate_password(self, password):
        if len(password) < 6:
            raise serializers.ValidationError("Password phải có ít nhất 6 ký tự")

        if not re.search(r"[A-Z]", password):
            raise serializers.ValidationError("Password phải có ít nhất 1 chữ in hoa")

        if not re.search(r"[a-z]", password):
            raise serializers.ValidationError("Password phải có ít nhất 1 chữ thường")
        
        if not re.search(r"\d", password):
            raise serializers.ValidationError("Password phải có ít nhất 1 chữ số")

        if not re.search(r"[!@#$%^&*(),.?\":{}|<>_\-\\/]", password):
            raise serializers.ValidationError("Password phải có ít nhất 1 ký tự đặc biệt")
        return password
    
    def to_representation(self, instance):
        data = super().to_representation(instance)

        data['full_name'] = f"{instance.last_name} {instance.first_name}"

        return data
    
    def create(self, validated_data):
        '''
        This's for student create an account
        '''
        user = User(**validated_data)

        user.auth_provider = User.AuthProvider.LOCAL

        user.set_password(user.password)
        user.save()

        user_group, _ = Group.objects.get_or_create(name='Student')
        user.groups.add(user_group)

        return user
    
class PhoneUpdateSerializer(ProfileSerializer):

    class Meta:
        model = ProfileSerializer.Meta.model
        fields = ['phone_num']   

class UserDetailSerializer(UserSerializer):
    enrollments = serializers.SerializerMethodField()
    profile = ProfileSerializer(required=False, allow_null=True)
    class Meta:
        model = UserSerializer.Meta.model
        fields = UserSerializer.Meta.fields + ['date_joined', 'last_login', 'profile', 'enrollments']
        extra_kwargs = UserSerializer.Meta.extra_kwargs

    def get_enrollments(self, instance):
        from enrollments.serializers import EnrollmentSerializer
        enrollments = instance.enrollment_set.all()
        return EnrollmentSerializer(enrollments, many=True).data
        
    @transaction.atomic
    def create(self, validated_data):
        '''
        This's for admin create user
        '''
        profile_data = validated_data.pop('profile', None)
        password = validated_data.pop('password', None)

        user = User(**validated_data)

        if password:
            user.set_password(password)

        user.save()

        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated and request.user.is_admin:
            user_group, _ = Group.objects.get_or_create(name='Teacher')
        else:
            user_group, _ = Group.objects.get_or_create(name='Student')
        user.groups.add(user_group)

        if profile_data:    
            Profile.objects.create(user=user, **profile_data)

        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', None)
        list_attrs_to_drop = ['password', 'avatar', 'date_joined', 'last_login', 'auth_provider']
        for attr in list_attrs_to_drop:
            validated_data.pop(attr, None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if profile_data is not None:
            s = PhoneUpdateSerializer(instance.profile, data=profile_data)
            s.is_valid(raise_exception=True)
            s.save()

        return instance
    
class PasswordUpdateSerializer(UserSerializer):

    class Meta:
        model = UserSerializer.Meta.model
        fields = ['password']

    def update(self, instance, validated_data):
        password = validated_data.get('password')
        if password:
            instance.set_password(password)
            instance.save()
        return instance    

    
