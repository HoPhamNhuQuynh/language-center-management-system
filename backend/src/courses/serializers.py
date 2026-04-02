from courses.models import Course, Level, ScoreType, Tag
from rest_framework import serializers

class CourseSerializer(serializers.ModelSerializer):
    level_name = serializers.CharField(source='level.name', read_only=True)
    class Meta:
        model = Course
        fields = ['name','price','description','image','total_sessions','level_name']
class LevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Level
        fields = ['id', 'name', 'description']

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Tên cấp độ không được để trống.")
        return value   
class ScoreTypeSerializer(serializers.ModelSerializer):
    course_name = serializers.ReadOnlyField(source='course.name')

    class Meta:
        model = ScoreType
        fields = ['id', 'name', 'weight', 'course', 'course_name']

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Tên cột điểm không được để trống.")
        return value

    def validate_weight(self, value):
        if value <= 0 or value > 3:
            raise serializers.ValidationError("Hệ số phải lớn hơn 0 và nhỏ hơn hoặc bằng 3.")
        return value
class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']