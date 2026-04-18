import { Input, Button, Card, Divider, Checkbox } from "antd";
import { Link } from "react-router-dom";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";

function RegisterForm({ last_name, first_name, phone_num,username, email, password, confirm_password, agree, setLastName, setFirstName, setPhoneNum, setUsername, setEmail, setPassword, setConfirmPassword, setAgree, onRegister }){
    return (
        <div style={{ display: "flex", justifyContent: "center",  alignItems: "center", height: "100vh", background: "#ffffff" }}>
            <Card style={{ width: 800, borderRadius: 10, background: "#ffffff" }} bodyStyle={{ padding: 0 }} >
                <h2 style={{ padding: 12, background: "#bcb8b8", textAlign: "center" }} >ĐĂNG KÝ TÀI KHOẢN</h2>
                <div style={{ padding: 10 }}>
                    <div style={{ display: "flex", gap: 20, marginBottom: 15}}>
                    <Input
                        style={{ flex: 1, height: 45, borderRadius: 25 }}
                        placeholder="HỌ*"
                        value={last_name}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                    <Input
                        style={{ flex: 1, height: 45, borderRadius: 25 }}
                        placeholder="TÊN*"
                        value={first_name}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                    <Input
                        style={{ width: 380, height: 45, borderRadius: 25 }}
                        placeholder="SỐ ĐIỆN THOẠI*"
                        value={phone_num}
                        onChange={(e) => setPhoneNum(e.target.value)}
                    />
                </div>
                <div style={{ display: "flex", gap: 25, marginBottom: 10 }}>
                    <Input
                        style={{ flex: 1, height: 45, borderRadius: 25 }}
                        placeholder="TÊN NGƯỜI DÙNG*"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <Input
                        style={{ flex: 1, height: 45, borderRadius: 25 }}
                        placeholder="EMAIL*"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div style={{ display: "flex", gap: 25, marginBottom: 15 }}>
                    <Input.Password
                        style={{ flex: 1, height: 45, borderRadius: 25 }}
                        placeholder="MẬT KHẨU*"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Input.Password
                        style={{ flex: 1, height: 45, borderRadius: 25 }}
                        placeholder="XÁC NHẬN MẬT KHẨU*"
                        value={confirm_password}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
                <div style={{ textAlign: "left", marginBottom: 20 }}>
                    <Checkbox
                        checked={agree}
                        onChange={(e) => setAgree(e.target.checked)}
                    >
                        Tôi đồng ý với{" "}<a href="/terms" target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}> Điều khoản dịch vụ</a>{" "}
                        và{" "}
                        <a href="/privacy" target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}> Chính sách bảo mật </a>
                    </Checkbox>
                </div>
                <Button
                    style={{  width: 400, height: 45, borderRadius: 25, fontWeight: "bold", background: "#ccc"}}
                    block
                    disabled={!agree}
                    onClick={onRegister}
                >
                    ĐĂNG KÝ
                </Button>
               <Divider style={{ borderColor: "#000000", borderWidth: "2px" }}>Hoặc đăng ký bằng</Divider>
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
                 <div style={{ textAlign: "center", marginTop: 15 }}>
                    Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                </div>
                </div>
            </Card>
        </div>
    )
}

export default RegisterForm;