import axios from "axios";
import { getAccessToken } from "../utils/token"

export const endpoints = {
    'course': '/courses/',
    'enrollment': '/enrollments/',
}

const Apis = axios.create({
    baseURL: '/api/',
});

Apis.interceptors.request.use((config) => {
    // const token = getAccessToken();
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});
export default Apis;
