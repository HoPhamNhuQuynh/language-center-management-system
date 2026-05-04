import { useEffect, useState } from 'react';
import '../../styles/ClassManagement.css';
import { FaPen } from "react-icons/fa6";
import { ImBin2 } from 'react-icons/im';
import { formatDate } from '../../utils/format';
import { createClass, deleteClass, getClasses, getCourses, getTeachers, updateClass } from '../../services/manageService';
import { vi } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';

const INITIAL_FORM = {
  name: "",
  course: "",
  start_date: "",
  end_date: "",
  capacity: "",
  grade_deadline: "",
  grade_status: "",
  main_teacher: "",
};

const ClassManagement = () => {
    const [showModal, setShowModal] = useState(false);
    const [classes, setClasses] = useState([]);
    const [courses, setCourses] = useState([]);      
    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [deleteModal, setDeleteModal] = useState({
      show: false, classId: null, className: "", error: ""
    });
    const [teachers, setTeachers] = useState([]);
    const [toast, setToast] = useState({ show: false, message: "" });

    const showToast = (message) => {
      setToast({ show: true, message });
      setTimeout(() => setToast({ show: false, message: "" }), 3000); 
    };

    const loadClasses = async () => {
      let res = await getClasses();
      const sorted = res.sort((a, b) => a.id - b.id);
      setClasses(sorted);
      console.info(sorted)
    };

    const loadCourses = async () => {
      let res = await getCourses();
      setCourses(res);  
    }

    const loadTeachers = async () => {
      let res = await getTeachers(); 
      setTeachers(res);
    };

    useEffect(() => {
      loadClasses();
      loadCourses();
      loadTeachers();
    }, []);

    const validate = () => {
      const errs = {};
      if (!form.name.trim())    
        errs.name = "Vui lòng nhập tên lớp học";
      if (!form.course)         
        errs.course = "Vui lòng chọn khóa học";
      if (!form.start_date)     
        errs.start_date = "Vui lòng chọn ngày khai giảng";
      if (!form.end_date)       
        errs.end_date = "Vui lòng chọn ngày kết thúc";
      if (!form.capacity)       
        errs.capacity = "Vui lòng nhập sĩ số tối đa";
      else if (form.capacity < 10 || form.capacity > 50)
        errs.capacity = "Sĩ số phải từ 10 đến 50 học viên";
      if (form.start_date && form.end_date && form.end_date <= form.start_date)
        errs.end_date = "Ngày kết thúc phải sau ngày khai giảng";
      return errs;
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, 
        [name]: name === "active" ? Number(value) : value
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
      if (Object.keys(errs).length > 0) { setErrors(errs); return; }

      try {
        setSaving(true);
        const payload = new FormData();
        payload.append("name",       form.name);
        payload.append("course",     form.course);
        payload.append("start_date", form.start_date);
        payload.append("end_date",   form.end_date);
        payload.append("capacity",   form.capacity);
        if (form.main_teacher) 
          payload.append("main_teacher_id", form.main_teacher);

        if (editingClass) {
          await updateClass(editingClass.id, payload);
        } else {
          await createClass(payload);
        }
        await loadClasses();
        showToast(editingClass ? "Cập nhật lớp học thành công!" : "Thêm lớp học thành công!"); 
        handleClose();
      } catch (ex) {
        console.error(ex);
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="course-page">
        <div className="course-header">
          <h1>Quản lý lớp học</h1>
          <button className="add-button" onClick={() => setShowModal(true)}>Thêm</button>
        </div>

        <div className="course-table-wrapper">
          <table className="course-table">
            <thead>
              <tr>
                <th>Mã lớp</th>
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
                  <td>{classroom.name}</td>
                  <td>
                    <span 
                      className={`status-badge ${classroom.active ? "active" : "inactive"}`}
                      title="Tự động active khi có từ 10 học viên đăng ký"
                    >
                      {classroom.active ? "Đang hoạt động" : "Không hoạt động"}
                    </span>
                  </td>
                  <td>{classroom.course_name ?? classroom.course}</td>
                  <td>{classroom.capacity}</td>
                  <td>
                    {classroom.main_teacher
                      ? `${classroom.main_teacher.last_name} ${classroom.main_teacher.first_name}`
                      : "—"}
                  </td>
                  <td>{formatDate(classroom.start_date)}</td>
                  <td>{formatDate(classroom.end_date)}</td>
                  <td>{formatDate(classroom.created_at)}</td>
                  <td>
                    <span className="icon-edit" onClick={() => handleEdit(classroom)}><FaPen /></span>
                    <span className="icon-delete" onClick={() => setDeleteModal({ show: true, classId: classroom.id, className: classroom.name, error: "" })}><ImBin2 /></span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {deleteModal.show && (
          <div className="course-modal">
            <div className="modal-body" style={{ maxWidth: "420px", textAlign: "center", padding: "32px" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "28px" }}>
                🗑️
              </div>
              <h2 style={{ margin: "0 0 8px", fontSize: "18px" }}>Xác nhận xóa</h2>
              <p style={{ color: "#6b7280", fontSize: "14px", margin: "0 0 20px", lineHeight: "1.6" }}>
                Bạn có chắc muốn xóa lớp học<br />
                <strong style={{ color: "#111827" }}>"{deleteModal.className}"</strong> không?<br />
                <span style={{ color: "#ef4444", fontSize: "13px" }}>Hành động này không thể hoàn tác.</span>
              </p>
              {deleteModal.error && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fff7ed", border: "1px solid #fed7aa", color: "#c2410c", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "20px", textAlign: "left" }}>
                  <span>⚠️</span><span>{deleteModal.error}</span>
                </div>
              )}
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button onClick={() => setDeleteModal({ show: false, classId: null, className: "", error: "" })} style={{ padding: "9px 24px", borderRadius: "8px", border: "1px solid #d1d5db", background: "#fff", color: "#374151", cursor: "pointer", fontSize: "14px" }}>Hủy</button>
                <button onClick={handleDelete} style={{ padding: "9px 24px", borderRadius: "8px", border: "none", background: "#ef4444", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>Xóa</button>
              </div>
            </div>
          </div>
        )}

        {showModal && (
          <div className="course-modal">
            <div className="modal-body">
              <span className="close-btn" onClick={handleClose}>&times;</span>
              <h2>{editingClass ? "Sửa lớp học" : "Thêm lớp học"}</h2>

              <div className="form-row">
                <div className="input-group">
                  <label>Tên lớp</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="VD: IELTS_01" />
                  {errors.name && <div className="input-error">{errors.name}</div>}
                </div>

                <div className="input-group">
                  <label>Khóa học</label>
                  <select name="course" value={form.course} onChange={handleChange}>
                    <option value="">-- Chọn khóa học --</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.course && <div className="input-error">{errors.course}</div>}
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Ngày khai giảng</label>
                  <div>
                    <DatePicker
                      selected={form.start_date ? new Date(form.start_date) : null}
                      onChange={(date) => {
                        setForm((prev) => ({ ...prev, start_date: date.toISOString().split("T")[0] }));
                      }}
                      dateFormat="dd/MM/yyyy"
                      locale={vi}
                      placeholderText="DD/MM/YYYY"
                      className="date-input"
                    />
                  </div>
                  {errors.start_date && <div className="input-error">{errors.start_date}</div>}
                </div>

                <div className="input-group">
                  <label>Ngày kết thúc</label>
                  <div>
                    <DatePicker
                      selected={form.end_date ? new Date(form.end_date) : null}
                      onChange={(date) => {
                        setForm((prev) => ({ ...prev, end_date: date.toISOString().split("T")[0] }));
                      }}
                      dateFormat="dd/MM/yyyy"
                      locale={vi}
                      placeholderText="DD/MM/YYYY"
                      className="date-input"
                    />
                  </div>
                  {errors.end_date && <div className="input-error">{errors.end_date}</div>}
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Sĩ số tối đa</label>
                  <input type="number" name="capacity" value={form.capacity} onChange={handleChange} placeholder="VD: 20" />
                  {errors.capacity && <div className="input-error">{errors.capacity}</div>}
                </div>

                <div className="input-group">
                  <label>Giáo viên chính</label>
                  <select name="main_teacher" value={form.main_teacher} onChange={handleChange}>
                    <option value="">-- Chọn giáo viên --</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.last_name} {t.first_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn-save" onClick={handleSave} disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu"}
                </button>
                <button className="btn-cancel" onClick={handleClose}>Hủy</button>
              </div>
            </div>
          </div>
        )}

      {toast.show && (
        <div style={{
          position: "fixed", bottom: "24px", right: "24px",
          background: "#16a34a", color: "#fff",
          padding: "12px 20px", borderRadius: "10px",
          fontSize: "14px", fontWeight: "500",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          display: "flex", alignItems: "center", gap: "8px",
          zIndex: 9999,
          animation: "fadeIn 0.3s ease"
        }}>
          {toast.message}
        </div>
      )}  
      </div>
    );
};
export default ClassManagement;