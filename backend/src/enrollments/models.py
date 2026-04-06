from django.utils import timezone
from datetime import timedelta
from django.db import models
from core.models import BaseActiveModel, TimeStampedModel
from django.conf import settings
'''
    Enrollment, Payment
'''

class Enrollment(BaseActiveModel, TimeStampedModel):

    class Status(models.TextChoices):
        SUCCESS = "SUCCESS", "Đăng ký thành công"
        PENDING_PAYMENT = "PENDING_PAYMENT", "Đang chờ thanh toán"
        PARTIAL_PAYMENT = "PARTIAL_PAYMENT", "Thanh toán một phần"

    enrollment_status = models.CharField(
                                        max_length=20,
                                        choices=Status.choices,
                                        default=Status.PENDING_PAYMENT
                                    )
    payment_deadline = models.DateTimeField(blank=True, null=True)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    classroom = models.ForeignKey('classes.ClassRoom', on_delete=models.PROTECT)
    score_types = models.ManyToManyField('courses.ScoreType', through='grades.Score')

    class Meta:
        unique_together = ['student', 'classroom']

    def save(self, *args, **kwargs):
        if not self.payment_deadline:
            self.payment_deadline = timezone.now() + timedelta(minutes=30)
        super().save(*args, **kwargs)

class Payment(TimeStampedModel):

    class Method(models.TextChoices):
        MOMO = "MOMO", "MoMo"
        VNPAY = "VNPAY", "VNPay"

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(
                                    max_length=20, 
                                    choices=Method.choices, 
                                    default=Method.VNPAY
                                    )
    transaction_id = models.CharField(max_length=255, unique=True)
    paid_at = models.DateTimeField()
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE)