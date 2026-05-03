import Apis from "./Apis";

export const sessionApi = async () => {
    const res = await Apis.get("sessions/");
    return res.data;
};
