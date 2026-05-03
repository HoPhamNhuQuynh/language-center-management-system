import "./Footer.css";
import { FaFacebook, FaLinkedin, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__top">
        <div className="footer__left">
          <h2>QATH</h2>
          <p>Khu dân cư Nhơn Đức</p>
          <p>TP. Hồ Chí Minh, Việt Nam</p>
          <div className="footer__socials">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebook size={20} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <FaLinkedin size={20} />
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer">
              <FaXTwitter size={20} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram size={20} />
            </a>
          </div>
        </div>

        <div className="footer__right">
          <div className="footer__links">
            <a href="/">Trang chủ</a>
            <a href="/courses">Khóa học</a>
            <a href="/schedule">Lịch học</a>
            <a href="/tuition">Học phí</a>
            <a href="/about">Về chúng tôi</a>
            <a href="/contact">Liên hệ</a>
          </div>
          <p className="footer__copyright">Trung tâm ngoại ngữ QATH © 2026</p>
        </div>
      </div>

      <div className="container footer__bottom">
        <a href="/">Chính sách bảo mật</a>
        <a href="/">Điều khoản sử dụng</a>
        <a href="/">Pháp lý</a>
      </div>
    </footer>
  );
}

export default Footer;