import { describe, it, expect, vi, beforeEach } from "vitest";
import { courseApi, classApi, searchCourseApi, tagApi } from "./courseService";
import Apis from "./Apis";

vi.mock("./Apis");

const mockCourses = [
  { id: 1, name: "Khóa học React", price: 500000, tags: [{ id: 1, name: "ReactJS" }] },
  { id: 2, name: "Khóa học Python", price: 300000, tags: [{ id: 2, name: "Python" }] },
];

const mockCourseDetail = {
  id: 1,
  name: "Khóa học React",
  price: 500000,
  level: "Beginner",
  description: "Học React từ cơ bản đến nâng cao",
  total_sessions: 20,
  tags: [{ id: 1, name: "ReactJS" }],
};

const mockClasses = {
  results: [
    { id: 10, name: "Lớp A", remaining_slots: 5, start_date: "2025-01-01", end_date: "2025-03-01" },
    { id: 11, name: "Lớp B", remaining_slots: 0, start_date: "2025-02-01", end_date: "2025-04-01" },
  ],
};

const mockTags = [
  { id: 1, name: "ReactJS" },
  { id: 2, name: "Python" },
];

describe("courseService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── courseApi (gộp get all + get by id) ─────────────────────────────────

  describe("courseApi", () => {
    it("gọi GET /courses/ khi không truyền id", async () => {
      Apis.get.mockResolvedValue({ data: mockCourses });

      const result = await courseApi();

      expect(Apis.get).toHaveBeenCalledWith("courses/");
      expect(result).toEqual(mockCourses);
    });

    it("gọi GET /courses/ khi truyền id = null", async () => {
      Apis.get.mockResolvedValue({ data: mockCourses });

      await courseApi(null);

      expect(Apis.get).toHaveBeenCalledWith("courses/");
    });

    it("gọi GET /courses/:id/ khi truyền id số", async () => {
      Apis.get.mockResolvedValue({ data: mockCourseDetail });

      const result = await courseApi(1);

      expect(Apis.get).toHaveBeenCalledWith("courses/1/");
      expect(result).toEqual(mockCourseDetail);
    });

    it("gọi GET /courses/:id/ khi truyền id string", async () => {
      Apis.get.mockResolvedValue({ data: mockCourseDetail });

      await courseApi("abc-123");

      expect(Apis.get).toHaveBeenCalledWith("courses/abc-123/");
    });

    it("trả về mảng khi get all", async () => {
      Apis.get.mockResolvedValue({ data: mockCourses });

      const result = await courseApi();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
    });

    it("trả về object detail khi get by id", async () => {
      Apis.get.mockResolvedValue({ data: mockCourseDetail });

      const result = await courseApi(1);

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("total_sessions");
    });

    it("trả về mảng rỗng khi get all không có dữ liệu", async () => {
      Apis.get.mockResolvedValue({ data: [] });

      const result = await courseApi();

      expect(result).toEqual([]);
    });

    it("throw error khi get all lỗi", async () => {
      Apis.get.mockRejectedValue(new Error("Network Error"));

      await expect(courseApi()).rejects.toThrow("Network Error");
    });

    it("throw error khi get by id không tồn tại (404)", async () => {
      const error = { response: { status: 404, data: "Not found" } };
      Apis.get.mockRejectedValue(error);

      await expect(courseApi(999)).rejects.toEqual(error);
    });
  });

  // ─── classApi ────────────────────────────────────────────────────────────

  describe("classApi", () => {
    it("gọi GET /courses/:id/classes/ với đúng id", async () => {
      Apis.get.mockResolvedValue({ data: mockClasses });

      const result = await classApi(1);

      expect(Apis.get).toHaveBeenCalledWith("courses/1/classes/");
      expect(result).toEqual(mockClasses);
    });

    it("trả về data dạng { results: [...] }", async () => {
      Apis.get.mockResolvedValue({ data: mockClasses });

      const result = await classApi(1);

      expect(result).toHaveProperty("results");
      expect(Array.isArray(result.results)).toBe(true);
    });

    it("trả về data dạng mảng phẳng nếu backend không wrap results", async () => {
      Apis.get.mockResolvedValue({ data: mockClasses.results });

      const result = await classApi(1);

      expect(Array.isArray(result)).toBe(true);
    });

    it("throw error khi API lỗi", async () => {
      Apis.get.mockRejectedValue(new Error("Server error"));

      await expect(classApi(1)).rejects.toThrow("Server error");
    });
  });

  // ─── searchCourseApi ─────────────────────────────────────────────────────

  describe("searchCourseApi", () => {
    it("gọi GET với query string đúng", async () => {
      const mockResponse = { data: { results: [mockCourses[0]] } };
      Apis.get.mockResolvedValue(mockResponse);

      const result = await searchCourseApi("React");

      expect(Apis.get).toHaveBeenCalledWith("courses?q=React");
      expect(result).toEqual(mockResponse);
    });

    it("trả về toàn bộ response (không chỉ .data)", async () => {
      const mockResponse = { data: { results: mockCourses }, status: 200 };
      Apis.get.mockResolvedValue(mockResponse);

      const result = await searchCourseApi("Python");

      expect(result).toEqual(mockResponse);
    });

    it("trả về kết quả rỗng khi không tìm thấy", async () => {
      Apis.get.mockResolvedValue({ data: { results: [] } });

      const result = await searchCourseApi("xyz_không_tồn_tại");

      expect(result.data.results).toHaveLength(0);
    });

    it("throw error khi API lỗi", async () => {
      Apis.get.mockRejectedValue(new Error("Network Error"));

      await expect(searchCourseApi("React")).rejects.toThrow("Network Error");
    });
  });

  // ─── tagApi ──────────────────────────────────────────────────────────────

  describe("tagApi", () => {
    it("gọi GET /tags/ và trả về danh sách tag", async () => {
      Apis.get.mockResolvedValue({ data: mockTags });

      const result = await tagApi();

      expect(Apis.get).toHaveBeenCalledWith("tags/");
      expect(result).toEqual(mockTags);
    });

    it("trả về mảng với đầy đủ id và name", async () => {
      Apis.get.mockResolvedValue({ data: mockTags });

      const result = await tagApi();

      result.forEach((tag) => {
        expect(tag).toHaveProperty("id");
        expect(tag).toHaveProperty("name");
      });
    });

    it("trả về mảng rỗng nếu chưa có tag nào", async () => {
      Apis.get.mockResolvedValue({ data: [] });

      const result = await tagApi();

      expect(result).toEqual([]);
    });

    it("throw error khi API lỗi", async () => {
      Apis.get.mockRejectedValue(new Error("Unauthorized"));

      await expect(tagApi()).rejects.toThrow("Unauthorized");
    });
  });
});