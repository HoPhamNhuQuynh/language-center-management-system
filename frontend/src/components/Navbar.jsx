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
          <a href="/">Home</a>
          <a href="/">Course</a>
          <a href="/">Class</a>
          <a href="/">About us</a>
          <a href="/">Blog</a>
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