function ScheduleForm({ weekLabel, weekNumber, weekDates, totalWeeks, onWeekChange, scheduleData, isTeacher }) {

  const daysOfWeek = [
    "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"
  ].map((day, i) => {
    const raw = weekDates?.[i] || "";
    const [y, m, d] = raw.split('-');
    return {
      day,
      dateLabel: raw ? `${d}/${m}/${y}` : ""
    };
  });

  const getLessonsByDay = (day) =>
    scheduleData.filter(item => item.day === day);

  const HOUR_HEIGHT = 100;

  const timeToY = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return (h - 7) * HOUR_HEIGHT + (m / 60) * HOUR_HEIGHT + HOUR_HEIGHT / 2;
  };

  const durationToHeight = (start, end) => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return ((eh * 60 + em) - (sh * 60 + sm)) / 60 * HOUR_HEIGHT;
  };

  return (
    <div className="schedule-layout">
      <main className="schedule-main">
        <h1 style={{ textAlign: "center" }}>THỜI KHÓA BIỂU</h1>

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
                {["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
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
                    const height = durationToHeight(lesson.start_time, lesson.end_time);
                    return (
                      <div
                        className="schedule-class-card"
                        key={i}
                        style={{ top: `${top}px`, height: `${height}px` }}
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
                        {!isTeacher && (
                          <div className="schedule-class-info">
                            <p className="schedule-label">GV:</p>
                            <p className="schedule-value">{lesson.teacher}</p>
                          </div>
                        )}
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