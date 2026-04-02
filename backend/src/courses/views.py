
from rest_framework import viewsets,generics
from courses.models import Course, Tag
from courses import serializers

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = serializers.CourseSerializer
class CourseCreateView(generics.CreateAPIView):
    queryset = Course.objects.all()
    serializer_class = serializers.CourseSerializer
class TagCreateView(generics.CreateAPIView):
    queryset = Course.objects.all()
    serializer_class = serializers.TagSerializer