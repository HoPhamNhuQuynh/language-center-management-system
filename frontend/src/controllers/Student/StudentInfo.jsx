import logo from "../../assets/hero.png";
import StudentInfoForm from "../../pages/User/StudentInfoForm";
import "../../styles/StudentInfo.css";
import { useEffect, useState } from "react";
import { studentApi, updateStudentApi, updateStudentAvatarApi, myEnrollmentApi } from "../../services/studentService";

function StudentInfo() {
  const [userInfo, setUserInfo] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    first_name: "",
    last_name: "",
    phone_num: ""
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [user, enrollmentData] = await Promise.all([
          studentApi(),
          myEnrollmentApi(),
        ]);
        setUserInfo(user);
        setEnrollments(enrollmentData);
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

  const totalAmount = enrollments.reduce((sum, e) => sum + (Number(e.classroom?.course_price) || 0), 0);
  const totalPaid = enrollments.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const remaining = totalAmount - totalPaid;

  const tuition = {
    paid: totalPaid.toLocaleString('vi-VN') + " VND",
    remaining: (remaining > 0 ? remaining.toLocaleString('vi-VN') : "0") + " VND",
  };

  const courses = enrollments.map((enrollment) => {
    const classroom = enrollment.classroom;

    const formatSchedule = (schedule) => {
      if (!schedule || schedule.length === 0) return "Chưa có lịch học";
      return schedule.map(s => {
        const day = s.day_of_week === 8 ? "Chủ nhật" : `Thứ ${s.day_of_week}`;
        return `${day} ${s.start_time.slice(0, 5)} - ${s.end_time.slice(0, 5)}`;
      }).join(", ");
    };

    const teacher = classroom?.main_teacher
      ? `${classroom.main_teacher.first_name} ${classroom.main_teacher.last_name}`
      : "đang cập nhật";

    return {
      id: enrollment.id,
      classId: classroom?.id || "---",
      className: classroom?.name || "---",
      schedule: formatSchedule(classroom?.schedules),
      teacher: teacher,
      price: classroom?.course_price || 0,
      status: enrollment.enrollment_status || "---",
    };
  });

  const openEditModal = () => {
    setEditData({
      first_name: userInfo.first_name || "",
      last_name: userInfo.last_name || "",
      phone_num: userInfo.profile?.phone_num || "",
      email: userInfo.email || "",
    });
    setIsModalOpen(true);
  };

  const handleAvatarChange = async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      await updateStudentAvatarApi(formData);
      const fresh = await studentApi();
      setUserInfo(fresh);
    } catch (ex) {
      alert("Lỗi upload avatar: " + (ex.response?.data?.detail || "Check console"));
    }
  };

  const handleSaveProfile = async () => {
    console.log("1. State hiện tại (editData):", editData);

    const payload = {
      first_name: editData.first_name,
      last_name: editData.last_name,
      email: editData.email,
      profile: {
        phone_num: editData.phone_num
      }
    };

    console.log("2. Payload gửi đi (Check cấu trúc profile):", JSON.stringify(payload, null, 2));

    try {
      const res = await updateStudentApi(payload);

      console.log("3. Server phản hồi (Response):", res);

      if (res) {
        console.log("4. Kiểm tra tên trong Response:", res.first_name, res.last_name);

        setUserInfo(res);
        setIsModalOpen(false);
        alert("Cập nhật thành công! Check Console để xem dữ liệu mới nhen babi.");
      }
    } catch (ex) {
      console.error("❌ LỖI API:");
      console.error("- Status:", ex.response?.status);
      console.error("- Data lỗi:", JSON.stringify(ex.response?.data, null, 2)); // ← đổi thành JSON.stringify
      alert("Lỗi: " + JSON.stringify(ex.response?.data));
    }
  };

  return (
    <StudentInfoForm
      logo={logo}
      user={userInfo}
      studentProfile={studentProfile}
      tuition={tuition}
      courses={courses}
      isModalOpen={isModalOpen}
      editData={editData}
      setEditData={setEditData}
      onOpenModal={openEditModal}
      onSave={handleSaveProfile}
      setIsOpen={setIsModalOpen}
      onAvatarChange={handleAvatarChange}
    />
  );
}

export default StudentInfo;