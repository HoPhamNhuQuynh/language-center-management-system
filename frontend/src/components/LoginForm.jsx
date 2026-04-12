import { Input, Button, Card } from "antd";

function LoginForm({ username, password, setUsername, setPassword, onLogin }){
    return (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 60 }}>
            <Card title="Login" style={{ width: 300 }}>
                <Input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                />
                <Input
                    style={{ marginTop: 10 }}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button type="primary" block style={{ marginTop: 20 }} onClick={onLogin}>
                    Login
                </Button>
            </Card>
        </div>
    )
}

export default LoginForm;