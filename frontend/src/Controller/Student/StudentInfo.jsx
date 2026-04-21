import logo from "../../assets/hero.png";
import StudentInfoForm from "../../components/forms/StudentInfoForm";
import "./StudentInfo.css";

function StudentInfo() {
  const user = {
    username: "MinhKhoi123",
    id: "123456789",
  };

  const studentProfile = {
    fullName: "Lê Minh Khôi",
    phone: "0909878322",
    email: "leminhkhoi@123gmail.com",
  };

  const tuition = {
    paid: "8.500.000 vnđ",
    remaining: "500.000 vnđ",
  };

  const courses = [
    {
      id: 1,
      classCode: "TQ01",
      className: "Tiếng Trung giao tiếp",
      schedule: "T3,T5,T7 - 18H-20H",
      teacher: "QiuYin",
      status: "Đang học",
    },
    {
      id: 2,
      classCode: "TANC1",
      className: "Tiếng Anh nâng cao",
      schedule: "T2,T4,T6 - 18H-20H",
      teacher: "Thanh Lan",
      status: "Đang học",
    },
  ];

  return (
    <StudentInfoForm
      logo={logo}
      user={user}
      studentProfile={studentProfile}
      tuition={tuition}
      courses={courses}
    />
  );
}

export default StudentInfo;