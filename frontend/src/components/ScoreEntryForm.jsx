function ScoreEntryForm({ logo, selectedClassCode, selectedClassName, setSelectedClassCode, setSelectedClassName, classCodes, classNames, students, onScoreChange, onCommentChange, onSave,}){
  return (
    <div className="score-layout">
      <aside className="score-sidebar">
        <div className="score-logo">
          <img src={logo} alt="Logo" />
        </div>

        <button className="score-sidebar-btn active">Nhập điểm</button>
        <button className="score-sidebar-btn">Lịch giảng dạy</button>
        <button className="score-sidebar-btn">Danh sách học viên</button>
        <button className="score-sidebar-btn">Điểm danh</button>
      </aside>

      <main className="score-main">
        <div className="score-topbar">
          <h1>NHẬP ĐIỂM</h1>

          <div className="score-userbox">
            <div>
              <p><strong>NAME:</strong> Nguyen Ngoc Anh</p>
              <p><strong>ID:</strong> 123456789</p>
            </div>
            <button className="score-logout-btn">ĐĂNG XUẤT</button>
          </div>
        </div>

        <div className="score-filters">
          <select
            value={selectedClassCode}
            onChange={(e) => setSelectedClassCode(e.target.value)}
          >
            <option value="">Mã lớp: TQ01</option>
            {classCodes.slice(1).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          <select
            value={selectedClassName}
            onChange={(e) => setSelectedClassName(e.target.value)}
          >
            <option value="">Tiếng Trung giao tiếp, A103</option>
            {classNames.slice(1).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="score-table-wrapper">
          <table className="score-table">
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
              {students.map((student, index) => (
                <tr key={student.id}>
                  <td>{index + 1}</td>
                  <td>{student.fullName}</td>

                  <td>
                    <input
                      type="number"
                      min="0"
                      max="10"
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
                      value={student.final}
                      onChange={(e) =>
                        onScoreChange(student.id, "final", e.target.value)
                      }
                    />
                  </td>

                  <td>
                    <input type="text" value={student.average} readOnly />
                  </td>

                  <td>
                    <input
                      type="text"
                      value={student.comment}
                      onChange={(e) =>
                        onCommentChange(student.id, e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="score-submit">
          <button className="score-save-btn" onClick={onSave}>
            LƯU NHẬP ĐIỂM
          </button>
        </div>
      </main>
    </div>
  );
}

export default ScoreEntryForm;