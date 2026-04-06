from rest_framework import viewsets, generics, permissions
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
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

    def retrieve(self, request, pk=None):
        try:
            enrollment = Enrollment.objects.get(pk=pk, active=True)
        except Enrollment.DoesNotExist:
            raise NotFound("Enrollment not found")

        serializer = EnrollmentSerializer(enrollment)
        return Response(serializer.data)
    
class PaymentViewSet(viewsets.ViewSet, generics.ListAPIView):

    serializer_class = PaymentSerializer

    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            return Payment.objects.select_related('enrollment__classroom', 'enrollment__student').all()

        return Payment.objects.select_related('enrollment__classroom').filter(enrollment__student=user)




