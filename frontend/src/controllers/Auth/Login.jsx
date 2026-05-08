import { useNavigate } from "react-router-dom";
import LoginForm from "../../pages/Auth/LoginForm";
import { loginApi, googleLoginApi, facebookLoginApi } from "../../services/authService"
import { setTokens } from "../../utils/token";
import { useGoogleLogin } from "@react-oauth/google";
import { FacebookLoginClient } from "@greatsumini/react-facebook-login";
import { useEffect } from "react";
import { message } from "antd";

const translateError = (errorMsg) => {
  if (!errorMsg) return "Đã có lỗi xảy ra. Vui lòng thử lại.";

  if (errorMsg.includes("FACEBOOK"))
    return "Email này đã được đăng ký qua Facebook. Vui lòng đăng nhập bằng Facebook.";
  if (errorMsg.includes("GOOGLE"))
    return "Email này đã được đăng ký qua Google. Vui lòng đăng nhập bằng Google.";
  if (
    errorMsg.toLowerCase().includes("invalid") ||
    errorMsg.toLowerCase().includes("unauthorized") ||
    errorMsg.toLowerCase().includes("credentials") ||
    errorMsg.toLowerCase().includes("grant")
  )
    return "Tên đăng nhập hoặc mật khẩu không đúng.";

  return "Đã có lỗi xảy ra. Vui lòng thử lại."; // ← đổi từ return errorMsg
};

function Login(){
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

    const handleLogin = async (username, password) => {
      try {
        const res = await loginApi(username, password);

        setTokens(res.access_token, res.refresh_token, res.user);
        if (res.user.role === "Admin") {
          navigate("/dashboard")
        } else if (res.user.role === "Teacher") {
          navigate("/schedule")
        } else {
          navigate("/");
        }
        console.info(res)
      } catch (error) {
        const errorMsg = error.response?.data?.error;
        message.error(translateError(errorMsg));
      }
    };

    const googleLogin = useGoogleLogin({
      flow: "implicit",
      prompt: "consent",
      onSuccess: async (tokenResponse) => {
        try {
          const res = await googleLoginApi(tokenResponse.access_token);

          setTokens(res.access_token, res.refresh_token, res.user);
          console.log("Google trả về:", tokenResponse);
          navigate("/");
        } catch (err) {
          const errorMsg = err.response?.data?.error;
          message.error(translateError(errorMsg) || "Đăng nhập Google thất bại.")
        }
      },
      onError: () => {
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
                setTokens(res.access_token, res.refresh_token, res.user);
                navigate("/");
              })
              .catch((err) => {
                const errorMsg = err.response?.data?.error;
                message.error(translateError(errorMsg) || "Đăng nhập Facebook thất bại.");
              });
          } else {
            alert("Facebook login bị huỷ");
          }
        },
        { scope: "email,public_profile" },
      );
    };
    
    return (
      <LoginForm
        onLogin={handleLogin}
        onGoogleLogin={() => googleLogin()}
        onFacebookLogin={() => facebookLogin()}
      ></LoginForm>
    );
}
export default Login;