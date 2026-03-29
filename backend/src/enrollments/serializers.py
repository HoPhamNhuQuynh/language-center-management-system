from enrollments.models import Enrollment, Payment
from rest_framework import serializers

class EnrollmentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    class_name = serializers.CharField(source='classroom.name', read_only=True)

    class Meta:
        model = Enrollment
        fields = ['enrollment_status','payment_deadline','user_name','class_name']

class PaymentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='enrollment.user.username', read_only=True)
    class_name = serializers.CharField(source='enrollment.classroom.name', read_only=True)
    class Meta:
        model = Payment
        fields = ['amount','payment_method','transaction_id','paid_at','user_name','class_name']