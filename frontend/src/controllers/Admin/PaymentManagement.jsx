import { useEffect, useState } from "react";
import "../../styles/PaymentManagement.css";
import "../../styles/Styles.css";
import { getUsers } from "../../services/manageService";
import { FaLock, FaPen } from "react-icons/fa6";
import { formatDate } from "../../utils/format";

const PaymentManagement = () => {
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    try {
      let res = await getUsers();
      console.info(res);
      setUsers(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const getRoleClass = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "admin";
      case "teacher":
        return "teacher";
      case "student":
        return "student";
      default:
        return "";
    }
  };

  return (
    <div className="page-layout">
      <div className="page-header">
        <h1>Quản lý doanh thu trung tâm</h1>
        <button className="add-btn">Tạo tài khoản</button>
      </div>

      <div className="table-wrapper">
        <table className="data-table account-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ và tên</th>
              <th>Email</th>
              <th>Username</th>
              <th>Số điện thoại</th>
              <th>Trạng thái</th>
              <th>Loại chứng thực</th>
              <th>Vai trò</th>
              <th>Last login</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>
                  {u.first_name} {u.last_name}
                </td>
                <td>{u.email}</td>
                <td>{u.username}</td>
                <td>{u.phone_num}</td>
                <td>
                  <span
                    className={`status-badge ${u.is_active ? "active" : "inactive"}`}
                  >
                    {u.is_active ? "Đang hoạt động" : "Không hoạt động"}
                  </span>
                </td>
                <td>{u.auth_provider}</td>
                <td>
                  <span className={`role-badge ${getRoleClass(u.role)}`}>
                    {u.role}
                  </span>
                </td>
                <td>{formatDate(u.last_login)}</td>
                <td>{formatDate(u.date_joined)}</td>
                <td>
                  <span className="icon-edit">
                    <FaPen />
                  </span>
                  <span className="icon-delete">
                    <FaLock />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentManagement;
