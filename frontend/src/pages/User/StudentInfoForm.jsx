import { Link } from "react-router-dom";
import { useRef } from "react";

function StudentInfoForm({ user, studentProfile, tuition, courses, isModalOpen, editData, setEditData, onOpenModal, onSave, setIsOpen, onAvatarChange }) {
  const fileInputRef = useRef(null);

  return (
    <div className="student-info-layout">
      <main className="student-info-main">
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>THÔNG TIN HỌC VIÊN</h1>

        <section className="student-profile-card">
          <div className="student-profile-content">
            <p>
              <strong>Họ tên:</strong>{" "}
              {isModalOpen ? (
                <span className="inline-name-inputs">
                  <input className="inline-input" value={editData.first_name} placeholder="Họ"
                    onChange={(e) => setEditData({ ...editData, first_name: e.target.value })} />
                  <input className="inline-input" value={editData.last_name} placeholder="Tên"
                    onChange={(e) => setEditData({ ...editData, last_name: e.target.value })} />
                </span>
              ) : studentProfile.fullName}
            </p>
            <p>
              <strong>Số điện thoại:</strong>{" "}
              {isModalOpen ? (
                <input className="inline-input" value={editData.phone_num}
                  onChange={(e) => setEditData({ ...editData, phone_num: e.target.value })} />
              ) : (studentProfile.phone || "Chưa cập nhật")}
            </p>
            <p>
              <strong>Email:</strong>{" "}
              {isModalOpen ? (
                <input className="inline-input" value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })} />
              ) : studentProfile.email}
            </p>

            {isModalOpen ? (
              <div className="inline-actions">
                <button onClick={onSave} className="btn-save-inline">Lưu</button>
                <button onClick={() => setIsOpen(false)} className="btn-cancel-inline">Hủy</button>
              </div>
            ) : (
              <button className="student-profile-edit-btn" onClick={onOpenModal}>
                <span className="student-profile-edit-icon">✎</span>
                <span>Chỉnh sửa thông tin</span>
              </button>
            )}
          </div>

          <div className="student-profile-avatar" onClick={() => fileInputRef.current?.click()}>
            {user?.avatar ? (
              <img src={user?.avatar} alt="avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "22px" }} />
            ) : (
              <div className="student-profile-avatar-inner"></div>
            )}
            <div className="avatar-overlay">Đổi ảnh</div>
            <input ref={fileInputRef} type="file" accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files[0]) onAvatarChange(e.target.files[0]);
              }} />
          </div>
        </section>

        <section className="student-tuition-section">
          <h2>HỌC PHÍ</h2>
          <p>Học phí đã đóng: {tuition.paid}</p>
          <p>Học phí còn nợ: {tuition.remaining}</p>
          <p>
            <Link to="/payment-history" className="student-tuition-history">
              Xem lịch sử thanh toán
            </Link>
          </p>
        </section>

        <section className="student-course-section">
          <h2>KHÓA HỌC CỦA BẠN</h2>
          <div className="student-course-table-wrapper">
            <table className="student-course-table">
              <thead>
                <tr>
                  <th>MÃ LỚP</th><th>TÊN LỚP</th><th>LỊCH HỌC</th>
                  <th>GIÁO VIÊN</th><th>HỌC PHÍ</th><th>TRẠNG THÁI</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course, index) => (
                  <tr key={course.id || index}>
                    <td>{course.classId}</td>
                    <td>{course.className}</td>
                    <td>{course.schedule}</td>
                    <td>{course.teacher}</td>
                    <td>{course.price.toLocaleString('vi-VN')} VND</td>
                    <td>
                      {course.status === "SUCCESS" ? "Đăng ký thành công" :
                        course.status === "PENDING_PAYMENT" ? "Đang chờ thanh toán" :
                          course.status === "PARTIAL_PAYMENT" ? "Thanh toán một phần" :
                            course.status}
                    </td>
                    <td>
                      <Link to="/result-academic" state={{ enrollmentId: course.id, classId: course.classId }}>
                        Xem chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default StudentInfoForm;