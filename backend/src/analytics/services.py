from django.db.models import Count, Sum
from django.db.models.functions import ExtractQuarter
from users.models import User
from courses.models import Course
from classes.models import ClassRoom
from enrollments.models import Enrollment, Payment


class DashboardService:

    @staticmethod
    def _get_months(quarter):
        return {
            "1": [1, 2, 3],
            "2": [4, 5, 6],
            "3": [7, 8, 9],
            "4": [10, 11, 12],
        }.get(str(quarter), [1, 2, 3])

    @staticmethod
    def _get_prev_quarter(year, quarter):
        quarter = int(quarter)
        if quarter == 1:
            return year - 1, 4
        return year, quarter - 1

    @staticmethod
    def get_dashboard(year, quarter):
        year = int(year)      
        quarter = int(quarter)
        months = DashboardService._get_months(quarter)

        enrollments = Enrollment.objects.filter(
            created_at__year=year,
            created_at__month__in=months,
            enrollment_status=Enrollment.Status.SUCCESS,
        )

        return {
            "summary":              DashboardService._get_summary(enrollments),
            "revenue_summary":      DashboardService._get_revenue_summary(year, quarter),
            "revenue_by_quarter":   DashboardService._get_revenue_by_quarter(year),        
            "payment_status_stats": DashboardService._get_payment_status_stats(year, quarter),
        }

    @staticmethod
    def _get_summary(enrollments):
        return {
            "total_students":    User.objects.filter(groups__name="Student", is_active=True).count(),
            "total_courses":     Course.objects.filter(active=True).count(),
            "total_classes":     ClassRoom.objects.count(),
            "total_enrollments": enrollments.count(),
        }

    @staticmethod
    def _get_quarter_revenue(year, quarter):
        months = DashboardService._get_months(quarter)
        result = Payment.objects.filter(
            payment_status=Payment.Status.SUCCESS,
            created_at__year=year,
            created_at__month__in=months,
        ).aggregate(total=Sum("amount"))
        return result["total"] or 0

    @staticmethod
    def _get_revenue_summary(year, quarter):
        current = DashboardService._get_quarter_revenue(year, quarter)

        prev_year, prev_quarter = DashboardService._get_prev_quarter(year, quarter)
        prev = DashboardService._get_quarter_revenue(prev_year, prev_quarter)

        growth_rate = None if prev == 0 else round((current / prev - 1) * 100, 2)

        return {
            "total":       current,
            "prev_total":  prev,
            "growth_rate": growth_rate,
        }

    @staticmethod
    def _get_revenue_by_quarter(year):
        rows = (
            Payment.objects.filter(
                payment_status=Payment.Status.SUCCESS,
                created_at__year=year,
            )
            .annotate(quarter=ExtractQuarter("created_at"))
            .values("quarter")
            .annotate(total=Sum("amount"))
            .order_by("quarter")
        )

        revenue_map = {row["quarter"]: row["total"] for row in rows}

        return [
            {"quarter": q, "label": f"Q{q}", "total": revenue_map.get(q, 0)}
            for q in range(1, 5)
        ]

    @staticmethod
    def _get_payment_status_stats(year, quarter):
        months = DashboardService._get_months(quarter)

        rows = (
            Payment.objects.filter(
                created_at__year=year,
                created_at__month__in=months,
            )
            .values("payment_status")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        label_map = {
            Payment.Status.SUCCESS: "Thành công",
            Payment.Status.FAILED:  "Thất bại",
            Payment.Status.PENDING: "Đang xử lý",
        }

        result_map = {row["payment_status"]: row["count"] for row in rows}

        return [
            {"status": status, "label": label, "count": result_map.get(status, 0)}
            for status, label in label_map.items()
        ]