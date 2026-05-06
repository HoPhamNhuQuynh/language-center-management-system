import RegisterForm from "../../pages/Auth/RegisterForm";
import { registerApi, googleLoginApi, facebookLoginApi } from "../../services/authService";
import { setTokens } from "../../utils/token";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { FacebookLoginClient } from "@greatsumini/react-facebook-login";
import { useEffect, useState } from "react";
import { message } from "antd";

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

      setTokens(res.access, res.refresh, res.user);
      navigate("/");

      message.success("Đăng ký thành công!");
    } catch (err) {
      const data = err.response?.data; 
      let msg = "Đăng ký thất bại";

      if (data?.username || data?.email) {
        msg = "Tài khoản đã tồn tại";
      } else if (data?.password) {
        msg = "Mật khẩu không hợp lệ";
      } else if (data?.phone_num) {
        msg = "Số điện thoại không hợp lệ";
      }

      message.error(msg);
      }
  };

  const googleLogin = useGoogleLogin({
    flow: "implicit",
    prompt: "consent",
    onSuccess: async (tokenResponse) => {
      console.log("Google token:", tokenResponse.access_token);
      try {
        const res = await googleLoginApi(tokenResponse.access_token);

        setTokens(res.access_token, res.refresh_token, res.user);
        console.log("Backend trả về:", res);
        navigate("/");
      } catch (err) {
        console.log(err.response?.data);
        console.log(err.response?.status);
        message.error("Google login thất bại");
      }
    },
    onError: (err) => {
      if (err?.response?.data) {
        setErrors(err.response.data);
      } else {
        console.error("Lỗi hệ thống:", err?.message);
      }
    },
  });

  const facebookLogin = () => {
        FacebookLoginClient.login(
          (response) => {
            if (response.status === "connected") {
              facebookLoginApi(response.authResponse.accessToken)
                .then((res) => {
                  console.info(res);
                  setTokens(res.access_token, res.refresh_token, res.user);
                  navigate("/");
                })
                .catch((err) => {
                  if (err?.response?.data) {
                    setErrors(err.response.data);
                  } else {
                    console.error("Lỗi hệ thống:", err?.message);
                  }
                });
            } else {
              message.error("Facebook login thất bại");
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