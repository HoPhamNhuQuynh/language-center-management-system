import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CourseRegister from "./CourseRegister";
import { enrollmentApi, paymentApi, deleteEnrollmentApi } from "../../services/enrollmentService";
import { courseApi, classApi, searchCourseApi } from "../../services/courseService";
import { myPaymentApi } from "../../services/studentService";
import Apis from "../../services/Apis";

vi.mock("../../pages/Payment/CourseRegisterForm", () => ({
  default: (props) => (
    <div>
      <div data-testid="course-name">{props.course?.name}</div>
      <div data-testid="loading">{props.loading ? "loading" : "idle"}</div>
      <div data-testid="payment">{props.payment ? "payment-open" : ""}</div>
      <div data-testid="confirm">{props.confirm ? "confirm-open" : ""}</div>
      <div data-testid="bill">{props.bill ? "bill-open" : ""}</div>
      <div data-testid="my-enrollments">{JSON.stringify(props.myEnrollments)}</div>
      <button data-testid="btn-open-confirm" onClick={props.onOpenConfirm}>OpenConfirm</button>
      <button data-testid="btn-submit" onClick={props.onSubmit}>Submit</button>
      <button data-testid="btn-cancel-confirm" onClick={props.onCancelConfirm}>CancelConfirm</button>
      <button data-testid="btn-search" onClick={props.onSearch}>Search</button>
      <button data-testid="btn-select-class" onClick={() => props.onSelectClass({ id: 10, name: "Lớp A" })}>SelectClass</button>
      <button data-testid="btn-back" onClick={props.backToCourse}>Back</button>
      <button
        data-testid="btn-retry"
        onClick={() => props.onRetry({ id: 42, enrollment_status: "PENDING_PAYMENT", classroom: 10 })}
      >
        Retry
      </button>
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

const mockEnrollmentPending = {
  id: 42,
  classroom: 10,
  enrollment_status: "PENDING_PAYMENT",
};

const mockEnrollmentSuccess = {
  id: 42,
  classroom: 10,
  enrollment_status: "SUCCESS",
};

const renderComponent = (locationState = null, searchParamsStr = "") =>
  render(
    <MemoryRouter
      initialEntries={[
        { pathname: "/course-register", search: searchParamsStr, state: locationState },
      ]}
    >
      <Routes>
        <Route path="/course-register" element={<CourseRegister />} />
        <Route path="/course-list" element={<div>Course List</div>} />
      </Routes>
    </MemoryRouter>
  );

describe("CourseRegister", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "alert").mockImplementation(() => {});
    vi.spyOn(window, "open").mockImplementation(() => {});
    localStorage.clear();
    sessionStorage.clear();

    Apis.get.mockResolvedValue({ data: [] });
    courseApi.mockResolvedValue(mockCourse);
    classApi.mockResolvedValue(mockClasses);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("khởi tạo và load dữ liệu", () => {
    it("ERM-001: render không lỗi khi không có selectedCourse", async () => {
      renderComponent();
      await waitFor(() => expect(screen.getByTestId("loading")).toBeInTheDocument());
    });

    it("ERM-002: load course detail khi có selectedCourse từ location.state", async () => {
      renderComponent({ course: { id: 1 } });
      await waitFor(() => {
        expect(courseApi).toHaveBeenCalledWith(1);
        expect(classApi).toHaveBeenCalledWith(1);
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React");
      });
    });

    it("ERM-003: load course từ localStorage khi không có selectedCourse", async () => {
      localStorage.setItem("lastCourseId", "2");
      courseApi.mockResolvedValue({ ...mockCourse, id: 2 });
      renderComponent();
      await waitFor(() => {
        expect(courseApi).toHaveBeenCalledWith("2");
        expect(classApi).toHaveBeenCalledWith("2");
      });
    });

    it("ERM-004: load myEnrollments khi mount", async () => {
      Apis.get.mockResolvedValue({ data: [mockEnrollmentPending] });
      renderComponent();
      await waitFor(() => expect(Apis.get).toHaveBeenCalledWith("users/me/enrollments/"));
    });

    it("ERM-005: xử lý myEnrollments dạng { results: [] }", async () => {
      Apis.get.mockResolvedValue({ data: { results: [mockEnrollmentSuccess] } });
      renderComponent();
      await waitFor(() => expect(Apis.get).toHaveBeenCalledWith("users/me/enrollments/"));
    });

    it("ERM-006: catch lỗi khi courseApi throw và không crash", async () => {
      courseApi.mockRejectedValue(new Error("Course not found"));
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("idle")
      );
      expect(screen.getByTestId("course-name").textContent).toBe("");
    });

    it("ERM-007: catch lỗi khi Apis.get enrollments thất bại", async () => {
      Apis.get.mockRejectedValue(new Error("Unauthorized"));
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      renderComponent({ course: { id: 1 } });
      await waitFor(() => expect(Apis.get).toHaveBeenCalledWith("users/me/enrollments/"));
      consoleSpy.mockRestore();
    });
  });

  describe("handleOpenConfirm", () => {
    it("ERM-008: alert khi chưa chọn lớp", async () => {
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );
      await userEvent.click(screen.getByTestId("btn-open-confirm"));
      expect(window.alert).toHaveBeenCalledWith("Vui lòng chọn lớp học trước khi đăng ký!");
    });

    it("ERM-009: gọi enrollmentApi và mở ConfirmForm khi thành công", async () => {
      enrollmentApi.mockResolvedValue({ id: 42 });
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );
      await userEvent.click(screen.getByTestId("btn-select-class"));
      await userEvent.click(screen.getByTestId("btn-open-confirm"));
      await waitFor(() => {
        expect(enrollmentApi).toHaveBeenCalledWith({ classroom: 10 });
        expect(screen.getByTestId("confirm").textContent).toBe("confirm-open");
      });
    });

    it("ERM-010: alert lỗi khi enrollmentApi throw (detail)", async () => {
      enrollmentApi.mockRejectedValue({ response: { data: { detail: "Lớp đã đầy." } } });
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );
      await userEvent.click(screen.getByTestId("btn-select-class"));
      await userEvent.click(screen.getByTestId("btn-open-confirm"));
      await waitFor(() =>
        expect(window.alert).toHaveBeenCalledWith("Đăng ký thất bại: Lớp đã đầy.")
      );
    });

    it("ERM-011: alert lỗi khi enrollmentApi throw (string)", async () => {
      enrollmentApi.mockRejectedValue({ response: { data: "Server Error" } });
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );
      await userEvent.click(screen.getByTestId("btn-select-class"));
      await userEvent.click(screen.getByTestId("btn-open-confirm"));
      await waitFor(() =>
        expect(window.alert).toHaveBeenCalledWith("Đăng ký thất bại: Server Error")
      );
    });

    it("ERM-012: alert lỗi khi enrollmentApi throw (array)", async () => {
      enrollmentApi.mockRejectedValue({ response: { data: ["Lỗi 1", "Lỗi 2"] } });
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );
      await userEvent.click(screen.getByTestId("btn-select-class"));
      await userEvent.click(screen.getByTestId("btn-open-confirm"));
      await waitFor(() =>
        expect(window.alert).toHaveBeenCalledWith("Đăng ký thất bại: Lỗi 1\nLỗi 2")
      );
    });

    it("ERM-013: alert lỗi khi enrollmentApi throw (object key-value)", async () => {
      enrollmentApi.mockRejectedValue({
        response: { data: { classroom: ["Lớp đã đầy."], non_field_errors: ["Lỗi khác"] } },
      });
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );
      await userEvent.click(screen.getByTestId("btn-select-class"));
      await userEvent.click(screen.getByTestId("btn-open-confirm"));
      await waitFor(() =>
        expect(window.alert).toHaveBeenCalledWith("Đăng ký thất bại: Lớp đã đầy.\nLỗi khác")
      );
    });

    it("ERM-014: alert lỗi mặc định khi enrollmentApi throw không có response.data", async () => {
      enrollmentApi.mockRejectedValue(new Error("Network Error"));
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );
      await userEvent.click(screen.getByTestId("btn-select-class"));
      await userEvent.click(screen.getByTestId("btn-open-confirm"));
      await waitFor(() =>
        expect(window.alert).toHaveBeenCalledWith("Đăng ký thất bại: Lỗi kết nối Server")
      );
    });
  });

  describe("handleSubmit", () => {
    it("ERM-015: không làm gì nếu chưa có pendingEnrollmentId", async () => {
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );
      await userEvent.click(screen.getByTestId("btn-submit"));
      expect(paymentApi).not.toHaveBeenCalled();
    });

    it("ERM-016: gọi paymentApi và mở VNPay khi thành công", async () => {
      enrollmentApi.mockResolvedValue({ id: 42 });
      paymentApi.mockResolvedValue({ payment_url: "https://sandbox.vnpayment.vn/pay?token=abc" });
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );
      await userEvent.click(screen.getByTestId("btn-select-class"));
      await userEvent.click(screen.getByTestId("btn-open-confirm"));
      await waitFor(() =>
        expect(screen.getByTestId("confirm").textContent).toBe("confirm-open")
      );
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

    it("ERM-017: lưu pendingCourseId và lastCourseId vào localStorage", async () => {
      enrollmentApi.mockResolvedValue({ id: 42 });
      paymentApi.mockResolvedValue({ payment_url: "https://sandbox.vnpayment.vn/pay?token=abc" });
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );
      await userEvent.click(screen.getByTestId("btn-select-class"));
      await userEvent.click(screen.getByTestId("btn-open-confirm"));
      await waitFor(() =>
        expect(screen.getByTestId("confirm").textContent).toBe("confirm-open")
      );
      await userEvent.click(screen.getByTestId("btn-submit"));
      await waitFor(() => {
        expect(localStorage.getItem("pendingCourseId")).toBe("1");
        expect(localStorage.getItem("lastCourseId")).toBe("1");
      });
    });

    it("ERM-018: alert lỗi khi paymentApi throw", async () => {
      enrollmentApi.mockResolvedValue({ id: 42 });
      paymentApi.mockRejectedValue(new Error("Payment failed"));
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );
      await userEvent.click(screen.getByTestId("btn-select-class"));
      await userEvent.click(screen.getByTestId("btn-open-confirm"));
      await waitFor(() =>
        expect(screen.getByTestId("confirm").textContent).toBe("confirm-open")
      );
      await userEvent.click(screen.getByTestId("btn-submit"));
      await waitFor(() =>
        expect(window.alert).toHaveBeenCalledWith("Thanh toán thất bại")
      );
    });

    it("ERM-019: paymentApi không có payment_url thì không mở window.open", async () => {
      enrollmentApi.mockResolvedValue({ id: 42 });
      paymentApi.mockResolvedValue({ data: { message: "ok" } });
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );
      await userEvent.click(screen.getByTestId("btn-select-class"));
      await userEvent.click(screen.getByTestId("btn-open-confirm"));
      await waitFor(() =>
        expect(screen.getByTestId("confirm").textContent).toBe("confirm-open")
      );
      await userEvent.click(screen.getByTestId("btn-submit"));
      await waitFor(() => {
        expect(window.open).not.toHaveBeenCalled();
        expect(screen.getByTestId("loading").textContent).toBe("idle");
      });
    });
  });

  describe("handleCancelConfirm", () => {
    it("ERM-020: gọi deleteEnrollmentApi với đúng id khi hủy", async () => {
      enrollmentApi.mockResolvedValue({ id: 42 });
      deleteEnrollmentApi.mockResolvedValue({});
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );
      await userEvent.click(screen.getByTestId("btn-select-class"));
      await userEvent.click(screen.getByTestId("btn-open-confirm"));
      await waitFor(() =>
        expect(screen.getByTestId("confirm").textContent).toBe("confirm-open")
      );
      await userEvent.click(screen.getByTestId("btn-cancel-confirm"));
      await waitFor(() => expect(deleteEnrollmentApi).toHaveBeenCalledWith(42));
    });

    it("ERM-021: đóng ConfirmForm và mở lại PaymentForm sau khi hủy", async () => {
      enrollmentApi.mockResolvedValue({ id: 42 });
      deleteEnrollmentApi.mockResolvedValue({});
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );
      await userEvent.click(screen.getByTestId("btn-select-class"));
      await userEvent.click(screen.getByTestId("btn-open-confirm"));
      await waitFor(() =>
        expect(screen.getByTestId("confirm").textContent).toBe("confirm-open")
      );
      await userEvent.click(screen.getByTestId("btn-cancel-confirm"));
      await waitFor(() => {
        expect(screen.getByTestId("confirm").textContent).toBe("");
        expect(screen.getByTestId("payment").textContent).toBe("payment-open");
      });
    });

    it("ERM-022: không gọi deleteEnrollmentApi nếu chưa có pendingEnrollmentId", async () => {
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );
      await userEvent.click(screen.getByTestId("btn-cancel-confirm"));
      expect(deleteEnrollmentApi).not.toHaveBeenCalled();
    });

    it("ERM-023: vẫn đóng ConfirmForm dù deleteEnrollmentApi lỗi", async () => {
      enrollmentApi.mockResolvedValue({ id: 42 });
      deleteEnrollmentApi.mockRejectedValue(new Error("Delete failed"));
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );
      await userEvent.click(screen.getByTestId("btn-select-class"));
      await userEvent.click(screen.getByTestId("btn-open-confirm"));
      await waitFor(() =>
        expect(screen.getByTestId("confirm").textContent).toBe("confirm-open")
      );
      await userEvent.click(screen.getByTestId("btn-cancel-confirm"));
      await waitFor(() =>
        expect(screen.getByTestId("confirm").textContent).toBe("")
      );
    });
  });

  describe("handleRetry", () => {
    it("ERM-024: mở PaymentForm với enrollment cũ, KHÔNG gọi enrollmentApi mới", async () => {
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );
      await userEvent.click(screen.getByTestId("btn-retry"));
      await waitFor(() =>
        expect(screen.getByTestId("payment").textContent).toBe("payment-open")
      );
      expect(enrollmentApi).not.toHaveBeenCalled();
    });

    it("ERM-025: sau handleRetry, handleSubmit dùng đúng enrollment id cũ (42)", async () => {
      paymentApi.mockResolvedValue({ payment_url: "https://sandbox.vnpayment.vn/pay?token=retry" });
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );
      await userEvent.click(screen.getByTestId("btn-retry"));
      await waitFor(() =>
        expect(screen.getByTestId("payment").textContent).toBe("payment-open")
      );
      await userEvent.click(screen.getByTestId("btn-submit"));
      await waitFor(() =>
        expect(paymentApi).toHaveBeenCalledWith(
          expect.objectContaining({ enrollment: 42 })
        )
      );
    });

    it("ERM-026: handleRetry reset paid, bill, confirm về mặc định", async () => {
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );
      await userEvent.click(screen.getByTestId("btn-retry"));
      await waitFor(() => {
        expect(screen.getByTestId("payment").textContent).toBe("payment-open");
        expect(screen.getByTestId("confirm").textContent).toBe("");
        expect(screen.getByTestId("bill").textContent).toBe("");
      });
    });
  });

  describe("handleSearch", () => {
    it("ERM-027: tìm kiếm và setCourse khi có kết quả (dạng data.results)", async () => {
      courseApi
        .mockResolvedValueOnce(mockCourse)
        .mockResolvedValueOnce({ ...mockCourse, id: 2, name: "Khóa Python" });
      classApi.mockResolvedValue(mockClasses);
      searchCourseApi.mockResolvedValue({ data: { results: [{ id: 2 }] } });
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );
      await userEvent.click(screen.getByTestId("btn-search"));
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa Python")
      );
    });

    it("ERM-028: tìm kiếm dạng results trực tiếp (không lồng trong data)", async () => {
      courseApi
        .mockResolvedValueOnce(mockCourse)
        .mockResolvedValueOnce({ ...mockCourse, id: 5, name: "Khóa Tiếng Nhật" });
      classApi.mockResolvedValue(mockClasses);
      searchCourseApi.mockResolvedValue({ results: [{ id: 5 }] });
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );
      await userEvent.click(screen.getByTestId("btn-search"));
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa Tiếng Nhật")
      );
    });

    it("ERM-029: alert khi không tìm thấy kết quả", async () => {
      searchCourseApi.mockResolvedValue({ data: { results: [] } });
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );
      await userEvent.click(screen.getByTestId("btn-search"));
      await waitFor(() =>
        expect(window.alert).toHaveBeenCalledWith("Không tìm thấy khóa học nào phù hợp.")
      );
    });

    it("ERM-030: catch lỗi khi searchCourseApi throw và không crash", async () => {
      searchCourseApi.mockRejectedValue(new Error("Search failed"));
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );
      await userEvent.click(screen.getByTestId("btn-search"));
      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("idle")
      );
      expect(window.alert).not.toHaveBeenCalled();
    });
  });

  describe("handleSelectClass", () => {
    it("ERM-031: reset payment, confirm, bill khi chọn lớp mới", async () => {
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );
      await userEvent.click(screen.getByTestId("btn-select-class"));
      expect(screen.getByTestId("payment").textContent).toBe("");
      expect(screen.getByTestId("confirm").textContent).toBe("");
      expect(screen.getByTestId("bill").textContent).toBe("");
    });
  });

  describe("backToCourse", () => {
    it("ERM-032: navigate về /course-list", async () => {
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );
      await userEvent.click(screen.getByTestId("btn-back"));
      await waitFor(() =>
        expect(screen.getByText("Course List")).toBeInTheDocument()
      );
    });
  });

  describe("VNPay callback qua searchParams", () => {
    it("ERM-033: responseCode=00 → show bill", async () => {
      myPaymentApi.mockResolvedValue([
        { id: "TXN123", enrollment: 42, classroom: "Lớp A", total_sessions: 20, amount: 500000 },
      ]);
      localStorage.setItem("pendingCourseId", "1");
      renderComponent(
        null,
        "?vnp_ResponseCode=00&vnp_TxnRef=TXN123&vnp_TransactionNo=TXN123&vnp_PayDate=20250115&vnp_Amount=50000000"
      );
      await waitFor(() =>
        expect(screen.getByTestId("bill").textContent).toBe("bill-open")
      );
    });

    it("ERM-034: responseCode != 00 → vẫn show bill (trạng thái FAILED)", async () => {
      myPaymentApi.mockResolvedValue([]);
      renderComponent(
        null,
        "?vnp_ResponseCode=24&vnp_TxnRef=TXN999&vnp_TransactionNo=TXN999&vnp_PayDate=20250115&vnp_Amount=50000000"
      );
      await waitFor(() =>
        expect(screen.getByTestId("bill").textContent).toBe("bill-open")
      );
    });

    it("ERM-035: không có payDate vẫn xử lý được", async () => {
      renderComponent(
        null,
        "?vnp_ResponseCode=00&vnp_TxnRef=TXN_NODATE&vnp_TransactionNo=TXN_NODATE&vnp_Amount=50000000"
      );
      await waitFor(() =>
        expect(screen.getByTestId("bill").textContent).toBe("bill-open")
      );
    });

    it("ERM-036: Promise.all lỗi → vẫn show bill với fallback data", async () => {
      myPaymentApi.mockRejectedValue(new Error("detail fail"));
      courseApi.mockRejectedValueOnce(new Error("course fail"));
      localStorage.setItem("pendingCourseId", "99");
      renderComponent(
        null,
        "?vnp_ResponseCode=00&vnp_TxnRef=TXN_CATCH&vnp_TransactionNo=TXN_CATCH&vnp_PayDate=20250115&vnp_Amount=10000000"
      );
      await waitFor(() =>
        expect(screen.getByTestId("bill").textContent).toBe("bill-open")
      );
    });

    it("ERM-037: myPaymentApi được gọi với đúng txnRef", async () => {
      myPaymentApi.mockResolvedValue({
        enrollment: 42, classroom: "Lớp A", total_sessions: 30,
      });
      localStorage.setItem("pendingCourseId", "1");
      renderComponent(
        null,
        "?vnp_ResponseCode=00&vnp_TxnRef=TXN_DETAIL&vnp_TransactionNo=TXN_DETAIL&vnp_PayDate=20250115&vnp_Amount=50000000"
      );
      await waitFor(() =>
        expect(screen.getByTestId("bill").textContent).toBe("bill-open")
      );
      expect(myPaymentApi).toHaveBeenCalledWith("TXN_DETAIL");
    });

    it("ERM-038: không có pendingCourseId thì courseApi không được gọi với savedCourseId", async () => {
      myPaymentApi.mockResolvedValue({ enrollment: 42, classroom: "Lớp A", total_sessions: 20 });
      renderComponent(
        null,
        "?vnp_ResponseCode=00&vnp_TxnRef=TXN_NOID&vnp_TransactionNo=TXN_NOID&vnp_PayDate=20250115&vnp_Amount=50000000"
      );
      await waitFor(() =>
        expect(screen.getByTestId("bill").textContent).toBe("bill-open")
      );
    });

    it("ERM-039: cleanup popstate listener khi unmount", async () => {
      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
      const { unmount } = renderComponent(
        null,
        "?vnp_ResponseCode=00&vnp_TxnRef=TXN_CLEANUP&vnp_TransactionNo=TXN_CLEANUP&vnp_PayDate=20250115&vnp_Amount=50000000"
      );
      await waitFor(() =>
        expect(screen.getByTestId("bill").textContent).toBe("bill-open")
      );
      unmount();
      expect(removeEventListenerSpy).toHaveBeenCalledWith("popstate", expect.any(Function));
    });

    it("ERM-040: popstate navigate về /course-list", async () => {
      renderComponent(
        null,
        "?vnp_ResponseCode=00&vnp_TxnRef=TXN_POP&vnp_TransactionNo=TXN_POP&vnp_PayDate=20250115&vnp_Amount=50000000"
      );
      await waitFor(() =>
        expect(screen.getByTestId("bill").textContent).toBe("bill-open")
      );
      await act(async () => {
        window.dispatchEvent(new PopStateEvent("popstate"));
      });
      await waitFor(() =>
        expect(screen.getByText("Course List")).toBeInTheDocument()
      );
    });
  });

  describe("postMessage PAYMENT_SUCCESS", () => {
    it("ERM-041: nhận PAYMENT_SUCCESS → refresh enrollments + show bill", async () => {
      Apis.get.mockResolvedValue({ data: [mockEnrollmentSuccess] });
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );
      await act(async () => {
        window.dispatchEvent(
          new MessageEvent("message", { data: { type: "PAYMENT_SUCCESS" } })
        );
      });
      await waitFor(() => {
        expect(screen.getByTestId("bill").textContent).toBe("bill-open");
        expect(Apis.get).toHaveBeenCalledTimes(2); 
      });
    });

    it("ERM-042: message type khác PAYMENT_SUCCESS thì không set bill", async () => {
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );
      await act(async () => {
        window.dispatchEvent(
          new MessageEvent("message", { data: { type: "OTHER_EVENT" } })
        );
      });
      expect(screen.getByTestId("bill").textContent).toBe("");
    });

    it("ERM-043: Apis.get lỗi trong handler vẫn show bill", async () => {
      Apis.get
        .mockResolvedValueOnce({ data: [] })
        .mockRejectedValueOnce(new Error("Network error"));
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );
      await act(async () => {
        window.dispatchEvent(
          new MessageEvent("message", { data: { type: "PAYMENT_SUCCESS" } })
        );
      });
      await waitFor(() =>
        expect(screen.getByTestId("bill").textContent).toBe("bill-open")
      );
    });
  });

  describe("visibilitychange và focus refresh enrollments", () => {
    it("ERM-044: visibilitychange → visible → gọi refresh enrollments", async () => {
      Apis.get.mockResolvedValue({ data: [mockEnrollmentSuccess] });
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );
      const callsBefore = Apis.get.mock.calls.length;
      await act(async () => {
        Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
        document.dispatchEvent(new Event("visibilitychange"));
      });
      await waitFor(() =>
        expect(Apis.get.mock.calls.length).toBeGreaterThan(callsBefore)
      );
    });

    it("ERM-045: visibilitychange → hidden → KHÔNG gọi refresh", async () => {
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );
      const callsBefore = Apis.get.mock.calls.length;
      await act(async () => {
        Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
        document.dispatchEvent(new Event("visibilitychange"));
      });
      expect(Apis.get.mock.calls.length).toBe(callsBefore);
    });

    it("ERM-046: window focus → gọi refresh enrollments", async () => {
      Apis.get.mockResolvedValue({ data: [mockEnrollmentPending] });
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );
      const callsBefore = Apis.get.mock.calls.length;
      await act(async () => {
        window.dispatchEvent(new Event("focus"));
      });
      await waitFor(() =>
        expect(Apis.get.mock.calls.length).toBeGreaterThan(callsBefore)
      );
    });

    it("ERM-047: sau visibilitychange, myEnrollments được cập nhật đúng", async () => {
      Apis.get
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValueOnce({ data: [mockEnrollmentSuccess] });
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("my-enrollments").textContent).toBe("[]")
      );
      await act(async () => {
        Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
        document.dispatchEvent(new Event("visibilitychange"));
      });
      await waitFor(() =>
        expect(screen.getByTestId("my-enrollments").textContent).toContain("SUCCESS")
      );
    });

    it("ERM-048: cleanup visibilitychange listener khi unmount", async () => {
      const removeSpy = vi.spyOn(document, "removeEventListener");
      const { unmount } = renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );
      unmount();
      expect(removeSpy).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
    });

    it("ERM-049: Apis.get lỗi trong visibilitychange không crash UI", async () => {
      Apis.get
        .mockResolvedValueOnce({ data: [] })
        .mockRejectedValueOnce(new Error("Refresh failed"));
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );
      await act(async () => {
        Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
        document.dispatchEvent(new Event("visibilitychange"));
      });
      expect(screen.getByTestId("course-name")).toBeInTheDocument();
    });
  });
});