
from rest_framework import serializers
from classes.models import ClassRoom, TeachingAssignment
from django.db import transaction

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
    
    class Meta:
        model = ClassRoom
        fields = ['id', 'name', 'course_name', 'course', 'start_date', 'end_date']
  
    def create(self, validated_data):
        assignments_data = validated_data.pop('teachers', [])
        classroom = ClassRoom.objects.create(**validated_data)

        for data in assignments_data:
            TeachingAssignment.objects.create(
                classroom=classroom,
                teacher=data['teacher'],
                is_main=data['is_main']
            )
        return classroom

    def update(self, instance, validated_data):
        assignments_data = validated_data.pop('teachers', None)

        instance = super().update(instance, validated_data)

        if assignments_data:
            with transaction.atomic():
                new_main_teacher = next((t for t in assignments_data if t.get('is_main')), None)

                if new_main_teacher:
                    TeachingAssignment.objects.filter(classroom=instance, is_main=True).update(is_main=False)

                for t_data in assignments_data:
                    TeachingAssignment.objects.update_or_create(
                        classroom = instance,
                        teacher=t_data['teacher'],
                        defaults={'is_main': t_data.get('is_main', False)}
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