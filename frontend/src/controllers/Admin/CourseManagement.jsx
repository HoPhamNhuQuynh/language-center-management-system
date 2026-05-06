import { useEffect, useState } from 'react';
import '../../styles/CourseManagement.css';
import "../../styles/Styles.css";
import { FaPen } from "react-icons/fa6";
import { ImBin2 } from 'react-icons/im';
import { createCourse, deleteCourse, getCourses, getLevels, updateCourse } from '../../services/manageService';
import { formatDate } from '../../utils/format';

const INITIAL_FORM = {
  name: "",
  level: "",
  description: "",
  image: null,
  price: 0.0,
  active: true,
  total_sessions: "",
};

const CourseManagement = () => {
    const [showModal, setShowModal] = useState(false);
    const [courses, setCourses] = useState([]);
    const [levels, setLevels] = useState([]);
    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [deleteModal, setDeleteModal] = useState({
                                            show: false, 
                                            courseId: null, 
                                            courseName: "",
                                            error: "" });
    const [toast, setToast] = useState({ show: false, message: "" });

    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: "" }), 3000);
    };

    const loadCourses = async() => {
        let res = await getCourses();
        const sorted = res.sort((a, b) => a.id - b.id);
        setCourses(sorted);
        console.info(sorted);
    }

    const loadLevels = async () => {
        const res = await getLevels();
        setLevels(res);
    };

    useEffect(() => {
        loadCourses();
        loadLevels();
    }, []); 

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) 
            errs.name = "Vui lòng nhập tên khóa học";
        if (!form.level)          
            errs.level = "Vui lòng chọn cấp độ";
        if (!form.description.trim()) 
            errs.description = "Vui lòng nhập mô tả";
        if (!form.price) 
            errs.price = "Vui lòng nhập học phí";
        else if (form.price < 2000000) 
          errs.price = "Học phí tối thiểu là 2 triệu VND";
        if (!form.total_sessions)
            errs.total_sessions = "Vui lòng nhập số buổi học";
        else if (form.total_sessions < 10 || form.total_sessions > 30)
            errs.total_sessions = "Số buổi học phải từ 10 đến 30 buổi";
        else if (editingCourse && form.total_sessions < editingCourse.actual_total_sessions)
            errs.total_sessions = `Không thể giảm xuống dưới ${editingCourse.actual_total_sessions} buổi đã tạo thực tế`;
        return errs;
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setForm((prev) => ({
        ...prev,
        [name]: files ? files[0] 
           : name === "active" ? value === "true"
           : value,   
        }));
        setErrors((prev) => ({ ...prev, [name]: undefined })); 
    };

    const handleClose = () => {
        setShowModal(false);
        setForm(INITIAL_FORM);
        setErrors({});
        setEditingCourse(null); 
    };

    const handleEdit = (course) => {
        setEditingCourse(course);
        setForm({
            name: course.name,
            level: course.level,
            description: course.description,
            price: course.price,
            image: null,
            active: course.active,
            total_sessions: course.total_sessions ?? "",
        });
        setShowModal(true);
    };

    const handleDelete = async () => {
        try {
            await deleteCourse(deleteModal.courseId);
            await loadCourses();
            setDeleteModal({ show: false, courseId: null, courseName: "", error: "" });
            showToast("Xóa khóa học thành công!");
        } catch (ex) {
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
            const payload = new FormData();
            payload.append("name", form.name);
            payload.append("level", form.level);
            payload.append("price", form.price);
            payload.append("description", form.description);
            payload.append("active", form.active);
            payload.append("total_sessions", form.total_sessions);
            if (form.image) payload.append("image", form.image);

            if (editingCourse) {
            await updateCourse(editingCourse.id, payload); 
            } else {
            await createCourse(payload); 
            }
            await loadCourses();
            showToast(editingCourse ? "Cập nhật khóa học thành công!" : "Thêm khóa học thành công!");
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
          <h1>Quản lý khóa học</h1>
          <button className="add-btn" onClick={() => setShowModal(true)}>
            Thêm
          </button>
        </div>

        <div className="table-wrapper">
          <table className="data-table course-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên khóa học</th>
                <th>Trạng thái</th>
                <th>Mô tả</th>
                <th>Cấp độ</th>
                <th>Số buổi</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td>{course.id}</td>
                  <td>{course.name}</td>
                  <td>
                    <span
                      className={`status-badge ${course.active ? "active" : "inactive"}`}
                    >
                      {course.active ? "Đang hoạt động" : "Không hoạt động"}
                    </span>
                  </td>
                  <td>{course.description}</td>
                  <td>{course.level_name}</td>
                  <td>{course.total_sessions}</td>
                  <td>{formatDate(course.created_at)}</td>
                  <td>
                    <span
                      className="icon-edit"
                      onClick={() => handleEdit(course)}
                    >
                      <FaPen />
                    </span>
                    <span
                      className="icon-delete"
                      onClick={() =>
                        setDeleteModal({
                          show: true,
                          courseId: course.id,
                          courseName: course.name,
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
              style={{
                maxWidth: "420px",
                textAlign: "center",
                padding: "32px",
              }}
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
                Bạn có chắc muốn xóa khóa học
                <br />
                <strong style={{ color: "#111827" }}>
                  "{deleteModal.courseName}"
                </strong>{" "}
                không?
                <br />
                <span style={{ color: "#ef4444", fontSize: "13px" }}>
                  Hành động này không thể hoàn tác.
                </span>
              </p>

              {deleteModal.error && (
                <div className="status-badge badge-warning">
                  <span style={{ fontSize: "16px" }}>⚠️</span>
                  <span>{deleteModal.error}</span>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "center",
                }}
              >
                <button
                  className="btn-cancel"
                  onClick={() =>
                    setDeleteModal({
                      show: false,
                      courseId: null,
                      courseName: "",
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
                {editingCourse ? "SỬA KHÓA HỌC" : "THÊM KHÓA HỌC MỚI"}
              </h2>

              <div className="form-row">
                <div className="input-group">
                  <label>Tên khóa</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="VD: IELTS 6.5"
                  />
                  {errors.name && (
                    <div className="input-error">{errors.name}</div>
                  )}
                </div>

                <div className="input-group">
                  <label>Học phí (VND)</label>
                  <input
                    type="text"
                    name="price"
                    value={Number(form.price).toLocaleString("vi-VN")}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\./g, "");
                      setForm((prev) => ({ ...prev, price: raw }));
                      setErrors((prev) => ({ ...prev, price: undefined }));
                    }}
                    placeholder="VD: 2.000.000"
                  />
                  {errors.price && (
                    <div className="input-error">{errors.price}</div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Cấp độ</label>
                  <select
                    name="level"
                    value={form.level}
                    onChange={handleChange}
                  >
                    <option value="">-- Chọn cấp độ --</option>
                    {levels.map((lv) => (
                      <option key={lv.id} value={lv.id}>
                        {lv.name}
                      </option>
                    ))}
                  </select>
                  {errors.level && (
                    <div className="input-error">{errors.level}</div>
                  )}
                </div>
                <div className="input-group">
                  <label>Số buổi học (kế hoạch)</label>
                  <input
                    type="number"
                    name="total_sessions"
                    value={form.total_sessions}
                    onChange={handleChange}
                    placeholder="VD: 20"
                  />
                  {errors.total_sessions && (
                    <div className="input-error">{errors.total_sessions}</div>
                  )}
                </div>
                <div className="input-group">
                  <label>Trạng thái</label>
                  <select
                    name="active"
                    value={String(form.active)}
                    onChange={handleChange}
                  >
                    <option value="true">Đang hoạt động</option>
                    <option value="false">Không hoạt động</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Mô tả khóa học</label>
                <textarea
                  name="description"
                  rows="4"
                  value={form.description}
                  onChange={handleChange}
                />
                {errors.description && (
                  <div className="input-error">{errors.description}</div>
                )}
              </div>

              <div className="input-group">
                <label>Ảnh khóa học</label>

                {editingCourse?.image && !form.image && (
                  <img
                    src={editingCourse.image}
                    alt="Ảnh hiện tại"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  />
                )}

                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                />
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

export default CourseManagement;