from rest_framework import serializers
from .models import Score
from enrollments.serializers import EnrollmentSerializer

class ScoreSerializer(serializers.ModelSerializer):

    class Meta:
        model = Score
        fields = ['id', 'score_value', 'score_type', 'enrollment']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['score_type'] = instance.score_type.name
        data['score_type'] = EnrollmentSerializer(instance.enrollment).data
        return data