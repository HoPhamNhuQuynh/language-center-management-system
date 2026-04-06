from rest_framework import viewsets,generics,filters,status
from rest_framework.permissions import IsAdminUser
from courses.models import Course, Level, ScoreType, Tag
from courses import serializers
from courses.serializers import CourseSerializer, CourseDetailSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from classes.models import ClassRoom
from classes.serializers import ClassRoomSerializer

class CourseViewSet(viewsets.ViewSet,generics.ListAPIView,generics.CreateAPIView,generics.RetrieveAPIView):
      queryset = Course.objects.filter(active=True)
      def get_serializer_class(self):
        if self.action == 'retrieve':
            return serializers.CourseDetailSerializer
        return serializers.CourseSerializer
      
      @action(methods=['get'], url_path='classes', detail=True)
      def get_classes(self, request, pk):
          classes = ClassRoom.objects.select_related('course').filter(course=self.get_object(),active=True)
          return Response(ClassRoomSerializer(classes,many=True).data,status=status.HTTP_200_OK) 
class TagViewSet(viewsets.ViewSet,generics.CreateAPIView):
    queryset = Tag.objects.all()
    serializer_class = serializers.TagSerializer
class LevelViewSet(generics.ListCreateAPIView, viewsets.ViewSet):
    queryset = Level.objects.all()
    serializer_class = serializers.LevelSerializer
    #permission_classes = [IsAdminUser]
class ScoreTypeViewSet(generics.ListCreateAPIView, viewsets.ViewSet):
    queryset = ScoreType.objects.all()
    serializer_class = serializers.ScoreTypeSerializer