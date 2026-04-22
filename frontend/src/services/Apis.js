import axios from "axios";
import { getAccessToken } from "../utils/token";

const Apis = axios.create({
    baseURL: '/api/',
});

Apis.interceptors.request.use((config) => {
    const token = getAccessToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});
export default Apis;