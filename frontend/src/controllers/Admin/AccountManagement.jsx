import { useEffect, useState } from "react";
import "../../styles/AccountManagement.css";
import "../../styles/Styles.css";
import {
  getUsers,
  updateUser,
  lockUser,
  changeUserRole,
  createTeacher,
} from "../../services/manageService";
import { FaLock, FaPen, FaUnlock } from "react-icons/fa6";
import { formatDate } from "../../utils/format";

const ROLES = ["Student", "Teacher", "Admin"];

const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  email: "",
  phone_num: "",
};

const EMPTY_CREATE_FORM = {
  first_name: "",
  last_name: "",
  email: "",
  username: "",
  password: "",
  confirm_password: "",
  phone_num: "",
};

const AccountManagement = () => {
  const [users, setUsers] = useState([]);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [lockModal, setLockModal] = useState({
    show: false,
    user: null,
    loading: false,
    error: "",
  });
  const [roleModal, setRoleModal] = useState({
    show: false,
    user: null,
    role: "",
    loading: false,
    error: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [createErrors, setCreateErrors] = useState({});
  const [createLoading, setCreateLoading] = useState(false);

  const validateCreate = () => {
    const errors = {};
    if (!createForm.first_name.trim()) errors.first_name = "Vui lòng nhập tên";
    if (!createForm.last_name.trim()) errors.last_name = "Vui lòng nhập họ";
    if (!createForm.email.trim()) errors.email = "Vui lòng nhập email";
    if (!createForm.username.trim()) errors.username = "Vui lòng nhập username";
    if (!createForm.password.trim()) errors.password = "Vui lòng nhập mật khẩu";
    if (!createForm.confirm_password.trim())
      errors.confirm_password = "Vui lòng xác nhận mật khẩu";
    if (
      createForm.password &&
      createForm.confirm_password &&
      createForm.password !== createForm.confirm_password
    ) {
      errors.confirm_password = "Mật khẩu không khớp";
    }
    if (!createForm.phone_num.trim())
      errors.phone_num = "Vui lòng nhập số điện thoại";
    return errors;
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3000,
    );
  };

  const loadUsers = async (page = 1) => {
    try {
      const res = await getUsers(page);
      setUsers(res.results);
      setTotalPages(Math.ceil(res.count / 20));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadUsers(currentPage);
  }, [currentPage]);

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

  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setForm({
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      phone_num: u.phone_num ?? "",
    });
    setFormErrors({});
    setShowFormModal(true);
  };

  const validate = () => {
    const errors = {};
    if (!form.first_name.trim()) errors.first_name = "Vui lòng nhập tên";
    if (!form.last_name.trim()) errors.last_name = "Vui lòng nhập họ";
    if (!form.email.trim()) errors.email = "Vui lòng nhập email";
    return errors;
  };

  const handleSubmitEdit = async () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormLoading(true);
    try {
      const res = await updateUser(editingUser.id, form);
      console.log("response:", res);
      showToast("Cập nhật tài khoản thành công!");
      setShowFormModal(false);
      loadUsers();
    } catch (err) {
      console.log("err:", err);
      console.log("err.response:", err?.response);
      showToast(err?.response?.data?.message || "Có lỗi xảy ra", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreate = async () => {
    const errors = validateCreate();
    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }
    setCreateLoading(true);
    try {
      const { confirm_password, ...payload } = createForm;
      await createTeacher(payload);
      showToast("Tạo tài khoản giáo viên thành công!");
      setShowCreateModal(false);
      setCreateForm(EMPTY_CREATE_FORM);
      loadUsers(currentPage);
    } catch (err) {
      showToast(err?.response?.data?.message || "Có lỗi xảy ra", "error");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleLock = async () => {
    setLockModal((prev) => ({ ...prev, loading: true, error: "" }));
    try {
      await lockUser(lockModal.user.id);
      showToast(
        lockModal.user.is_active
          ? "Đã khóa tài khoản!"
          : "Đã mở khóa tài khoản!",
      );
      setLockModal({ show: false, user: null, loading: false, error: "" });
      loadUsers();
    } catch (err) {
      setLockModal((prev) => ({
        ...prev,
        loading: false,
        error: err?.response?.data?.message || "Thao tác thất bại",
      }));
    }
  };

  const handleChangeRole = async () => {
    setRoleModal((prev) => ({ ...prev, loading: true, error: "" }));
    try {
      await changeUserRole(roleModal.user.id, { role: roleModal.role });
      showToast("Cập nhật vai trò thành công!");
      setRoleModal({
        show: false,
        user: null,
        role: "",
        loading: false,
        error: "",
      });
      loadUsers();
    } catch (err) {
      setRoleModal((prev) => ({
        ...prev,
        loading: false,
        error: err?.response?.data?.message || "Thao tác thất bại",
      }));
    }
  };
  return (
    <div className="page-layout">
      <div className="page-header">
        <h1>Quản lý tài khoản người dùng</h1>
        <button
          className="add-btn"
          onClick={() => {
            setCreateForm(EMPTY_CREATE_FORM);
            setCreateErrors({});
            setShowCreateModal(true);
          }}
        >
          Tạo tài khoản
        </button>
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
                  <span
                    className={`role-badge ${getRoleClass(u.role)}`}
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setRoleModal({
                        show: true,
                        user: u,
                        role: u.role ?? "Student",
                        loading: false,
                        error: "",
                      })
                    }
                    title="Đổi vai trò"
                  >
                    {u.role}
                  </span>
                </td>
                <td>{formatDate(u.last_login)}</td>
                <td>{formatDate(u.date_joined)}</td>
                <td>
                  <span className="icon-edit" onClick={() => handleOpenEdit(u)}>
                    <FaPen />
                  </span>
                  <span
                    className="icon-delete"
                    onClick={() =>
                      setLockModal({
                        show: true,
                        user: u,
                        loading: false,
                        error: "",
                      })
                    }
                    title={u.is_active ? "Khóa tài khoản" : "Mở khóa"}
                  >
                    {u.is_active ? <FaLock /> : <FaUnlock />}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          className="page-btn"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          &laquo;
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(
            (p) =>
              p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2,
          )
          .reduce((acc, p, idx, arr) => {
            if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
            acc.push(p);
            return acc;
          }, [])
          .map((p, idx) =>
            p === "..." ? (
              <span key={`ellipsis-${idx}`} className="page-ellipsis">
                ...
              </span>
            ) : (
              <button
                key={p}
                className={`page-btn ${currentPage === p ? "active" : ""}`}
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </button>
            ),
          )}

        <button
          className="page-btn"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          &raquo;
        </button>
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div
            className="modal-body"
            style={{ maxWidth: "460px", width: "90%" }}
          >
            <span
              className="modal-close-btn"
              onClick={() => setShowCreateModal(false)}
            >
              &times;
            </span>
            <h2 className="title-form">TẠO TÀI KHOẢN GIÁO VIÊN</h2>
            {[
              { field: "last_name", label: "Họ" },
              { field: "first_name", label: "Tên" },
              { field: "email", label: "Email" },
              { field: "username", label: "Username" },
              { field: "password", label: "Mật khẩu", type: "password" },
              {
                field: "confirm_password",
                label: "Xác nhận mật khẩu",
                type: "password",
              },
              { field: "phone_num", label: "Số điện thoại" },
            ].map(({ field, label, type = "text" }) => (
              <div className="input-group" key={field}>
                <label>
                  {label} <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type={type}
                  value={createForm[field]}
                  onChange={(e) => {
                    setCreateForm((prev) => ({
                      ...prev,
                      [field]: e.target.value,
                    }));
                    setCreateErrors((prev) => ({
                      ...prev,
                      [field]: undefined,
                    }));
                  }}
                />
                {createErrors[field] && (
                  <div className="input-error">{createErrors[field]}</div>
                )}
              </div>
            ))}
            <div className="modal-actions">
              <button
                className="btn-save"
                onClick={handleCreate}
                disabled={createLoading}
              >
                {createLoading ? "Đang tạo..." : "Tạo mới"}
              </button>
              <button
                className="btn-cancel"
                onClick={() => setShowCreateModal(false)}
                disabled={createLoading}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

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
            <h2 className="title-form">SỬA THÔNG TIN</h2>
            {[
              { field: "last_name", label: "Họ" },
              { field: "first_name", label: "Tên" },
              { field: "email", label: "Email" },
              { field: "phone_num", label: "Số điện thoại" },
            ].map(({ field, label }) => (
              <div className="input-group" key={field}>
                <label>
                  {label}{" "}
                  {field !== "phone_num" && (
                    <span style={{ color: "red" }}>*</span>
                  )}
                </label>
                <input
                  value={form[field]}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, [field]: e.target.value }));
                    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
                  }}
                />
                {formErrors[field] && (
                  <div className="input-error">{formErrors[field]}</div>
                )}
              </div>
            ))}
            <div className="modal-actions">
              <button
                className="btn-save"
                onClick={handleSubmitEdit}
                disabled={formLoading}
              >
                {formLoading ? "Đang lưu..." : "Cập nhật"}
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

      {lockModal.show && (
        <div className="modal-overlay">
          <div
            className="modal-body"
            style={{ maxWidth: "420px", textAlign: "center", padding: "32px" }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: 28,
              }}
            >
              {lockModal.user?.is_active ? "🔒" : "🔓"}
            </div>
            <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>
              {lockModal.user?.is_active
                ? "Khóa tài khoản"
                : "Mở khóa tài khoản"}
            </h2>
            <p style={{ color: "#6b7280", fontSize: 14, margin: "0 0 20px" }}>
              Bạn có chắc muốn {lockModal.user?.is_active ? "khóa" : "mở khóa"}{" "}
              tài khoản{" "}
              <strong style={{ color: "#111827" }}>
                {lockModal.user?.username}
              </strong>{" "}
              không?
            </p>
            {lockModal.error && (
              <div className="badge-warning" style={{ marginBottom: 12 }}>
                ⚠️ {lockModal.error}
              </div>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                className="btn-cancel"
                disabled={lockModal.loading}
                onClick={() =>
                  setLockModal({
                    show: false,
                    user: null,
                    loading: false,
                    error: "",
                  })
                }
              >
                Hủy
              </button>
              <button
                className="btn-delete"
                disabled={lockModal.loading}
                onClick={handleLock}
              >
                {lockModal.loading ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

      {roleModal.show && (
        <div className="modal-overlay">
          <div
            className="modal-body"
            style={{ maxWidth: "400px", width: "90%" }}
          >
            <span
              className="modal-close-btn"
              onClick={() =>
                setRoleModal({
                  show: false,
                  user: null,
                  role: "",
                  loading: false,
                  error: "",
                })
              }
            >
              &times;
            </span>
            <h2 className="title-form">PHÂN QUYỀN</h2>
            <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 16 }}>
              Tài khoản: <strong>{roleModal.user?.username}</strong>
            </p>
            <div className="input-group">
              <label>Vai trò</label>
              <select
                value={roleModal.role}
                onChange={(e) =>
                  setRoleModal((prev) => ({ ...prev, role: e.target.value }))
                }
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            {roleModal.error && (
              <div className="badge-warning">⚠️ {roleModal.error}</div>
            )}
            <div className="modal-actions">
              <button
                className="btn-save"
                onClick={handleChangeRole}
                disabled={roleModal.loading}
              >
                {roleModal.loading ? "Đang lưu..." : "Cập nhật"}
              </button>
              <button
                className="btn-cancel"
                onClick={() =>
                  setRoleModal({
                    show: false,
                    user: null,
                    role: "",
                    loading: false,
                    error: "",
                  })
                }
                disabled={roleModal.loading}
              >
                Hủy
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

export default AccountManagement;
