import { describe, it, expect, vi, beforeEach } from "vitest";
import { enrollmentApi, paymentApi, enrollmentDetailApi, deleteEnrollmentApi } from "./enrollmentService";
import Apis from "./Apis";

vi.mock("./Apis");

const mockEnrollment = {
  id: 42,
  classroom: 10,
  student: 7,
  status: "active",
};

const mockPaymentPayload = {
  enrollment: 42,
  amount: 500000,
  payment_method: "VNPAY",
};

const mockPaymentResponse = {
  id: 99,
  enrollment: 42,
  amount: 500000,
  payment_method: "VNPAY",
  payment_url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?token=abc123",
  status: "pending",
};

const mockEnrollmentDetail = {
  id: 42,
  classroom: { id: 10, name: "Lớp A" },
  student: { id: 7, username: "testuser" },
  status: "active",
  paid_at: "2025-01-15T08:00:00Z",
};

describe("enrollmentService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("enrollmentApi", () => {
    it("gọi POST /enrollments/ với đúng payload", async () => {
      Apis.post.mockResolvedValue({ data: mockEnrollment });

      const result = await enrollmentApi({ classroom: 10 });

      expect(Apis.post).toHaveBeenCalledWith("enrollments/", { classroom: 10 });
      expect(result).toEqual(mockEnrollment);
    });

    it("trả về enrollment có id để dùng cho payment", async () => {
      Apis.post.mockResolvedValue({ data: mockEnrollment });

      const result = await enrollmentApi({ classroom: 10 });

      expect(result).toHaveProperty("id");
      expect(typeof result.id).toBe("number");
    });

    it("throw error khi đã đăng ký lớp này rồi (400)", async () => {
      const error = {
        response: { status: 400, data: { detail: "Bạn đã đăng ký lớp học này rồi." } },
      };
      Apis.post.mockRejectedValue(error);

      await expect(enrollmentApi({ classroom: 10 })).rejects.toEqual(error);
    });

    it("throw error khi không có slot trống (400)", async () => {
      const error = { response: { status: 400, data: ["Lớp học đã đầy."] } };
      Apis.post.mockRejectedValue(error);

      await expect(enrollmentApi({ classroom: 11 })).rejects.toEqual(error);
    });

    it("throw error khi chưa đăng nhập (401)", async () => {
      const error = { response: { status: 401, data: { detail: "Unauthorized" } } };
      Apis.post.mockRejectedValue(error);

      await expect(enrollmentApi({ classroom: 10 })).rejects.toEqual(error);
    });
  });

  describe("paymentApi", () => {
    it("gọi POST /payments/ với đúng payload", async () => {
      Apis.post.mockResolvedValue({ data: mockPaymentResponse });

      const result = await paymentApi(mockPaymentPayload);

      expect(Apis.post).toHaveBeenCalledWith("payments/", mockPaymentPayload);
      expect(result).toEqual(mockPaymentResponse);
    });

    it("trả về payment_url để redirect sang VNPay", async () => {
      Apis.post.mockResolvedValue({ data: mockPaymentResponse });

      const result = await paymentApi(mockPaymentPayload);

      expect(result).toHaveProperty("payment_url");
      expect(result.payment_url).toMatch(/^https?:\/\//);
    });

    it("trả về đầy đủ thông tin payment", async () => {
      Apis.post.mockResolvedValue({ data: mockPaymentResponse });

      const result = await paymentApi(mockPaymentPayload);

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("enrollment");
      expect(result).toHaveProperty("amount");
      expect(result).toHaveProperty("payment_method");
    });

    it("throw error khi enrollment id không hợp lệ (400)", async () => {
      const error = {
        response: { status: 400, data: { enrollment: ["Invalid pk"] } },
      };
      Apis.post.mockRejectedValue(error);

      await expect(paymentApi({ ...mockPaymentPayload, enrollment: 9999 })).rejects.toEqual(error);
    });

    it("throw error khi server lỗi (500)", async () => {
      const error = { response: { status: 500, data: "Internal Server Error" } };
      Apis.post.mockRejectedValue(error);

      await expect(paymentApi(mockPaymentPayload)).rejects.toEqual(error);
    });
  });

  describe("enrollmentDetailApi", () => {
    it("gọi GET /enrollments/:id/ với đúng id", async () => {
      Apis.get.mockResolvedValue({ data: mockEnrollmentDetail });

      const result = await enrollmentDetailApi(42);

      expect(Apis.get).toHaveBeenCalledWith("enrollments/42/");
      expect(result).toEqual(mockEnrollmentDetail);
    });

    it("trả về object có classroom và student", async () => {
      Apis.get.mockResolvedValue({ data: mockEnrollmentDetail });

      const result = await enrollmentDetailApi(42);

      expect(result).toHaveProperty("classroom");
      expect(result).toHaveProperty("student");
      expect(result).toHaveProperty("status");
    });

    it("gọi đúng endpoint khi id là string", async () => {
      Apis.get.mockResolvedValue({ data: mockEnrollmentDetail });

      await enrollmentDetailApi("42");

      expect(Apis.get).toHaveBeenCalledWith("enrollments/42/");
    });

    it("throw error khi enrollment không tồn tại (404)", async () => {
      const error = { response: { status: 404, data: { detail: "Not found." } } };
      Apis.get.mockRejectedValue(error);

      await expect(enrollmentDetailApi(9999)).rejects.toEqual(error);
    });

    it("throw error khi không có quyền truy cập (403)", async () => {
      const error = { response: { status: 403, data: { detail: "Forbidden" } } };
      Apis.get.mockRejectedValue(error);

      await expect(enrollmentDetailApi(1)).rejects.toEqual(error);
    });
  });

  describe("deleteEnrollmentApi", () => {
    it("gọi DELETE /enrollments/:id/ với đúng id số", async () => {
      Apis.delete.mockResolvedValue({ data: {} });

      await deleteEnrollmentApi(42);

      expect(Apis.delete).toHaveBeenCalledWith("enrollments/42/");
    });

    it("gọi đúng endpoint khi id là string", async () => {
      Apis.delete.mockResolvedValue({ data: {} });

      await deleteEnrollmentApi("42");

      expect(Apis.delete).toHaveBeenCalledWith("enrollments/42/");
    });

    it("trả về data sau khi xóa", async () => {
      Apis.delete.mockResolvedValue({ data: {} });

      const result = await deleteEnrollmentApi(42);

      expect(result).toEqual({});
    });

    it("throw error khi enrollment không tồn tại (404)", async () => {
      const error = { response: { status: 404, data: { detail: "Not found." } } };
      Apis.delete.mockRejectedValue(error);

      await expect(deleteEnrollmentApi(9999)).rejects.toEqual(error);
    });

    it("throw error khi không có quyền xóa (403)", async () => {
      const error = { response: { status: 403, data: { detail: "Forbidden" } } };
      Apis.delete.mockRejectedValue(error);

      await expect(deleteEnrollmentApi(42)).rejects.toEqual(error);
    });

    it("throw error khi chưa đăng nhập (401)", async () => {
      const error = { response: { status: 401, data: { detail: "Unauthorized" } } };
      Apis.delete.mockRejectedValue(error);

      await expect(deleteEnrollmentApi(42)).rejects.toEqual(error);
    });
  });
});