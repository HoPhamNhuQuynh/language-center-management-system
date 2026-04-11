from enrollments.models import Enrollment, Payment
from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator
from users.serializers import UserSerializer
from classes.serializers import ClassRoomSerializer

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'classroom', 'enrollment_status', 'payment_deadline']
        extra_kwargs = {
            'student': {
                'read_only': True
            },
            'enrollment_status': {
                'read_only': True
            },
            'payment_deadline': {
                'read_only': True
            }
        }

    def validate(self, attrs):
        student = self.context['request'].user
        classroom = attrs.get('classroom')

        if Enrollment.objects.filter(student=student, classroom=classroom).exists():
            raise serializers.ValidationError("Sinh viên này đã đăng ký lớp học này rồi.")

        enrollment_count = Enrollment.objects.filter(classroom=classroom).count()
        if enrollment_count >= classroom.capacity:
            raise serializers.ValidationError("Lớp đã đủ sỉ số, không thể đăng ký thêm")

        new_schedule = classroom.schedule_set.all()
        enrollments = Enrollment.objects.filter(
            student=student, active=True
        ).select_related('classroom').prefetch_related('classroom__schedule_set')

        for e in enrollments:
            existing_schedule = e.classroom.schedule_set.all()

            for s in new_schedule:
                for es in existing_schedule:
                    if s.day_of_week == es.day_of_week:
                        if s.start_time < es.end_time and s.end_time > es.start_time:
                            raise serializers.ValidationError(
                                f"Lịch học bị trùng với lớp {e.classroom.name}"
                                f" vào thứ {s.day_of_week} ({s.start_time} - {s.end_time})"
                            )

        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['classroom'] = ClassRoomSerializer(instance.classroom).data

        return data

class EnrollmentDetailSerializer(EnrollmentSerializer):

    class Meta:
        model = EnrollmentSerializer.Meta.model
        fields = EnrollmentSerializer.Meta.fields + ['created_at','updated_at', 'active']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'enrollment', 'amount', 'payment_method', 'paid_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['classroom'] = instance.enrollment.classroom.name
        return data 
