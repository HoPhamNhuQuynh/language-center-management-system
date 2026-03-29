
from rest_framework import viewsets, parsers, generics, filters
from enrollments.models import Enrollment, Payment
from enrollments import serializers

class EnrollmentViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Enrollment.objects.filter(active=True)
    serializer_class = serializers.EnrollmentSerializer

class PaymentViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Payment.objects.all()
    serializer_class = serializers.PaymentSerializer




