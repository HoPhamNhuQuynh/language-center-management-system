from rest_framework import serializers
from .models import Score
from enrollments.serializers import EnrollmentSerializer

class ScoreSerializer(serializers.ModelSerializer):

    class Meta:
        model = Score
        fields = ['id', 'score_value', 'score_type', 'enrollment']

    def validate_score_value(self, value):
        if value < 0 or value > 10:
            raise serializers.ValidationError("Điểm phải từ 0 đến 10")
        return value

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['score_type'] = instance.score_type.name
        data['enrollment'] = EnrollmentSerializer(instance.enrollment).data
        return data
    
class BulkSyncScoreSerializer(serializers.Serializer):
    scores = ScoreSerializer(many=True)

    def validate_scores(self, data):
        seen = set()

        for item in data:
            key = (item["enrollment"].id, item["score_type"].id)

            if key in seen:
                raise serializers.ValidationError(
                    "Trùng mã đăng ký và mã cột điểm"
                )

            seen.add(key)

        return data
