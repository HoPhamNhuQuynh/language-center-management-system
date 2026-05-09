from rest_framework import serializers
from classes.models import ClassRoom, TeachingAssignment, Session, Room
from django.db import transaction
from users.models import User
from users.serializers import UserSerializer
from classes.models import Schedule
from datetime import timedelta
from grades.models import Attendance

DAY_NAMES = {
    0: "Thứ 2",
    1: "Thứ 3",
    2: "Thứ 4",
    3: "Thứ 5",
    4: "Thứ 6",
    5: "Thứ 7",
    6: "Chủ nhật",
}


class TeachingAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeachingAssignment
        fields = "__all__"


class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = "__all__"
        extra_kwargs = {"classroom": {"required": False}}

    def validate(self, data):
        start_time = data.get("start_time")
        end_time = data.get("end_time")

        if end_time and start_time and end_time <= start_time:
            raise serializers.ValidationError("Giờ kết thúc phải sau giờ bắt đầu.")

        return data


class ClassRoomSerializer(serializers.ModelSerializer):
    active = serializers.ReadOnlyField(source="is_auto_active")
    main_teacher_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True, required=False
    )
    remaining_slots = serializers.SerializerMethodField()
    schedules = ScheduleSerializer(many=True, read_only=True, source="schedule_set")
    course_price = serializers.ReadOnlyField(source="course.price")
    schedules_input = ScheduleSerializer(many=True, write_only=True, required=False)

    class Meta:
        model = ClassRoom
        fields = [
            "id",
            "name",
            "course",
            "start_date",
            "end_date",
            "main_teacher_id",
            "active",
            "remaining_slots",
            "schedules",
            "course_price",
            "capacity",
            "schedules_input",
        ]

    def get_remaining_slots(self, classroom):
        enrolled = classroom.enrollment_set.count()
        return classroom.capacity - enrolled

    def to_representation(self, classroom):
        data = super().to_representation(classroom)

        data['course_id'] = classroom.course.id
        data['course_name'] = classroom.course.name
        data['course_level'] = classroom.course.level.name if classroom.course.level else None  


        assignment = next(
            (a for a in classroom.teachingassignment_set.all() if a.is_main), None
        )
        data["main_teacher"] = (
            UserSerializer(assignment.teacher).data if assignment else None
        )
        return data

    def validate_capacity(self, capacity):
        if capacity < 10 or capacity > 50:
            raise serializers.ValidationError("Sĩ số lớp học không hợp lệ.")
        return capacity

    def validate(self, data):
        start_date = data.get("start_date")
        end_date = data.get("end_date")
        schedules = data.get("schedules_input", [])
        course = data.get("course")

        if start_date and end_date and end_date <= start_date:
            raise serializers.ValidationError(
                "Ngày kết thúc phải lớn hơn ngày bắt đầu."
            )
        
        if start_date and end_date and schedules and course:
            # Đếm số sessions sẽ được sinh ra
            selected_days = [s["day_of_week"] for s in schedules]
            count = 0
            current = start_date
            while current <= end_date:
                if current.weekday() in selected_days:
                    count += 1
                current += timedelta(days=1)

            planned = course.total_sessions
            if abs(count - planned) > 2:
                suggested_end = start_date
                sessions_counted = 0
                while sessions_counted < planned:
                    if suggested_end.weekday() in selected_days:
                        sessions_counted += 1
                    suggested_end += timedelta(days=1)
                suggested_end -= timedelta(days=1)
                raise serializers.ValidationError(
                    f"Với lịch học đã chọn, khoảng thời gian này sẽ tạo ra {count} buổi "
                    f"nhưng khóa học yêu cầu {planned} buổi. "
                    f"Gợi ý ngày kết thúc: {suggested_end.strftime('%d/%m/%Y')}."
                )
        
        for s in schedules:
            room = s.get("room")
            day_of_week = s.get("day_of_week")
            start_time = s.get("start_time")
            end_time = s.get("end_time")

            current_classroom = self.instance

            qs = Schedule.objects.filter(
                room=room,
                day_of_week=day_of_week,
                start_time__lt=end_time,
                end_time__gt=start_time,
            )
            if current_classroom:
                qs = qs.exclude(classroom=current_classroom)

            if qs.exists():
                conflicting = qs.first()
                raise serializers.ValidationError(
                    f"Phòng {room.name} đã bị trùng lịch vào {DAY_NAMES[day_of_week]} "
                    f"({start_time.strftime('%H:%M')}-{end_time.strftime('%H:%M')}) "
                    f'với lớp "{conflicting.classroom.name}".'
                )

        return data

    def create(self, validated_data):
        main_teacher = validated_data.pop("main_teacher_id", None)
        schedules_data = validated_data.pop("schedules_input", [])

        with transaction.atomic():
            classroom = ClassRoom.objects.create(**validated_data)

            if main_teacher:
                TeachingAssignment.objects.create(
                    teacher=main_teacher, classroom=classroom, is_main=True
                )

            for s in schedules_data:
                s.pop("classroom", None)
                Schedule.objects.create(classroom=classroom, **s)

            if schedules_data:
                classroom.generate_sessions_from_schedules()  # sinh sessions tu dong
        return classroom

    def update(self, instance, validated_data):
        main_teacher = validated_data.pop("main_teacher_id", None)
        schedules_data = validated_data.pop("schedules_input", None)
        instance = super().update(instance, validated_data)

        if main_teacher:
            with transaction.atomic():
                TeachingAssignment.objects.filter(
                    classroom=instance, is_main=True
                ).update(is_main=False)
                TeachingAssignment.objects.update_or_create(
                    classroom=instance, teacher=main_teacher, defaults={"is_main": True}
                )

        if schedules_data is not None:
            with transaction.atomic():
                has_attendance = Attendance.objects.filter(
                    session__schedule__classroom=instance
                ).exists()

                if has_attendance:
                    raise serializers.ValidationError(
                        "Không thể thay đổi lịch học vì đã có dữ liệu điểm danh."
                    )

                Session.objects.filter(schedule__classroom=instance).delete()
                instance.schedule_set.all().delete()

                for s in schedules_data:
                    s.pop("classroom", None)
                    Schedule.objects.create(classroom=instance, **s)

                instance.generate_sessions_from_schedules()
        return instance


class ClassRoomDetailSerializer(ClassRoomSerializer):
    active = serializers.ReadOnlyField(source="is_auto_active")
    total_sessions = serializers.IntegerField(source='course.total_sessions', read_only=True)

    class Meta:
        model = ClassRoomSerializer.Meta.model
        fields = ClassRoomSerializer.Meta.fields + [
            "created_at",
            "grade_deadline",
            "grade_status",
            "total_sessions"
        ]


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ["id", "name", "capacity"]

    def validate_capacity(self, capacity):
        if capacity < 0 or capacity > 100:
            raise serializers.ValidationError("Sức chứa phòng học không hợp lệ.")
        return capacity


class SessionSerializer(serializers.ModelSerializer):
    schedule = serializers.PrimaryKeyRelatedField(
        queryset=Schedule.objects.all(), write_only=True, required=False
    )
    classroom_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Session
        fields = [
            "id",
            "date",
            "start_time",
            "end_time",
            "user",
            "room",
            "schedule",
            "classroom_id",
        ]

    def validate(self, data):
        end_time = data.get("end_time")
        start_time = data.get("start_time")
        room = data.get("room")
        date = data.get("date")

        if end_time and start_time and end_time <= start_time:
            raise serializers.ValidationError(
                {"end_time": "Giờ kết thúc phải lớn hơn giờ bắt đầu."}
            )
        
        if room and date and start_time and end_time:
            qs = Session.objects.filter(
                room=room,
                date=date,
                start_time__lt=end_time,
                end_time__gt=start_time,
            )
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)

            if qs.exists():
                conflicting = qs.first()
                raise serializers.ValidationError(
                    f"Phòng {room.name} đã bị trùng lịch vào ngày {date} "
                    f"({start_time.strftime('%H:%M')}-{end_time.strftime('%H:%M')}) "
                    f"với buổi học của lớp \"{conflicting.schedule.classroom.name}\"."
                )
        
        if self.instance:
            classroom = self.instance.schedule.classroom
        else:
            classroom_id = data.get("classroom_id")
            classroom = ClassRoom.objects.filter(id=classroom_id).first()

        if classroom is None:
            return data

        actual = Session.objects.filter(schedule__classroom=classroom).count()

        if self.instance:
            actual -= 1

        planned = classroom.course.total_sessions

        if actual >= planned:
            raise serializers.ValidationError(
                f"Đã đủ {planned} buổi theo kế hoạch của lớp, không thể thêm buổi mới."
            )

        return data
    
    def create(self, validated_data):
        validated_data.pop("classroom_id", None)
        return super().create(validated_data)

    def to_representation(self, session):
        data = super().to_representation(session)
        if session.user:
            data["teacher_fullname"] = (
                f"{session.user.last_name} {session.user.first_name}"
            )
        else:
            data["teacher_fullname"] = None
        data["room"] = RoomSerializer(session.room).data if session.room else None
        data["classroom_name"] = session.schedule.classroom.name
        data["day_of_week"] = session.schedule.day_of_week
        data["classroom_start_date"] = session.schedule.classroom.start_date
        data["classroom_end_date"] = session.schedule.classroom.end_date

        request = self.context.get("request")
        if (
            request
            and request.user
            and request.user.is_authenticated
            and request.user.is_admin
        ):
            data["created_at"] = session.created_at
            data["active"] = session.active

        return data
