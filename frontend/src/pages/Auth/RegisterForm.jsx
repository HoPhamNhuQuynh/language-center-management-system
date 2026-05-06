import { Form, Input, Button, Card, Divider, Checkbox } from "antd";
import classImg from "../../assets/class.jpg";
import googleImg from "../../assets/google.png";
import facebookImg from "../../assets/facebook.png";
import "../../styles/Register.css";
import "../../styles/Styles.css";
import { Link } from "react-router-dom";
import { validatePassword } from "../../utils/validation";

function RegisterForm({
  onRegister,
  onGoogleLogin,
  onFacebookLogin,
}) {
  return (
    <div className="auth-container">
      <Card className="auth-card" styles={{ body: { padding: 0 } }}>
        <div className="auth-wrapper">
          <div
            className="auth-image-side"
            style={{ backgroundImage: `url(${classImg})` }}
          />

          <div className="auth-form-side">
            <h2 className="auth-title">Đăng ký tài khoản</h2>

            <Form
              onFinish={onRegister}
              layout="vertical"
              validateTrigger="onSubmit"
            >
              <div className="auth-input-group">
                <Form.Item
                  name="last_name"
                  rules={[{ required: true, message: "Nhập họ!" }]}
                >
                  <Input placeholder="HỌ*" />
                </Form.Item>

                <Form.Item
                  name="first_name"
                  rules={[{ required: true, message: "Nhập tên!" }]}
                >
                  <Input placeholder="TÊN*" />
                </Form.Item>
              </div>

              <Form.Item
                name="phone_num"
                rules={[
                  { required: true, message: "Nhập SĐT!" },
                  {
                    pattern: /^(0|\+84)[0-9]{9}$/,
                    message: "SĐT không hợp lệ",
                  },
                ]}
              >
                <Input placeholder="SỐ ĐIỆN THOẠI*" />
              </Form.Item>

              <Form.Item
                name="username"
                rules={[{ required: true, message: "Nhập username!" }]}
              >
                <Input placeholder="TÊN NGƯỜI DÙNG*" />
              </Form.Item>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input placeholder="EMAIL*" />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Nhập mật khẩu!" },
                  {
                    validator: (_, value) => {
                      const error = validatePassword(value || "");
                      if (error) return Promise.reject(error);
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input.Password placeholder="MẬT KHẨU" />
              </Form.Item>

              <Form.Item
                name="confirm_password"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Xác nhận mật khẩu!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject("Mật khẩu không khớp!");
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="XÁC NHẬN MẬT KHẨU*" />
              </Form.Item>

              <Form.Item
                name="agree"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value
                        ? Promise.resolve()
                        : Promise.reject("Đồng ý điều khoản là bắt buộc"),
                  },
                ]}
              >
                <Checkbox>Tôi đồng ý với Điều khoản và Chính sách</Checkbox>
              </Form.Item>
              
              <Button
                type="primary"
                htmlType="submit"
                className="auth-submit-btn"
              >
                ĐĂNG KÝ
              </Button>
              <div className="auth-footer">
                Đã có tài khoản?{" "}
                <Link to="/login" style={{ fontWeight: 700 }}>
                  Đăng nhập
                </Link>
              </div>
            </Form>

            <Divider plain>Hoặc đăng ký bằng</Divider>

            <div className="auth-social-group">
              <Button className="auth-social-btn" onClick={onGoogleLogin}>
                <img src={googleImg} alt="google" />
                Google
              </Button>

              <Button className="auth-social-btn" onClick={onFacebookLogin}>
                <img src={facebookImg} alt="facebook" />
                Facebook
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default RegisterForm;
