import "./Navbar.css";
import logo from "../assets/hero.png";
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
          <button className="btn btn--outline">Đăng ký</button>
          <button className="btn btn--primary">Đăng nhập</button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;