import '../../styles/AccountManagement.css';

const AccountManagement = () => {
  return (
    <div className="account-container">
      <div className="account-header">
        <h2>Quản lý tài khoản hệ thống</h2>
        <button className="btn-add-red">Tạo tài khoản</button>
      </div>

      <div className="account-table-card">
        <table>
          <thead>
            <tr>
              <th>Họ và tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Nguyễn Văn A</td>
              <td>teacherA@gmail.com</td>
              <td>0901234567</td>
              <td><span className="role-badge teacher">Giáo viên</span></td>
              <td><span className="status-active">Đang hoạt động</span></td>
              <td>
                <button className="btn-icon">✏️</button>
                <button className="btn-icon">🔒</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountManagement;