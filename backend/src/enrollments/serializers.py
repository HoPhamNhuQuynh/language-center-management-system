from django.db import transaction, models
from enrollments.models import Enrollment, Payment
from classes.models import Session
from rest_framework import serializers
from users.serializers import UserSerializer
from classes.serializers import ClassRoomSerializer

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'classroom', 'enrollment_status', 'payment_deadline', 'created_at']
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

        old = Enrollment.objects.filter(
            student=student,
            classroom=classroom,
            enrollment_status=Enrollment.Status.PENDING_PAYMENT,
        ).first()
        if old:
            old.delete()

        if Enrollment.objects.filter(
            student=student,
            classroom=classroom,
            enrollment_status=Enrollment.Status.SUCCESS,
        ).exists():
            raise serializers.ValidationError(
                "Sinh viên này đã đăng ký lớp học này rồi."
            )

        if Enrollment.objects.filter(student=student, classroom=classroom).exists():
            raise serializers.ValidationError("Sinh viên này đã đăng ký lớp học này rồi.")

        enrollment_count = Enrollment.objects.filter(classroom=classroom).count()
        if enrollment_count >= classroom.capacity:
            raise serializers.ValidationError("Lớp đã đủ sỉ số, không thể đăng ký thêm")

        new_schedule = classroom.schedule_set.all()
        enrollments = (
            Enrollment.objects.filter(
                student=student,
                active=True,
                enrollment_status=Enrollment.Status.SUCCESS,
            )
            .select_related("classroom")
            .prefetch_related("classroom__schedule_set")
        )

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

        enrolled_classroom_ids = enrollments.values_list('classroom_id', flat=True)
        existing_sessions = Session.objects.filter(
            schedule__classroom_id__in=enrolled_classroom_ids
        ).select_related('schedule__classroom')

        for s in new_schedule:
            for es in existing_sessions:
                if s.day_of_week == es.schedule.day_of_week:
                    if s.start_time < es.end_time and s.end_time > es.start_time:
                        raise serializers.ValidationError(
                            f"Lịch học bị trùng với lớp {es.schedule.classroom.name}"
                            f" vào thứ {s.day_of_week} ({es.start_time} - {es.end_time})"
                        )

        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['student'] = UserSerializer(instance.student).data
        data['classroom'] = ClassRoomSerializer(instance.classroom).data

        return data

class EnrollmentDetailSerializer(EnrollmentSerializer):

    class Meta:
        model = EnrollmentSerializer.Meta.model
        fields = EnrollmentSerializer.Meta.fields + ['created_at','updated_at', 'active']

class PaymentSerializer(serializers.ModelSerializer):
    classroom = serializers.SerializerMethodField()
    payment_url = serializers.CharField(read_only=True, required=False)
    total_sessions = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = ['id', 'enrollment', 'amount', 'payment_method', 'paid_at', 'classroom', 'payment_url', 'payment_status', 'total_sessions', 'transaction_id', 'created_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["student_name"] = instance.enrollment.student.full_name
        data["student_email"] = instance.enrollment.student.email
        return data

    def validate(self, data):
        enrollment = data.get('enrollment')
        amount = data.get('amount')
        course_fee = enrollment.classroom.course.price

        if course_fee < 5000000:
            if amount < course_fee:
                raise serializers.ValidationError(
                    f"Khóa học dưới 5tr bắt buộc thanh toán toàn bộ ({course_fee} VNĐ)."
                )
        else:
            min_partial = course_fee / 2
            if amount < min_partial and enrollment.enrollment_status == "PENDING_PAYMENT":
                raise serializers.ValidationError(
                    f"Khóa học trên 5tr được phép đóng trước tối thiểu 50% ({min_partial} VNĐ)."
                )
                
        return data
    
    def get_classroom(self, instance):
        return instance.enrollment.classroom.name

    def get_total_sessions(self, instance):
        return instance.enrollment.classroom.course.total_sessions

    @transaction.atomic
    def create(self, validated_data):
        payment = super().create(validated_data)
        enrollment = payment.enrollment
        course_fee = enrollment.classroom.course.price

        total_paid = Payment.objects.filter(enrollment=enrollment).aggregate(models.Sum('amount'))['amount__sum'] or 0

        if total_paid >= course_fee:
            enrollment.enrollment_status = Enrollment.Status.PENDING_PAYMENT
        elif total_paid >= course_fee / 2:
            enrollment.enrollment_status = Enrollment.Status.PARTIAL_PAYMENT

        enrollment.save()
        return payment

