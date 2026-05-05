from rest_framework import serializers
from .models import Score, Attendance, AcademicResult
from users.serializers import UserSerializer

class RemarkItemSerializer(serializers.Serializer):
    enrollment_id = serializers.IntegerField()
    comment = serializers.CharField(allow_blank=True)

class SubmitScoreSerializer(serializers.Serializer):
    remarks = RemarkItemSerializer(many=True, required=False, default=list)
    
class ScoreSerializer(serializers.ModelSerializer):

    class Meta:
        model = Score
        fields = ['id', 'score_value', 'score_type']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['score_type_id'] = instance.score_type.id
        data['score_type'] = instance.score_type.name
        data['enrollment_id'] = instance.enrollment_id 
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
    
class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='enrollment.student.get_full_name', read_only=True)
    student_code = serializers.CharField(source='enrollment.student.username', read_only=True)

    class Meta:
        model = Attendance
        fields = ['enrollment_id', 'student_name', 'student_code', 'attendance_status', 'note']  

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

class AcademicResultSerializer(serializers.ModelSerializer):
    enrollment_id = serializers.IntegerField(source='enrollment.id', read_only=True)
    scores = serializers.SerializerMethodField()
    attendance_count = serializers.SerializerMethodField()

    class Meta:
        model = AcademicResult
        fields = [
            'id', 'enrollment_id',
            'scores', 'attendance_count',
            'average_score', 'comment',
        ]

    def get_scores(self, obj):
        scores = Score.objects.filter(
            enrollment=obj.enrollment,
            active=True
        ).select_related('score_type')
        return ScoreSerializer(scores, many=True).data

    def get_attendance_count(self, obj):
        return Attendance.objects.filter(
            enrollment=obj.enrollment,
            attendance_status=Attendance.Status.PRESENT
        ).count()

