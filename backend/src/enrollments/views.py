from rest_framework import viewsets, generics, permissions
from enrollments.models import Enrollment, Payment
from enrollments.serializers import PaymentSerializer, EnrollmentSerializer, EnrollmentDetailSerializer
from core.permissions import IsStudent

class EnrollmentViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Enrollment.objects.select_related('user', 'classroom').all()
        return Enrollment.objects.select_related('user', 'classroom').filter(user=user, active=True)
    
    def get_serializer_class(self):
        if self.action == 'retrieve' or self.request.user.is_staff:
            return EnrollmentDetailSerializer
        return EnrollmentSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [IsStudent()]
        if self.action in ['list', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

class PaymentViewSet(viewsets.ViewSet, generics.ListAPIView):

    serializer_class = PaymentSerializer

    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            return Payment.objects.select_related('enrollment__classroom', 'enrollment__student').all()

        return Payment.objects.select_related('enrollment__classroom').filter(enrollment__student=user)




