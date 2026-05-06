import Apis from "./Apis";

export const classDetailApi = async (data) => {
    const res = await Apis.get(`classes/${data}/`);
    return res.data;
}
