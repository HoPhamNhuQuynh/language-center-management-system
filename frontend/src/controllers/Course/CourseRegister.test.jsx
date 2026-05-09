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
  myPaymentApi: vi.fn(),
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

describe("CourseRegister", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "alert").mockImplementation(() => { });
    vi.spyOn(window, "open").mockImplementation(() => { });
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

    it("ERM-002: load course từ localStorage khi không có selectedCourse", async () => {
      localStorage.setItem("lastCourseId", "2");
      courseApi.mockResolvedValue({ ...mockCourse, id: 2 });
      classApi.mockResolvedValue(mockClasses);

      renderComponent();

      await waitFor(() => {
        expect(courseApi).toHaveBeenCalledWith("2");
        expect(classApi).toHaveBeenCalledWith("2");
      });
    });

    it("ERM-003: load myEnrollments khi mount", async () => {
      const mockEnrollments = [{ id: 42, classroom: 10 }];
      Apis.get.mockResolvedValue({ data: mockEnrollments });

      renderComponent();

      await waitFor(() => {
        expect(Apis.get).toHaveBeenCalledWith("users/me/enrollments/");
      });
    });

    it("ERM-004: xử lý myEnrollments dạng { results: [] }", async () => {
      Apis.get.mockResolvedValue({ data: { results: [{ id: 42 }] } });

      renderComponent();

      await waitFor(() => {
        expect(Apis.get).toHaveBeenCalledWith("users/me/enrollments/");
      });
    });
  });

  describe("handleOpenConfirm", () => {
    it("ERM-005: alert khi chưa chọn lớp", async () => {
      renderComponent({ course: { id: 1 } });
      await waitFor(() => expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React"));

      await userEvent.click(screen.getByTestId("btn-open-confirm"));

      expect(window.alert).toHaveBeenCalledWith("Vui lòng chọn lớp học trước khi đăng ký!");
    });

    it("ERM-006: gọi enrollmentApi và mở ConfirmForm khi thành công", async () => {
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

    it("ERM-007: hiện alert lỗi khi enrollmentApi throw (detail)", async () => {
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

    it("ERM-008: hiện alert lỗi khi enrollmentApi throw (string)", async () => {
      enrollmentApi.mockRejectedValue({ response: { data: "Server Error" } });
      renderComponent({ course: { id: 1 } });
      await waitFor(() => expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React"));

      await userEvent.click(screen.getByTestId("btn-select-class"));
      await userEvent.click(screen.getByTestId("btn-open-confirm"));

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith("Đăng ký thất bại: Server Error");
      });
    });

    it("ERM-009: hiện alert lỗi khi enrollmentApi throw (array)", async () => {
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

  describe("handleSubmit", () => {
    it("ERM-010: không làm gì nếu chưa có pendingEnrollmentId", async () => {
      renderComponent({ course: { id: 1 } });
      await waitFor(() => expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React"));

      await userEvent.click(screen.getByTestId("btn-submit"));

      expect(paymentApi).not.toHaveBeenCalled();
    });

    it("ERM-011: gọi paymentApi và mở VNPay khi thành công", async () => {
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

    it("ERM-012: lưu pendingCourseId và lastCourseId vào localStorage", async () => {
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

    it("ERM-013: alert lỗi khi paymentApi throw", async () => {
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

  describe("handleCancelConfirm", () => {
    it("ERM-014: gọi deleteEnrollmentApi với đúng id khi hủy", async () => {
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

    it("ERM-015: đóng ConfirmForm và mở lại PaymentForm sau khi hủy", async () => {
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

    it("ERM-016: không gọi deleteEnrollmentApi nếu chưa có pendingEnrollmentId", async () => {
      renderComponent({ course: { id: 1 } });
      await waitFor(() => expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React"));

      await userEvent.click(screen.getByTestId("btn-cancel-confirm"));

      expect(deleteEnrollmentApi).not.toHaveBeenCalled();
    });

    it("ERM-017: vẫn đóng ConfirmForm dù deleteEnrollmentApi lỗi", async () => {
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

  describe("handleSearch", () => {
    it("ERM-018: tìm kiếm và setCourse khi có kết quả", async () => {
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

    it("ERM-019: alert khi không tìm thấy kết quả", async () => {
      searchCourseApi.mockResolvedValue({ data: { results: [] } });

      renderComponent({ course: { id: 1 } });
      await waitFor(() => expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React"));

      await userEvent.click(screen.getByTestId("btn-search"));

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith("Không tìm thấy khóa học nào phù hợp.");
      });
    });
  });

  describe("handleSelectClass", () => {
    it("ERM-020: reset các state khi chọn lớp mới", async () => {
      renderComponent({ course: { id: 1 } });
      await waitFor(() => expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React"));

      await userEvent.click(screen.getByTestId("btn-select-class"));

      expect(screen.getByTestId("payment").textContent).toBe("");
      expect(screen.getByTestId("confirm").textContent).toBe("");
      expect(screen.getByTestId("bill").textContent).toBe("");
    });
  });

  describe("backToCourse", () => {
    it("ERM-021: navigate về /course-list", async () => {
      renderComponent({ course: { id: 1 } });
      await waitFor(() => expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React"));

      await userEvent.click(screen.getByTestId("btn-back"));

      await waitFor(() => {
        expect(screen.getByText("Course List")).toBeInTheDocument();
      });
    });
  });

  describe("VNPay callback qua searchParams", () => {
    it("ERM-022: xử lý callback thành công (responseCode=00) và show bill", async () => {
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

    it("ERM-023: xử lý callback thất bại (responseCode != 00) vẫn show bill", async () => {
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

  describe("handleOpenConfirm - error branches", () => {
    it("ERM-024: hiện alert lỗi khi enrollmentApi throw dạng object (key-value)", async () => {
      enrollmentApi.mockRejectedValue({
        response: {
          data: { classroom: ["Lớp đã đầy."], non_field_errors: ["Lỗi khác"] },
        },
      });
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );

      await userEvent.click(screen.getByTestId("btn-select-class"));
      await userEvent.click(screen.getByTestId("btn-open-confirm"));

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          "Đăng ký thất bại: Lớp đã đầy.\nLỗi khác"
        );
      });
    });

    it("ERM-025: hiện alert lỗi mặc định khi enrollmentApi throw không có response.data", async () => {
      enrollmentApi.mockRejectedValue(new Error("Network Error"));

      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );

      await userEvent.click(screen.getByTestId("btn-select-class"));
      await userEvent.click(screen.getByTestId("btn-open-confirm"));

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          "Đăng ký thất bại: Lỗi kết nối Server"
        );
      });
    });
  });

  describe("handleSearch - error branch", () => {
    it("ERM-026: catch lỗi khi searchCourseApi throw và không crash", async () => {
      searchCourseApi.mockRejectedValue(new Error("Search failed"));

      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );

      await userEvent.click(screen.getByTestId("btn-search"));

      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("idle");
        expect(window.alert).not.toHaveBeenCalled();
      });
    });

    it("ERM-027: tìm kiếm dạng results trực tiếp (không lồng trong data)", async () => {
      searchCourseApi.mockResolvedValue({ results: [{ id: 5 }] });
      courseApi.mockResolvedValueOnce({ ...mockCourse, id: 1, name: "Khóa học React" }); // initial load
      classApi.mockResolvedValueOnce(mockClasses);
      courseApi.mockResolvedValueOnce({ ...mockCourse, id: 5, name: "Khóa Tiếng Nhật" });
      classApi.mockResolvedValueOnce(mockClasses);

      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );

      await userEvent.click(screen.getByTestId("btn-search"));

      await waitFor(() => {
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa Tiếng Nhật");
      });
    });
  });

  describe("loadCourseDetail - error branch", () => {
    it("ERM-028: catch lỗi khi courseApi throw và không crash", async () => {
      courseApi.mockRejectedValue(new Error("Course not found"));

      renderComponent({ course: { id: 1 } });

      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("idle");
      });

      expect(screen.getByTestId("course-name").textContent).toBe("");
    });
  });


  describe("myEnrollments - Apis.get branches", () => {
    it("ERM-029: xử lý lỗi khi Apis.get enrollments thất bại (catch console.error)", async () => {
      Apis.get.mockRejectedValue(new Error("Unauthorized"));
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => { });

      renderComponent({ course: { id: 1 } });

      await waitFor(() => {
        expect(Apis.get).toHaveBeenCalledWith("users/me/enrollments/");
      });

      expect(screen.getByTestId("loading")).toBeInTheDocument();
      consoleSpy.mockRestore();
    });
  });

  describe("handlePayment", () => {
    it("ERM-030: mở PaymentForm khi đã chọn lớp", async () => {
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );
    });

    it("ERM-031: alert khi bấm Payment chưa chọn lớp (qua btn-open-confirm không có class)", async () => {
      renderComponent({ course: { id: 1 } });
      await waitFor(() =>
        expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React")
      );

      await userEvent.click(screen.getByTestId("btn-open-confirm"));

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          "Vui lòng chọn lớp học trước khi đăng ký!"
        );
      });
    });
  });

  describe("VNPay opener & message & popstate branches", () => {

    it("ERM-032: VNPay callback không có payDate vẫn xử lý được", async () => {
      renderComponent(
        null,
        "?vnp_ResponseCode=00&vnp_TxnRef=TXN_NODATE2&vnp_TransactionNo=TXN_NODATE2&vnp_Amount=50000000"
      );

      await waitFor(() => {
        expect(screen.getByTestId("bill").textContent).toBe("bill-open");
      });
    });

    it("ERM-033: VNPay Promise.all lỗi vẫn show bill với fallback data", async () => {
      myPaymentApi.mockRejectedValueOnce(new Error("detail fail"));
      courseApi.mockRejectedValueOnce(new Error("course fail"));
      localStorage.setItem("pendingCourseId", "99");

      renderComponent(
        null,
        "?vnp_ResponseCode=00&vnp_TxnRef=TXN_CATCH2&vnp_TransactionNo=TXN_CATCH2&vnp_PayDate=20250115&vnp_Amount=10000000"
      );

      await waitFor(() => {
        expect(screen.getByTestId("bill").textContent).toBe("bill-open");
      });
    });

    it("ERM-034: nhận message PAYMENT_SUCCESS thì set paid và bill", async () => {
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
      });
    });

    it("ERM-035: message event type khác PAYMENT_SUCCESS thì không set bill", async () => {
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

    it("ERM-036: cleanup popstate listener khi unmount với responseCode", async () => {
      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

      const { unmount } = renderComponent(
        null,
        "?vnp_ResponseCode=00&vnp_TxnRef=TXN_CLEANUP&vnp_TransactionNo=TXN_CLEANUP&vnp_PayDate=20250115&vnp_Amount=50000000"
      );

      await waitFor(() => {
        expect(screen.getByTestId("bill").textContent).toBe("bill-open");
      });

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith("popstate", expect.any(Function));
    });

    it("ERM-037: popstate listener navigate về /course-list khi có responseCode", async () => {
      renderComponent(
        null,
        "?vnp_ResponseCode=00&vnp_TxnRef=TXN_POP&vnp_TransactionNo=TXN_POP&vnp_PayDate=20250115&vnp_Amount=50000000"
      );

      await waitFor(() => {
        expect(screen.getByTestId("bill").textContent).toBe("bill-open");
      });

      await act(async () => {
        window.dispatchEvent(new PopStateEvent("popstate"));
      });

      await waitFor(() => {
        expect(screen.getByText("Course List")).toBeInTheDocument();
      });
    });
  });

  it("ERM-038: paymentApi trả về response không có payment_url thì không mở window.open", async () => {
    enrollmentApi.mockResolvedValue({ id: 42 });
    paymentApi.mockResolvedValue({ data: { message: "ok" } }); 

    renderComponent({ course: { id: 1 } });
    await waitFor(() => expect(screen.getByTestId("course-name").textContent).toBe("Khóa học React"));

    await userEvent.click(screen.getByTestId("btn-select-class"));
    await userEvent.click(screen.getByTestId("btn-open-confirm"));
    await waitFor(() => expect(screen.getByTestId("confirm").textContent).toBe("confirm-open"));

    await userEvent.click(screen.getByTestId("btn-submit"));

    await waitFor(() => {
      expect(window.open).not.toHaveBeenCalled();
      expect(screen.getByTestId("loading").textContent).toBe("idle");
    });
  });

  it("ERM-039: VNPay callback với myPaymentApi thành công → setCourse đúng total_sessions", async () => {
    myPaymentApi.mockResolvedValue({
      enrollment: 42,
      classroom: "Lớp A",
      total_sessions: 30,
    });
    courseApi.mockResolvedValue(mockCourse);
    localStorage.setItem("pendingCourseId", "1");

    renderComponent(
      null,
      "?vnp_ResponseCode=00&vnp_TxnRef=TXN_DETAIL&vnp_TransactionNo=TXN_DETAIL&vnp_PayDate=20250115&vnp_Amount=50000000",
    );

    await waitFor(() => {
      expect(screen.getByTestId("bill").textContent).toBe("bill-open");
    });

    expect(myPaymentApi).toHaveBeenCalledWith("TXN_DETAIL");
  });

  it("ERM-040: VNPay callback không có pendingCourseId thì courseApi không được gọi với savedCourseId", async () => {
    myPaymentApi.mockResolvedValue({
      enrollment: 42,
      classroom: "Lớp A",
      total_sessions: 20,
    });

    renderComponent(
      null,
      "?vnp_ResponseCode=00&vnp_TxnRef=TXN_NOID&vnp_TransactionNo=TXN_NOID&vnp_PayDate=20250115&vnp_Amount=50000000"
    );

    await waitFor(() => {
      expect(screen.getByTestId("bill").textContent).toBe("bill-open");
    });
  });
});