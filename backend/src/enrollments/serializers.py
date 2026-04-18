from enrollments.models import Enrollment, Payment
from rest_framework import serializers
from django.utils import timezone
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
        data['student'] = UserSerializer(instance.student)
        data['classroom'] = ClassRoomSerializer(instance.classroom).data

        return data

class EnrollmentDetailSerializer(EnrollmentSerializer):

    class Meta:
        model = EnrollmentSerializer.Meta.model
        fields = EnrollmentSerializer.Meta.fields + ['created_at','updated_at', 'active']

class PaymentSerializer(serializers.ModelSerializer):
    classroom = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = ['id', 'enrollment', 'amount', 'payment_method', 'paid_at', 'classroom']

    def get_classroom(self, obj):
        return obj.enrollment.classroom.name

from django.utils import timezone
from rest_framework import serializers

class PaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['enrollment', 'payment_method']

    def validate(self, attrs):
        request = self.context['request']
        enrollment = attrs['enrollment']

        if enrollment.student != request.user:
            raise serializers.ValidationError("Không có quyền")

        if enrollment.payment_deadline < timezone.now():
            enrollment.delete()
            raise serializers.ValidationError("Hết hạn giữ chỗ")

        if enrollment.enrollment_status == Enrollment.Status.SUCCESS:
            raise serializers.ValidationError("Đã thanh toán rồi")

        return attrs

    def create(self, validated_data):
        enrollment = validated_data['enrollment']
        course_price = enrollment.classroom.course.price

        if course_price > 5_000_000:
            amount = course_price * 0.5
        else:
            amount = course_price

        payment = Payment.objects.create(
            enrollment=enrollment,
            amount=amount,
            payment_method=validated_data['payment_method'],
            payment_status=Payment.Status.PENDING
        )

        return payment