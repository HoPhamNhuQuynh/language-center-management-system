import "../Navbar/Navbar.css";
import logo from "../../assets/hero.png";
import { Link } from "react-router-dom";

function Navbar() {
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
          <Link to="/register">
            <button className="btn btn--outline">Đăng ký</button>
          </Link>
          <Link to="/login">
            <button className="btn btn--primary">Đăng nhập</button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Navbar;