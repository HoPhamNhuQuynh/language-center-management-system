from rest_framework import viewsets, status, permissions, parsers
from courses.models import Course, Tag, ScoreType, Level
from courses import serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from classes.serializers import ClassRoomSerializer
from classes.models import ClassRoom
from django.db.models import ProtectedError
from rest_framework.serializers import ValidationError
from core import core_perms
from core.paginators import CoursePaginator


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.select_related('level').prefetch_related('tags').all().order_by("id")
    parser_classes = [parsers.MultiPartParser]
    pagination_class = CoursePaginator

    def get_queryset(self):
        qs = Course.objects.select_related('level').prefetch_related('tags').order_by("id")

        if self.request.user.is_authenticated and self.request.user.is_admin:
            pass
        else:
            qs = qs.filter(active=True)

        tag = self.request.query_params.get('tag')
        if tag:
            qs = qs.filter(tags__name__iexact=tag)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(name__icontains=search)

        return qs

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


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.filter(active=True).all()
    serializer_class = serializers.TagSerializer

    def get_permissions(self):
        if self.action == 'list':
            return [permissions.AllowAny()]
        return [core_perms.IsAdmin()]

    def perform_destroy(self, instance):
        if instance.course_set.exists():
            raise ValidationError("Không thể xóa thẻ này do ràng buộc dữ liệu.")
        instance.delete()


class LevelViewSet(viewsets.ModelViewSet):
    queryset = Level.objects.all()
    serializer_class = serializers.LevelSerializer

    def get_permissions(self):
        if self.action == 'list':
            return [permissions.AllowAny()]
        return [core_perms.IsAdmin()]

    def perform_destroy(self, instance):
        try:
            instance.delete()
        except ProtectedError:
            raise ValidationError("Không thể xóa cấp độ này do ràng buộc dữ liệu.")


class ScoreTypeViewSet(viewsets.ModelViewSet):
    queryset = ScoreType.objects.all()
    serializer_class = serializers.ScoreTypeSerializer

    def get_permissions(self):
        if self.action == 'list':
            return [permissions.AllowAny()]
        return [core_perms.IsAdmin()]

    def perform_destroy(self, instance):
        try:
            instance.delete()
        except ProtectedError:
            raise ValidationError("Không thể xóa cột điểm này do ràng buộc dữ liệu.")
