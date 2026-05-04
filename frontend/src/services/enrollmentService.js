import Apis from "./Apis";


export const enrollmentApi = async (data) => {
    const res = await Apis.post("enrollments/", data);
    return res.data;
};

export const paymentApi = async (data) => {
    const res = await Apis.post("payments/", data);
    return res.data;
};

export const enrollmentDetailApi = async (id) => {
    const res = await Apis.get(`enrollments/${id}/`);
    return res.data;
};

