import Apis from "./Apis";

export const loginApi = async (username, password) => {
    const res = await Apis.post("auth/login/", {
        username,
        password,
    }, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        }
    );
    return res.data;
};

export const registerApi = async (data) => {
    const res = await Apis.post("auth/register/", data);
    return res.data;
};

export const googleLoginApi = async (access_token) => {
  const res = await Apis.post("auth/social-login/", {
    provider: "GOOGLE",
    access_token: access_token,
  });

  return res.data;
};

export const facebookLoginApi = async (access_token) => {
  const res = await Apis.post("auth/social-login/", {
    provider: "FACEBOOK",
    access_token: access_token,
  });

  return res.data;
};

export const revokeTokenApi = async (refreshToken) => {
    const params = new URLSearchParams();
    params.append('token', refreshToken);

    const res = await Apis.post("auth/logout/", params, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

    return res;
};