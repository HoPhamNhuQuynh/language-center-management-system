
from django.contrib.auth.models import Group
from django.db import transaction

from users.models import User, Profile
from rest_framework import serializers

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

    def validate_phone_num(self, value):
        user = self.context['request'].user

        qs = Profile.objects.filter(phone_num=value)

        if self.instance:
            qs = qs.exclude(user=self.instance.user)

        if qs.exists():
            raise serializers.ValidationError('Phone number already exists')

        return value

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(required=False, allow_null=True)
    class Meta:
        model = User
        fields = ['id','first_name','last_name','email','username', 'email', 'password','auth_provider','date_joined',
                  'last_login', 'profile']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})

        with transaction.atomic():
            user = User(**validated_data)
            user.set_password(user.password)
            user.save()

        teacher_group, _ = Group.objects.get_or_create(name='teacher')
        user.groups.add(teacher_group)

        Profile.objects.create(user=user, **profile_data)

        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile',None)
        password = validated_data.pop('password',None)

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

