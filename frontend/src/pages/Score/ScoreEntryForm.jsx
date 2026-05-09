function ScoreEntryForm({
  logo,
  selectedClass,
  setSelectedClass,
  selectedCourse,
  setSelectedCourse,
  classes,
  courses,
  scoreRows,
  onScoreChange,
  onTemporarySave,
  onSubmit,
}) {
  return (
    <div className="score-entry-layout">
      <aside className="score-entry-sidebar">
        <button className="score-entry-sidebar-btn active">Nhập điểm</button>
        <button className="score-entry-sidebar-btn">Lịch giảng dạy</button>
        <button className="score-entry-sidebar-btn">Danh sách học viên</button>
        <button className="score-entry-sidebar-btn">Điểm danh</button>
      </aside>

      <main className="score-entry-main">
        <h1>NHẬP ĐIỂM</h1>

        <div className="score-entry-filters">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            {classes.map((item) => (
              <option key={item} value={item}>
                Mã lớp: {item}
              </option>
            ))}
          </select>

          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            {courses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="score-entry-table-wrapper">
          <table className="score-entry-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>HỌ TÊN</th>
                <th>ĐIỂM GIỮA KÌ</th>
                <th>ĐIỂM CUỐI KÌ</th>
                <th>ĐIỂM TRUNG BÌNH</th>
                <th>NHẬN XÉT</th>
              </tr>
            </thead>

            <tbody>
              {(scoreRows || []).map((student, index) => (
                <tr key={student.id}>
                  <td>{index + 1}</td>
                  <td>{student.fullName}</td>

                  <td>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={student.midterm}
                      onChange={(e) =>
                        onScoreChange(student.id, "midterm", e.target.value)
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={student.final}
                      onChange={(e) =>
                        onScoreChange(student.id, "final", e.target.value)
                      }
                    />
                  </td>

                  <td>
                    <span className="score-entry-average">
                      {student.average}
                    </span>
                  </td>

                  <td>
                    {student.remark ? (
                      <span className="score-entry-remark">
                        {student.remark}
                      </span>
                    ) : (
                      ""
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="score-entry-actions">
          <button className="draft-btn" onClick={onTemporarySave}>
            LƯU TẠM
          </button>

          <button className="save-btn" onClick={onSubmit}>
            LƯU NHẬP ĐIỂM
          </button>
        </div>
      </main>
    </div>
  );
}

export default ScoreEntryForm;