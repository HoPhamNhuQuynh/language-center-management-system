import { LockFilled } from "@ant-design/icons";
import { Tag } from "antd";

function ScoreEntryForm({
  classes,
  selectedClass,
  onClassChange,
  scoreTypes,
  scoreRows,
  isSubmitted,
  loading,
  error,
  onScoreChange,
  onBlurFormat,
  onFocus,
  getDisplayValue,
  onLocalSave,
  onSaveToDB,
  onSubmit,
}) {
  return (
    <div className="score-entry-layout">
      <main className="score-entry-main">
        <h1>NHẬP ĐIỂM</h1>

        <div className="score-entry-filters">
          <div className="custom-select-wrapper">
            <select
              className="custom-select"
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
        </div>
        <div className="header-flex">
          {isSubmitted && (
            <Tag icon={<LockFilled />} className="status-badge-locked">
              BẢNG ĐIỂM ĐÃ KHÓA — KHÔNG THỂ CHỈNH SỬA
            </Tag>
          )}
        </div>

        {/* Chưa chọn lớp */}
        {!selectedClass && (
          <div className="score-entry-empty">
            Vui lòng chọn lớp để bắt đầu nhập điểm.
          </div>
        )}

        {/* Đang load */}
        {selectedClass && loading && (
          <div className="score-loading">Đang tải dữ liệu...</div>
        )}

        {/* Lỗi */}
        {selectedClass && error && <div className="score-error">{error}</div>}

        {/* Bảng điểm */}
        {selectedClass && !loading && !error && (
          <>
            <div className="score-entry-table-wrapper">
              <table className="score-entry-table">
                <thead>
                  <tr>
                    <th className="col-stt">STT</th>
                    <th className="col-name">HỌ TÊN</th>
                    {scoreTypes.map((st) => (
                      <th key={st.id} className="col-score">
                        {st.name.toUpperCase()}
                        <span className="col-score-weight">×{st.weight}</span>
                      </th>
                    ))}
                    <th className="col-average">ĐIỂM TB</th>
                    <th className="col-remark">NHẬN XÉT</th>
                  </tr>
                </thead>
                <tbody>
                  {scoreRows.map((row, index) => (
                    <tr key={row.enrollmentId}>
                      <td className="col-stt">{index + 1}</td>
                      <td className="col-name">{row.fullName}</td>
                      {scoreTypes.map((st) => (
                        <td key={st.id} className="col-score">
                          <input
                            type="text"
                            className={isSubmitted ? "input-locked" : ""}
                            value={getDisplayValue(row, st.id)}
                            disabled={isSubmitted}
                            onFocus={() => onFocus(row.enrollmentId, st.id)}
                            onChange={(e) =>
                              onScoreChange(
                                row.enrollmentId,
                                st.id,
                                e.target.value,
                              )
                            }
                            onBlur={() => onBlurFormat(row.enrollmentId, st.id)}
                          />
                        </td>
                      ))}
                      <td className="col-average">
                        <span className="score-entry-average">
                          {row.average ?? ""}
                        </span>
                      </td>
                      <td className="col-remark">
                        <input
                          type="text"
                          placeholder="Nhập nhận xét..."
                          className={`score-entry-input-remark ${isSubmitted ? "input-locked" : ""}`}
                          value={row.remark || ""}
                          disabled={isSubmitted}
                          onChange={(e) =>
                            onScoreChange(
                              row.enrollmentId,
                              "remark",
                              e.target.value,
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="score-entry-actions">
              {!isSubmitted ? (
                <>
                  <button className="save-btn" onClick={onLocalSave}>
                    LƯU TẠM
                  </button>
                  <button className="draft-btn" onClick={onSaveToDB}>
                    LƯU ĐIỂM
                  </button>
                  <button className="submit-btn" onClick={onSubmit}>
                    NỘP BẢNG ĐIỂM
                  </button>
                </>
              ) : (
                <div className="locked-notification">
                  Bảng điểm đã được nộp và khóa.
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
export default ScoreEntryForm;
