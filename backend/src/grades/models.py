
from django.db import models
from core.models import TimeStampedModel, BaseActiveModel
'''
    Attendance, AcademicResult, Score
'''

class Attendance(TimeStampedModel):
    class Status(models.TextChoices):
        ABSENT = "ABSENT", "Vắng mặt"
        LATE = "LATE", "Trễ"
        PRESENT = "PRESENT", "Có mặt"

    attendance_status = models.CharField(max_length=20, choices=Status.choices, default=Status.ABSENT)
    note = models.TextField(null=True, blank=True)
    enrollment = models.ForeignKey('enrollments.Enrollment', on_delete=models.PROTECT)
    session = models.ForeignKey('classes.Session', on_delete=models.PROTECT)

class AcademicResult(TimeStampedModel, BaseActiveModel):
    average_score = models.FloatField()
    comment = models.TextField(null=True, blank=True)
    enrollment = models.OneToOneField('enrollments.Enrollment', on_delete=models.CASCADE, related_name='academic_result')

class Score(BaseActiveModel, TimeStampedModel):
    score_value = models.FloatField()
    enrollment = models.ForeignKey('enrollments.Enrollment', on_delete=models.CASCADE)
    score_type = models.ForeignKey('courses.ScoreType', on_delete=models.PROTECT)
