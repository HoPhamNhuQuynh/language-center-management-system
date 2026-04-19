import { Input, Button, Card, Divider, Checkbox } from "antd";
import { Link } from "react-router-dom";
import classImg from "../assets/class.jpg";
import googleImg from "../assets/google.png";
import facebookImg from "../assets/facebook.png";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";

function RegisterForm({
  last_name, first_name, phone_num, username, email, password, confirm_password, agree,
  setLastName, setFirstName, setPhoneNum, setUsername, setEmail, setPassword, setConfirmPassword, setAgree, onRegister
}) {
  return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh",background:"#191970"}}>
      <Card style={{width:1000, borderRadius:10, overflow:"hidden", padding:0}} bodyStyle={{padding:0}}>
        <div style={{display:"flex"}}>
          <div style={{width:500,backgroundImage:`url(${classImg})`,backgroundSize:"cover",backgroundPosition:"center"}} />
          <div style={{width:500,padding:30}}>
            <h2 style={{marginBottom:20}}>ĐĂNG KÝ TÀI KHOẢN</h2>
            <div style={{display:"flex",justifyContent:"center",gap:10,marginBottom:10}}>
              <Input style={{width:145,height:45,borderRadius:25}} 
                placeholder="HỌ*" value={last_name} 
                onChange={(e)=>setLastName(e.target.value)} />
              <Input style={{width:145,height:45,borderRadius:25}} 
                placeholder="TÊN*" value={first_name} 
                onChange={(e)=>setFirstName(e.target.value)} />
            </div>
            <Input style={{width: 300,height:45,borderRadius:25,marginBottom:10}} 
                placeholder="SỐ ĐIỆN THOẠI*" value={phone_num} 
                onChange={(e)=>setPhoneNum(e.target.value)} />
            <Input style={{width: 300,height:45,borderRadius:25,marginBottom:10}} 
                placeholder="TÊN NGƯỜI DÙNG*" value={username} 
                onChange={(e)=>setUsername(e.target.value)} />
            <Input style={{width: 300,height:45,borderRadius:25,marginBottom:10}} 
                placeholder="EMAIL*" value={email} 
                onChange={(e)=>setEmail(e.target.value)} />
            <Input.Password style={{width: 300,height:45,borderRadius:25,marginBottom:10}} 
                placeholder="MẬT KHẨU*" value={password} 
                onChange={(e)=>setPassword(e.target.value)} />
            <Input.Password style={{width: 300,height:45,borderRadius:25,marginBottom:10}} 
                placeholder="XÁC NHẬN MẬT KHẨU*" value={confirm_password} 
                onChange={(e)=>setConfirmPassword(e.target.value)} />
            <div style={{marginBottom:15}}>
              <Checkbox checked={agree} onChange={(e)=>setAgree(e.target.checked)}>
                Tôi đồng ý với <a href="/terms">Điều khoản</a> và <a href="/privacy">Chính sách</a>
              </Checkbox>
            </div>
            <Button style={{width:300,height:45,borderRadius:25,fontWeight:"bold",background:"#484895",color:"#fff"}} disabled={!agree} onClick={onRegister}>
              ĐĂNG KÝ
            </Button>
            <Divider>Hoặc đăng ký bằng</Divider>
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
            <div style={{textAlign:"center",marginTop:15}}>
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default RegisterForm;