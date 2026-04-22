import { Input, Button, Card, Divider, Form } from "antd";
import { Link } from "react-router-dom";
import classImg from "../../assets/class.jpg";
import googleImg from "../../assets/google.png";
import facebookImg from "../../assets/facebook.png";
import "../../styles/Login.css";

function LoginForm({ onLogin, onGoogleLogin, onFacebookLogin }) {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    onLogin(values.username, values.password);
  };

  return (
    <div className="login-container">
      <Card className="login-card" styles={{ body: { padding: 0 } }}>
        <div className="login-wrapper">
          <div
            className="login-left"
            style={{ backgroundImage: `url(${classImg})` }}
          />

          <div className="login-right">
            <div className="login-form-box">
              <h2 className="login-title">Chào mừng bạn đã quay trở lại!</h2>

              <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                  name="username"
                  rules={[{ required: true, message: "Nhập tên đăng nhập!" }]}
                >
                  <Input placeholder="TÊN NGƯỜI DÙNG*" />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: "Nhập mật khẩu!" }]}
                >
                  <Input.Password placeholder="MẬT KHẨU*" />
                </Form.Item>

                <div className="login-forgot">
                  <a href="/forgot-password">Quên mật khẩu?</a>
                </div>

                <Form.Item>
                  <Button type="primary" htmlType="submit" block>
                    ĐĂNG NHẬP
                  </Button>
                </Form.Item>
              </Form>

              <Divider plain>Hoặc đăng nhập bằng</Divider>

              <div className="login-social">
                <Button onClick={onGoogleLogin} block>
                  <img src={googleImg} style={{ height: 20, marginRight: 8 }} />
                  Google
                </Button>

                <Button onClick={onFacebookLogin} block>
                  <img
                    src={facebookImg}
                    style={{ height: 20, marginRight: 8 }}
                  />
                  Facebook
                </Button>
              </div>

              <div className="login-footer">
                Chưa có tài khoản?{" "}
                <Link to="/register" style={{ fontWeight: 700 }}>
                  Đăng ký
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default LoginForm;
