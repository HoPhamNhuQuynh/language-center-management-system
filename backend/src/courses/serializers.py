from courses.models import Course, Tag
from rest_framework import serializers

class CourseSerializer(serializers.ModelSerializer):
    level_name = serializers.CharField(source='level.name', read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(),
        many=True,
        source='tags'
    )
    class Meta:
        model = Course
        fields = ['name','price','description','image','total_sessions','level_name','tag_ids']
    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Tên khóa học không được để trống.")
        return value
    def validate_total_sessions(self, value):
        if value <= 0:
            raise serializers.ValidationError("Số buổi học phải lớn hơn 0.")
        return value

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Tên tag không được để trống.")
        return value


