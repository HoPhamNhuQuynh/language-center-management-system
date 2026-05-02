function ScheduleForm({ weekLabel, scheduleData }) {
  const daysOfWeek = [
    { day: "Thứ Hai", dateLabel: "17/03" },
    { day: "Thứ Ba", dateLabel: "18/03" },
    { day: "Thứ Tư", dateLabel: "19/03" },
    { day: "Thứ Năm", dateLabel: "20/03" },
    { day: "Thứ Sáu", dateLabel: "21/03" },
    { day: "Thứ Bảy", dateLabel: "22/03" },
    { day: "Chủ Nhật", dateLabel: "23/03" },
  ];

  const getLessonByDay = (day) => {
    return scheduleData.find((item) => item.day === day);
  };

  return (
    <div className="schedule-layout">
      <aside className="schedule-sidebar">
        <button className="schedule-sidebar__btn">Thông tin học viên</button>
        <button className="schedule-sidebar__btn active">Lịch học</button>
      </aside>

      <main className="schedule-main">
        <h1 level={1} style={{ textAlign: "center" }}>
          LỊCH HỌC
        </h1>

        <div className="schedule-board">
          <div className="schedule-week-row">
            <div className="schedule-week-pill">TUẦN:01</div>
            <div className="schedule-week-text">{weekLabel}</div>
          </div>

          <div className="schedule-grid">
            {daysOfWeek.map((item) => {
              const lesson = getLessonByDay(item.day);

              return (
                <div className="schedule-column" key={item.day}>
                  <div className="schedule-column-header">
                    <span>{item.day}</span>
                    <span className="schedule-date">{item.dateLabel}</span>
                  </div>

                  <div className="schedule-day-body">
                    <div className="schedule-session-block"></div>

                    <div className="schedule-session-block schedule-session-block--bottom">
                      <div className="schedule-session-content">
                        {lesson ? (
                          <div className="schedule-class-card">
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
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ScheduleForm;