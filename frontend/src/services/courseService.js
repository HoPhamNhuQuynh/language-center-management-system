import Apis from "./Apis";

export const courseApi = async () => {
    const res = await Apis.get("courses/");
    return res.data;
};

export const courseDetailApi = async (data) => {
    const res = await Apis.get(`courses/${data}/`);
    return res.data;
}

export const searchCourseApi = async (query) => {
    return await Apis.get(`${endpoints['courses']}?q=${query}`);
};

export const tagApi = async () => {
    const res = await Apis.get("tags/");
    return res.data;
};
