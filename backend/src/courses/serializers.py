from courses.models import Course
from rest_framework import serializers

class CourseSerializer(serializers.ModelSerializer):
    level_name = serializers.CharField(source='level.name', read_only=True)
    class Meta:
        model = Course
        fields = ['name','price','description','image','total_sessions','level_name']

