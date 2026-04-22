import RegisterForm from "../../pages/Auth/RegisterForm";
import { registerApi, googleLoginApi } from "../../services/AuthService";
import { setTokens } from "../../utils/token";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

function Register(){
  const navigate = useNavigate();
  
  const handleRegister = async (values) => {
    try {
      const payload = {
        last_name: values.last_name,
        first_name: values.first_name,
        phone_num: values.phone_num,
        username: values.username,
        email: values.email,
        password: values.password,
      };

      const res = await registerApi(payload);

      setTokens(res.access, res.refresh);
      navigate("/");

      alert("Đăng ký thành công!");
    } catch (err) {
      console.log("Lỗi đăng ký:", err.response?.data);
      alert("Đăng ký thất bại!");
    }
  };

  const googleLogin = useGoogleLogin({
    flow: "implicit",
    prompt: "consent",
    onSuccess: async (tokenResponse) => {
      console.log("Google token:", tokenResponse.access_token);
      try {
        const res = await googleLoginApi(tokenResponse.access_token);

        setTokens(res.access_token, res.refresh_token);
        console.log("Backend trả về:", res);
        navigate("/");
      } catch (err) {
        console.log(err.response?.data);
        console.log(err.response?.status);
        alert("Google login thất bại");
      }
    },
    onError: () => {
      console.log("Google OAuth lỗi:", err);
      alert("Google login lỗi");
    },
  });

  return (
    <RegisterForm
      onRegister={handleRegister}
      onGoogleLogin={() => googleLogin()}
    />
  );
}
export default Register;