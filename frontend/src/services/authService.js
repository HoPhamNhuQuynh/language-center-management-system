import Apis from "./Apis"

export const loginApi = async (username, password) => {
    const res = await Api.post(`${API_URL}/o/token/`, {
        username,
        password,
    });

    return res.data;
};
