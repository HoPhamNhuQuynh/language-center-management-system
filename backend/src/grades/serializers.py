from rest_framework import serializers
from .models import Score, Attendance
from classes.models import Session
from enrollments.models import Enrollment
from users.serializers import UserSerializer

class ScoreSerializer(serializers.ModelSerializer):

    class Meta:
        model = Score
        fields = ['id', 'score_value', 'score_type']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['score_type'] = instance.score_type.name
        data['student'] = UserSerializer(instance.enrollment.student).data
        return data
    
class ScoreItemSerializer(serializers.Serializer):
    enrollment_id = serializers.IntegerField()
    score_type_id = serializers.IntegerField()
    score_value = serializers.FloatField()

    def validate_score_value(self, value):
        if value < 0 or value > 10:
            raise serializers.ValidationError("Điểm phải từ 0 đến 10")
        return value
    
class BulkSyncScoreSerializer(serializers.Serializer):
    scores = ScoreItemSerializer(many=True)

    def validate_scores(self, data):
        seen = set()

        for item in data:
            key = (item["enrollment_id"], item["score_type_id"])

            if key in seen:
                raise serializers.ValidationError("Trùng điểm trong request")

            seen.add(key)

        return data

class AttendanceItemSerializer(serializers.Serializer):
    enrollment_id = serializers.IntegerField()
    attendance_status = serializers.CharField()
    note = serializers.CharField(required=False, allow_blank=True)

class BulkSyncAttendanceSerializer(serializers.Serializer):
    session_id = serializers.IntegerField()
    attendances = AttendanceItemSerializer(many=True)

    def validate_attendances(self, data):
        seen = set()

        for item in data:
            key = item["enrollment_id"]

            if key in seen:
                raise serializers.ValidationError("Trùng mã đăng ký")

            seen.add(key)

        return data