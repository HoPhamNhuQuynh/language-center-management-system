import { useEffect, useState } from "react";
import { myScheduleApi } from "../../services/studentService";
import ScheduleForm from "../../pages/Schedule/ScheduleForm";
import { getRole } from "../../utils/token";
import "../../styles/Schedule.css";

function Schedule() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const role = getRole();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await myScheduleApi();
        setSessions(res);
      } catch (ex) {
        console.error("Failed to load schedule:", ex);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const dayMap = {
    2: "Thứ Hai", 3: "Thứ Ba", 4: "Thứ Tư",
    5: "Thứ Năm", 6: "Thứ Sáu", 7: "Thứ Bảy", 8: "Chủ Nhật",
  };

  const startDate = sessions[0]?.classroom_start_date || null;
  const endDate = sessions[0]?.classroom_end_date || null;

  const totalWeeks = startDate && endDate
    ? Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24 * 7))
    : 10;

  const getCurrentWeek = (startDateStr) => {
    if (!startDateStr) return 1;
    const start = new Date(startDateStr);
    const today = new Date();
    const diffDays = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    return Math.max(1, Math.floor(diffDays / 7) + 1);
  };

  const getWeekDates = (startDateStr, weekNumber) => {
    const [y, mo, d] = startDateStr.split('-').map(Number);
    const weekStart = new Date(y, mo - 1, d + (weekNumber - 1) * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(y, mo - 1, d + (weekNumber - 1) * 7 + i);
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      return `${dd}/${mm}`;
    });
  };

  useEffect(() => {
    if (startDate) {
      setSelectedWeek(getCurrentWeek(startDate));
    }
  }, [startDate]);

  const weekDates = startDate ? getWeekDates(startDate, selectedWeek) : [];

  const filteredSessions = sessions.filter(session => {
    if (!weekDates.length) return true;
    const [y, m, d] = session.date.split('-');
    const sessionDate = `${d}/${m}`;
    return weekDates.includes(sessionDate);
  });

  const scheduleData = filteredSessions.map(session => ({
    day: dayMap[session.day_of_week] || "---",
    dateLabel: (() => { const [y, m, d] = session.date.split('-'); return `${d}/${m}`; })(),
    className: session.classroom_name,
    start_time: session.start_time.slice(0, 5),
    end_time: session.end_time.slice(0, 5),
    time: `${session.start_time.slice(0, 5)} - ${session.end_time.slice(0, 5)}`,
    room: session.room?.name || "---",
    teacher: session.teacher_fullname,
  }));

  if (loading) return <div>Loading...</div>;

  return (
    <ScheduleForm
      weekLabel={weekDates.length ? `${weekDates[0]} - ${weekDates[6]}` : ""}
      weekNumber={selectedWeek}
      weekDates={weekDates}
      totalWeeks={totalWeeks}
      onWeekChange={setSelectedWeek}
      scheduleData={scheduleData}
      isTeacher={role === "Teacher"}
    />
  );
}

export default Schedule;