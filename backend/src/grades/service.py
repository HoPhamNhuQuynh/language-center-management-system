from django.db import transaction
from django.forms import ValidationError
from .models import Score, Attendance
from enrollments.models import Enrollment

class ScoreService:
    @staticmethod
    @transaction.atomic
    def bulk_sync_scores(classroom, scores_date):
        valid_enrollment_ids = set(
                                    Enrollment.objects.filter(
                                        classroom=classroom,
                                        enrollment_status=Enrollment.Status.SUCCESS
                                    ).values_list('id', flat=True)
                                )
        existings = {
            (s.enrollment_id, s.score_type_id): s
            for s in Score.objects.filter(enrollment__classroom=classroom)
        }

        to_update = []
        to_create = []

        for item in scores_date:
            enrollment_id = item["enrollment_id"]
            score_type_id = item["score_type_id"]
            value = item["score_value"]

            if enrollment_id not in valid_enrollment_ids:
                continue

            key = (enrollment_id, score_type_id)
            if key in existings:
                obj = existings[key]
                if obj.score_value != value:
                    obj.score_value = value
                    to_update.append(obj)
            else:
                to_create.append(Score(enrollment_id=enrollment_id, score_type_id=score_type_id, score_value=value))

        if to_update:
            Score.objects.bulk_update(to_update, ["score_value"])

        if to_create:
            Score.objects.bulk_create(to_create)

        return {
            "updated": len(to_update),
            "created": len(to_create)
        }
    

class AttendanceService:
    @staticmethod
    def get_attendances_list(session):
        classroom = session.schedule.classroom

        enrollments = Enrollment.objects.filter(
            classroom=classroom
        ).select_related('student')

        attendances = Attendance.objects.filter(
            session=session,
            enrollment__enrollment_status=Enrollment.Status.SUCCESS
        )

        attendance_map = {
            a.enrollment_id: a
            for a in attendances
        }

        result = []

        DEFAULT_STATUS = Attendance.Status.ABSENT

        for e in enrollments:
            att = attendance_map.get(e.id)

            result.append({
                'enrollment_id': e.id,
                'student_name': f'{e.student.first_name} {e.student.last_name}',
                'attendance_status': (att.attendance_status if att else DEFAULT_STATUS),
                'note': att.note if att else ""
            })

        return result
    

    @staticmethod
    @transaction.atomic
    def bulk_sync_attendances(session, attendances_data):

        classroom = session.schedule.classroom

        valid_enrollment_ids = set(
            Enrollment.objects.filter(
                classroom=classroom,
                enrollment_status=Enrollment.Status.SUCCESS
            ).values_list('id', flat=True)
        )

        existings = {
            a.enrollment_id: a
            for a in Attendance.objects.filter(session=session)
        }

        to_create = []
        to_update = []
        
        for item in attendances_data:
            enrollment_id = item['enrollment_id']
            if enrollment_id not in valid_enrollment_ids:
                raise ValidationError(
                    f"Enrollment {enrollment_id} không thuộc lớp này hoặc không tồn tại"
                )
            
            status = item['attendance_status']
            if status not in Attendance.Status.values:
                raise ValidationError(f"Trạng thái '{status}' không hợp lệ")
            
            note = item.get('note', "")

            if enrollment_id in existings:
                obj = existings[enrollment_id]
                if obj.attendance_status != status or obj.note != note:
                    obj.attendance_status = status
                    obj.note = note
                    to_update.append(obj)
            else:
                to_create.append(
                    Attendance(
                        enrollment_id=enrollment_id,
                        session=session,
                        attendance_status=status,
                        note=note
                    )
                )
        if to_create:
            Attendance.objects.bulk_create(to_create)
        
        if to_update:
            Attendance.objects.bulk_update(to_update, ['attendance_status', 'note'])

        return {
            "created": len(to_create),
            "updated": len(to_update)
        }
