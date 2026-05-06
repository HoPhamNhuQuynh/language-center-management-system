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
export const getClasses = async (page = 1, signal) => {
  const res = await Apis.get(`classes/?page=${page}`, { signal });
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

export const getRooms = async () => {
  const res = await Apis.get("rooms/");
  return res.data;
};

// Session
export const getSessionsByClass = async (classId) => {
  const res = await Apis.get(`classes/${classId}/sessions/`);
  return res.data;
};

export const createSession = async (data) => {
  const res = await Apis.post("sessions/", data);
  return res.data;
};

export const updateSession = async (sessionId, data) => {
  const res = await Apis.patch(`sessions/${sessionId}/`, data);
  return res.data;
};

export const deleteSession = async (sessionId) => {
  const res = await Apis.delete(`sessions/${sessionId}/`);
  return res.data;
};

// User
export const getUsers = async (page = 1, signal) => {
  const res = await Apis.get(`users/?page=${page}`, { signal });
  return res.data;
};

export const updateUser = async (userId, data) => {
  const res = await Apis.patch(`users/${userId}/`, data);
  return res.data;
};

export const lockUser = async (userId) => {
  const res = await Apis.patch(`users/${userId}/toggle-lock/`);
  return res.data;
};

export const changeUserRole = async (userId, data) => {
  const res = await Apis.patch(`users/${userId}/role/`, data);
  return res.data;
};

export const createTeacher = async (data) => {
  const res = await Apis.post("users/", data);
  return res.data;
};

// Payment
export const getPayments = async (page = 1, search = "", status = "", signal) => {
  const res = await Apis.get(
    `payments/?page=${page}&search=${search}&payment_status=${status}`,
    {
      signal,
    },
  );
  return res.data;
};