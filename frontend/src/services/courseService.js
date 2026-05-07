import Apis from "./Apis";

export const courseApi = async (id = null) => {
    const res = await Apis.get(id ? `courses/${id}/` : "courses/");
    return res.data;
};

export const classApi = async (id) => {
    const res = await Apis.get(`courses/${id}/classes/`);
    return res.data;
};

export const searchCourseApi = async (query) => {
    return await Apis.get(`courses?q=${query}`);
};

export const tagApi = async () => {
    const res = await Apis.get("tags/");
    return res.data;
};

export const coursePageApi = async (id = null, params = {}) => {
  if (id) {
    const res = await Apis.get(`courses/${id}/`);
    return res.data;
  }
  const res = await Apis.get("courses/", { params });
  return res.data;
};