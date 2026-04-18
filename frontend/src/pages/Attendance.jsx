import { useState } from "react";
import logo from "../assets/hero.png";
import AttendanceForm from "../components/AttendanceForm";
import "./Attendance.css";

function Attendance() {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

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

  const classes = [
    { id: "class1", name: "Chọn lớp học" },
    { id: "class2", name: "English Giao tiếp 01" },
    { id: "class3", name: "English Giao tiếp 02" },
  ];

  const dates = [
    { id: "date1", name: "Hôm nay, 18/03/2026" },
    { id: "date2", name: "19/03/2026" },
    { id: "date3", name: "20/03/2026" },
  ];

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
    console.log("Class:", selectedClass);
    console.log("Date:", selectedDate);
    console.log("Attendance data:", students);
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