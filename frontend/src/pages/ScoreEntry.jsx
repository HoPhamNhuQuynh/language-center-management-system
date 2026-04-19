import { useEffect, useMemo, useState } from "react";
import logo from "../assets/hero.png";
import ScoreEntryForm from "../components/ScoreEntryForm";
import "./ScoreEntry.css";

function ScoreEntry() {
  const [selectedClass, setSelectedClass] = useState("TQ01");
  const [selectedCourse, setSelectedCourse] = useState("Tiếng Trung giao tiếp, A103");

  const classes = ["TQ01", "TQ02", "TANC1"];
  const courses = [
    "Tiếng Trung giao tiếp, A103",
    "Tiếng Anh giao tiếp, A101",
    "Tiếng Hàn sơ cấp, A105",
  ];

  const defaultRows = useMemo(
    () => [
      {
        id: 1,
        fullName: "Nguyễn Văn Đạt",
        midterm: "8",
        final: "9",
        average: "8.5",
        remark: "Học tốt",
      },
      {
        id: 2,
        fullName: "Trần Ngọc Lan",
        midterm: "7",
        final: "8",
        average: "7.5",
        remark: "Cần cố gắng thêm",
      },
      {
        id: 3,
        fullName: "Lê Minh Khôi",
        midterm: "",
        final: "",
        average: "",
        remark: "",
      },
    ],
    []
  );

  const [scoreRows, setScoreRows] = useState(defaultRows);

  const draftKey = `score_draft_${selectedClass}`;

  const calculateAverage = (midterm, final) => {
    const mid = Number(midterm);
    const fin = Number(final);

    if (Number.isNaN(mid) || Number.isNaN(fin) || midterm === "" || final === "") {
      return "";
    }

    return ((mid + fin) / 2).toFixed(1);
  };

  const generateRemark = (average) => {
    const avg = Number(average);
    if (Number.isNaN(avg)) return "";
    if (avg >= 8) return "Học tốt";
    if (avg >= 6.5) return "Khá";
    if (avg >= 5) return "Đạt";
    return "Cần cố gắng thêm";
  };

  useEffect(() => {
    const savedDraft = localStorage.getItem(draftKey);

    if (savedDraft) {
      try {
        setScoreRows(JSON.parse(savedDraft));
      } catch {
        setScoreRows(defaultRows);
      }
    } else {
      setScoreRows(defaultRows);
    }
  }, [draftKey, defaultRows]);

  useEffect(() => {
    localStorage.setItem(draftKey, JSON.stringify(scoreRows));
  }, [draftKey, scoreRows]);

  const handleScoreChange = (studentId, field, value) => {
    if (value !== "" && (Number(value) < 0 || Number(value) > 10)) return;

    setScoreRows((prev) =>
      prev.map((student) => {
        if (student.id !== studentId) return student;

        const updated = {
          ...student,
          [field]: value,
        };

        const average = calculateAverage(updated.midterm, updated.final);

        return {
          ...updated,
          average,
          remark: average ? generateRemark(average) : "",
        };
      })
    );
  };

  const handleTemporarySave = () => {
    localStorage.setItem(draftKey, JSON.stringify(scoreRows));
    alert("Đã lưu tạm!");
  };

  const handleSubmit = () => {
    console.log({
      selectedClass,
      selectedCourse,
      scoreRows,
    });

    alert("Đã lưu nhập điểm!");
    localStorage.removeItem(draftKey);
  };

  return (
    <ScoreEntryForm
      logo={logo}
      selectedClass={selectedClass}
      setSelectedClass={setSelectedClass}
      selectedCourse={selectedCourse}
      setSelectedCourse={setSelectedCourse}
      classes={classes}
      courses={courses}
      scoreRows={scoreRows}
      onScoreChange={handleScoreChange}
      onTemporarySave={handleTemporarySave}
      onSubmit={handleSubmit}
    />
  );
}

export default ScoreEntry;