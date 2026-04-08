from rest_framework import serializers
from classes.models import ClassRoom, TeachingAssignment, Session, Room
from django.db import transaction
from users.models import User
from users.serializers import UserSerializer

class TeachingAssignmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = TeachingAssignment
        fields = '__all__'


class ClassRoomSerializer(serializers.ModelSerializer):
    main_teacher_id = serializers.PrimaryKeyRelatedField(
        queryset = User.objects.all(),
        write_only = True,
        required = False
    )


    class Meta:
        model = ClassRoom
        fields = ['id', 'name', 'course', 'start_date', 'end_date', 'main_teacher_id']

    def to_representation(self, classroom):
        data = super().to_representation(classroom)

        data['course'] = classroom.course.name

        assignment = next(
                (a for a in classroom.teachingassignment_set.all() if a.is_main),
                None
            )
        data['main_teacher'] = UserSerializer(assignment.teacher).data if assignment else None
        return data
  
    def create(self, validated_data):
        main_teacher = validated_data.pop('main_teacher_id', None)

        classroom = ClassRoom.objects.create(**validated_data)

        if main_teacher:
            TeachingAssignment.objects.create(
                teacher=main_teacher,
                classroom=classroom,
                is_main=True
            )
        return classroom

    def update(self, instance, validated_data):
        main_teacher = validated_data.pop('main_teacher_id', None)
        instance = super().update(instance, validated_data)

        if main_teacher:
            with transaction.atomic():
                TeachingAssignment.objects.filter(classroom=instance, is_main=True).update(is_main=False)

                TeachingAssignment.objects.update_or_create(
                    classroom = instance,
                    teacher=main_teacher,
                    defaults={"is_main": True}
                )   
        return instance
    
class ClassRoomDetailSerializer(ClassRoomSerializer):

    class Meta:
        model = ClassRoomSerializer.Meta.model
        fields = ClassRoomSerializer.Meta.fields + ['created_at', 'grade_deadline', 'grade_status']


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room    
        fields = ["id", "name", "capacity"]
    
    def validate_capacity(self, capacity):
        if capacity < 0 or capacity > 100:
            raise serializers.ValidationError("Sức chứa phòng học không hợp lệ.")
        return capacity

    
class SessionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Session
        fields = ["id", "date", "start_time", "end_time", "user"]
    
    def validate(self, data):
        end_time = data.get('end_time')
        start_time = data.get('start_time')

        if end_time and start_time and end_time <= start_time:
            raise serializers.ValidationError({
                "end_time": "Giờ kết thúc phải lớn hơn giờ bắt đầu."
            })
        
        return data

    def to_representation(self, session):
        data = super().to_representation(session)
        data['teacher_fullname'] = f'{session.user.last_name} {session.user.last_name}'
        data['room'] = RoomSerializer(session.room).data
        
        request = self.context.get('request')
        if request and request.user and request.user.is_admin:
            data['created_at'] = session.created_at
            data['active'] = session.active

        return data
