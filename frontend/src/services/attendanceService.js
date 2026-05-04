import Apis from "./Apis";

export const getSessionsApi = async (classId) => {
    const res = await Apis.get(`classes/${classId}/sessions/`);
    return res.data;
}

export const getAttendancesApi = async ( sessionId) => {
    const res = await Apis.get(`attendances?session_id=${sessionId}`);
    return res.data;
}

export const bulkSyncAttendancesApi = async (classId, payload) => {
    const res = await Apis.post(`classes/${classId}/bulk-sync-attendances/`, payload);
    return res.data;
}