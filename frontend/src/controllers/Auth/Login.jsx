import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../../pages/Auth/LoginForm";
import { loginApi } from "../../services/authService";


function Login(){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    // const handleLogin = async () => {
    //     const fakeUser = {
    //         username: "admin",
    //         password: "123456"
    //     };

    //     if (username === fakeUser.username && password === fakeUser.password) {
    //         console.log("Đăng nhập thành công");

    //         navigate("/about-us");
    //     } else {
    //         console.log("Đăng nhập thất bại");
    //         alert("Sai tên người dùng hoặc mật khẩu!");
    //     }

    // };
}
export default Login;