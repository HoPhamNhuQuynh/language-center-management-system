import { useNavigate } from "react-router-dom";
import LoginForm from "../../pages/Auth/LoginForm";
import { loginApi, googleLoginApi, facebookLoginApi } from "../../services/authService"
import { setTokens } from "../../utils/token";
import { useGoogleLogin } from "@react-oauth/google";
import { FacebookLoginClient } from "@greatsumini/react-facebook-login";
import { useEffect } from "react";


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

        setTokens(res.access_token, res.refresh_token);

        console.info(res);
        navigate("/");
      } catch (error) {
        alert("Sai tài khoản hoặc mật khẩu.");
      }
    };

    const googleLogin = useGoogleLogin({
      flow: "implicit",
      prompt: "consent",
      onSuccess: async (tokenResponse) => {
        try {
          const res = await googleLoginApi(tokenResponse.access_token);

          setTokens(res.access_token, res.refresh_token);
          console.log("Google trả về:", tokenResponse);
          navigate("/");
        } catch (err) {
          console.log(err.response?.data);
          alert("Google login thất bại");
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
      <LoginForm
        onLogin={handleLogin}
        onGoogleLogin={() => googleLogin()}
        onFacebookLogin={() => facebookLogin()}
      ></LoginForm>
    );
}
export default Login;