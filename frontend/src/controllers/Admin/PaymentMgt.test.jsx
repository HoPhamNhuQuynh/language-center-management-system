import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";

vi.mock("../../services/manageService", () => ({
  getPayments: vi.fn(),
}));

vi.mock("../../utils/format", () => ({
  formatDate: vi.fn((d) => d ?? "—"),
}));

vi.mock("react-icons/fa", () => ({
  FaSearch: () => <span>SearchIcon</span>,
  FaPen: () => <span>Edit</span>,
}));

vi.mock("react-icons/im", () => ({
  ImBin2: () => <span>Delete</span>,
}));

import { getPayments } from "../../services/manageService";
import PaymentManagement from "./PaymentManagement";

const mockPayments = [
  {
    id: 1,
    student_name: "Nguyen Van A",
    student_email: "a@test.com",
    amount: "1000000",
    payment_method: "VNPAY",
    classroom: "IELTS_01",
    payment_status: "success",
    transaction_id: "TXN001",
    paid_at: "2024-01-15",
    created_at: "2024-01-10",
  },
  {
    id: 2,
    student_name: "Tran Thi B",
    student_email: "b@test.com",
    amount: "2000000",
    payment_method: "MOMO",
    classroom: "TOEIC_01",
    payment_status: "pending",
    transaction_id: "TXN002",
    paid_at: null,
    created_at: "2024-01-11",
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  getPayments.mockResolvedValue({
    results: mockPayments,
    count: mockPayments.length,
  });
});

describe("PaymentManagement", () => {
  describe("1. Load dữ liệu", () => {
    it("gọi getPayments khi mount với tham số mặc định", async () => {
      render(<PaymentManagement />);

      await waitFor(() => {
        expect(getPayments).toHaveBeenCalledWith(1, "", "");
      });
    });

    it("hiển thị danh sách payment sau khi load", async () => {
      render(<PaymentManagement />);

      await waitFor(() => {
        expect(screen.getByText("Nguyen Van A")).toBeInTheDocument();
        expect(screen.getByText("Tran Thi B")).toBeInTheDocument();
      });
    });

    it("hiển thị đúng các trường dữ liệu", async () => {
      render(<PaymentManagement />);

      await waitFor(() => {
        expect(screen.getByText("a@test.com")).toBeInTheDocument();
        expect(screen.getByText("1000000")).toBeInTheDocument();
        expect(screen.getByText("VNPAY")).toBeInTheDocument();
        expect(screen.getByText("IELTS_01")).toBeInTheDocument();
        expect(screen.getByText("success")).toBeInTheDocument();
        expect(screen.getByText("TXN001")).toBeInTheDocument();
      });
    });

    it("hiển thị — khi paid_at là null", async () => {
      render(<PaymentManagement />);

      await waitFor(() => {
        expect(screen.getByText("—")).toBeInTheDocument();
      });
    });

    it("không crash khi getPayments thất bại", async () => {
      getPayments.mockRejectedValue(new Error("Network error"));
      render(<PaymentManagement />);

      await waitFor(() => {
        expect(
          screen.getByText("Quản lý doanh thu trung tâm"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("2. Tìm kiếm (debounce)", () => {
    it("gọi getPayments với keyword sau 500ms debounce", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      render(<PaymentManagement />);

      await waitFor(() => expect(getPayments).toHaveBeenCalledWith(1, "", ""));

      fireEvent.change(
        screen.getByPlaceholderText("Tìm theo mã giao dịch..."),
        {
          target: { value: "TXN001" },
        },
      );

      // Chưa gọi ngay
      expect(getPayments).not.toHaveBeenCalledWith(1, "TXN001", "");

      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(getPayments).toHaveBeenCalledWith(1, "TXN001", "");
      });

      vi.useRealTimers();
    });

    it("reset về trang 1 khi nhập keyword", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      getPayments.mockResolvedValue({ results: mockPayments, count: 40 });
      render(<PaymentManagement />);

      await waitFor(() => screen.getByText("Nguyen Van A"));

      // Vào trang 2
      fireEvent.click(screen.getByRole("button", { name: "2" }));
      await waitFor(() => expect(getPayments).toHaveBeenCalledWith(2, "", ""));

      // Nhập keyword → reset về trang 1
      fireEvent.change(
        screen.getByPlaceholderText("Tìm theo mã giao dịch..."),
        {
          target: { value: "TXN" },
        },
      );

      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(getPayments).toHaveBeenCalledWith(1, "TXN", "");
      });

      vi.useRealTimers();
    });

    it("không gọi API ngay khi đang gõ (trong 500ms)", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      render(<PaymentManagement />);
      await waitFor(() => expect(getPayments).toHaveBeenCalledTimes(1));

      fireEvent.change(
        screen.getByPlaceholderText("Tìm theo mã giao dịch..."),
        {
          target: { value: "T" },
        },
      );
      fireEvent.change(
        screen.getByPlaceholderText("Tìm theo mã giao dịch..."),
        {
          target: { value: "TX" },
        },
      );
      fireEvent.change(
        screen.getByPlaceholderText("Tìm theo mã giao dịch..."),
        {
          target: { value: "TXN" },
        },
      );

      await act(async () => {
        vi.advanceTimersByTime(499);
      });

      // Vẫn chỉ 1 lần từ lúc mount
      expect(getPayments).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });
  });

  describe("3. Filter trạng thái", () => {
    it("gọi getPayments với status khi chọn filter", async () => {
      render(<PaymentManagement />);
      await waitFor(() => screen.getByText("Nguyen Van A"));

      fireEvent.change(screen.getByDisplayValue("Tất cả trạng thái"), {
        target: { value: "success" },
      });

      await waitFor(() => {
        expect(getPayments).toHaveBeenCalledWith(1, "", "success");
      });
    });

    it("reset về trang 1 khi đổi filter status", async () => {
      getPayments.mockResolvedValue({ results: mockPayments, count: 40 });
      render(<PaymentManagement />);
      await waitFor(() => screen.getByText("Nguyen Van A"));

      fireEvent.click(screen.getByRole("button", { name: "2" }));
      await waitFor(() => expect(getPayments).toHaveBeenCalledWith(2, "", ""));

      fireEvent.change(screen.getByDisplayValue("Tất cả trạng thái"), {
        target: { value: "pending" },
      });

      await waitFor(() => {
        expect(getPayments).toHaveBeenCalledWith(1, "", "pending");
      });
    });

    it("gọi getPayments không có status khi chọn Tất cả", async () => {
      render(<PaymentManagement />);
      await waitFor(() => screen.getByText("Nguyen Van A"));

      const statusSelect = screen.getByRole("combobox");

      fireEvent.change(statusSelect, {
        target: { value: "success" },
      });

      fireEvent.change(statusSelect, {
        target: { value: "" },
      });

      await waitFor(() => {
        expect(getPayments).toHaveBeenCalledWith(1, "", "");
      });
    });
  });

  describe("4. Phân trang", () => {
    it("nút prev disabled ở trang 1", async () => {
      render(<PaymentManagement />);
      await waitFor(() => screen.getByText("Nguyen Van A"));

      expect(screen.getByText("«")).toBeDisabled();
    });

    it("nút next disabled khi chỉ có 1 trang", async () => {
      render(<PaymentManagement />);
      await waitFor(() => screen.getByText("Nguyen Van A"));

      expect(screen.getByText("»")).toBeDisabled();
    });

    it("click trang 2 gọi getPayments(2)", async () => {
      getPayments.mockResolvedValue({ results: mockPayments, count: 40 });
      render(<PaymentManagement />);
      await waitFor(() => screen.getByText("Nguyen Van A"));

      fireEvent.click(screen.getByRole("button", { name: "2" }));

      await waitFor(() => {
        expect(getPayments).toHaveBeenCalledWith(2, "", "");
      });
    });

    it("click prev về trang trước", async () => {
      getPayments.mockResolvedValue({ results: mockPayments, count: 40 });
      render(<PaymentManagement />);
      await waitFor(() => screen.getByText("Nguyen Van A"));

      fireEvent.click(screen.getByRole("button", { name: "2" }));
      await waitFor(() => expect(getPayments).toHaveBeenCalledWith(2, "", ""));

      fireEvent.click(screen.getByText("«"));
      await waitFor(() => {
        expect(getPayments).toHaveBeenCalledWith(1, "", "");
      });
    });
  });

  describe("5. Kết hợp filter và search", () => {
    it("gọi getPayments với cả keyword và status", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      render(<PaymentManagement />);
      await waitFor(() => screen.getByText("Nguyen Van A"));

      fireEvent.change(screen.getByDisplayValue("Tất cả trạng thái"), {
        target: { value: "success" },
      });

      fireEvent.change(
        screen.getByPlaceholderText("Tìm theo mã giao dịch..."),
        {
          target: { value: "TXN001" },
        },
      );

      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(getPayments).toHaveBeenCalledWith(1, "TXN001", "success");
      });

      vi.useRealTimers();
    });
  });

  describe("6. Dữ liệu rỗng", () => {
    it("không hiển thị row khi payments rỗng", async () => {
      getPayments.mockResolvedValue({
        results: [],
        count: 0,
      });

      render(<PaymentManagement />);

      await waitFor(() => {
        expect(screen.queryByText("Nguyen Van A")).not.toBeInTheDocument();
      });
    });

    it("không hiển thị nút trang 2 khi chỉ có 1 trang", async () => {
      render(<PaymentManagement />);

      await waitFor(() => {
        expect(
          screen.queryByRole("button", { name: "2" }),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("7. Pagination nhiều trang", () => {
    it("hiển thị dấu ... khi có nhiều trang", async () => {
      getPayments.mockResolvedValue({
        results: mockPayments,
        count: 200,
      });

      render(<PaymentManagement />);

      await waitFor(() => {
        expect(screen.getByText("...")).toBeInTheDocument();
      });
    });

    it("next chuyển sang trang kế tiếp", async () => {
      getPayments.mockResolvedValue({
        results: mockPayments,
        count: 40,
      });

      render(<PaymentManagement />);

      await waitFor(() => expect(getPayments).toHaveBeenCalledWith(1, "", ""));

      fireEvent.click(screen.getByText("»"));

      await waitFor(() => {
        expect(getPayments).toHaveBeenCalledWith(2, "", "");
      });
    });
  });
});
