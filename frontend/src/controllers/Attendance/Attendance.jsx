import { useState, useEffect } from "react";
import AttendanceForm from "../../pages/Attendance/AttendanceForm";
import "../../styles/Attendance.css";
import {
  getSessionsApi,
  getAttendancesApi,
  bulkSyncAttendancesApi,
} from "../../services/attendanceService";
import { loadClassesApi } from "../../services/scoreService";

const STATUS_BE_TO_FE = {
  PRESENT: "Có mặt",
  ABSENT: "Vắng",
  LATE: "Trễ",
};
const STATUS_FE_TO_BE = {
  "Có mặt": "PRESENT",
  Vắng: "ABSENT",
  Trễ: "LATE",
};

function Attendance() {
  const [classes, setClasses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSession, setSelectedSession] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [canAttendance, setCanAttendance] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await loadClassesApi();
        setClasses(res.results);
      } catch (err) {
        console.error(err);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    setSessions([]);
    setStudents([]);
    setSelectedSession("");

    const fetchSessions = async () => {
      try {
        const res = await getSessionsApi(selectedClass);
        setSessions(res);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSessions();
  }, [selectedClass]);

  useEffect(() => {
    if (!selectedSession) return;
    setStudents([]);

    const fetchAttendances = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getAttendancesApi(selectedSession);

        setCanAttendance(res.can_attendance); // ← nhận trạng thái

        const rows = res.attendances.map((a) => ({
          enrollmentId: a.enrollment_id,
          fullName: a.student_name,
          studentCode: a.student_code,
          status: STATUS_BE_TO_FE[a.attendance_status] ?? "Vắng",
          note: a.note ?? "",
        }));
        setStudents(rows);
      } catch (err) {
        setError("Không thể tải danh sách điểm danh.");
      } finally {
        setLoading(false);
      }
    };
    fetchAttendances();
  }, [selectedSession]);

  const handleClassChange = (classId) => {
    setSelectedClass(classId);
    setSelectedSession("");
    setStudents([]); 
    setSessions([]);
  };

  const handleSessionChange = (sessionId) => {
    setSelectedSession(sessionId);
    setCanAttendance(true); 
  };

  const handleStatusChange = (enrollmentId, newStatus) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.enrollmentId === enrollmentId ? { ...s, status: newStatus } : s,
      ),
    );
  };

  const handleNoteChange = (enrollmentId, newNote) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.enrollmentId === enrollmentId ? { ...s, note: newNote } : s,
      ),
    );
  };

  const handleSubmit = async () => {
    if (!selectedClass || !selectedSession) {
      alert("Vui lòng chọn lớp và buổi học.");
      return;
    }

    try {
      const payload = {
        session_id: parseInt(selectedSession),
        attendances: students.map((s) => ({
          enrollment_id: s.enrollmentId,
          attendance_status: STATUS_FE_TO_BE[s.status],
          note: s.note ?? "",
        })),
      };

      await bulkSyncAttendancesApi(selectedClass, payload);
      alert("Điểm danh thành công!");
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.[0] ||
        "Điểm danh thất bại, vui lòng thử lại.";
      alert(errorMsg);
      console.error(err);
    }
  };

  return (
    <AttendanceForm
      classes={classes}
      sessions={sessions}
      students={students}
      selectedClass={selectedClass}
      selectedSession={selectedSession}
      onClassChange={handleClassChange}
      onSessionChange={handleSessionChange}
      onStatusChange={handleStatusChange}
      onNoteChange={handleNoteChange}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      canAttendance={canAttendance}
    />
  );
}

export default Attendance;
