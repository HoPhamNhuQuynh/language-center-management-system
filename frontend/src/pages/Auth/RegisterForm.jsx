import { Input, Button, Card, Divider, Checkbox } from "antd";
import { Link } from "react-router-dom";
import classImg from "../../assets/class.jpg";
import googleImg from "../../assets/google.png";
import facebookImg from "../../assets/facebook.png";
import "../../styles/Register.css"; 

function RegisterForm() {
  return (
    <div className="auth-container">
      <Card className="auth-card" bodyStyle={{ padding: 0 }}>
        <div className="auth-wrapper">
          {/* Cột bên trái: Hình ảnh */}
          <div
            className="auth-image-side"
            style={{ backgroundImage: `url(${classImg})` }}
          />

          {/* Cột bên phải: Form đăng ký */}
          <div className="auth-form-side">
            <h2 className="auth-title">ĐĂNG KÝ TÀI KHOẢN</h2>

            {/* Group Họ và Tên */}
            <div className="auth-input-group">
              <Input
                placeholder="HỌ*"
                className="auth-input"
                style={{ marginBottom: 0 }}
              />
              <Input
                placeholder="TÊN*"
                className="auth-input"
                style={{ marginBottom: 0 }}
              />
            </div>

            <Input placeholder="SỐ ĐIỆN THOẠI*" className="auth-input" />
            <Input placeholder="TÊN NGƯỜI DÙNG*" className="auth-input" />
            <Input placeholder="EMAIL*" className="auth-input" />

            <Input.Password placeholder="MẬT KHẨU*" className="auth-input" />
            <Input.Password
              placeholder="XÁC NHẬN MẬT KHẨU*"
              className="auth-input"
            />

            <div className="auth-checkbox-wrapper">
              <Checkbox>Tôi đồng ý với Điều khoản và Chính sách</Checkbox>
            </div>

            <Button type="primary" className="auth-submit-btn">
              ĐĂNG KÝ
            </Button>

            <Divider plain style={{ margin: "20px 0" }}>
              Hoặc đăng ký bằng
            </Divider>

            <div className="auth-social-group">
              <Button className="auth-social-btn">
                <img src={googleImg} alt="google" />
                Tiếp tục với Google
              </Button>
              <Button className="auth-social-btn">
                <img src={facebookImg} alt="facebook" />
                Tiếp tục với Facebook
              </Button>
            </div>

            <div className="auth-footer">
              Đã có tài khoản?{" "}
              <Link to="/login" style={{ fontWeight: "bold", color: "#333" }}>
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default RegisterForm;
