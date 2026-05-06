import Apis from "./Apis";


export const studentApi = async () => {
    const res = await Apis.get("users/me/");
    return res.data;
};

export const updateStudentApi = async (formData) => {
    try {
        const res = await Apis.patch("users/me/", formData);
        return res.data;
    } catch (err) {
        console.log("Full error object:", err);
        console.log("Error message:", err.message);
        throw err;
    }
};

export const updateStudentAvatarApi = async (formData) => {
    const res = await Apis.patch("users/me/avatar/", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
};

export const myEnrollmentApi = async () => {
    const res = await Apis.get("users/me/enrollments/");
    return res.data;
};

export const myPaymentApi = async () => {
    const res = await Apis.get("users/me/payments/");
    return res.data;
};

export const myScheduleApi = async () => {
    const res = await Apis.get("sessions/");
    return res.data;
};

export const myClassResultApi = async () => {
    const res = await Apis.get("users/me/results/");
    return res.data;
}

export const paymentDetailApi = async (id) => {
    const res = await Apis.get(`payments/${id}/`);
    return res.data;
};


