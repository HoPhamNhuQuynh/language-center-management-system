from django.contrib.auth.models import Group
from users.models import User, Profile
from rest_framework import serializers
from django.db import transaction

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['phone_num','avatar']
        extra_kwargs = {
            'avatar': {'required': False},
            'phone_num': {'required': False}
        }

    def to_representation(self, instance):
        if not instance:
            return None

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

        student_group, _ = Group.objects.get_or_create(name="Student")
        user.groups.add(student_group)

        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance

class UserDetailSerializer(UserSerializer):
    profile = ProfileSerializer(required=False, allow_null=True)
    class Meta:
        model = UserSerializer.Meta.model
        fields = UserSerializer.Meta.fields + ['date_joined', 'last_login', 'profile']
        
    @transaction.atomic
    def create(self, validated_data):
        '''
        This's for admin create user
        '''
        profile_data = validated_data.pop('profile', {})
        password = validated_data.pop('password', None)

        user = User(**validated_data)

        if password:
            user.set_password(password)

        user.save()

        teacher_group, _ = Group.objects.get_or_create(name='Teacher')
        user.groups.add(teacher_group)

        Profile.objects.create(user=user, **profile_data)

        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', None)
        password = validated_data.pop('password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()

        if profile_data is not None:
            profile, _ = Profile.objects.get_or_create(user=instance)
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()

        return instance

