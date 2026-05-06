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
    name = serializers.CharField(
        required=True,
        allow_blank=False,
        trim_whitespace=True
    )
    level_name = serializers.ReadOnlyField(source='level.name')
    tags = TagSerializer(many=True, read_only=True)
    class Meta:
        model = Course
        fields = ['id', 'name', 'image', 'total_sessions', 'level', 'level_name', 'tags', 'price']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['tags'] = TagSerializer(instance.tags, many=True).data

        return data
    
    def validate_total_sessions(self, total_sessions):
        if total_sessions < 10:
            raise serializers.ValidationError("Giá trị nhập vào không hợp lệ, tổng số buổi học phải từ 10 buổi trở lên.")
        if total_sessions > 30:
            raise serializers.ValidationError("Giá trị nhập vào không hợp lệ, tổng số buổi học tối đa là 30 buổi.")
        return total_sessions
    
    def validate_name(self, value):
        qs = Course.objects.filter(name__iexact=value.strip())
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError("Tên khóa học đã tồn tại.")

        return value

class CourseDetailSerializer(CourseSerializer):
    actual_total_sessions = serializers.ReadOnlyField()

    class Meta:
        model = CourseSerializer.Meta.model
        fields = CourseSerializer.Meta.fields + ['price', 'description', 'active', 'created_at', 'actual_total_sessions']

    def update(self, course, validated_data):
        field_to_update = ['name', 'total_sessions', 'level', 'price', 'description', 'image', 'active']
        tags = validated_data.pop('tags', [])

        for attr, value in validated_data.items():
            if attr in field_to_update:
                setattr(course, attr, value)
        course.save()

        if tags:
            course.tags.set(tags)

        return course
    
    def validate_price(self, price):
        if price < 2000000:
            raise serializers.ValidationError("Học phí tối thiểu là 2.000.000 VND, vui lòng nhập học phí hợp lệ.")
        return price


class LevelSerializer(serializers.ModelSerializer):
    name = serializers.CharField(
        required=True,
        allow_blank=False,
        trim_whitespace=True
    )
    class Meta:
        model = Level
        fields = ['id', 'name', 'description']
    
class ScoreTypeSerializer(serializers.ModelSerializer):
    course_name = serializers.ReadOnlyField(source='course.name')
    name = serializers.CharField(
        required=True,
        allow_blank=False,
        trim_whitespace=True
    )
    
    class Meta:
        model = ScoreType
        fields = ['id', 'name', 'weight', 'course', 'course_name']

    def validate_weight(self, value):
        if value <= 0 or value > 3:
            raise serializers.ValidationError("Hệ số phải lớn hơn 0 và nhỏ hơn hoặc bằng 3.")
        return value