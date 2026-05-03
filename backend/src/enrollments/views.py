from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action
from enrollments.models import Enrollment, Payment
from enrollments.serializers import PaymentSerializer, EnrollmentSerializer, EnrollmentDetailSerializer
from core import core_perms
from .perms import IsEnrollmentOwner
from rest_framework.response import Response
from .services import VNPayService
from django.utils import timezone
from django.db import transaction


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
        s = PaymentSerializer(data=request.data, context={'request': request})
        s.is_valid(raise_exception=True)
        payment = s.save()

        response_data = s.data

        if payment.payment_method == Payment.Method.VNPAY:
            ip_address = request.META.get('REMOTE_ADDR', '127.0.0.1')
            payment_url = VNPayService.create_payment_url(payment=payment, ip_address=ip_address)

            response_data['payment_url'] = payment_url
            return Response(response_data)

        # Mock MoMo
        if payment.payment_method == Payment.Method.MOMO:
            response_data['payUrl'] = f"/mock-momo/{payment.id}"
            return Response(response_data)

        return Response({"error": "Invalid method"}, status=400)

    @action(detail=False, methods=['get'], url_path='vnpay-callback', permission_classes=[permissions.AllowAny])
    def vnpay_callback(self, request):
        data = request.GET
        vnp_response_code = data.get('vnp_ResponseCode')
        
        if vnp_response_code == "00":
            return Response({"status": "Success", "message": "Thanh toán thành công!"})
        return Response({"status": "Failed", "message": "Thanh toán thất bại hoặc đã bị hủy."})

    @action(detail=False, methods=['get'], url_path='vnpay-ipn', permission_classes=[permissions.AllowAny])
    def vnpay_ipn(self, request):
        data = request.GET
        vnp_txn_ref = data.get('vnp_TxnRef') 
        vnp_response_code = data.get('vnp_ResponseCode')

        try:
            payment = Payment.objects.select_related('enrollment').get(id=vnp_txn_ref)
            
            if payment.payment_status == Payment.Status.SUCCESS:
                return Response({"RspCode": "00", "Message": "Already confirmed"})
    
            with transaction.atomic():
                if vnp_response_code == "00":
                    payment.payment_status = Payment.Status.SUCCESS
                    payment.paid_at = timezone.now()
                    payment.save()

                    enrollment = payment.enrollment
                    enrollment.enrollment_status = Enrollment.Status.SUCCESS
                    enrollment.save()

                else:
                    payment.payment_status = Payment.Status.FAILED
                    payment.save()

            return Response({"RspCode": "00", "Message": "Confirm success"}) 
        except Payment.DoesNotExist:
            return Response({"RspCode": "01", "Message": "Enrollment not found"})
