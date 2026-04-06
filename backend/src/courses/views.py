from rest_framework import viewsets, status, permissions
from courses.models import Course, Tag
from courses import serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from classes.serializers import ClassRoomSerializer

class CourseViewSet(viewsets.ModelViewSet):
      queryset = Course.objects.filter(active=True).select_related('level').prefetch_related('tags').all()

      def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]   

      def get_serializer_class(self):
        if self.action == 'retrieve':
            return serializers.CourseDetailSerializer
        return serializers.CourseSerializer
      
      @action(methods=['get'], url_path='classes', detail=True)
      def get_classes(self, request, pk):
          classes = self.get_object().classroom_set.filter(active=True).all()
          return Response(ClassRoomSerializer(classes,many=True).data,status=status.HTTP_200_OK) 
      
class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.filter(active=True).all()
    serializer_class = serializers.TagSerializer

    def get_permissions(self):
        if self.action == 'list':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
