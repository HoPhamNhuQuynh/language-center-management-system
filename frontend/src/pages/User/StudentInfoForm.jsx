import { Link } from "react-router-dom";
function StudentInfoForm({ logo, user, studentProfile, tuition, courses }) {
  return (
    <div className="student-info-layout">
      <aside className="student-info-sidebar">
        <div className="student-info-sidebar__logo">
          <img src={logo} alt="Logo" />
        </div>

        <button className="student-info-sidebar__btn active">
          Thông tin học viên
        </button>
        <button className="student-info-sidebar__btn">Lịch học</button>
      </aside>

      <main className="student-info-main">
        <h1 level={1} style={{ textAlign: "center" }}>
          THÔNG TIN HỌC VIÊN
        </h1>
        <section className="student-profile-card">
          <div className="student-profile-content">
            <p>Họ tên: {studentProfile.fullName}</p>
            <p>Số điện thoại: {studentProfile.phone}</p>
            <p>Email: {studentProfile.email}</p>

            <button className="student-profile-edit-btn">
              <span className="student-profile-edit-icon">✎</span>
              <span>Chỉnh sửa thông tin cá nhân</span>
              </button>
          </div>

          <div className="student-profile-avatar">
            <div className="student-profile-avatar-inner"></div>
          </div>
      


          
        </section>

        <section className="student-tuition-section">
          <h2>HỌC PHÍ</h2>
          <p>
            Học phí đã đóng: {tuition.paid}
        <Link to="/payment-history" className="student-tuition-history">
  Xem lịch sử thanh toán
</Link>
          </p>
          <p>Học phí còn nợ: {tuition.remaining}</p>
        </section>

        <section className="student-course-section">
          <h2>KHÓA HỌC CỦA BẠN</h2>

          <div className="student-course-table-wrapper">
            <table className="student-course-table">
              <thead>
                <tr>
                  <th>MÃ LỚP</th>
                  <th>TÊN LỚP</th>
                  <th>LỊCH HỌC</th>
                  <th>GIÁO VIÊN</th>
                  <th>TRẠNG THÁI</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>{course.classCode}</td>
                    <td>{course.className}</td>
                    <td>{course.schedule}</td>
                    <td>{course.teacher}</td>
                    <td>{course.status}</td>
                    <td>
                      <span className="student-course-detail">Xem chi tiết</span>
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