import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CourseRegister from "./CourseRegister";

// ─── Mock tất cả dependencies ────────────────────────────────────────────────

vi.mock("../../pages/Payment/CourseRegisterForm", () => ({
  default: (props) => (
    <div>
      <div data-testid="course-name">{props.course?.name}</div>
      <div data-testid="loading">{props.loading ? "loading" : "idle"}</div>
      <button data-testid="btn-open-confirm" onClick={props.onOpenConfirm}>OpenConfirm</button>
      <button data-testid="btn-submit" onClick={props.onSubmit}>Submit</button>
      <button data-testid="btn-cancel-confirm" onClick={props.onCancelConfirm}>CancelConfirm</button>
      <button data-testid="btn-search" onClick={props.onSearch}>Search</button>
      <button data-testid="btn-select-class" onClick={() => props.onSelectClass({ id: 10, name: "Lớp A" })}>SelectClass</button>
      <button data-testid="btn-back" onClick={props.backToCourse}>Back</button>
      <div data-testid="payment">{props.payment ? "payment-open" : ""}</div>
      <div data-testid="confirm">{props.confirm ? "confirm-open" : ""}</div>
      <div data-testid="bill">{props.bill ? "bill-open" : ""}</div>
    </div>
  ),
}));

vi.mock("../../services/courseService", () => ({
  courseApi: vi.fn(),
  classApi: vi.fn(),
  searchCourseApi: vi.fn(),
}));

vi.mock("../../services/enrollmentService", () => ({
  enrollmentApi: vi.fn(),
  paymentApi: vi.fn(),
  enrollmentDetailApi: vi.fn(),
  deleteEnrollmentApi: vi.fn(),
}));

vi.mock("../../services/studentService", () => ({
  myPaymentApi: vi.fn(),
}));

vi.mock("../../services/Apis", () => ({
  default: { get: vi.fn() },
}));

import { courseApi, classApi, searchCourseApi } from "../../services/courseService";
import { enrollmentApi, paymentApi, deleteEnrollmentApi } from "../../services/enrollmentService";
import { myPaymentApi } from "../../services/studentService";
import Apis from "../../services/Apis";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mockCourse = {
  id: 1,
  name: "Khóa học React",
  price: 500000,
  total_sessions: 20,
  level_name: "Beginner",
};

const mockClasses = {
  results: [{ id: 10, name: "Lớp A", remaining_slots: 5 }],
};

const renderComponent = (locationState = null, searchParamsStr = "") => {
  return render(
    <MemoryRouter initialEntries={[{ pathname: "/course-register", search: searchParamsStr, state: locationState }]}>
      <Routes>
        <Route path="/course-register" element={<CourseRegister />} />
        <Route path="/course-list" element={<div>Course List</div>} />
      </Routes>
    </MemoryRouter>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

describe("CourseRegister", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "alert").mockImplementation(() => { });
    vi.spyOn(window, "open").mockImplementation(() => { });
    localStorage.clear();
    sessionStorage.clear();

    // Default mocks
    Apis.get.mockResolvedValue({ data: [] });
    courseApi.mockResolvedValue(mockCourse);
    classApi.mockResolvedValue(mockClasses);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ─── Mount & load course ──────────────────────────────────────────────────

  describe("khởi tạo và load dữ liệu", () => {
    it("render không lỗi khi không có selectedCourse", async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByTestId("loading")).toBeInTheDocument();
      });
    });

    it("load course detail khi có selectedCourse từ location.state", async () => {
      courseApi.mockResolvedValue(mockCourse);
      classApi.mockResolvedValue(mockClasses);

      renderComponent({ course: { id: 1 } });

      await waitFor(() => {
        expect(courseApi).toHaveBeenCalledWith(1);
        expect(classApi).toHaveBeenCalledWith(1);
      });

      await waitFor(() => {
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React");
      });
    });

    it("load course từ localStorage khi không có selectedCourse", async () => {
      localStorage.setItem("lastCourseId", "2");
      courseApi.mockResolvedValue({ ...mockCourse, id: 2 });
      classApi.mockResolvedValue(mockClasses);

      renderComponent();

      await waitFor(() => {
        expect(courseApi).toHaveBeenCalledWith("2");
        expect(classApi).toHaveBeenCalledWith("2");
      });
    });

    it("load myEnrollments khi mount", async () => {
      const mockEnrollments = [{ id: 42, classroom: 10 }];
      Apis.get.mockResolvedValue({ data: mockEnrollments });

      renderComponent();

      await waitFor(() => {
        expect(Apis.get).toHaveBeenCalledWith("users/me/enrollments/");
      });
    });

    it("xử lý myEnrollments dạng { results: [] }", async () => {
      Apis.get.mockResolvedValue({ data: { results: [{ id: 42 }] } });

      renderComponent();

      await waitFor(() => {
        expect(Apis.get).toHaveBeenCalledWith("users/me/enrollments/");
      });
    });
  });

  // ─── handleOpenConfirm ────────────────────────────────────────────────────

  describe("handleOpenConfirm", () => {
    it("alert khi chưa chọn lớp", async () => {
      renderComponent({ course: { id: 1 } });
      await waitFor(() => expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React"));

      await userEvent.click(screen.getByTestId("btn-open-confirm"));

      expect(window.alert).toHaveBeenCalledWith("Vui lòng chọn lớp học trước khi đăng ký!");
    });

    it("gọi enrollmentApi và mở ConfirmForm khi thành công", async () => {
      enrollmentApi.mockResolvedValue({ id: 42 });
      renderComponent({ course: { id: 1 } });
      await waitFor(() => expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React"));

      await userEvent.click(screen.getByTestId("btn-select-class"));
      await userEvent.click(screen.getByTestId("btn-open-confirm"));

      await waitFor(() => {
        expect(enrollmentApi).toHaveBeenCalledWith({ classroom: 10 });
        expect(screen.getByTestId("confirm").textContent).toBe("confirm-open");
      });
    });

    it("hiện alert lỗi khi enrollmentApi throw (detail)", async () => {
      enrollmentApi.mockRejectedValue({
        response: { data: { detail: "Lớp đã đầy." } },
      });
      renderComponent({ course: { id: 1 } });
      await waitFor(() => expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React"));

      await userEvent.click(screen.getByTestId("btn-select-class"));
      await userEvent.click(screen.getByTestId("btn-open-confirm"));

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith("Đăng ký thất bại: Lớp đã đầy.");
      });
    });

    it("hiện alert lỗi khi enrollmentApi throw (string)", async () => {
      enrollmentApi.mockRejectedValue({ response: { data: "Server Error" } });
      renderComponent({ course: { id: 1 } });
      await waitFor(() => expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React"));

      await userEvent.click(screen.getByTestId("btn-select-class"));
      await userEvent.click(screen.getByTestId("btn-open-confirm"));

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith("Đăng ký thất bại: Server Error");
      });
    });

    it("hiện alert lỗi khi enrollmentApi throw (array)", async () => {
      enrollmentApi.mockRejectedValue({ response: { data: ["Lỗi 1", "Lỗi 2"] } });
      renderComponent({ course: { id: 1 } });
      await waitFor(() => expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React"));

      await userEvent.click(screen.getByTestId("btn-select-class"));
      await userEvent.click(screen.getByTestId("btn-open-confirm"));

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith("Đăng ký thất bại: Lỗi 1\nLỗi 2");
      });
    });
  });

  // ─── handleSubmit ─────────────────────────────────────────────────────────

  describe("handleSubmit", () => {
    it("không làm gì nếu chưa có pendingEnrollmentId", async () => {
      renderComponent({ course: { id: 1 } });
      await waitFor(() => expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React"));

      await userEvent.click(screen.getByTestId("btn-submit"));

      expect(paymentApi).not.toHaveBeenCalled();
    });

    it("gọi paymentApi và mở VNPay khi thành công", async () => {
      enrollmentApi.mockResolvedValue({ id: 42 });
      paymentApi.mockResolvedValue({
        payment_url: "https://sandbox.vnpayment.vn/pay?token=abc",
      });

      renderComponent({ course: { id: 1 } });
      await waitFor(() => expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React"));

      await userEvent.click(screen.getByTestId("btn-select-class"));
      await userEvent.click(screen.getByTestId("btn-open-confirm"));
      await waitFor(() => expect(screen.getByTestId("confirm").textContent).toBe("confirm-open"));

      await userEvent.click(screen.getByTestId("btn-submit"));

      await waitFor(() => {
        expect(paymentApi).toHaveBeenCalledWith({
          enrollment: 42,
          amount: 500000,
          payment_method: "VNPAY",
        });
        expect(window.open).toHaveBeenCalledWith(
          "https://sandbox.vnpayment.vn/pay?token=abc",
          "_blank"
        );
      });
    });

    it("lưu pendingCourseId và lastCourseId vào localStorage", async () => {
      enrollmentApi.mockResolvedValue({ id: 42 });
      paymentApi.mockResolvedValue({
        payment_url: "https://sandbox.vnpayment.vn/pay?token=abc",
      });

      renderComponent({ course: { id: 1 } });
      await waitFor(() => expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React"));

      await userEvent.click(screen.getByTestId("btn-select-class"));
      await userEvent.click(screen.getByTestId("btn-open-confirm"));
      await waitFor(() => expect(screen.getByTestId("confirm").textContent).toBe("confirm-open"));
      await userEvent.click(screen.getByTestId("btn-submit"));

      await waitFor(() => {
        expect(localStorage.getItem("pendingCourseId")).toBe("1");
        expect(localStorage.getItem("lastCourseId")).toBe("1");
      });
    });

    it("alert lỗi khi paymentApi throw", async () => {
      enrollmentApi.mockResolvedValue({ id: 42 });
      paymentApi.mockRejectedValue(new Error("Payment failed"));

      renderComponent({ course: { id: 1 } });
      await waitFor(() => expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React"));

      await userEvent.click(screen.getByTestId("btn-select-class"));
      await userEvent.click(screen.getByTestId("btn-open-confirm"));
      await waitFor(() => expect(screen.getByTestId("confirm").textContent).toBe("confirm-open"));
      await userEvent.click(screen.getByTestId("btn-submit"));

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith("Thanh toán thất bại");
      });
    });
  });

  // ─── handleCancelConfirm ──────────────────────────────────────────────────

  describe("handleCancelConfirm", () => {
    it("gọi deleteEnrollmentApi với đúng id khi hủy", async () => {
      enrollmentApi.mockResolvedValue({ id: 42 });
      deleteEnrollmentApi.mockResolvedValue({});

      renderComponent({ course: { id: 1 } });
      await waitFor(() => expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React"));

      await userEvent.click(screen.getByTestId("btn-select-class"));
      await userEvent.click(screen.getByTestId("btn-open-confirm"));
      await waitFor(() => expect(screen.getByTestId("confirm").textContent).toBe("confirm-open"));

      await userEvent.click(screen.getByTestId("btn-cancel-confirm"));

      await waitFor(() => {
        expect(deleteEnrollmentApi).toHaveBeenCalledWith(42);
      });
    });

    it("đóng ConfirmForm và mở lại PaymentForm sau khi hủy", async () => {
      enrollmentApi.mockResolvedValue({ id: 42 });
      deleteEnrollmentApi.mockResolvedValue({});

      renderComponent({ course: { id: 1 } });
      await waitFor(() => expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React"));

      await userEvent.click(screen.getByTestId("btn-select-class"));
      await userEvent.click(screen.getByTestId("btn-open-confirm"));
      await waitFor(() => expect(screen.getByTestId("confirm").textContent).toBe("confirm-open"));

      await userEvent.click(screen.getByTestId("btn-cancel-confirm"));

      await waitFor(() => {
        expect(screen.getByTestId("confirm").textContent).toBe("");
        expect(screen.getByTestId("payment").textContent).toBe("payment-open");
      });
    });

    it("không gọi deleteEnrollmentApi nếu chưa có pendingEnrollmentId", async () => {
      renderComponent({ course: { id: 1 } });
      await waitFor(() => expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React"));

      await userEvent.click(screen.getByTestId("btn-cancel-confirm"));

      expect(deleteEnrollmentApi).not.toHaveBeenCalled();
    });

    it("vẫn đóng ConfirmForm dù deleteEnrollmentApi lỗi", async () => {
      enrollmentApi.mockResolvedValue({ id: 42 });
      deleteEnrollmentApi.mockRejectedValue(new Error("Delete failed"));

      renderComponent({ course: { id: 1 } });
      await waitFor(() => expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React"));

      await userEvent.click(screen.getByTestId("btn-select-class"));
      await userEvent.click(screen.getByTestId("btn-open-confirm"));
      await waitFor(() => expect(screen.getByTestId("confirm").textContent).toBe("confirm-open"));

      await userEvent.click(screen.getByTestId("btn-cancel-confirm"));

      await waitFor(() => {
        expect(screen.getByTestId("confirm").textContent).toBe("");
      });
    });
  });

  // ─── handleSearch ─────────────────────────────────────────────────────────

  describe("handleSearch", () => {
    it("tìm kiếm và setCourse khi có kết quả", async () => {
      courseApi.mockResolvedValueOnce({ ...mockCourse, id: 1, name: "Khóa học React" });
      classApi.mockResolvedValueOnce(mockClasses);
      searchCourseApi.mockResolvedValue({ data: { results: [{ id: 2 }] } });
      courseApi.mockResolvedValueOnce({ ...mockCourse, id: 2, name: "Khóa Python" });
      classApi.mockResolvedValueOnce(mockClasses);

      renderComponent({ course: { id: 1 } });
      await waitFor(() => expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React"));

      await userEvent.click(screen.getByTestId("btn-search"));

      await waitFor(() => {
        expect(searchCourseApi).toHaveBeenCalled();
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa Python");
      });
    });

    it("alert khi không tìm thấy kết quả", async () => {
      searchCourseApi.mockResolvedValue({ data: { results: [] } });

      renderComponent({ course: { id: 1 } });
      await waitFor(() => expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React"));

      await userEvent.click(screen.getByTestId("btn-search"));

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith("Không tìm thấy khóa học nào phù hợp.");
      });
    });
  });

  // ─── handleSelectClass ────────────────────────────────────────────────────

  describe("handleSelectClass", () => {
    it("reset các state khi chọn lớp mới", async () => {
      renderComponent({ course: { id: 1 } });
      await waitFor(() => expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React"));

      await userEvent.click(screen.getByTestId("btn-select-class"));

      expect(screen.getByTestId("payment").textContent).toBe("");
      expect(screen.getByTestId("confirm").textContent).toBe("");
      expect(screen.getByTestId("bill").textContent).toBe("");
    });
  });

  // ─── backToCourse ─────────────────────────────────────────────────────────

  describe("backToCourse", () => {
    it("navigate về /course-list", async () => {
      renderComponent({ course: { id: 1 } });
      await waitFor(() => expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React"));

      await userEvent.click(screen.getByTestId("btn-back"));

      await waitFor(() => {
        expect(screen.getByText("Course List")).toBeInTheDocument();
      });
    });
  });

  // ─── VNPay callback (searchParams) ───────────────────────────────────────

  describe("VNPay callback qua searchParams", () => {
    it("xử lý callback thành công (responseCode=00) và show bill", async () => {
      myPaymentApi.mockResolvedValue([
        {
          id: "TXN123",
          enrollment: 42,
          classroom: "Lớp A",
          total_sessions: 20,
          amount: 500000,
        },
      ]);
      courseApi.mockResolvedValue(mockCourse);
      localStorage.setItem("pendingCourseId", "1");

      renderComponent(
        null,
        "?vnp_ResponseCode=00&vnp_TxnRef=TXN123&vnp_TransactionNo=TXN123&vnp_PayDate=20250115&vnp_Amount=50000000"
      );

      await waitFor(() => {
        expect(screen.getByTestId("bill").textContent).toBe("bill-open");
      });
    });

    it("xử lý callback thất bại (responseCode != 00) vẫn show bill", async () => {
      myPaymentApi.mockResolvedValue([]);
      courseApi.mockResolvedValue(mockCourse);

      renderComponent(
        null,
        "?vnp_ResponseCode=24&vnp_TxnRef=TXN999&vnp_TransactionNo=TXN999&vnp_PayDate=20250115&vnp_Amount=50000000"
      );

      await waitFor(() => {
        expect(screen.getByTestId("bill").textContent).toBe("bill-open");
        });
      });
    });
  });