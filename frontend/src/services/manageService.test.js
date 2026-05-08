import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./Apis", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import Apis from "./Apis";
import {
  getDashboardApi,
  getCourses,
  getLevels,
  createCourse,
  updateCourse,
  deleteCourse,
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  getTeachers,
  getRooms,
  getSessionsByClass,
  createSession,
  updateSession,
  deleteSession,
  getUsers,
  updateUser,
  lockUser,
  changeUserRole,
  createTeacher,
  getPayments,
} from "./manageService";

describe("manageService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Dashboard ---
  describe("getDashboardApi", () => {
    it("SER-026 gọi đúng endpoint với year và quarter", async () => {
      Apis.get.mockResolvedValue({ data: { revenue: 1000 } });

      const result = await getDashboardApi(2024, 1);

      expect(Apis.get).toHaveBeenCalledWith(
        "analytics/dashboard/?year=2024&quarter=1",
      );
      expect(result).toEqual({ revenue: 1000 });
    });
  });

  // --- Courses ---
  describe("getCourses", () => {
    it("SER-027 gọi đúng endpoint danh sách courses", async () => {
      Apis.get.mockResolvedValue({ data: [{ id: 1, name: "IELTS" }] });

      const result = await getCourses(1);

      expect(Apis.get).toHaveBeenCalledWith("courses/?page=1", {
        signal: undefined,
      });
      expect(result).toEqual([{ id: 1, name: "IELTS" }]);
    });
  });

  describe("getLevels", () => {
    it("SER-028 gọi đúng endpoint danh sách levels", async () => {
      Apis.get.mockResolvedValue({ data: [{ id: 1, name: "Beginner" }] });

      const result = await getLevels();

      expect(Apis.get).toHaveBeenCalledWith("levels/");
      expect(result).toEqual([{ id: 1, name: "Beginner" }]);
    });
  });

  describe("createCourse", () => {
    it("SER-029 gọi đúng endpoint tạo course", async () => {
      const formData = { name: "TOEIC", level_id: 1 };
      Apis.post.mockResolvedValue({ data: { id: 2, ...formData } });

      const result = await createCourse(formData);

      expect(Apis.post).toHaveBeenCalledWith("courses/", formData);
      expect(result).toEqual({ id: 2, ...formData });
    });
  });

  describe("updateCourse", () => {
    it("SER-030 gọi đúng endpoint update course", async () => {
      const formData = { name: "TOEIC Updated" };
      Apis.patch.mockResolvedValue({ data: { id: 2, ...formData } });

      const result = await updateCourse(2, formData);

      expect(Apis.patch).toHaveBeenCalledWith("courses/2/", formData);
      expect(result).toEqual({ id: 2, ...formData });
    });
  });

  describe("deleteCourse", () => {
    it("SER-031 gọi đúng endpoint xóa course", async () => {
      Apis.delete.mockResolvedValue({ data: { success: true } });

      const result = await deleteCourse(2);

      expect(Apis.delete).toHaveBeenCalledWith("courses/2/");
      expect(result).toEqual({ success: true });
    });
  });

  // --- Classes ---
  describe("getClasses", () => {
    it("SER-032 gọi đúng endpoint với page mặc định là 1", async () => {
      Apis.get.mockResolvedValue({ data: [{ id: 1, name: "IELTS Basic A" }] });

      const result = await getClasses(); // page=1, signal=undefined

      expect(Apis.get).toHaveBeenCalledWith("classes/?page=1", {
        signal: undefined,
      });
      expect(result).toEqual([{ id: 1, name: "IELTS Basic A" }]);
    });

    it("gọi đúng endpoint với page truyền vào", async () => {
      Apis.get.mockResolvedValue({ data: [] });

      await getClasses(2);

      expect(Apis.get).toHaveBeenCalledWith("classes/?page=2", {
        signal: undefined,
      });
    });
  });

  describe("createClass", () => {
    it("SER-034 gọi đúng endpoint tạo class", async () => {
      const formData = { name: "IELTS Basic B", course_id: 1 };
      Apis.post.mockResolvedValue({ data: { id: 3, ...formData } });

      const result = await createClass(formData);

      expect(Apis.post).toHaveBeenCalledWith("classes/", formData);
      expect(result).toEqual({ id: 3, ...formData });
    });
  });

  describe("updateClass", () => {
    it("SER-033 gọi đúng endpoint update class", async () => {
      const formData = { name: "IELTS Basic B Updated" };
      Apis.patch.mockResolvedValue({ data: { id: 3, ...formData } });

      const result = await updateClass(3, formData);

      expect(Apis.patch).toHaveBeenCalledWith("classes/3/", formData);
      expect(result).toEqual({ id: 3, ...formData });
    });
  });

  describe("deleteClass", () => {
    it("SER-035 gọi đúng endpoint xóa class", async () => {
      Apis.delete.mockResolvedValue({ data: { success: true } });

      const result = await deleteClass(3);

      expect(Apis.delete).toHaveBeenCalledWith("classes/3/");
      expect(result).toEqual({ success: true });
    });
  });

  describe("getTeachers", () => {
    it("SER-036 gọi đúng endpoint danh sách teachers", async () => {
      Apis.get.mockResolvedValue({ data: [{ id: 1, name: "Nguyen Van A" }] });

      const result = await getTeachers();

      expect(Apis.get).toHaveBeenCalledWith("teachers/");
      expect(result).toEqual([{ id: 1, name: "Nguyen Van A" }]);
    });
  });

  describe("getRooms", () => {
    it("SER-037 gọi đúng endpoint danh sách rooms", async () => {
      Apis.get.mockResolvedValue({ data: [{ id: 1, name: "P.101" }] });

      const result = await getRooms();

      expect(Apis.get).toHaveBeenCalledWith("rooms/");
      expect(result).toEqual([{ id: 1, name: "P.101" }]);
    });
  });

  // --- Sessions ---
  describe("getSessionsByClass", () => {
    it("SER-038 gọi đúng endpoint với classId", async () => {
      Apis.get.mockResolvedValue({ data: [{ id: 1, date: "2024-01-15" }] });

      const result = await getSessionsByClass(5);

      expect(Apis.get).toHaveBeenCalledWith("classes/5/sessions/");
      expect(result).toEqual([{ id: 1, date: "2024-01-15" }]);
    });
  });

  describe("createSession", () => {
    it("SER-039 gọi đúng endpoint tạo session", async () => {
      const data = { class_id: 5, date: "2024-01-15" };
      Apis.post.mockResolvedValue({ data: { id: 10, ...data } });

      const result = await createSession(data);

      expect(Apis.post).toHaveBeenCalledWith("sessions/", data);
      expect(result).toEqual({ id: 10, ...data });
    });
  });

  describe("updateSession", () => {
    it("SER-040 gọi đúng endpoint update session", async () => {
      const data = { date: "2024-01-20" };
      Apis.patch.mockResolvedValue({ data: { id: 10, ...data } });

      const result = await updateSession(10, data);

      expect(Apis.patch).toHaveBeenCalledWith("sessions/10/", data);
      expect(result).toEqual({ id: 10, ...data });
    });
  });

  describe("deleteSession", () => {
    it("SER-041 gọi đúng endpoint xóa session", async () => {
      Apis.delete.mockResolvedValue({ data: { success: true } });

      const result = await deleteSession(10);

      expect(Apis.delete).toHaveBeenCalledWith("sessions/10/");
      expect(result).toEqual({ success: true });
    });
  });

  // --- Users ---
  describe("getUsers", () => {
    it("SER-042 gọi đúng endpoint với page mặc định là 1", async () => {
      Apis.get.mockResolvedValue({ data: { results: [{ id: 1 }] } });

      const result = await getUsers();

      expect(Apis.get).toHaveBeenCalledWith("users/?page=1", {
        signal: undefined,
      });
      expect(result).toEqual({ results: [{ id: 1 }] });
    });

    it("SER-043 gọi đúng endpoint với page truyền vào", async () => {
      Apis.get.mockResolvedValue({ data: { results: [] } });

      await getUsers(3);

      expect(Apis.get).toHaveBeenCalledWith("users/?page=3", {
        signal: undefined,
      });
    });
  });

  describe("updateUser", () => {
    it("SER-044 gọi đúng endpoint update user", async () => {
      const data = { email: "new@gmail.com" };
      Apis.patch.mockResolvedValue({ data: { id: 1, ...data } });

      const result = await updateUser(1, data);

      expect(Apis.patch).toHaveBeenCalledWith("users/1/", data);
      expect(result).toEqual({ id: 1, ...data });
    });
  });

  describe("lockUser", () => {
    it("SER-045 gọi đúng endpoint toggle lock user", async () => {
      Apis.patch.mockResolvedValue({ data: { id: 1, is_locked: true } });

      const result = await lockUser(1);

      expect(Apis.patch).toHaveBeenCalledWith("users/1/toggle-lock/");
      expect(result).toEqual({ id: 1, is_locked: true });
    });
  });

  describe("changeUserRole", () => {
    it("SER-046 gọi đúng endpoint thay đổi role", async () => {
      const data = { role: "teacher" };
      Apis.patch.mockResolvedValue({ data: { id: 1, ...data } });

      const result = await changeUserRole(1, data);

      expect(Apis.patch).toHaveBeenCalledWith("users/1/role/", data);
      expect(result).toEqual({ id: 1, ...data });
    });
  });

  describe("createTeacher", () => {
    it("SER-047 gọi đúng endpoint tạo teacher", async () => {
      const data = { username: "teacher01", role: "teacher" };
      Apis.post.mockResolvedValue({ data: { id: 5, ...data } });

      const result = await createTeacher(data);

      expect(Apis.post).toHaveBeenCalledWith("users/", data);
      expect(result).toEqual({ id: 5, ...data });
    });
  });

  // --- Payments ---
  describe("getPayments", () => {
    it("SER-048 gọi đúng endpoint với giá trị mặc định", async () => {
      Apis.get.mockResolvedValue({ data: { results: [], count: 0 } });

      const result = await getPayments();

      expect(Apis.get).toHaveBeenCalledWith(
        "payments/?page=1&search=&payment_status=",
        { signal: undefined },
      );
      expect(result).toEqual({ results: [], count: 0 });
    });

    it("SER-049 gọi đúng endpoint với đầy đủ tham số", async () => {
      Apis.get.mockResolvedValue({ data: { results: [{ id: 1 }], count: 1 } });

      const result = await getPayments(2, "john", "paid");

      expect(Apis.get).toHaveBeenCalledWith(
        "payments/?page=2&search=john&payment_status=paid",
        { signal: undefined },
      );
      expect(result).toEqual({ results: [{ id: 1 }], count: 1 });
    });
  });
});
