from rest_framework import viewsets, status, permissions, parsers, generics
from courses.models import Course, Tag, ScoreType, Level
from courses import serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from classes.serializers import ClassRoomSerializer
from classes.models import ClassRoom
from django.db.models import ProtectedError
from rest_framework.serializers import ValidationError
from core import core_perms

class CourseViewSet(viewsets.ModelViewSet):
      queryset = Course.objects.select_related('level').prefetch_related('tags').all().order_by("id")
      parser_classes = [parsers.MultiPartParser]

      def get_queryset(self):
          if self.request.user.is_authenticated and self.request.user.is_admin:
              return self.queryset.all()
          return self.queryset.filter(active=True)

      def get_permissions(self):
        if self.action in ['list', 'retrieve', 'get_classes']:
            return [permissions.AllowAny()]
        return [core_perms.IsAdmin()]   

      def get_serializer_class(self):
        if self.action in ['retrieve'] or self.request.user.is_authenticated and self.request.user.is_admin:
            return serializers.CourseDetailSerializer
        return serializers.CourseSerializer
      
      def perform_destroy(self, instance):
        try:
            instance.delete()
        except ProtectedError:
            raise ValidationError("Không thể xóa khóa học này do ràng buộc dữ liệu.")
      
      @action(methods=['get'], url_path='classes', detail=True)
      def get_classes(self, request, pk):
          classes = ClassRoom.objects.filter(course_id=pk)
          return Response(ClassRoomSerializer(classes, many=True).data, status=status.HTTP_200_OK) 

class TagViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Tag.objects.filter(active=True).all()
    serializer_class = serializers.TagSerializer
    
class LevelViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Level.objects.all()
    serializer_class = serializers.LevelSerializer

    
