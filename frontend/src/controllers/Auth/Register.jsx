import RegisterForm from "../../pages/Auth/RegisterForm";
import { registerApi, googleLoginApi, facebookLoginApi } from "../../services/AuthService";
import { setTokens } from "../../utils/token";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { FacebookLoginClient } from "@greatsumini/react-facebook-login";
import { useEffect } from "react";

function Register(){
  const navigate = useNavigate();

  useEffect(() => {
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: import.meta.env.VITE_FACEBOOK_APP_ID,
        version: "v19.0",
        cookie: true,
        xfbml: true,
      });
    };

    FacebookLoginClient.loadSdk("vi_VN");
  }, []);

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

  const facebookLogin = () => {
        FacebookLoginClient.login(
          (response) => {
            if (response.status === "connected") {
              facebookLoginApi(response.authResponse.accessToken)
                .then((res) => {
                  console.info(res)
                  setTokens(res.access_token, res.refresh_token);
                  navigate("/");
                })
                .catch(() => alert("Facebook login thất bại"));
            } else {
              alert("Facebook login bị huỷ");
            }
          },
          { scope: "email,public_profile" },
        );
      };

  return (
    <RegisterForm
      onRegister={handleRegister}
      onGoogleLogin={() => googleLogin()}
      onFacebookLogin={() => facebookLogin()}
    />
  );
}
export default Register;