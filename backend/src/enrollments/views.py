
from rest_framework import viewsets, parsers, generics, filters
from enrollments.models import Enrollment, Payment
from enrollments import serializers

class EnrollmentViewSet(viewsets.ViewSet, generics.ListAPIView,generics.RetrieveAPIView):
    queryset = Enrollment.objects.filter(active=True)
    serializer_class = serializers.EnrollmentSerializer

    def list(self, request, *args, **kwargs):
        return generics.ListAPIView.list(self, request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        return generics.RetrieveAPIView.retrieve(self, request, *args, **kwargs)
    
class PaymentViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Payment.objects.all()
    serializer_class = serializers.PaymentSerializer




