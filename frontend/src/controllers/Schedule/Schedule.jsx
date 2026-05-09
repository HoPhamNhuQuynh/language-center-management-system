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
    return date.toISOString().split('T')[0];
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
        const minDate = new Date(Math.min(Math.min(...allDates), today));
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

  const weekLabel = weekDates.length
    ? (() => {
      const fmt = (d) => { const [, m, day] = d.split('-'); return `${day}/${m}`; };
      return `${fmt(weekDates[0])} - ${fmt(weekDates[6])}`;
    })()
    : "";

  const filteredSessions = sessions.filter(session => {
    if (!weekDates.length) return false;
    return weekDates.includes(session.date);
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
      weekLabel={weekLabel}
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