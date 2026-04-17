from rest_framework import viewsets, generics, permissions, status
from enrollments.models import Enrollment, Payment
from enrollments.serializers import PaymentSerializer, EnrollmentSerializer, EnrollmentDetailSerializer
from core import core_perms
from .perms import IsEnrollmentOwner
from rest_framework.response import Response



class EnrollmentViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveDestroyAPIView):
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Enrollment.objects.none()
    
        if self.request.user and (self.request.user.is_staff or self.request.user.is_superuser):
            return Enrollment.objects.select_related('student', 'classroom').all()
        if self.request.user.is_admin:
            return Enrollment.objects.select_related('student', 'classroom').filter(
                classroom__teachingassignment__teacher=self.request.user,
                active=True
            ).distinct()
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

    def cancel_enrollment(self, request, pk):
        enrollment = self.get_object()
        if enrollment.enrollment_status != 'PENDING_PAYMENT':
            return Response({"detail": "Không thể hủy khi đã thanh toán."},status=status.HTTP_400_BAD_REQUEST)
        enrollment.active = False
        enrollment.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class PaymentViewSet(viewsets.ViewSet, generics.ListAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            return Payment.objects.select_related('enrollment__classroom', 'enrollment__student').all()

        return Payment.objects.select_related('enrollment__classroom').filter(enrollment__student=user)




