from courses.models import Course, Level, ScoreType, Tag
from rest_framework import serializers
from core.serializers import ItemImageSerializer

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Tên tag không được để trống.")
        return value

class CourseSerializer(ItemImageSerializer):
    level_name = serializers.ReadOnlyField(source='level.name')
    tags = TagSerializer(many=True, read_only=True)
    class Meta:
        model = Course
        fields = ['id', 'name', 'image', 'total_sessions', 'level', 'level_name', 'tags']

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Tên khóa học không được để trống.")
        return value
    
    def validate_total_sessions(self, value):
        if value <= 0:
            raise serializers.ValidationError("Số buổi học phải lớn hơn 0.")
        return value

class CourseDetailSerializer(CourseSerializer):
    class Meta:
        model = CourseSerializer.Meta.model
        fields = CourseSerializer.Meta.fields + ['price', 'description', 'active', 'created_at']


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