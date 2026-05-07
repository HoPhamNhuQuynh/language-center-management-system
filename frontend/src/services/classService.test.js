import { describe, it, expect, vi, beforeEach } from "vitest";
import { classDetailApi } from "./classService";
import Apis from "./Apis";

vi.mock("./Apis");

const mockClassDetail = {
  id: 10,
  name: "Lớp A",
  remaining_slots: 5,
  start_date: "2025-01-01",
  end_date: "2025-03-01",
  course: { id: 1, name: "Khóa học React" },
};

describe("classService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── classDetailApi ───────────────────────────────────────────────────────

  describe("classDetailApi", () => {
    it("gọi GET /classes/:id/ với đúng id số", async () => {
      Apis.get.mockResolvedValue({ data: mockClassDetail });

      const result = await classDetailApi(10);

      expect(Apis.get).toHaveBeenCalledWith("classes/10/");
      expect(result).toEqual(mockClassDetail);
    });

    it("gọi GET /classes/:id/ với đúng id string", async () => {
      Apis.get.mockResolvedValue({ data: mockClassDetail });

      await classDetailApi("10");

      expect(Apis.get).toHaveBeenCalledWith("classes/10/");
    });

    it("trả về đầy đủ thông tin class", async () => {
      Apis.get.mockResolvedValue({ data: mockClassDetail });

      const result = await classDetailApi(10);

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("remaining_slots");
      expect(result).toHaveProperty("start_date");
      expect(result).toHaveProperty("end_date");
    });

    it("throw error khi class không tồn tại (404)", async () => {
      const error = { response: { status: 404, data: { detail: "Not found." } } };
      Apis.get.mockRejectedValue(error);

      await expect(classDetailApi(9999)).rejects.toEqual(error);
    });

    it("throw error khi chưa đăng nhập (401)", async () => {
      const error = { response: { status: 401, data: { detail: "Unauthorized" } } };
      Apis.get.mockRejectedValue(error);

      await expect(classDetailApi(10)).rejects.toEqual(error);
    });

    it("throw error khi server lỗi (500)", async () => {
      Apis.get.mockRejectedValue(new Error("Internal Server Error"));

      await expect(classDetailApi(10)).rejects.toThrow("Internal Server Error");
    });
  });
});