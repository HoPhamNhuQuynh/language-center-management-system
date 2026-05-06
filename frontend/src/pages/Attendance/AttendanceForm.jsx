import { LockFilled, WarningFilled } from "@ant-design/icons";
import { Tag } from "antd";
import { formatDate } from "../../utils/format";

function AttendanceForm({
  classes,
  sessions,
  students,
  selectedClass,
  selectedSession,
  onClassChange,
  onSessionChange,
  onStatusChange,
  onNoteChange,
  onSubmit,
  loading,
  error,
  canAttendance,
}) {
  return (
    <div className="attendance-layout">
      <main className="attendance-main">
        <h1 style={{ textAlign: "center" }}>ĐIỂM DANH</h1>

        <div className="attendance-filters">
          <div className="filter-item">
            <label>Lớp</label>
            <select
              value={selectedClass}
              onChange={(e) => onClassChange(e.target.value)}
            >
              <option value="">-- Chọn lớp --</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <label>Buổi học</label>
            <select
              value={selectedSession}
              onChange={(e) => onSessionChange(e.target.value)}
              disabled={!selectedClass}
            >
              <option value="">-- Chọn buổi --</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {formatDate(s.date)} — Buổi {s.id}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedSession && !canAttendance && (
          <Tag
            icon={<LockFilled />}
            color="error"
            className="status-badge-locked"
          >
            BUỔI HỌC NÀY KHÔNG THỂ ĐIỂM DANH
          </Tag>
        )}

        {loading && <div className="score-loading">Đang tải...</div>}
        {error && <div className="score-error">{error}</div>}

        {!loading && !error && students.length > 0 && (
          <>
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
                    <tr key={student.enrollmentId}>
                      <td>{index + 1}</td>
                      <td>{student.fullName}</td>
                      <td>
                        <div className="status-options">
                          {["Có mặt", "Vắng", "Trễ"].map((status) => (
                            <label key={status}>
                              <input
                                type="radio"
                                name={`status-${student.enrollmentId}`}
                                checked={student.status === status}
                                onChange={() =>
                                  onStatusChange(student.enrollmentId, status)
                                }
                                disabled={!canAttendance}
                              />
                              {status}
                            </label>
                          ))}
                        </div>
                      </td>
                      <td>
                        <input
                          className="note-input"
                          type="text"
                          value={student.note}
                          onChange={(e) =>
                            onNoteChange(student.enrollmentId, e.target.value)
                          }
                          disabled={!canAttendance}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="attendance-submit">
              {canAttendance ? (
                <button className="complete-btn" onClick={onSubmit}>
                  HOÀN TẤT
                </button>
              ) : (
                <div className="locked-notification">
                  <Tag
                    icon={<WarningFilled />}
                    color="warning"
                    className="ant-tag-warning"
                  >
                    Chỉ có thể điểm danh trong ngày diễn ra buổi học.
                  </Tag>
                </div>
              )}
            </div>
          </>
        )}

        {!loading && !error && selectedSession && students.length === 0 && (
          <div className="score-entry-empty">Không có học viên nào.</div>
        )}

        {!selectedClass && (
          <div className="score-entry-empty">Vui lòng chọn lớp để bắt đầu.</div>
        )}
      </main>
    </div>
  );
}

export default AttendanceForm;