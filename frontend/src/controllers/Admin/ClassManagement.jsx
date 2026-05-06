import { useEffect, useState } from "react";
import "../../styles/ClassManagement.css";
import "../../styles/Styles.css"
import { FaPen } from "react-icons/fa6";
import { ImBin2 } from "react-icons/im";
import { formatDate } from "../../utils/format";
import {
  createClass,
  deleteClass,
  getClasses,
  getCourses,
  getTeachers,
  updateClass,
  getRooms,
} from "../../services/manageService";
import { vi } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { useNavigate } from "react-router-dom";

const INITIAL_FORM = {
  name: "",
  course: "",
  start_date: "",
  end_date: "",
  capacity: "",
  grade_deadline: "",
  grade_status: "",
  main_teacher: "",
  schedules: [],
};

const DAY_LABELS = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ nhật",
];

const TIME_SLOTS = [
  { label: "7:30 - 9:30", start: "07:30", end: "09:30" },
  { label: "9:30 - 11:30", start: "09:30", end: "11:30" },
  { label: "13:00 - 15:00", start: "13:00", end: "15:00" },
  { label: "15:00 - 17:00", start: "15:00", end: "17:00" },
  { label: "17:30 - 19:30", start: "17:30", end: "19:30" },
  { label: "19:30 - 21:30", start: "19:30", end: "21:30" },
];

const ClassManagement = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    classId: null,
    className: "",
    error: "",
  });
  const [teachers, setTeachers] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "" });
  const [rooms, setRooms] = useState([]);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  const loadRooms = async () => {
    const res = await getRooms();
    setRooms(res);
  };

  const loadClasses = async () => {
    let res = await getClasses();
    const sorted = res.sort((a, b) => a.id - b.id);
    setClasses(sorted);
    console.info(sorted);
  };

  const loadCourses = async () => {
    let res = await getCourses();
    setCourses(res);
  };

  const loadTeachers = async () => {
    let res = await getTeachers();
    setTeachers(res);
  };

  useEffect(() => {
    loadClasses();
    loadCourses();
    loadTeachers();
    loadRooms();
  }, []);

  const toggleDay = (idx) => {
    setForm((prev) => {
      const exists = prev.schedules.find((s) => s.day_of_week === idx);
      if (exists) {
        return {
          ...prev,
          schedules: prev.schedules.filter((s) => s.day_of_week !== idx),
        };
      }
      return {
        ...prev,
        schedules: [
          ...prev.schedules,
          {
            day_of_week: idx,
            start_time: "07:30",
            end_time: "09:30",
            room: "",
          },
        ],
      };
    });
    setErrors((prev) => ({ ...prev, schedules: undefined }));
  };

  const updateScheduleField = (dayIdx, fields) => {
    setForm((prev) => ({
      ...prev,
      schedules: prev.schedules.map((s) =>
        s.day_of_week === dayIdx ? { ...s, ...fields } : s,
      ),
    }));
    setErrors((prev) => ({ ...prev, schedules: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Vui lòng nhập tên lớp học";
    if (!form.course) errs.course = "Vui lòng chọn khóa học";
    if (!form.start_date) errs.start_date = "Vui lòng chọn ngày khai giảng";
    if (!form.end_date) errs.end_date = "Vui lòng chọn ngày kết thúc";
    if (!form.capacity) errs.capacity = "Vui lòng nhập sĩ số tối đa";
    else if (form.capacity < 10 || form.capacity > 50)
      errs.capacity = "Sĩ số phải từ 10 đến 50 học viên";
    if (form.start_date && form.end_date && form.end_date <= form.start_date)
      errs.end_date = "Ngày kết thúc phải sau ngày khai giảng";
    if (form.schedules.length === 0)
      errs.schedules = "Vui lòng chọn ít nhất một ngày học";
    else if (form.schedules.some((s) => !s.room))
      errs.schedules = "Vui lòng chọn phòng học cho tất cả các ngày";
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "active" ? Number(value) : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleClose = () => {
    setShowModal(false);
    setForm(INITIAL_FORM);
    setErrors({});
    setEditingClass(null);
  };

  const handleEdit = (classroom) => {
    setEditingClass(classroom);
    setForm({
      name: classroom.name,
      course: classroom.course_id,
      start_date: classroom.start_date ?? "",
      end_date: classroom.end_date ?? "",
      capacity: classroom.capacity ?? "",
      grade_deadline: classroom.grade_deadline ?? "",
      grade_status: classroom.grade_status ?? "",
      main_teacher: classroom.main_teacher?.id ?? "",
      schedules: (classroom.schedules ?? []).map((s) => ({
        day_of_week: s.day_of_week,
        start_time: s.start_time.slice(0, 5),
        end_time: s.end_time.slice(0, 5),
        room: s.room?.id ?? s.room ?? "",
      })),
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await deleteClass(deleteModal.classId);
      await loadClasses();
      setDeleteModal({ show: false, classId: null, className: "", error: "" });
      showToast("Xóa lớp học thành công!");
    } catch (ex) {
      console.error("Chi tiết lỗi:", ex.response?.data); // xem backend nói gì
      const msg = ex.response?.data?.[0] || "Xóa thất bại, vui lòng thử lại.";
      setDeleteModal((prev) => ({ ...prev, error: msg }));
    }
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name,
        course: form.course,
        start_date: form.start_date,
        end_date: form.end_date,
        capacity: form.capacity,
        ...(form.main_teacher && { main_teacher_id: form.main_teacher }),
        schedules_input: form.schedules.map((s) => ({
          day_of_week: s.day_of_week,
          start_time: s.start_time,
          end_time: s.end_time,
          room: s.room,
        })),
      };

      if (editingClass) {
        await updateClass(editingClass.id, payload);
      } else {
        await createClass(payload);
      }
      await loadClasses();
      showToast(
        editingClass
          ? "Cập nhật lớp học thành công!"
          : "Thêm lớp học thành công!",
      );
      handleClose();
    } catch (ex) {
      const data = ex.response?.data;
      console.error("Toàn bộ lỗi:", JSON.stringify(data, null, 2));
      const msg = Array.isArray(data)
        ? data[0]
        : typeof data === "object"
          ? Object.values(data).flat()[0]
          : "Lưu thất bại, vui lòng thử lại.";
      setErrors({ general: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-layout">
      <div className="page-header">
        <h1>Quản lý lớp học</h1>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          Thêm
        </button>
      </div>

      <div className="table-wrapper">
        <table className="data-table class-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên lớp</th>
              <th>Trạng thái</th>
              <th>Khóa học</th>
              <th>Sĩ số</th>
              <th>Giáo viên chính</th>
              <th>Khai giảng</th>
              <th>Kết thúc</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((classroom) => (
              <tr key={classroom.id}>
                <td>{classroom.id}</td>
                <td
                  className="class-link"
                  onClick={() => navigate(`/session-config/${classroom.id}`)}
                >
                  {classroom.name}
                </td>
                <td>
                  <span
                    className={`status-badge ${classroom.active ? "active" : "inactive"}`}
                  >
                    {classroom.active ? "Đang hoạt động" : "Không hoạt động"}
                  </span>
                </td>
                <td>{classroom.course_name ?? classroom.course}</td>
                <td>
                  {classroom.capacity - classroom.remaining_slots}/
                  {classroom.capacity}
                </td>
                <td>
                  {classroom.main_teacher
                    ? `${classroom.main_teacher.last_name} ${classroom.main_teacher.first_name}`
                    : "—"}
                </td>
                <td>{formatDate(classroom.start_date)}</td>
                <td>{formatDate(classroom.end_date)}</td>
                <td>{formatDate(classroom.created_at)}</td>
                <td>
                  <span
                    className="icon-edit"
                    onClick={() => handleEdit(classroom)}
                  >
                    <FaPen />
                  </span>
                  <span
                    className="icon-delete"
                    onClick={() =>
                      setDeleteModal({
                        show: true,
                        classId: classroom.id,
                        className: classroom.name,
                        error: "",
                      })
                    }
                  >
                    <ImBin2 />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
              Bạn có chắc muốn xóa lớp học
              <br />
              <strong style={{ color: "#111827" }}>
                "{deleteModal.className}"
              </strong>{" "}
              không?
              <br />
              <span style={{ color: "#ef4444", fontSize: "13px" }}>
                Hành động này không thể hoàn tác.
              </span>
            </p>
            {deleteModal.error && (
              <div className="status-badge badge-warning">
                <span>⚠️</span>
                <span>{deleteModal.error}</span>
              </div>
            )}
            <div
              style={{ display: "flex", gap: "10px", justifyContent: "center" }}
            >
              <button
                className="btn-cancel"
                onClick={() =>
                  setDeleteModal({
                    show: false,
                    classId: null,
                    className: "",
                    error: "",
                  })
                }
              >
                Hủy
              </button>
              <button className="btn-delete" onClick={handleDelete}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-body">
            <span className="modal-close-btn" onClick={handleClose}>
              &times;
            </span>
            <h2 className="title-form">
              {editingClass ? "SỬA LỚP HỌC" : "THÊM LỚP HỌC MỚI"}
            </h2>

            <div className="form-row">
              <div className="input-group">
                <label>Tên lớp</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="VD: IELTS_01"
                />
                {errors.name && (
                  <div className="input-error">{errors.name}</div>
                )}
              </div>
              <div className="input-group">
                <label>Khóa học</label>
                <select
                  name="course"
                  value={form.course}
                  onChange={handleChange}
                >
                  <option value="">-- Chọn khóa học --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.course && (
                  <div className="input-error">{errors.course}</div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Ngày khai giảng</label>
                <DatePicker
                  selected={form.start_date ? new Date(form.start_date) : null}
                  onChange={(date) =>
                    setForm((prev) => ({
                      ...prev,
                      start_date: date.toISOString().split("T")[0],
                    }))
                  }
                  dateFormat="dd/MM/yyyy"
                  locale={vi}
                  placeholderText="DD/MM/YYYY"
                />
                {errors.start_date && (
                  <div className="input-error">{errors.start_date}</div>
                )}
              </div>
              <div className="input-group">
                <label>Ngày kết thúc</label>
                <DatePicker
                  selected={form.end_date ? new Date(form.end_date) : null}
                  onChange={(date) =>
                    setForm((prev) => ({
                      ...prev,
                      end_date: date.toISOString().split("T")[0],
                    }))
                  }
                  dateFormat="dd/MM/yyyy"
                  locale={vi}
                  placeholderText="DD/MM/YYYY"
                />
                {errors.end_date && (
                  <div className="input-error">{errors.end_date}</div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Sĩ số tối đa</label>
                <input
                  type="number"
                  name="capacity"
                  value={form.capacity}
                  onChange={handleChange}
                  placeholder="VD: 20"
                />
                {errors.capacity && (
                  <div className="input-error">{errors.capacity}</div>
                )}
              </div>
              <div className="input-group">
                <label>Giáo viên chính</label>
                <select
                  name="main_teacher"
                  value={form.main_teacher}
                  onChange={handleChange}
                >
                  <option value="">-- Chọn giáo viên --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.last_name} {t.first_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="input-group">
              <label>Lịch học</label>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  margin: "8px 0",
                }}
              >
                {DAY_LABELS.map((label, idx) => {
                  const isSelected = form.schedules.some(
                    (s) => s.day_of_week === idx,
                  );
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleDay(idx)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "20px",
                        border: "1px solid",
                        borderColor: isSelected ? "#1d50a1" : "#ccc",
                        background: isSelected ? "#1d50a1" : "#fff",
                        color: isSelected ? "#fff" : "#374151",
                        cursor: "pointer",
                        fontSize: "13px",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {form.schedules
                .sort((a, b) => a.day_of_week - b.day_of_week)
                .map((s) => (
                  <div
                    key={s.day_of_week}
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                      padding: "8px 12px",
                      background: "#f0f4ff",
                      borderRadius: "8px",
                      margin: "4px 0",
                    }}
                  >
                    <span
                      style={{
                        minWidth: "55px",
                        fontWeight: 600,
                        fontSize: "13px",
                        color: "#1d50a1",
                      }}
                    >
                      {DAY_LABELS[s.day_of_week]}
                    </span>

                    <select
                      value={`${s.start_time}-${s.end_time}`}
                      onChange={(e) => {
                        const slot = TIME_SLOTS.find(
                          (t) => `${t.start}-${t.end}` === e.target.value,
                        );
                        updateScheduleField(s.day_of_week, {
                          start_time: slot.start,
                          end_time: slot.end,
                        });
                      }}
                      style={{
                        flex: 1,
                        padding: "6px 8px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        fontSize: "13px",
                      }}
                    >
                      {TIME_SLOTS.map((t) => (
                        <option key={t.label} value={`${t.start}-${t.end}`}>
                          {t.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={s.room}
                      onChange={(e) =>
                        updateScheduleField(s.day_of_week, {
                          room: e.target.value,
                        })
                      }
                      style={{
                        flex: 1,
                        padding: "6px 8px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        fontSize: "13px",
                      }}
                    >
                      <option value="">-- Chọn phòng --</option>
                      {rooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}

              {errors.schedules && (
                <div className="input-error">{errors.schedules}</div>
              )}
            </div>

            {errors.general && (
              <div className="status-badge badge-warning">
                <span>⚠️</span>
                <span>{errors.general}</span>
              </div>
            )}

            <div className="modal-actions">
              <button
                className="btn-save"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
              <button className="btn-cancel" onClick={handleClose}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.show && <div className="toast-badge">{toast.message}</div>}
    </div>
  );
};
export default ClassManagement;
