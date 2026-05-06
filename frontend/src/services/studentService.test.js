import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  studentApi,
  updateStudentApi,
  updateStudentAvatarApi,
  myEnrollmentApi,
  myPaymentApi,
  myScheduleApi,
  myClassResultApi,
  paymentDetailApi,
} from "./studentService";
import Apis from "./Apis";

vi.mock("./Apis");

const mockUser = {
  id: 7,
  username: "testuser",
  first_name: "Văn",
  last_name: "Nguyễn",
  email: "test@example.com",
  phone_num: "0901234567",
};

const mockEnrollments = [
  { id: 42, classroom: { id: 10, name: "Lớp A" }, status: "active" },
  { id: 43, classroom: { id: 11, name: "Lớp B" }, status: "completed" },
];

const mockPayments = [
  {
    id: 99,
    enrollment: 42,
    amount: 500000,
    payment_method: "VNPAY",
    payment_status: "SUCCESS",
    paid_at: "2025-01-15T08:00:00Z",
    classroom: "Lớp A",
    total_sessions: 20,
    transaction_id: "TXN123456",
  },
];

const mockSchedule = [
  { id: 1, classroom: 10, date: "2025-01-20", time: "08:00", topic: "Buổi 1" },
  { id: 2, classroom: 10, date: "2025-01-22", time: "08:00", topic: "Buổi 2" },
];

const mockResults = [
  { id: 1, classroom: 10, score: 8.5, grade: "Giỏi" },
];

describe("studentService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── studentApi ──────────────────────────────────────────────────────────────

  describe("studentApi", () => {
    it("gọi GET /users/me/ và trả về data", async () => {
      Apis.get.mockResolvedValue({ data: mockUser });

      const result = await studentApi();

      expect(Apis.get).toHaveBeenCalledWith("users/me/");
      expect(result).toEqual(mockUser);
    });

    it("trả về thông tin user đầy đủ", async () => {
      Apis.get.mockResolvedValue({ data: mockUser });

      const result = await studentApi();

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("first_name");
      expect(result).toHaveProperty("last_name");
      expect(result).toHaveProperty("email");
    });

    it("throw error khi chưa đăng nhập (401)", async () => {
      const error = { response: { status: 401, data: { detail: "Unauthorized" } } };
      Apis.get.mockRejectedValue(error);

      await expect(studentApi()).rejects.toEqual(error);
    });
  });

  // ─── updateStudentApi ────────────────────────────────────────────────────────

  describe("updateStudentApi", () => {
    it("gọi PATCH /users/me/ với formData", async () => {
      const updatePayload = { first_name: "Minh", phone_num: "0909876543" };
      Apis.patch.mockResolvedValue({ data: { ...mockUser, ...updatePayload } });

      const result = await updateStudentApi(updatePayload);

      expect(Apis.patch).toHaveBeenCalledWith("users/me/", updatePayload);
      expect(result.first_name).toBe("Minh");
    });

    it("trả về user đã được cập nhật", async () => {
      const updated = { ...mockUser, email: "new@email.com" };
      Apis.patch.mockResolvedValue({ data: updated });

      const result = await updateStudentApi({ email: "new@email.com" });

      expect(result.email).toBe("new@email.com");
    });

    it("throw và re-throw error khi API lỗi", async () => {
      const error = { response: { status: 400, data: { email: ["Email không hợp lệ"] } } };
      Apis.patch.mockRejectedValue(error);

      await expect(updateStudentApi({ email: "bad-email" })).rejects.toEqual(error);
    });
  });

  // ─── updateStudentAvatarApi ──────────────────────────────────────────────────

  describe("updateStudentAvatarApi", () => {
    it("gọi PATCH /users/me/avatar/ với multipart header", async () => {
      const formData = new FormData();
      Apis.patch.mockResolvedValue({ data: { avatar: "http://example.com/avatar.jpg" } });

      await updateStudentAvatarApi(formData);

      expect(Apis.patch).toHaveBeenCalledWith(
        "users/me/avatar/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
    });

    it("trả về URL avatar mới sau khi upload", async () => {
      const formData = new FormData();
      Apis.patch.mockResolvedValue({ data: { avatar: "http://example.com/new-avatar.jpg" } });

      const result = await updateStudentAvatarApi(formData);

      expect(result).toHaveProperty("avatar");
      expect(result.avatar).toMatch(/^http/);
    });

    it("throw error khi file không hợp lệ (400)", async () => {
      const error = { response: { status: 400, data: { avatar: ["Invalid image format"] } } };
      Apis.patch.mockRejectedValue(error);

      await expect(updateStudentAvatarApi(new FormData())).rejects.toEqual(error);
    });
  });

  // ─── myEnrollmentApi ─────────────────────────────────────────────────────────

  describe("myEnrollmentApi", () => {
    it("gọi GET /users/me/enrollments/ và trả về danh sách", async () => {
      Apis.get.mockResolvedValue({ data: mockEnrollments });

      const result = await myEnrollmentApi();

      expect(Apis.get).toHaveBeenCalledWith("users/me/enrollments/");
      expect(result).toEqual(mockEnrollments);
    });

    it("trả về mảng enrollment với classroom và status", async () => {
      Apis.get.mockResolvedValue({ data: mockEnrollments });

      const result = await myEnrollmentApi();

      expect(Array.isArray(result)).toBe(true);
      result.forEach((e) => {
        expect(e).toHaveProperty("classroom");
        expect(e).toHaveProperty("status");
      });
    });

    it("trả về mảng rỗng nếu chưa đăng ký khóa nào", async () => {
      Apis.get.mockResolvedValue({ data: [] });

      const result = await myEnrollmentApi();

      expect(result).toHaveLength(0);
    });
  });

  // ─── myPaymentApi ────────────────────────────────────────────────────────────

  describe("myPaymentApi", () => {
    it("gọi GET /users/me/payments/ và trả về danh sách payment", async () => {
      Apis.get.mockResolvedValue({ data: mockPayments });

      const result = await myPaymentApi();

      expect(Apis.get).toHaveBeenCalledWith("users/me/payments/");
      expect(result).toEqual(mockPayments);
    });

    it("trả về payment có đủ trường cần thiết cho bill", async () => {
      Apis.get.mockResolvedValue({ data: mockPayments });

      const result = await myPaymentApi();

      result.forEach((p) => {
        expect(p).toHaveProperty("id");
        expect(p).toHaveProperty("enrollment");
        expect(p).toHaveProperty("amount");
        expect(p).toHaveProperty("payment_status");
      });
    });

    it("trả về mảng rỗng nếu chưa có payment nào", async () => {
      Apis.get.mockResolvedValue({ data: [] });

      const result = await myPaymentApi();

      expect(result).toHaveLength(0);
    });

    it("throw error khi chưa đăng nhập", async () => {
      const error = { response: { status: 401 } };
      Apis.get.mockRejectedValue(error);

      await expect(myPaymentApi()).rejects.toEqual(error);
    });
  });

  // ─── myScheduleApi ───────────────────────────────────────────────────────────

  describe("myScheduleApi", () => {
    it("gọi GET /sessions/ và trả về lịch học", async () => {
      Apis.get.mockResolvedValue({ data: mockSchedule });

      const result = await myScheduleApi();

      expect(Apis.get).toHaveBeenCalledWith("sessions/");
      expect(result).toEqual(mockSchedule);
    });

    it("trả về các buổi học với date và topic", async () => {
      Apis.get.mockResolvedValue({ data: mockSchedule });

      const result = await myScheduleApi();

      result.forEach((s) => {
        expect(s).toHaveProperty("date");
        expect(s).toHaveProperty("topic");
      });
    });

    it("trả về mảng rỗng nếu chưa có lịch", async () => {
      Apis.get.mockResolvedValue({ data: [] });

      const result = await myScheduleApi();

      expect(result).toEqual([]);
    });
  });

  // ─── myClassResultApi ────────────────────────────────────────────────────────

  describe("myClassResultApi", () => {
    it("gọi GET /users/me/results/ và trả về kết quả học", async () => {
      Apis.get.mockResolvedValue({ data: mockResults });

      const result = await myClassResultApi();

      expect(Apis.get).toHaveBeenCalledWith("users/me/results/");
      expect(result).toEqual(mockResults);
    });

    it("trả về kết quả có score và grade", async () => {
      Apis.get.mockResolvedValue({ data: mockResults });

      const result = await myClassResultApi();

      result.forEach((r) => {
        expect(r).toHaveProperty("score");
        expect(r).toHaveProperty("grade");
      });
    });

    it("throw error khi server lỗi (500)", async () => {
      Apis.get.mockRejectedValue(new Error("Internal Server Error"));

      await expect(myClassResultApi()).rejects.toThrow("Internal Server Error");
    });
  });

  // ─── paymentDetailApi ────────────────────────────────────────────────────────

  describe("paymentDetailApi", () => {
    it("gọi GET /payments/:id/ với đúng id", async () => {
      Apis.get.mockResolvedValue({ data: mockPayments[0] });

      const result = await paymentDetailApi(99);

      expect(Apis.get).toHaveBeenCalledWith("payments/99/");
      expect(result).toEqual(mockPayments[0]);
    });

    it("gọi đúng endpoint khi id là string", async () => {
      Apis.get.mockResolvedValue({ data: mockPayments[0] });

      await paymentDetailApi("99");

      expect(Apis.get).toHaveBeenCalledWith("payments/99/");
    });

    it("trả về payment detail đầy đủ thông tin", async () => {
      Apis.get.mockResolvedValue({ data: mockPayments[0] });

      const result = await paymentDetailApi(99);

      expect(result).toHaveProperty("transaction_id");
      expect(result).toHaveProperty("payment_method");
      expect(result).toHaveProperty("payment_status");
      expect(result).toHaveProperty("amount");
    });

    it("throw error khi payment không tồn tại (404)", async () => {
      const error = { response: { status: 404, data: { detail: "Not found." } } };
      Apis.get.mockRejectedValue(error);

      await expect(paymentDetailApi(9999)).rejects.toEqual(error);
    });
  });
});