import Apis from "./Apis";

// Dashboard
export const getDashboardApi = async (year, quarter) => {
  const res = await Apis.get(
    `analytics/dashboard/?year=${year}&quarter=${quarter}`,
  );
  return res.data;
};

// Courses
export const getCourses = async () => {
  const res = await Apis.get("courses/");
  return res.data;
};

export const getLevels = async () => {
  const res = await Apis.get("levels/");
  return res.data;
};

export const createCourse = async (formData) => {
  const res = await Apis.post("courses/", formData);
  return res.data;
};

export const updateCourse = async (courseId, formData) => {
  const res = await Apis.patch(`courses/${courseId}/`, formData);
  return res.data;
};

export const deleteCourse = async (courseId) => {
  const res = await Apis.delete(`courses/${courseId}/`);
  return res.data;
};

// Classes
export const getClasses = async () => {
  const res = await Apis.get("classes/");
  return res.data;
};

export const createClass = async (formData) => {
  const res = await Apis.post("classes/", formData);
  return res.data;
};

export const updateClass = async (classId, formData) => {
  const res = await Apis.patch(`classes/${classId}/`, formData);
  return res.data;
};

export const deleteClass = async (classId) => {
  const res = await Apis.delete(`classes/${classId}/`);
  return res.data;
};

export const getTeachers = async () => {
  const res = await Apis.get("teachers/");
  return res.data;
};