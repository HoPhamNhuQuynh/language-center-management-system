from urllib import request

from users.models import User, Profile
from rest_framework import serializers, status
from rest_framework.response import Response

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['phone_num','avatar']

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()
    class Meta:
        model = User
        fields = ['id','first_name','last_name','username', 'email', 'password','auth_provider','date_joined',
                  'last_login','profile']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

    def create(self, validated_data):
        profile_data = validated_data.pop('profile')

        user = User(**validated_data)
        user.set_password(user.password)
        user.save()

        Profile.objects.create(
            user=user,
            **profile_data
        )

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
            profile = instance.profile
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
        return instance
