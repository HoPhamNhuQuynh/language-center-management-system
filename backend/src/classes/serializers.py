
from rest_framework import serializers
from classes.models import ClassRoom, TeachingAssignment, Session, Room
from django.db import transaction
from users.models import User
from users.serializers import UserSerializer

class ItemSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)

        if instance.image:
            data['image'] = instance.image.url
        
        return data

class TeachingAssignmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = TeachingAssignment
        fields = '__all__'


class ClassRoomSerializer(serializers.ModelSerializer):
    course_name = serializers.ReadOnlyField(source='course.name')
    teacher_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True
    )

    class Meta:
        model = ClassRoom
        fields = ['id', 'name', 'course_name', 'course', 'start_date', 'end_date', 'teacher_id']
  
    def create(self, validated_data):
        teacher = validated_data.pop('teacher_id', None)
        classroom = ClassRoom.objects.create(**validated_data)

        TeachingAssignment.objects.create(
            classroom=classroom,
            teacher=teacher,
            is_main=True
        )
        return classroom

    def update(self, instance, validated_data):
        teacher = validated_data.pop('teacher_id', [])
        instance = super().update(instance, validated_data)

        if teacher:
            with transaction.atomic():
                TeachingAssignment.objects.filter(classroom=instance, is_main=True).update(is_main=False)

                TeachingAssignment.objects.update_or_create(
                    classroom = instance,
                    teacher=teacher,
                     defaults={"is_main": True}
                )   
        return instance
    
class ClassRoomDetailSerializer(ClassRoomSerializer):
    main_teacher = serializers.SerializerMethodField()

    class Meta:
        model = ClassRoomSerializer.Meta.model
        fields = ClassRoomSerializer.Meta.fields + ['created_at', 'main_teacher', 'grade_deadline', 'grade_status']
    
    def get_main_teacher(self, obj):
        main_teacher = obj.teachingassignment_set.filter(is_main=True).first()

        if main_teacher:
            return {
                'id': main_teacher.teacher.id,
                'name': f"{main_teacher.teacher.last_name} {main_teacher.teacher.first_name}"
            }
        return None

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room    
        fields = ["id", "name", "capacity"]

    
class SessionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Session
        fields = ["id", "date", "start_time", "end_time"]

    def to_representation(self, instance):
        data = super().to_representation(instance)

        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated and request.user.is_staff:
            data['room'] = RoomSerializer(instance.room).data
            data['user'] = instance.user.id
            data['created_at'] = instance.created_at
            data['active'] = instance.active

        return data
