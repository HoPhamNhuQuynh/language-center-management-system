import "./Footer.css";
function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__top">
        <div className="footer__left">
          <h2>LOGO</h2>
          <p>20 XYZ Road, London</p>
          <p>AB1 2CD</p>
          <div className="footer__socials">
            <span>f</span>
            <span>in</span>
            <span>x</span>
            <span>ig</span>
          </div>
        </div>

        <div className="footer__right">
          <div className="footer__links">
            <a href="/">Label</a>
            <a href="/">Label</a>
            <a href="/">Label</a>
            <a href="/">Label</a>
            <a href="/">Label</a>
            <a href="/">Label</a>
          </div>
          <p className="footer__copyright">Product Name © 2023</p>
        </div>
      </div>

      <div className="container footer__bottom">
        <a href="/">Privacy</a>
        <a href="/">Terms</a>
        <a href="/">Legal</a>
      </div>
    </footer>
  );
}

export default Footer;