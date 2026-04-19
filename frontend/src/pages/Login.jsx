import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";


function Login(){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        const fakeUser = {
            username: "admin",
            password: "123456"
        };

        if (username === fakeUser.username && password === fakeUser.password) {
            console.log("Đăng nhập thành công");

            navigate("/about-us");
        } else {
            console.log("Đăng nhập thất bại");
            alert("Sai tên người dùng hoặc mật khẩu!");
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