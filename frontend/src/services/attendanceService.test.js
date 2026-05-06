import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Apis trước khi import service
vi.mock("./Apis", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import Apis from "./Apis";
import {
  getSessionsApi,
  getAttendancesApi,
  bulkSyncAttendancesApi,
} from "./attendanceService";

describe("attendanceService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- getSessionsApi ---
  describe("getSessionsApi", () => {
    it("gọi đúng endpoint với classId", async () => {
      Apis.get.mockResolvedValue({
        data: { sessions: [{ id: 1 }, { id: 2 }] },
      });

      const result = await getSessionsApi(5);

      expect(Apis.get).toHaveBeenCalledWith("classes/5/sessions/");
      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it("trả về mảng rỗng nếu không có sessions", async () => {
      Apis.get.mockResolvedValue({ data: { sessions: [] } });

      const result = await getSessionsApi(5);

      expect(result).toEqual([]);
    });

    it("throw lỗi khi API thất bại", async () => {
      Apis.get.mockRejectedValue(new Error("Network Error"));

      await expect(getSessionsApi(5)).rejects.toThrow("Network Error");
    });
  });

  // --- getAttendancesApi ---
  describe("getAttendancesApi", () => {
    it("gọi đúng endpoint với sessionId", async () => {
      Apis.get.mockResolvedValue({
        data: { results: [{ student_id: 1, status: "present" }] },
      });

      const result = await getAttendancesApi(10);

      expect(Apis.get).toHaveBeenCalledWith("attendances?session_id=10");
      expect(result).toEqual({
        results: [{ student_id: 1, status: "present" }],
      });
    });

    it("throw lỗi khi API thất bại", async () => {
      Apis.get.mockRejectedValue(new Error("Network Error"));

      await expect(getAttendancesApi(10)).rejects.toThrow("Network Error");
    });
  });

  // --- bulkSyncAttendancesApi ---
  describe("bulkSyncAttendancesApi", () => {
    it("gọi đúng endpoint với classId và payload", async () => {
      const payload = { attendances: [{ student_id: 1, status: "present" }] };
      Apis.post.mockResolvedValue({ data: { success: true } });

      const result = await bulkSyncAttendancesApi(5, payload);

      expect(Apis.post).toHaveBeenCalledWith(
        "classes/5/bulk-sync-attendances/",
        payload,
      );
      expect(result).toEqual({ success: true });
    });

    it("throw lỗi khi API thất bại", async () => {
      Apis.post.mockRejectedValue(new Error("Server Error"));

      await expect(bulkSyncAttendancesApi(5, {})).rejects.toThrow(
        "Server Error",
      );
    });
  });
});
