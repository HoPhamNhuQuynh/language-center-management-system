
from rest_framework import viewsets,generics
from rest_framework.permissions import IsAdminUser
from courses.models import Course, Level, ScoreType, Tag
from courses import serializers

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = serializers.CourseSerializer
class LevelViewSet(generics.ListCreateAPIView, viewsets.ViewSet):
    queryset = Level.objects.all()
    serializer_class = serializers.LevelSerializer
    #permission_classes = [IsAdminUser]
class ScoreTypeViewSet(generics.ListCreateAPIView, viewsets.ViewSet):
    queryset = ScoreType.objects.all()
    serializer_class = serializers.ScoreTypeSerializer
class TagViewSet(generics.ListAPIView, viewsets.ViewSet):
    queryset = Tag.objects.all()
    serializer_class = serializers.TagSerializer