import { Input, Button, Card, Divider } from "antd";
import { Link } from "react-router-dom";
import classImg from "../../assets/class.jpg";
import googleImg from "../../assets/google.png";
import facebookImg from "../../assets/facebook.png";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";

function LoginForm({ username, password, setUsername, setPassword, onLogin }) {
  return (
    <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#191970"}}>
      <Card style={{width: 1000, borderRadius: 10, padding: 0, overflow: "hidden"}} bodyStyle={{ padding: 0 }}>
        <div style={{ display: "flex" }}>  
          <div
            style={{width: 500,backgroundImage: `url(${classImg})`,backgroundSize: "cover",backgroundPosition: "center"}}
          />
          <div style={{ width: 500, padding: 30 }}>
            <h2 style={{ marginBottom: 30 }}>ĐĂNG NHẬP</h2>
            <Input
              style={{width: 300,height: 45,borderRadius: 25,marginBottom: 10}}
              placeholder="TÊN NGƯỜI DÙNG*"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input.Password
              style={{ width: 300,height: 45,borderRadius: 25,marginBottom: 10}}
              placeholder="MẬT KHẨU*"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div style={{ textAlign: "left", marginBottom: 15, paddingLeft: 90}}>
              <a href="/forgot-password">Quên mật khẩu?</a>
            </div>
            <Button
              style={{width: 300,height: 45,borderRadius: 25,fontWeight: "bold",background: "#484895",color: "#ffffff"}}
              onClick={onLogin} 
            >
              ĐĂNG NHẬP
            </Button>
            <Divider>Hoặc đăng nhập bằng</Divider>
            <div style={{ display: "flex", gap: 10 }}>
              <Button style={{ flex: 1, height: 45, borderRadius: 25,  fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={googleImg} alt="google" style={{ height: 22 }} />
                Tiếp tục với Google
              </Button>
              <Button style={{ flex: 1, height: 45, borderRadius: 25,  fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={facebookImg} alt="facebook" style={{ height: 22 }} />
                Tiếp tục với Facebook
              </Button>
            </div>
            <div style={{ textAlign: "center", marginTop: 20 }}>
              Chưa có tài khoản?{" "}
              <Link to="/register">Đăng ký</Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default LoginForm;