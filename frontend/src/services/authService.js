import axios from "axios";
import { API_URL } from "../services/config";

export const loginApi = async (username, password) => {
    const res = await axios.post(`${API_URL}/o/token/`, {
        username,
        password,
    });

    return res.data;
};
