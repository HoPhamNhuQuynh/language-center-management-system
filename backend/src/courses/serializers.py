from courses.models import Course, Tag
from rest_framework import serializers

class CourseSerializer(serializers.ModelSerializer):
    level_name = serializers.CharField(source='level.name', read_only=True)
    image = serializers.ImageField(use_url=True)

    class Meta:
        model = Course
        fields = ['id','name','price','description','image','total_sessions','level','level_name']
    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Tên khóa học không được để trống.")
        return value
    def validate_total_sessions(self, value):
        if value <= 0:
            raise serializers.ValidationError("Số buổi học phải lớn hơn 0.")
        return value

class CourseDetailSerializer(serializers.ModelSerializer):
    level_name = serializers.ReadOnlyField(source='level.name')
    image = serializers.ImageField(use_url=True)

    class Meta:
        model = Course
        fields = '__all__'

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Tên tag không được để trống.")
        return value


