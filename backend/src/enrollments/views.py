from rest_framework import viewsets, generics, permissions
from enrollments.models import Enrollment, Payment
from enrollments.serializers import PaymentSerializer, EnrollmentSerializer, EnrollmentDetailSerializer
from core import core_perms
from .perms import IsEnrollmentOwner


class EnrollmentViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveDestroyAPIView):
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Enrollment.objects.none()
    
        if self.request.user and (self.request.user.is_staff or self.request.user.is_superuser):
            return Enrollment.objects.select_related('student', 'classroom').all()
        return Enrollment.objects.select_related('student', 'classroom').filter(student=self.request.user, active=True)
    
    def get_serializer_class(self):
        if self.action == 'retrieve' or self.request.user.is_staff:
            return EnrollmentDetailSerializer
        return EnrollmentSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [core_perms.IsStudent()]
        if self.action == 'destroy':
            return [IsEnrollmentOwner()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

class PaymentViewSet(viewsets.ViewSet, generics.ListAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            return Payment.objects.select_related('enrollment__classroom', 'enrollment__student').all()

        return Payment.objects.select_related('enrollment__classroom').filter(enrollment__student=user)




