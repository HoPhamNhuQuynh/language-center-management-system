import "../Navbar/Navbar.css";
import logo from "../../assets/hero.png";
import { Link, useNavigate } from "react-router-dom";
import { getAccessToken, clearTokens, getRole } from "../../utils/token";
import { revokeTokenApi } from "../../services/authService";

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!getAccessToken();
  const role = getRole();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      console.info(refreshToken)
      
      await revokeTokenApi(refreshToken);
      
      clearTokens();
      navigate("/login");
    } catch (error) {
      console.log("Revoke token failed:", error);
    }
  };

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <div className="navbar__logo">
          <img src={logo} alt="Logo" />
        </div>

        <nav className="navbar__menu">
          {(role === "Student" || !isLoggedIn) && (
            <>
              <Link to="/">Trang chủ</Link>
              <Link to="/about-us">Về chúng tôi</Link>
              <Link to="/course-list">Khóa học</Link>
              <Link to="/student-info">Thông tin cá nhân</Link>
            </>
          )}

          {role === "Teacher" && (
            <>
              <Link to="/attendance">Điểm danh</Link>
              <Link to="/score-entry">Nhập điểm</Link>
              <Link to="/schedule">Lịch dạy</Link>
            </>
          )}

          {role === "Admin" && (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/setting">Quản trị hệ thống</Link>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.open("https://localhost:8000/admin", "django_admin");
                }}
              >
                Django Admin
              </a>
            </>
          )}
        </nav>

        <div className="navbar__actions">
          {isLoggedIn ? (
            <button className="btn btn--primary" onClick={handleLogout}>
              Đăng xuất
            </button>
          ) : (
            <>
              <Link to="/register">
                <button className="btn btn--outline">Đăng ký</button>
              </Link>
              <Link to="/login">
                <button className="btn btn--primary">Đăng nhập</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;