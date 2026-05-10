import pytest
from model_bakery import baker
from analytics.services import DashboardService
from enrollments.models import Enrollment
from grades.models import AcademicResult
from django.contrib.auth.models import Group
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
class TestDashboardService:
    def test_UTL_001_get_months(self):
        assert DashboardService._get_months(1) == [1, 2, 3]
        assert DashboardService._get_months(2) == [4, 5, 6]
        assert DashboardService._get_months(3) == [7, 8, 9]
        assert DashboardService._get_months(4) == [10, 11, 12]

    def test_UTL_002_get_prev_quarter(self):
        assert DashboardService._get_prev_quarter(2025, 1) == (2024, 4)
        assert DashboardService._get_prev_quarter(2025, 3) == (2025, 2)

    def test_UTL_003_get_summary(
        self,
        student_group,
        classroom,
    ):
        student = baker.make(
            "users.User",
            is_active=True,
        )
        student.groups.add(student_group)

        baker.make(
            "courses.Course",
            active=True,
        )

        baker.make(
            "classes.ClassRoom",
            active=True,
        )

        enrollments = baker.make(
            "enrollments.Enrollment",
            enrollment_status=Enrollment.Status.SUCCESS,
            _quantity=2,
        )

        result = DashboardService._get_summary(
            Enrollment.objects.filter(id__in=[e.id for e in enrollments])
        )

        assert result["total_students"] >= 1
        assert result["total_courses"] >= 1
        assert result["total_classes"] >= 1
        assert result["total_enrollments"] == 2

    def test_UTL_004_get_quarter_revenue(self):
        baker.make(
            "enrollments.Payment",
            payment_status="SUCCESS",
            amount=1000000,
            created_at="2025-01-10T10:00:00Z",
        )

        baker.make(
            "enrollments.Payment",
            payment_status="SUCCESS",
            amount=2000000,
            created_at="2025-02-10T10:00:00Z",
        )

        result = DashboardService._get_quarter_revenue(2025, 1)

        assert result == 3000000

    def test_UTL_005_get_revenue_summary(self):
        baker.make(
            "enrollments.Payment",
            payment_status="SUCCESS",
            amount=1000000,
            created_at="2024-11-10T10:00:00Z",
        )

        baker.make(
            "enrollments.Payment",
            payment_status="SUCCESS",
            amount=2000000,
            created_at="2025-01-10T10:00:00Z",
        )

        result = DashboardService._get_revenue_summary(2025, 1)

        assert result["total"] == 2000000
        assert result["prev_total"] == 1000000
        assert result["growth_rate"] == 100.0

    def test_UTL_006_get_revenue_by_quarter(self):
        baker.make(
            "enrollments.Payment",
            payment_status="SUCCESS",
            amount=1500000,
            created_at="2025-01-10T10:00:00Z",
        )

        baker.make(
            "enrollments.Payment",
            payment_status="SUCCESS",
            amount=2500000,
            created_at="2025-05-10T10:00:00Z",
        )

        result = DashboardService._get_revenue_by_quarter(2025)

        assert len(result) == 4
        assert result[0]["total"] == 1500000
        assert result[1]["total"] == 2500000

    def test_UTL_007_get_payment_status_stats(self):
        baker.make(
            "enrollments.Payment",
            payment_status="SUCCESS",
            created_at="2025-01-10T10:00:00Z",
        )

        baker.make(
            "enrollments.Payment",
            payment_status="FAILED",
            created_at="2025-01-11T10:00:00Z",
        )

        result = DashboardService._get_payment_status_stats(2025, 1)

        success = next(x for x in result if x["status"] == "SUCCESS")
        failed = next(x for x in result if x["status"] == "FAILED")

        assert success["count"] == 1
        assert failed["count"] == 1

    def test_UTL_008_get_pass_rate_stats(self):
        baker.make(
            "grades.AcademicResult",
            average_score=8,
            active=True,
            created_at="2025-01-10T10:00:00Z",
        )

        baker.make(
            "grades.AcademicResult",
            average_score=3,
            active=True,
            created_at="2025-01-11T10:00:00Z",
        )

        result = DashboardService._get_pass_rate_stats(2025, 1)

        assert result["total"] == 2
        assert result["passed"] == 1
        assert result["failed"] == 1
        assert result["pass_rate"] == 50.0

    def test_UTL_009_get_dashboard(
        self,
        student_group,
    ):
        student = baker.make(
            "users.User",
            is_active=True,
        )
        student.groups.add(student_group)

        baker.make(
            "courses.Course",
            active=True,
        )

        baker.make(
            "classes.ClassRoom",
            active=True,
        )

        baker.make(
            "enrollments.Enrollment",
            enrollment_status=Enrollment.Status.SUCCESS,
            created_at="2025-01-10T10:00:00Z",
        )

        result = DashboardService.get_dashboard(2025, 1)

        assert "summary" in result
        assert "revenue_summary" in result
        assert "revenue_by_quarter" in result
        assert "payment_status_stats" in result
        assert "pass_rate_stats" in result

@pytest.mark.django_db
class TestDashboardAPI:
    def test_UTL_010_dashboard_summary_when_admin_returns_200(
        self, api_client, admin_user
    ):
        api_client.force_authenticate(user=admin_user)

        url = reverse("dashboard-analytics")

        response = api_client.get(url, {"year": 2025, "quarter": 1})

        assert response.status_code == status.HTTP_200_OK

        assert "summary" in response.data
        assert "revenue_summary" in response.data
        assert "revenue_by_quarter" in response.data
        assert "payment_status_stats" in response.data
        assert "pass_rate_stats" in response.data

    def test_UTL_011_dashboard_summary_when_not_admin_returns_403(
        self, api_client, active_user
    ):
        api_client.force_authenticate(user=active_user)

        url = reverse("dashboard-analytics")

        response = api_client.get(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_UTL_012_dashboard_summary_when_unauthenticated_returns_401(
        self, api_client
    ):
        url = reverse("dashboard-analytics")

        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
