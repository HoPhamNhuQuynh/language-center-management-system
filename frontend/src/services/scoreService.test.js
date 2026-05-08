import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./Apis", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import Apis from "./Apis";
import {
  getScoresApi,
  getScoreTypesApi,
  bulkSyncScoresApi,
  submitScoresApi,
  loadClassesApi,
} from "./scoreService";

describe("scoreService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getScoresApi", () => {
    it("gọi đúng endpoint với classId", async () => {
      Apis.get.mockResolvedValue({ data: { scores: [{ id: 1, value: 9 }] } });

      const result = await getScoresApi(3);

      expect(Apis.get).toHaveBeenCalledWith("classes/3/scores/");
      expect(result).toEqual({ scores: [{ id: 1, value: 9 }] });
    });

    it("throw lỗi khi API thất bại", async () => {
      Apis.get.mockRejectedValue(new Error("Network Error"));

      await expect(getScoresApi(3)).rejects.toThrow("Network Error");
    });
  });

  describe("getScoreTypesApi", () => {
    it("gọi đúng endpoint với classId", async () => {
      Apis.get.mockResolvedValue({
        data: [
          { id: 1, name: "Midterm" },
          { id: 2, name: "Final" },
        ],
      });

      const result = await getScoreTypesApi(3);

      expect(Apis.get).toHaveBeenCalledWith("classes/3/score-types/");
      expect(result).toEqual([
        { id: 1, name: "Midterm" },
        { id: 2, name: "Final" },
      ]);
    });

    it("throw lỗi khi API thất bại", async () => {
      Apis.get.mockRejectedValue(new Error("Network Error"));

      await expect(getScoreTypesApi(3)).rejects.toThrow("Network Error");
    });
  });

  describe("bulkSyncScoresApi", () => {
    it("gọi đúng endpoint với classId và scores", async () => {
      const scores = [
        { student_id: 1, value: 8.5 },
        { student_id: 2, value: 9 },
      ];
      Apis.post.mockResolvedValue({ data: { success: true } });

      const result = await bulkSyncScoresApi(3, scores);

      expect(Apis.post).toHaveBeenCalledWith("classes/3/bulk-sync-scores/", {
        scores,
      });
      expect(result).toEqual({ success: true });
    });

    it("throw lỗi khi API thất bại", async () => {
      Apis.post.mockRejectedValue(new Error("Server Error"));

      await expect(bulkSyncScoresApi(3, [])).rejects.toThrow("Server Error");
    });
  });

  describe("submitScoresApi", () => {
    it("gọi đúng endpoint với classId và payload", async () => {
      const payload = { confirmed: true };
      Apis.post.mockResolvedValue({ data: { message: "Submitted" } });

      const result = await submitScoresApi(3, payload);

      expect(Apis.post).toHaveBeenCalledWith(
        "classes/3/submit-scores/",
        payload,
      );
      expect(result).toEqual({ message: "Submitted" });
    });

    it("throw lỗi khi API thất bại", async () => {
      Apis.post.mockRejectedValue(new Error("Server Error"));

      await expect(submitScoresApi(3, {})).rejects.toThrow("Server Error");
    });
  });

  describe("loadClassesApi", () => {
    it("gọi đúng endpoint danh sách classes", async () => {
      Apis.get.mockResolvedValue({ data: [{ id: 1, name: "IELTS Basic" }] });

      const result = await loadClassesApi();

      expect(Apis.get).toHaveBeenCalledWith("classes/");
      expect(result).toEqual([{ id: 1, name: "IELTS Basic" }]);
    });

    it("trả về mảng rỗng khi không có class", async () => {
      Apis.get.mockResolvedValue({ data: [] });

      const result = await loadClassesApi();

      expect(result).toEqual([]);
    });

    it("throw lỗi khi API thất bại", async () => {
      Apis.get.mockRejectedValue(new Error("Network Error"));

      await expect(loadClassesApi()).rejects.toThrow("Network Error");
    });
  });
});
