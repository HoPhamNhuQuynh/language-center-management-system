
from rest_framework import viewsets,generics
from rest_framework.permissions import IsAdminUser
from courses.models import Course, Level, ScoreType, Tag
from courses import serializers

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = serializers.CourseSerializer
class LevelListCreateView(generics.ListCreateAPIView):
    queryset = Level.objects.all()
    serializer_class = serializers.LevelSerializer
    permission_classes = [IsAdminUser]
class ScoreTypeCreateView(generics.CreateAPIView):
    queryset = ScoreType.objects.all()
    serializer_class = serializers.ScoreTypeSerializer
class TagListView(generics.ListAPIView):
    queryset = Tag.objects.all()
    serializer_class = serializers.TagSerializer