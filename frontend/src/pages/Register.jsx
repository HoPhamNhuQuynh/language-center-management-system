import { useState } from "react";
import RegisterForm from "../components/RegisterForm";


function Register(){
    const [last_name, setLastName] = useState("");
    const [first_name, setFirstName] = useState("");
    const [phone_num, setPhoneNum] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm_password, setConfirmPassword] = useState("");
    const [agree, setAgree] = useState(false);
    

    const handleRegister = async () => {
        if (!last_name || !first_name || !phone_num || !username || !email || !password || !confirm_password) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
    }

        if (password !== confirm_password) {
            alert("Mật khẩu không khớp!");
            return;
        }

        if (!agree) {
            alert("Bạn phải đồng ý điều khoản!");
            return;
        }
        try {
            const result = await registerApi(last_name, first_name, phone_num, username, email, password);
            console.log("Đăng ký thành công", result);
            alert("Đăng ký thành công!")
        }
        catch (e) {
            console.log("Đăng ký thất bại", e.response?.data);
            alert("Đăng ký thất bại!")
        }
    };

    return (
        <div>
            <RegisterForm 
                last_name={last_name}
                first_name={first_name}
                phone_num={phone_num}
                username={username}
                email={email}
                password={password}
                confirm_password={confirm_password}
                setLastName={setLastName}
                setFirstName={setFirstName}
                setPhoneNum={setPhoneNum}
                setUsername={setUsername}
                setEmail={setEmail}
                setPassword={setPassword}
                setConfirmPassword={setConfirmPassword}
                 agree={agree}
                setAgree={setAgree}
                onRegister={handleRegister}
            />
        </div>
    );
}

export default Register;