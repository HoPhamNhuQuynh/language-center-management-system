import "../Navbar/Navbar.css";
import logo from "../../assets/hero.png";
import { Link, useNavigate } from "react-router-dom";
import { getAccessToken, clearTokens } from "../../utils/token";
import { revokeTokenApi } from "../../services/AuthService"

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!getAccessToken();

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
          <a href="/">Trang chủ</a>
          <a href="/">Khóa học</a>
          <a href="/">Lớp học</a>
          <a href="/">Thông tin</a>
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