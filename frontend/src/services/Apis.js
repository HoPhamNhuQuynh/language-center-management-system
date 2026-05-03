import axios from "axios";
import { getAccessToken } from "../utils/token"

const Apis = axios.create({
    baseURL: '/api/',
    headers: {
        'ngrok-skip-browser-warning': 'true' 
    }
});

Apis.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("Token added to request:", token);
    }

    return config;
}
);
export default Apis;
