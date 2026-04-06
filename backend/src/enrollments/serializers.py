from enrollments.models import Enrollment, Payment
from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator

class EnrollmentSerializer(serializers.ModelSerializer):
    _first_name = serializers.CharField(source='user.first_name', read_only=True)
    user_last_name = serializers.CharField(source='user.last_name', read_only=True)
    class_name = serializers.CharField(source='classroom.name', read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id','user','classroom','class_name','enrollment_status']

        validators = [
            UniqueTogetherValidator(
                queryset=Enrollment.objects.all(),
                fields = ['user','classroom']
            )
        ]

class EnrollmentDetailSerializer(EnrollmentSerializer):

    class Meta:
        model = EnrollmentSerializer.Meta.model
        fields = EnrollmentSerializer.Meta.fields + ['payment_deadline','created_at','updated_at']

class PaymentSerializer(serializers.ModelSerializer):
    user_first_name = serializers.CharField(source='enrollment.user.first_name', read_only=True)
    user_last_name = serializers.CharField(source='enrollment.user.last_name', read_only=True)
    class_name = serializers.CharField(source='enrollment.classroom.name', read_only=True)

    amount = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False)
    class Meta:
        model = Payment
        fields = ['id','user_first_name','user_last_name','class_name','enrollment','amount','payment_method','transaction_id','paid_at']
