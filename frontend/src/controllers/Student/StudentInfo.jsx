import logo from "../../assets/hero.png";
import StudentInfoForm from "../../pages/User/StudentInfoForm";
import "../../styles/StudentInfo.css";
import { useEffect, useState } from "react";
import Apis, { endpoints } from "../../services/Apis";

function StudentInfo() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await Apis.get(endpoints['profile']);
        setUserInfo(res.data);
        console.log("User info loaded:", res.data);
      } catch (ex) {
        console.error("Failed to load profile:", ex);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!userInfo) {
    return <div>Failed to load user information.</div>;
  }

  const studentProfile = {
    fullName: userInfo.first_name + " " + userInfo.last_name,
    email: userInfo.email,
    phone: userInfo.profile?.phone_num,
  };

  const totalAmount = userInfo.enrollments?.reduce((sum, enrollment) => {
    return sum + (Number(enrollment.classroom?.course_price) || 0);
  }, 0) || 0;

  const totalPaid = userInfo.enrollments?.reduce((total, enrollment) => {
    return total + (Number(enrollment.amount) || 0);
  }, 0) || 0;

  const remaining = totalAmount - totalPaid;

  const tuition = {
    paid: totalPaid.toLocaleString('vi-VN') + " VND",
    remaining:  (remaining > 0 ? remaining.toLocaleString('vi-VN') : "0") + " VND",
  };

  const courses = userInfo.enrollments?.map((enrollment) => {
    const classroom = enrollment.classroom;

    const formatSchedule = (schedule) => {
      if (!schedule || schedule.length === 0) return "Chưa có lịch học";
      return schedule.map(s => {
        const day = s.day_of_week === 8 ? "Chủ nhật" : `Thứ ${s.day_of_week}`;
        return `${day} ${s.start_time.slice(0, 5)} - ${s.end_time.slice(0, 5)}`;
      }).join(", ");
    };

    const teacher = classroom?.main_teacher 
    ? `${classroom.main_teacher.first_name} ${classroom.main_teacher.last_name}` : "đang cập nhật";

    return {
      id: enrollment.id,
      classId: classroom?.id || "---",
      className: classroom?.name || "---",
      schedule: formatSchedule(classroom?.schedules),
      teacher: teacher,
      price: classroom?.course_price || 0,
      status: enrollment.enrollment_status || "---",
    };
  }) || [];

  return (
    <StudentInfoForm
      logo={logo}
      user={userInfo}
      studentProfile={studentProfile}
      tuition={tuition}
      courses={courses}
    />
  );
}

export default StudentInfo;