
import Apis from "./Apis";

export const getScoresApi = async (classId) => {
  const res = await Apis.get(`classes/${classId}/scores/`);
  return res.data;
};

export const getScoreTypesApi = async (classId) => {
  const res = await Apis.get(`classes/${classId}/score-types/`);
  return res.data;
};

export const bulkSyncScoresApi = async (classId, scores) => {
  const res = await Apis.post(`classes/${classId}/bulk-sync-scores/`, { scores });
  return res.data;
};

export const submitScoresApi = async (classId, payload) => {
  const res = await Apis.post(`classes/${classId}/submit-scores/`, payload);
  return res.data;
};

export const loadClassesApi = async () => {
  const res = await Apis.get("classes/");
  return res.data;
};