import { Input, Button, Card, Divider } from "antd";
import { Link } from "react-router-dom";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";

function LoginForm({ username, password, setUsername, setPassword, onLogin }){
    return (
        <div style={{ display: "flex", justifyContent: "center",  alignItems: "center", height: "100vh", background: "#ffffff" }}>
            <Card style={{ width: 800, borderRadius: 10, background: "#ffffff" }} bodyStyle={{ padding: 0 }} >
                <h2 style={{ padding: 20, background: "#bcb8b8" }}>ĐĂNG NHẬP</h2>
                <div style={{ padding: 10 }}>
                    <Input
                        style={{ width: 600, height: 45, borderRadius: 25, marginBottom: 10 }}
                        placeholder="TÊN NGƯỜI DÙNG*"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <Input.Password
                        style={{ width: 600, height: 45, borderRadius: 25, marginBottom: 10 }}
                        placeholder="MẬT KHẨU*"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <div style={{ textAlign: "left", marginBottom: 20, marginLeft: 85 }}>
                        <a href="/forgot-password" style={{ textDecoration: "underline" }}>
                            Quên mật khẩu?
                        </a>
                    </div>
                    <Button
                        style={{  width: 400, height: 45, borderRadius: 25, fontWeight: "bold", background: "#ccc"}}
                        block
                        onClick={onLogin}
                    >
                        ĐĂNG NHẬP
                    </Button>
                    <Divider style={{ borderColor: "#000000", borderWidth: "2px" }}>Hoặc đăng nhập bằng</Divider>
                    <div style={{ width: 600, margin: "0 auto", display: "flex", gap: 10}}>
                        <Button
                            style={{ flex: 1, borderRadius: 25, height: 40, fontWeight: "bold", background: "#ede2e2" }}
                        >
                            Google
                        </Button>
                        <Button
                            style={{ flex:1, width: 600, borderRadius: 25, height: 40, fontWeight: "bold", background: "#ede2e2" }}
                        >
                            Facebook
                        </Button>
                    </div>
                    <div style={{ textAlign: "center", marginTop: 10 }}>
                        Chưa có tài khoản? <Link to="/register" style={{ textDecoration: "underline" }}>Đăng ký</Link>
                    </div>
                </div>    
            </Card>
        </div>
    )
}

export default LoginForm;