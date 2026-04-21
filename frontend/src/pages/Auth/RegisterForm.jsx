import { Input, Button, Card, Divider, Checkbox } from "antd";
import { Link } from "react-router-dom";
import classImg from "../../assets/class.jpg";
import googleImg from "../../assets/google.png";
import facebookImg from "../../assets/facebook.png";

function RegisterForm() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#191970",
        padding: "20px",
      }}
    >
      <Card
        style={{ width: 1000, borderRadius: 15, overflow: "hidden" }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ display: "flex", minHeight: "600px" }}>
          {/* Cột bên trái: Hình ảnh */}
          <div
            style={{
              flex: 1,
              backgroundImage: `url(${classImg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          {/* Cột bên phải: Form đăng ký */}
          <div
            style={{
              flex: 1,
              padding: "40px 50px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center", // Căn giữa theo chiều dọc
              alignItems: "center", // Căn giữa theo chiều ngang
            }}
          >
            <h2
              style={{
                marginBottom: 30,
                width: "100%",
                textAlign: "left",
                fontWeight: "bold",
              }}
            >
              ĐĂNG KÝ TÀI KHOẢN
            </h2>

            {/* Group Họ và Tên */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                width: "100%",
                marginBottom: 15,
              }}
            >
              <Input
                placeholder="HỌ*"
                style={{ borderRadius: 20, height: 45 }}
              />
              <Input
                placeholder="TÊN*"
                style={{ borderRadius: 20, height: 45 }}
              />
            </div>

            <Input
              placeholder="SỐ ĐIỆN THOẠI*"
              style={{
                width: "100%",
                borderRadius: 20,
                height: 45,
                marginBottom: 15,
              }}
            />
            <Input
              placeholder="TÊN NGƯỜI DÙNG*"
              style={{
                width: "100%",
                borderRadius: 20,
                height: 45,
                marginBottom: 15,
              }}
            />
            <Input
              placeholder="EMAIL*"
              style={{
                width: "100%",
                borderRadius: 20,
                height: 45,
                marginBottom: 15,
              }}
            />

            <Input.Password
              placeholder="MẬT KHẨU*"
              style={{
                width: "100%",
                borderRadius: 20,
                height: 45,
                marginBottom: 15,
              }}
            />
            <Input.Password
              placeholder="XÁC NHẬN MẬT KHẨU*"
              style={{
                width: "100%",
                borderRadius: 20,
                height: 45,
                marginBottom: 15,
              }}
            />

            <div style={{ width: "100%", textAlign: "left", marginBottom: 20 }}>
              <Checkbox>Tôi đồng ý với Điều khoản và Chính sách</Checkbox>
            </div>

            <Button
              type="primary"
              style={{
                width: "100%",
                height: 50,
                borderRadius: 25,
                fontWeight: "bold",
                background: "#484895",
                fontSize: "16px",
                border: "none",
              }}
            >
              ĐĂNG KÝ
            </Button>

            <Divider plain style={{ margin: "20px 0" }}>
              Hoặc đăng ký bằng
            </Divider>

            <div style={{ display: "flex", gap: 15, width: "100%" }}>
              <Button
                style={{
                  flex: 1,
                  height: 45,
                  borderRadius: 25,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "500",
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
                  fontWeight: "500",
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

            <div style={{ textAlign: "center", marginTop: 25 }}>
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
