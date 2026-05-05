import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../styles/SessionManagement.css";
import "../../styles/Styles.css";
import { FaPen } from "react-icons/fa6";
import {
  getSessionsByClass,
  createSession,
  updateSession,
  deleteSession,
  getRooms,
  getTeachers,
} from "../../services/manageService";
import { ImBin2 } from "react-icons/im";
import { formatDate } from "../../utils/format";
import DatePicker from "react-datepicker";
import { vi } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

const STATUS_CONFIG = {
  scheduled: { label: "Chưa diễn ra", className: "pending" },
  completed: { label: "Đã hoàn thành", className: "active" },
  cancelled: { label: "Đã hủy", className: "cancelled" },
};

const TIME_SLOTS = [
  { label: "7:30 - 9:30", start: "07:30", end: "09:30" },
  { label: "9:30 - 11:30", start: "09:30", end: "11:30" },
  { label: "13:00 - 15:00", start: "13:00", end: "15:00" },
  { label: "15:00 - 17:00", start: "15:00", end: "17:00" },
  { label: "17:30 - 19:30", start: "17:30", end: "19:30" },
  { label: "19:30 - 21:30", start: "19:30", end: "21:30" },
];

const EMPTY_FORM = {
  date: null,
  time_slot: "07:30-09:30",
  room: "",
  teacher: "",
};

const SessionManagement = () => {
  const { classId } = useParams();
  const [sessions, setSessions] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [classroomName, setClassroomName] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "" });
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    sessionId: null,
    sessionDate: "",
    error: "",
    loading: false,
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3000,
    );
  };

  const parseSlot = (slotValue) => {
    const [start, end] = slotValue.split("-");
    return { start, end };
  };

  const toSlotValue = (start_time, end_time) => `${start_time}-${end_time}`;

  const getStatusFromDate = (dateStr) => {
    if (!dateStr) return "scheduled";
    const today = new Date();
    const input = new Date(dateStr);
    today.setHours(0, 0, 0, 0);
    input.setHours(0, 0, 0, 0);
    return input < today ? "completed" : "scheduled";
  };

  const loadSessions = async () => {
    try {
      const res = await getSessionsByClass(classId);
      setSessions(res.sessions);
      setClassroomName(res.classroom_name);
    } catch (err) {
      console.error(err);
    }
  };

  const loadRooms = async () => {
    const res = await getRooms();
    setRooms(res);
  };

  const loadTeachers = async () => {
    const res = await getTeachers();
    setTeachers(res);
  };

  const validate = () => {
    const errors = {};
    if (!form.date) errors.date = "Vui lòng chọn ngày học";
    if (!form.room) errors.room = "Vui lòng chọn phòng học"; 
    return errors;
  };

  useEffect(() => {
    if (classId) {
      loadSessions();
      loadRooms();
      loadTeachers(); 
    }
  }, [classId]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setShowFormModal(true);
  };

  const handleOpenEdit = (session) => {
    setEditingId(session.id);
    setForm({
      date: session.date ? new Date(session.date) : null,
      time_slot: toSlotValue(
        session.start_time?.slice(0, 5),
        session.end_time?.slice(0, 5),
      ),
      room: session.room?.id ?? "",
      teacher: session.user ?? "",
    });
    setFormErrors({});
    setShowFormModal(true);
  };


  const handleSubmit = async () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const { start, end } = parseSlot(form.time_slot);
    const dateStr = form.date.toISOString().split("T")[0];

    setFormLoading(true);
    try {
      if (editingId) {
        await updateSession(editingId, {
          date: dateStr,
          start_time: start,
          end_time: end,
          room: form.room,
          user: form.teacher ? Number(form.teacher) : null,
        });
        showToast("Cập nhật buổi học thành công!");
      } else {
        await createSession({
          classroom_id: classId,
          date: dateStr,
          start_time: start,
          end_time: end,
          room: form.room,
          user: form.teacher ? Number(form.teacher) : null,
        });
        showToast("Tạo buổi học bù thành công!");
      }
      setShowFormModal(false);
      loadSessions();
    } catch (err) {
      console.log("Status:", err?.response?.status);
      console.log(
        "Error detail:",
        JSON.stringify(err?.response?.data, null, 2),
      );
      showToast(
        err?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại",
        "error",
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteModal((prev) => ({ ...prev, loading: true, error: "" }));
    try {
      await deleteSession(deleteModal.sessionId);
      setDeleteModal({
        show: false,
        sessionId: null,
        sessionDate: "",
        error: "",
        loading: false,
      });
      showToast("Xóa buổi học thành công!");
      loadSessions();
    } catch (err) {
      setDeleteModal((prev) => ({
        ...prev,
        loading: false,
        error: err?.response?.data?.message || "Xóa thất bại, vui lòng thử lại",
      }));
    }
  };

  return (
    <div className="page-layout">
      <div className="page-header">
        <h1>Quản lý buổi học</h1>
        <button className="add-btn" onClick={handleOpenCreate}>
          Tạo buổi học bù
        </button>
      </div>

      <div className="class-title">
        <div>
          <strong>Lớp:</strong> {classroomName}
        </div>
        <span className="session-count">{sessions.length} buổi học</span>
      </div>

      <div className="table-wrapper">
        {sessions.length === 0 ? (
          <div className="session-empty">Không có buổi học</div>
        ) : (
          <table className="data-table session-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Ngày học</th>
                <th>Trạng thái</th>
                <th>Giờ học</th>
                <th>Phòng</th>
                <th>Giáo viên</th>
                <th>Lịch trình</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, idx) => {
                const status = getStatusFromDate(s.date);
                const isPast = status === "completed";

                return (
                  <tr key={s.id}>
                    <td>{idx + 1}</td>
                    <td>{formatDate(s.date)}</td>
                    <td>
                      <span
                        className={`status-badge ${s.active ? "active" : "inactive"}`}
                      >
                        {s.active ? "Đang hoạt động" : "Không hoạt động"}
                      </span>
                    </td>
                    <td>
                      {s.start_time} - {s.end_time}
                    </td>
                    <td>{s.room.name}</td>
                    <td>{s.teacher_fullname ?? "Chưa phân công"}</td>
                    <td>
                      <span
                        className={`status-badge ${STATUS_CONFIG[status]?.className}`}
                      >
                        {STATUS_CONFIG[status]?.label}
                      </span>
                    </td>
                    <td>{formatDate(s.created_at)}</td>
                    <td>
                      <span
                        className="icon-edit"
                        onClick={() => !isPast && handleOpenEdit(s)}
                        style={{
                          opacity: isPast ? 0.4 : 1,
                          cursor: isPast ? "not-allowed" : "pointer",
                        }}
                      >
                        <FaPen />
                      </span>
                      <span
                        className="icon-delete"
                        onClick={() =>
                          !isPast &&
                          setDeleteModal({
                            show: true,
                            sessionId: s.id,
                            sessionDate: s.date,
                            error: "",
                            loading: false,
                          })
                        }
                        style={{
                          opacity: isPast ? 0.4 : 1,
                          cursor: isPast ? "not-allowed" : "pointer",
                        }}
                      >
                        <ImBin2 />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showFormModal && (
        <div className="modal-overlay">
          <div
            className="modal-body"
            style={{ maxWidth: "460px", width: "90%" }}
          >
            <span
              className="modal-close-btn"
              onClick={() => setShowFormModal(false)}
            >
              &times;
            </span>
            <h2 className="title-form">
              {editingId ? "SỬA BUỔI HỌC" : "TẠO BUỔI HỌC BÙ"}
            </h2>

            <div className="input-group">
              <label>
                Ngày học <span style={{ color: "red" }}>*</span>
              </label>
              <DatePicker
                selected={form.date}
                onChange={(date) => {
                  setForm((prev) => ({ ...prev, date }));
                  setFormErrors((prev) => ({ ...prev, date: undefined }));
                }}
                dateFormat="dd/MM/yyyy"
                locale={vi}
                placeholderText="DD/MM/YYYY"
                minDate={new Date()} // không cho chọn ngày trong quá khứ khi tạo mới
              />
              {formErrors.date && (
                <div className="input-error">{formErrors.date}</div>
              )}
            </div>

            {/* Khung giờ — dropdown cố định */}
            <div className="input-group">
              <label>
                Khung giờ <span style={{ color: "red" }}>*</span>
              </label>
              <select
                value={form.time_slot}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, time_slot: e.target.value }))
                }
              >
                {TIME_SLOTS.map((t) => (
                  <option key={t.label} value={`${t.start}-${t.end}`}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>
                Phòng học <span style={{ color: "red" }}>*</span>
              </label>
              <select
                value={form.room}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, room: e.target.value }));
                  setFormErrors((prev) => ({ ...prev, room: undefined }));
                }}
              >
                <option value="">-- Chọn phòng --</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              {formErrors.room && (
                <div className="input-error">{formErrors.room}</div>
              )}
            </div>

            <div className="input-group">
              <label>Giáo viên</label>
              <select
                value={form.teacher}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, teacher: e.target.value }))
                }
              >
                <option value="">-- Chọn giáo viên --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.last_name} {t.first_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button
                className="btn-save"
                onClick={handleSubmit}
                disabled={formLoading}
              >
                {formLoading
                  ? "Đang lưu..."
                  : editingId
                    ? "Cập nhật"
                    : "Tạo mới"}
              </button>
              <button
                className="btn-cancel"
                onClick={() => setShowFormModal(false)}
                disabled={formLoading}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal.show && (
        <div className="modal-overlay">
          <div
            className="modal-body"
            style={{ maxWidth: "420px", textAlign: "center", padding: "32px" }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: "28px",
              }}
            >
              🗑️
            </div>
            <h2 style={{ margin: "0 0 8px", fontSize: "18px" }}>
              Xác nhận xóa
            </h2>
            <p
              style={{
                color: "#6b7280",
                fontSize: "14px",
                margin: "0 0 20px",
                lineHeight: "1.6",
              }}
            >
              Bạn có chắc muốn xóa buổi học ngày{" "}
              <strong style={{ color: "#111827" }}>
                {formatDate(deleteModal.sessionDate)}
              </strong>{" "}
              không?
              <br />
              <span style={{ color: "#ef4444", fontSize: "13px" }}>
                Hành động này không thể hoàn tác.
              </span>
            </p>
            {deleteModal.error && (
              <div
                className="status-badge badge-warning"
                style={{ marginBottom: "12px" }}
              >
                ⚠️ {deleteModal.error}
              </div>
            )}
            <div
              style={{ display: "flex", gap: "10px", justifyContent: "center" }}
            >
              <button
                className="btn-cancel"
                disabled={deleteModal.loading}
                onClick={() =>
                  setDeleteModal({
                    show: false,
                    sessionId: null,
                    sessionDate: "",
                    error: "",
                    loading: false,
                  })
                }
              >
                Hủy
              </button>
              <button
                className="btn-delete"
                disabled={deleteModal.loading}
                onClick={handleDelete}
              >
                {deleteModal.loading ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.show && (
        <div
          className="toast-badge"
          style={{ background: toast.type === "error" ? "#ef4444" : undefined }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default SessionManagement;
