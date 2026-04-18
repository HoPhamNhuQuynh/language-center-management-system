import { useState } from "react";
import LoginForm from "../components/LoginForm";


function Login(){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            const result = await loginApi(username, password);
            console.log("Đăng nhập thành công", result);
            alert("Đăng nhập thành công!")
        }
        catch (e) {
            console.log("Đăng nhập thất bại", e.response?.data);
            alert("Sai tên người dùng hoặc mật khẩu!")
        }

    };

    return (
        <div>
            <LoginForm 
                username={username}
                password={password}
                setUsername={setUsername}
                setPassword={setPassword}
                onLogin={handleLogin}
            />
        </div>
    );
}

export default Login;