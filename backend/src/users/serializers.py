from urllib import request
from users.models import User, Profile
from rest_framework import serializers, status
from rest_framework.response import Response

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
            data['avatar'] = instance.avatar.url

        return data

    def validate_phone_num(self, value):
        current_user = self.context['request'].user

        if Profile.objects.filter(phone_num=value).exclude(user=current_user).exists():
            raise serializers.ValidationError('this phone number is already in use')
        return value

class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','first_name','last_name','email']

class UserSerializer(SimpleUserSerializer):
    profile = ProfileSerializer()
    class Meta:
        model = SimpleUserSerializer.Meta.model
        fields = SimpleUserSerializer.Meta.fields + ['username', 'email', 'password','auth_provider','date_joined',
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

