import axios from "axios";
import { clearTokens, getAccessToken, setTokens } from "../utils/token";
import { refreshTokenApi } from "./authService";

const Apis = axios.create({
  baseURL: "/api/",
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});

Apis.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("Token added to request:", token);
  }

  return config;
});

export default Apis;

Apis.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem("refresh_token");

        const data = await refreshTokenApi(refresh);

        setTokens(data.access_token, data.refresh_token);

        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;

        return Apis(originalRequest);
      } catch (e) {
        console.log("REFRESH ERROR:", e.response?.data);
        clearTokens();
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  },
);
