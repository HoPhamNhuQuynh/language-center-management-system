import { useEffect, useState } from "react";
import { myScheduleApi } from "../../services/studentService";
import ScheduleForm from "../../pages/Schedule/ScheduleForm";
import { getRole } from "../../utils/token";
import "../../styles/Schedule.css";

const getFirstMonday = (startDateStr) => {
  const classStart = new Date(startDateStr);
  const dow = classStart.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  const mon = new Date(classStart);
  mon.setDate(classStart.getDate() + diff);
  return mon;
};

const getWeekDates = (mondayDate) => {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(mondayDate);
    date.setDate(mondayDate.getDate() + i);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}`;
  });
};

function Schedule() {
  const [sessions, setSessions] = useState([]);
  const [allMondays, setAllMondays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const role = getRole();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await myScheduleApi();
        setSessions(res);

        const today = new Date();
        const allDates = res.map(s => new Date(s.date));
        const minDate = new Date(Math.min(...allDates));
        const maxDate = new Date(Math.max(Math.max(...allDates), today));

        const firstMon = getFirstMonday(minDate.toISOString().split('T')[0]);
        const mondays = [];
        const cur = new Date(firstMon);
        while (cur <= maxDate) {
          mondays.push(new Date(cur));
          cur.setDate(cur.getDate() + 7);
        }

        setAllMondays(mondays);

        let weekIdx = mondays.findIndex(mon => {
          const sunday = new Date(mon);
          sunday.setDate(mon.getDate() + 6);
          return today >= mon && today <= sunday;
        });

        if (weekIdx === -1) {
          weekIdx = mondays.findIndex(mon => mon > today);
        }
        if (weekIdx === -1) weekIdx = mondays.length - 1;

        setSelectedWeek(weekIdx + 1);

      } catch (ex) {
        console.error("Failed to load schedule:", ex);
        setSelectedWeek(1);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const dayMap = {
    0: "Thứ Hai", 1: "Thứ Ba", 2: "Thứ Tư",
    3: "Thứ Năm", 4: "Thứ Sáu", 5: "Thứ Bảy", 6: "Chủ Nhật",
  };

  const totalWeeks = allMondays.length;

  const currentMonday = allMondays[selectedWeek - 1];
  const weekDates = currentMonday ? getWeekDates(currentMonday) : [];

  const filteredSessions = sessions.filter((session) => {
    if (!currentMonday) return false;
    const sessionDate = new Date(session.date);
    const sunday = new Date(currentMonday);
    sunday.setDate(currentMonday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return sessionDate >= currentMonday && sessionDate <= sunday;
  });

  const scheduleData = filteredSessions.map(session => ({
    day: dayMap[session.day_of_week] || "---",
    dateLabel: (() => { const [, m, d] = session.date.split('-'); return `${d}/${m}`; })(),
    className: session.classroom_name,
    start_time: session.start_time.slice(0, 5),
    end_time: session.end_time.slice(0, 5),
    time: `${session.start_time.slice(0, 5)} - ${session.end_time.slice(0, 5)}`,
    room: session.room?.name || "---",
    teacher: session.teacher_fullname,
  }));

  if (loading || selectedWeek === null) return <div>Loading...</div>;

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