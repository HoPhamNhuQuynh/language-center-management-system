from rest_framework import viewsets, generics, permissions
from enrollments.models import Enrollment, Payment
from enrollments.serializers import PaymentSerializer, EnrollmentSerializer, EnrollmentDetailSerializer, PaymentCreateSerializer
from core import core_perms
from .perms import IsEnrollmentOwner
from .services import VNPayService


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

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.utils import timezone

class PaymentViewSet(viewsets.ViewSet, generics.ListAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            return Payment.objects.select_related(
                'enrollment__classroom',
                'enrollment__student'
            ).all()

        return Payment.objects.select_related(
            'enrollment__classroom'
        ).filter(enrollment__student=user)

    def create(self, request):
        s = PaymentCreateSerializer(data=request.data, context={'request': request})
        s.is_valid(raise_exception=True)
        payment = s.save()

        if payment.payment_method == Payment.Method.VNPAY:
            ip_address = request.META.get('REMOTE_ADDR', '127.0.0.1')
            payment_url = VNPayService.create_payment_url(payment=payment, ip_address=ip_address)

            return Response({"payemnt_url": payment_url})

        # Mock MoMo
        if payment.payment_method == Payment.Method.MOMO:
            return Response({"payUrl": f"/mock-momo/{payment.id}"})

        return Response({"error": "Invalid method"}, status=400)


