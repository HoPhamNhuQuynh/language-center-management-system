import { useState } from "react";
import logo from "../../assets/hero.png";
import AttendanceForm from "../../pages/Attendance/AttendanceForm";
import "../../styles/Attendance.css";

function Attendance() {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState("18/03/2026");

  const [students, setStudents] = useState([
    {
      id: 1,
      fullName: "Nguyễn Văn Đạt",
      status: "Có mặt",
      note: "",
    },
    {
      id: 2,
      fullName: "Trần Ngọc Lan",
      status: "Vắng",
      note: "Xin phép",
    },
    {
      id: 3,
      fullName: "Lê Minh Khôi",
      status: "Trễ",
      note: "",
    },
  ]);

  const classes = ["English Giao tiếp 01", "English Giao tiếp 02"];

  const dates = ["18/03/2026", "19/03/2026", "20/03/2026"];

  const handleStatusChange = (studentId, newStatus) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, status: newStatus } : student
      )
    );
  };

  const handleNoteChange = (studentId, newNote) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, note: newNote } : student
      )
    );
  };

  const handleSubmit = () => {
    console.log("Lớp:", selectedClass);
    console.log("Ngày:", selectedDate);
    console.log("Dữ liệu điểm danh:", students);
    alert("Hoàn tất điểm danh!");
  };

  return (
    <AttendanceForm
      logo={logo}
      selectedClass={selectedClass}
      selectedDate={selectedDate}
      setSelectedClass={setSelectedClass}
      setSelectedDate={setSelectedDate}
      classes={classes}
      dates={dates}
      students={students}
      onStatusChange={handleStatusChange}
      onNoteChange={handleNoteChange}
      onSubmit={handleSubmit}
    />
  );
}

export default Attendance;