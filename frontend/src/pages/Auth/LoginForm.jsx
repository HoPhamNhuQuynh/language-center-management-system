import { Input, Button, Card, Divider } from "antd";
import { Link } from "react-router-dom";
import classImg from "../../assets/class.jpg";
import googleImg from "../../assets/google.png";
import facebookImg from "../../assets/facebook.png";

function LoginForm({ username, password, setUsername, setPassword, onLogin }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh", // Sử dụng minHeight để linh hoạt hơn
        background: "#191970",
        padding: "20px",
      }}
    >
      <Card
        style={{
          width: 1000,
          borderRadius: 15,
          overflow: "hidden",
          border: "none",
        }}
        body={{ padding: 0 }}
      >
        <div style={{ display: "flex", minHeight: "550px" }}>
          {/* Cột Trái: Hình ảnh */}
          <div
            style={{
              flex: 1,
              backgroundImage: `url(${classImg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          {/* Cột Phải: Form Đăng Nhập */}
          <div
            style={{
              flex: 1,
              padding: "50px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center", // Căn giữa tất cả các phần tử con
              background: "#fff",
            }}
          >
            <div style={{ width: "100%", maxWidth: "350px" }}>
              {" "}
              {/* Box giới hạn độ rộng form */}
              <h2
                style={{
                  marginBottom: 30,
                  fontWeight: "bold",
                  textAlign: "left",
                }}
              >
                Chào mừng bạn đã quay trở lại!
              </h2>
              <Input
                style={{
                  width: "100%",
                  height: 45,
                  borderRadius: 25,
                  marginBottom: 15,
                }}
                placeholder="TÊN NGƯỜI DÙNG*"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Input.Password
                style={{
                  width: "100%",
                  height: 45,
                  borderRadius: 25,
                  marginBottom: 10,
                }}
                placeholder="MẬT KHẨU*"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <a href="/forgot-password" style={{ color: "#666" }}>
                  Quên mật khẩu?
                </a>
              </div>
              <Button
                type="primary"
                style={{
                  width: "100%",
                  height: 45,
                  borderRadius: 25,
                  fontWeight: "bold",
                  background: "#484895",
                  border: "none",
                }}
                onClick={onLogin}
              >
                ĐĂNG NHẬP
              </Button>
              <Divider plain style={{ margin: "25px 0" }}>
                Hoặc đăng nhập bằng
              </Divider>
              <div style={{ display: "flex", gap: 10 }}>
                <Button
                  style={{
                    flex: 1,
                    height: 45,
                    borderRadius: 25,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={googleImg}
                    alt="google"
                    style={{ height: 20, marginRight: 8 }}
                  />
                  Tiếp tục với Google
                </Button>
                <Button
                  style={{
                    flex: 1,
                    height: 45,
                    borderRadius: 25,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={facebookImg}
                    alt="facebook"
                    style={{ height: 20, marginRight: 8 }}
                  />
                  Tiếp tục với Facebook
                </Button>
              </div>
              <div style={{ textAlign: "center", marginTop: 30 }}>
                Chưa có tài khoản?{" "}
                <Link to="/register" style={{ fontWeight: "bold" }}>
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
