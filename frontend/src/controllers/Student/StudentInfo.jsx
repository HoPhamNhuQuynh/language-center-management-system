import logo from "../../assets/hero.png";
import StudentInfoForm from "../../pages/User/StudentInfoForm";
import "../../styles/StudentInfo.css";
import { useEffect, useState } from "react";
import { studentApi, updateStudentApi, updateStudentAvatarApi, myEnrollmentApi, resetPasswordApi, deleteAccountApi, myPaymentApi } from "../../services/studentService";

function StudentInfo() {
  const [userInfo, setUserInfo] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    password: "",
    confirm_password: ""
  });
  const [editData, setEditData] = useState({
    first_name: "",
    last_name: "",
    phone_num: ""
  });

  const handleChangePassword = async () => {
    if (passwordData.password !== passwordData.confirm_password) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    try {
      await resetPasswordApi({
        old_password: passwordData.old_password,
        password: passwordData.password,
      });
      alert("Đổi mật khẩu thành công!");
      setIsPasswordModalOpen(false);
      setPasswordData({ old_password: "", password: "", confirm_password: "" });
    } catch (ex) {
      const data = ex.response?.data;
      let message = "Đổi mật khẩu thất bại!";

      if (data) {
        if (data.old_password) {
          message = Array.isArray(data.old_password)
            ? data.old_password[0]
            : data.old_password;
        } else if (data.password) {
          message = Array.isArray(data.password)
            ? data.password[0]
            : data.password;
        } else if (data.non_field_errors) {
          message = Array.isArray(data.non_field_errors)
            ? data.non_field_errors[0]
            : data.non_field_errors;
        } else if (typeof data === "string") {
          message = data;
        }
      }
      alert(message);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa tài khoản?");
    if (!confirmed) return;
    try {
      await deleteAccountApi();
      alert("Tài khoản đã bị xóa.");
      window.location.href = "/login";
    } catch (ex) {
      alert("Lỗi: " + JSON.stringify(ex.response?.data));
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [user, enrollmentData, paymentData] = await Promise.all([
          studentApi(),
          myEnrollmentApi(),
          myPaymentApi(),
        ]);
        setUserInfo(user);
        setEnrollments(enrollmentData);
        setPayments(paymentData);
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
    phone: userInfo.phone_num,
  };

  const totalAmount = enrollments.reduce((sum, e) => sum + (Number(e.classroom?.course_price) || 0), 0);
  const totalPaid = payments
    .filter((p) => {
      const enrollment = enrollments.find((e) => e.id === p.enrollment);
      return enrollment?.enrollment_status === "SUCCESS";
    })
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0); 
    const remaining = totalAmount - totalPaid;

  const tuition = {
    paid: totalPaid.toLocaleString('vi-VN') + " VND",
    remaining: (remaining > 0 ? remaining.toLocaleString('vi-VN') : "0") + " VND",
  };

  const courses = enrollments.map((enrollment) => {
    const classroom = enrollment.classroom;

    const formatSchedule = (schedule) => {
      if (!schedule || schedule.length === 0) return "Chưa có lịch học";
      const dayMap = {
        0: "Thứ Hai", 1: "Thứ Ba", 2: "Thứ Tư",
        3: "Thứ Năm", 4: "Thứ Sáu", 5: "Thứ Bảy", 6: "Chủ Nhật",
      };
      return schedule.map(s => {
        const day = dayMap[s.day_of_week] || "---";
        return `${day} ${s.start_time.slice(0, 5)} - ${s.end_time.slice(0, 5)}`;
      }).join(", ");
    };

    const teacher = classroom?.main_teacher
      ? `${classroom.main_teacher.first_name} ${classroom.main_teacher.last_name}`
      : "đang cập nhật";

    return {
      id: enrollment.id,
      enrollmentId: enrollment.id,
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
      phone_num: userInfo.phone_num || "",
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
    const payload = {
      first_name: editData.first_name,
      last_name: editData.last_name,
      email: editData.email,
      phone_num: editData.phone_num
    };

    try {
      const res = await updateStudentApi(payload);

      if (res) {
        setUserInfo(res);
        setIsModalOpen(false);
        alert("Cập nhật thành công!");
      }
    } catch (ex) {
      console.error("❌ LỖI API:");
      console.error("- Status:", ex.response?.status);
      console.error("- Data lỗi:", JSON.stringify(ex.response?.data, null, 2));
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
      isPasswordModalOpen={isPasswordModalOpen}
      setIsPasswordModalOpen={setIsPasswordModalOpen}
      passwordData={passwordData}
      setPasswordData={setPasswordData}
      onChangePassword={handleChangePassword}
      onDeleteAccount={handleDeleteAccount}
    />
  );
}

export default StudentInfo;