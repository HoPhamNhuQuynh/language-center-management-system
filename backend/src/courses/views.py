
from rest_framework import viewsets,generics
from courses.models import Course
from courses import serializers

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = serializers.CourseSerializer
