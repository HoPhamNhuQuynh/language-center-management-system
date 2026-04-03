
from rest_framework import viewsets,generics,filters
from courses.models import Course, Tag
from courses import serializers
from courses.serializers import CourseSerializer, CourseDetailSerializer

class CourseViewSet(viewsets.ViewSet,generics.ListAPIView,generics.CreateAPIView,generics.RetrieveAPIView):
      queryset = Course.objects.filter(active=True)
      def get_serializer_class(self):
        if self.action == 'retrieve':
            return serializers.CourseDetailSerializer
        return serializers.CourseSerializer
class TagViewSet(viewsets.ViewSet,generics.CreateAPIView):
    queryset = Tag.objects.all()
    serializer_class = serializers.TagSerializer