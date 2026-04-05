
from rest_framework import viewsets,generics,filters,status
from courses.models import Course,Tag
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