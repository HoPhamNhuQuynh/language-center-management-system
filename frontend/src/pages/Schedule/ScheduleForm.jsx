function ScheduleForm({ weekLabel, weekNumber, weekDates, totalWeeks, onWeekChange, scheduleData }) {

  const daysOfWeek = [
    "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"
  ].map((day, i) => ({
    day,
    dateLabel: weekDates?.[i] || ""
  }));

  const getLessonsByDay = (day) =>
    scheduleData.filter(item => item.day === day);

  const timeToY = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return (h - 8) * 80 + (m / 60) * 80;
  };

  return (
    <div className="schedule-layout">
      <main className="schedule-main">
        <h1 style={{ textAlign: "center" }}>LỊCH HỌC</h1>

        <div className="schedule-board">
          <div className="schedule-week-row">
            <select
              className="schedule-week-pill"
              value={weekNumber}
              onChange={(e) => onWeekChange(Number(e.target.value))}
            >
              {Array.from({ length: totalWeeks }, (_, i) => i + 1).map(w => (
                <option key={w} value={w}>
                  TUẦN: {String(w).padStart(2, '0')}
                </option>
              ))}
            </select>
            <div className="schedule-week-text">{weekLabel}</div>
          </div>

          <div className="schedule-grid">
            <div className="schedule-time-column">
              <div className="schedule-time-column__header" />
              <div className="schedule-time-column__body">
                {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
                  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
                  "20:00", "21:00", "22:00"].map(t => (
                    <div className="schedule-time-slot" key={t}>{t}</div>
                  ))}
              </div>
            </div>

            {daysOfWeek.map((item) => (
              <div className="schedule-column" key={item.day}>
                <div className="schedule-column-header">
                  <span>{item.day}</span>
                  <span className="schedule-date">{item.dateLabel}</span>
                </div>
                <div className="schedule-day-body">
                  {getLessonsByDay(item.day).map((lesson, i) => {
                    const top = timeToY(lesson.start_time);
                    const height = timeToY(lesson.end_time) - top;
                    return (
                      <div
                        className="schedule-class-card"
                        key={i}
                        style={{ top: `${top}px` }}
                      >
                        <h3>{lesson.className}</h3>
                        <div className="schedule-class-info">
                          <p className="schedule-label">Khung giờ:</p>
                          <p className="schedule-value">{lesson.time}</p>
                        </div>
                        <div className="schedule-class-info">
                          <p className="schedule-label">Phòng:</p>
                          <p className="schedule-value">{lesson.room}</p>
                        </div>
                        <div className="schedule-class-info">
                          <p className="schedule-label">GV:</p>
                          <p className="schedule-value">{lesson.teacher}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ScheduleForm;