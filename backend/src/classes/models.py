
from django.db import models
from core.models import BaseActiveModel, TimeStampedModel
from django.conf import settings
'''
    Class, Room, Schedule, Session, TeachingAssignment
'''
class ClassRoom(BaseActiveModel, TimeStampedModel):

    class Status(models.TextChoices): 
        DRAFT = "DRAFT", "Bản nháp"
        SUBMITTED = "SUBMITTED", "Đã nộp bảng điểm"
        REOPENED = "REOPENED", "Mở lại bảng điểm"

    name = models.CharField(max_length=100, unique=True)
    start_date = models.DateField()
    end_date = models.DateField()
    capacity = models.PositiveIntegerField(default=30)
    grade_deadline = models.DateTimeField()
    grade_status = models.CharField(max_length=20, choices=Status, default=Status.DRAFT)
    course = models.ForeignKey('courses.Course', on_delete=models.PROTECT)

    def __str__(self):
        return self.name
    
class Room(BaseActiveModel, TimeStampedModel):
    name = models.CharField(max_length=50, unique=True)
    capacity = models.PositiveIntegerField(default=30)

    def __str__(self):
        return self.name
    
class Schedule(BaseActiveModel, TimeStampedModel):
    start_time = models.TimeField()
    end_time = models.TimeField()
    day_of_week = models.PositiveIntegerField()
    classroom = models.ForeignKey(ClassRoom, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.classroom_id}_{self.day_of_week}"
    
class Session(BaseActiveModel, TimeStampedModel):
    start_time = models.TimeField()
    end_time = models.TimeField()
    date = models.DateField()
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    schedule = models.ForeignKey(Schedule, on_delete=models.PROTECT)
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True)

    enrollments = models.ManyToManyField('enrollments.Enrollment', through='grades.Attendance')

    def __str__(self):
        return f"{self.schedule.classroom.id}_{self.date}"
    
class TeachingAssignment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    classroom = models.ForeignKey(ClassRoom, on_delete=models.PROTECT)
    is_main = models.BooleanField(default=False)

    class Meta:
        unique_together = ['user', 'classroom']


    

