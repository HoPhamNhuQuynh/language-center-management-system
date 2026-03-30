from django.urls import path, include
from rest_framework.routers import DefaultRouter

from enrollments.views import PaymentViewSet, EnrollmentViewSet

r = DefaultRouter()
r.register('enrollments', EnrollmentViewSet, 'enrollment')
r.register('payments', PaymentViewSet,'payment')

urlpatterns = [
    path('', include(r.urls)),
]