
from rest_framework import viewsets, parsers, generics, filters
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from enrollments.models import Enrollment, Payment
from enrollments import serializers

class EnrollmentViewSet(viewsets.ViewSet, generics.ListAPIView,generics.RetrieveAPIView):
    queryset = Enrollment.objects.filter(active=True)
    serializer_class = serializers.EnrollmentSerializer

    def retrieve(self, request, pk=None):
        try:
            enrollment = Enrollment.objects.get(pk=pk, active=True)
        except Enrollment.DoesNotExist:
            raise NotFound("Enrollment not found")

        serializer = serializers.EnrollmentSerializer(enrollment)
        return Response(serializer.data)
    
class PaymentViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Payment.objects.all()
    serializer_class = serializers.PaymentSerializer




