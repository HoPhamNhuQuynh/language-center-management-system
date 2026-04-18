import { useState } from "react";
import logo from "../assets/hero.png";
import ScoreEntryForm from "../components/ScoreEntryForm";
import "./ScoreEntry.css";

function ScoreEntry() {
  const [selectedClassCode, setSelectedClassCode] = useState("");
  const [selectedClassName, setSelectedClassName] = useState("");

  const [students, setStudents] = useState([
    {
      id: 1,
      fullName: "Nguyễn Văn Đạt",
      midterm: 8,
      final: 9,
      average: 8.5,
      comment: "Học tốt",
    },
    {
      id: 2,
      fullName: "Trần Ngọc Lan",
      midterm: 7,
      final: 8,
      average: 7.5,
      comment: "Cần cố gắng thêm",
    },
    {
      id: 3,
      fullName: "Lê Minh Khôi",
      midterm: "",
      final: "",
      average: "",
      comment: "",
    },
  ]);

  const classCodes = [
    { id: "tq01", name: "Mã lớp: TQ01" },
    { id: "tq02", name: "Mã lớp: TQ02" },
  ];

  const classNames = [
    { id: "lop1", name: "Tiếng Trung giao tiếp, A103" },
    { id: "lop2", name: "Tiếng Trung cơ bản, A104" },
  ];

  const calculateAverage = (midterm, final) => {
    const m = parseFloat(midterm);
    const f = parseFloat(final);
    if (isNaN(m) || isNaN(f)) return "";
    return ((m + f) / 2).toFixed(1);
  };

  const handleScoreChange = (studentId, field, value) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id !== studentId) return student;

        const updated = { ...student, [field]: value };
        updated.average = calculateAverage(
          field === "midterm" ? value : updated.midterm,
          field === "final" ? value : updated.final
        );

        return updated;
      })
    );
  };

  const handleCommentChange = (studentId, value) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, comment: value } : student
      )
    );
  };

  const handleSaveScores = () => {
    console.log("Class code:", selectedClassCode);
    console.log("Class name:", selectedClassName);
    console.log("Students:", students);
    alert("Lưu nhập điểm thành công!");
  };

  return (
    <ScoreEntryForm
      logo={logo}
      selectedClassCode={selectedClassCode}
      selectedClassName={selectedClassName}
      setSelectedClassCode={setSelectedClassCode}
      setSelectedClassName={setSelectedClassName}
      classCodes={classCodes}
      classNames={classNames}
      students={students}
      onScoreChange={handleScoreChange}
      onCommentChange={handleCommentChange}
      onSave={handleSaveScores}
    />
  );
}

export default ScoreEntry;