import { useState } from "react";
import LoginForm from "../components/LoginForm";


function Login(){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            const result = await loginApi(username, password);
            console.log("Login success", result);
            alert("login OK!")
        }
        catch (e) {
            console.log("Login failed", e.response?.data);
            alert("Login fail.")
        }

    };

    return (
        <div>
            <h2 style={{ marginTop: 100 }}>Login Page</h2>
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