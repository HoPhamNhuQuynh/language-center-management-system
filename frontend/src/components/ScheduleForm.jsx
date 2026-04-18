function ScheduleForm({ logo, user, weekLabel, scheduleData }) {
  const daysOfWeek = [
    { day: "MONDAY", dateLabel: "17/03" },
    { day: "TUESDAY", dateLabel: "18/03" },
    { day: "WEDNESDAY", dateLabel: "19/03" },
    { day: "THURSDAY", dateLabel: "20/03" },
    { day: "FRIDAY", dateLabel: "21/03" },
    { day: "SATURDAY", dateLabel: "22/03" },
    { day: "SUNDAY", dateLabel: "23/03" },
  ];

  const getScheduleByDay = (day) => {
    return scheduleData.find((item) => item.day === day);
  };

  return (
    <div className="schedule-layout">
      <aside className="schedule-sidebar">
        <div className="schedule-sidebar__logo">
          <img src={logo} alt="Logo" />
        </div>

        <button className="schedule-sidebar__btn">Thông tin học viên</button>
        <button className="schedule-sidebar__btn active">Lịch học</button>
      </aside>

      <main className="schedule-main">
        <div className="schedule-topbar">
          <h1 className="schedule-topbar__title">Lịch học</h1>
          <div className="schedule-userbox">
            <div>
              <p>
                <strong>Name:</strong> {user.name}
              </p>
              <p>
                <strong>ID:</strong> {user.id}
              </p>
            </div>

            <button className="schedule-logout-btn">ĐĂNG XUẤT</button>
          </div>
        </div>

        <div className="schedule-board">
          <div className="schedule-week-row">
            <div className="schedule-week-pill">TUẦN:01</div>
            <div className="schedule-week-text">{weekLabel}</div>
          </div>

          <div className="schedule-grid">
            {daysOfWeek.map((item) => {
              const lesson = getScheduleByDay(item.day);

              return (
                <div className="schedule-column" key={item.day}>
                  <div className="schedule-column-header">
                    <span>{item.day}</span>
                    <span className="schedule-date">{item.dateLabel}</span>
                  </div>

                  <div className="schedule-cell">
                    {lesson ? (
                      <div className="schedule-class-card">
                        <h3>{lesson.className}</h3>
                        <p>Khung giờ: {lesson.time}</p>
                        <p>Phòng: {lesson.room}</p>
                        <p>{lesson.teacher}</p>
                      </div>
                    ) : null}
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