
from rest_framework import serializers

class ClassScoreItemSerializer(serializers.Serializer):
    score_type = serializers.CharField()
    score_value = serializers.FloatField()


class ClassStudentScoreSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    scores = ClassScoreItemSerializer(many=True)
    average_score = serializers.FloatField(allow_null=True)
    comment = serializers.CharField(allow_null=True, allow_blank=True)