from django.db.models import Count, Sum
from courses.models import Course
from classes.models import ClassRoom
from grades.models import AcademicResult
from enrollments.models import Enrollment, Payment
from datetime import datetime
import pytz
from users.models import User
from django.db.models.functions import ExtractQuarter


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
        tz = pytz.timezone("Asia/Ho_Chi_Minh")

        start = tz.localize(datetime(year, months[0], 1))
        last_month = months[-1]
        if last_month == 12:
            end = tz.localize(datetime(year + 1, 1, 1))
        else:
            end = tz.localize(datetime(year, last_month + 1, 1))

        enrollments = Enrollment.objects.filter(
            created_at__gte=start,
            created_at__lt=end,
            enrollment_status=Enrollment.Status.SUCCESS,
        )
        print(enrollments.query)

        return {
            "summary": DashboardService._get_summary(enrollments),
            "revenue_summary": DashboardService._get_revenue_summary(year, quarter),
            "revenue_by_quarter": DashboardService._get_revenue_by_quarter(year),
            "payment_status_stats": DashboardService._get_payment_status_stats(
                year, quarter
            ),
            "pass_rate_stats": DashboardService._get_pass_rate_stats(year, quarter),
        }

    @staticmethod
    def _get_summary(enrollments):
        return {
            "total_students": User.objects.filter(
                groups__name="Student", is_active=True
            ).count(),
            "total_courses": Course.objects.filter(active=True).count(),
            "total_classes": ClassRoom.objects.filter(active=True).count(),
            "total_enrollments": enrollments.count(),
        }

    @staticmethod
    def _get_quarter_revenue(year, quarter):
        tz = pytz.timezone("Asia/Ho_Chi_Minh")
        months = DashboardService._get_months(quarter)
        last_month = months[-1]

        start = tz.localize(datetime(year, months[0], 1))
        end = tz.localize(
            datetime(year + 1, 1, 1)
            if last_month == 12
            else datetime(year, last_month + 1, 1)
        )

        result = Payment.objects.filter(
            payment_status=Payment.Status.SUCCESS,
            created_at__gte=start,
            created_at__lt=end,
        ).aggregate(total=Sum("amount"))

        return result["total"] or 0

    @staticmethod
    def _get_revenue_summary(year, quarter):
        current = DashboardService._get_quarter_revenue(year, quarter)

        prev_year, prev_quarter = DashboardService._get_prev_quarter(year, quarter)
        prev = DashboardService._get_quarter_revenue(prev_year, prev_quarter)

        growth_rate = None if prev == 0 else round((current / prev - 1) * 100, 2)

        return {
            "total": current,
            "prev_total": prev,
            "growth_rate": growth_rate,
        }

    @staticmethod
    def _get_revenue_by_quarter(year):
        tz = pytz.timezone("Asia/Ho_Chi_Minh")

        revenue_map = {}
        for q in range(1, 5):
            months = DashboardService._get_months(q)
            last_month = months[-1]
            start = tz.localize(datetime(year, months[0], 1))
            end = tz.localize(
                datetime(year + 1, 1, 1)
                if last_month == 12
                else datetime(year, last_month + 1, 1)
            )
            result = Payment.objects.filter(
                payment_status=Payment.Status.SUCCESS,
                created_at__gte=start,
                created_at__lt=end,
            ).aggregate(total=Sum("amount"))
            revenue_map[q] = result["total"] or 0

        return [
            {"quarter": q, "label": f"Q{q}", "total": revenue_map[q]}
            for q in range(1, 5)
        ]

    @staticmethod
    def _get_payment_status_stats(year, quarter):
        tz = pytz.timezone("Asia/Ho_Chi_Minh")

        months = DashboardService._get_months(quarter)
        last_month = months[-1]

        start = tz.localize(datetime(year, months[0], 1))
        end = tz.localize(
            datetime(year + 1, 1, 1)
            if last_month == 12
            else datetime(year, last_month + 1, 1)
        )

        rows = (
            Payment.objects.filter(
                created_at__gte=start,
                created_at__lt=end,
            )
            .values("payment_status")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        label_map = {
            Payment.Status.SUCCESS: "Thành công",
            Payment.Status.FAILED: "Thất bại",
            Payment.Status.PENDING: "Đang xử lý",
        }

        result_map = {row["payment_status"]: row["count"] for row in rows}
        return [
            {"status": status, "label": label, "count": result_map.get(status, 0)}
            for status, label in label_map.items()
        ]
    
    @staticmethod
    def _get_pass_rate_stats(year, quarter):
        tz = pytz.timezone("Asia/Ho_Chi_Minh")
        months = DashboardService._get_months(quarter)
        last_month = months[-1]
        start = tz.localize(datetime(year, months[0], 1))
        end = tz.localize(
            datetime(year + 1, 1, 1)
            if last_month == 12
            else datetime(year, last_month + 1, 1)
        )

        results = AcademicResult.objects.filter(
            active=True,
            created_at__gte=start,
            created_at__lt=end,
        )

        total = results.count()
        passed = results.filter(average_score__gte=5.0).count()
        failed = total - passed

        return {
            "total": total,
            "passed": passed,
            "failed": failed,
            "pass_rate": round((passed / total) * 100, 1) if total > 0 else 0,
        }
