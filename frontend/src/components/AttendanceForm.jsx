function AttendanceForm({ logo, selectedClass, selectedDate, setSelectedClass, setSelectedDate, classes, dates, students, onStatusChange, onNoteChange, onSubmit, }){
  return (
    <div className="attendance-layout">
      <aside className="attendance-sidebar">
        <div className="attendance-logo">
          <img src={logo} alt="Logo" />
        </div>

        <button className="attendance-sidebar-btn active">Điểm danh</button>
        <button className="attendance-sidebar-btn">Lịch giảng dạy</button>
        <button className="attendance-sidebar-btn">Nhập điểm</button>
        <button className="attendance-sidebar-btn">Danh sách học viên</button>
      </aside>

      <main className="attendance-main">
        <div className="attendance-topbar">
          <h1>ĐIỂM DANH</h1>

          <div className="attendance-userbox">
            <div>
              <p>
                <strong>NAME:</strong> Nguyen Ngoc Anh
              </p>
              <p>
                <strong>ID:</strong> 123456789
              </p>
            </div>

            <button className="logout-btn">ĐĂNG XUẤT</button>
          </div>
        </div>

        <div className="attendance-filters">
          <div className="filter-item">
            <label>Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Chọn lớp học</option>
              {classes.slice(1).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Date</label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            >
              <option value="">Hôm nay, 18/03/2026</option>
              {dates.slice(1).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="attendance-table-wrapper">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>HỌ TÊN</th>
                <th>TRẠNG THÁI</th>
                <th>GHI CHÚ</th>
              </tr>
            </thead>

            <tbody>
              {students.map((student, index) => (
                <tr key={student.id}>
                  <td>{index + 1}</td>
                  <td>{student.fullName}</td>
                  <td>
                    <div className="status-options">
                      <label>
                        <input
                          type="radio"
                          name={`status-${student.id}`}
                          checked={student.status === "Có mặt"}
                          onChange={() => onStatusChange(student.id, "Có mặt")}
                        />
                        Có mặt
                      </label>

                      <label>
                        <input
                          type="radio"
                          name={`status-${student.id}`}
                          checked={student.status === "Vắng"}
                          onChange={() => onStatusChange(student.id, "Vắng")}
                        />
                        Vắng
                      </label>

                      <label>
                        <input
                          type="radio"
                          name={`status-${student.id}`}
                          checked={student.status === "Trễ"}
                          onChange={() => onStatusChange(student.id, "Trễ")}
                        />
                        Trễ
                      </label>
                    </div>
                  </td>

                  <td>
                    <input
                      className="note-input"
                      type="text"
                      value={student.note}
                      onChange={(e) => onNoteChange(student.id, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="attendance-submit">
          <button className="complete-btn" onClick={onSubmit}>
            HOÀN TẤT
          </button>
        </div>
      </main>
    </div>
  );
}

export default AttendanceForm;