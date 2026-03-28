
from rest_framework import serializers
from classes.models import ClassRoom

class ItemSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)

        if instance.image:
            data['image'] = instance.image.url
        
        return data

class ClassRoomSerializer(serializers.ModelSerializer):
    teacher = serializers.IntegerField()
    
    class Meta:
        model = ClassRoom
        fields = ['id', 'name', 'start_date', 'end_date', 'capacity', 'created_at']