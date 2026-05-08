import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import PaymentHistory from "./PaymentHistory";
import { myPaymentApi } from "../../services/studentService";

vi.mock("../../pages/Payment/PaymentHistoryForm", () => ({
  default: (props) => (
    <div>
      <div data-testid="total-paid">{props.totalPaid}</div>
      <div data-testid="payments-count">{props.payments?.length}</div>
      <button data-testid="btn-filter-success" onClick={() => props.setStatusFilter("SUCCESS")}>Filter</button>
      <button data-testid="btn-filter-clear" onClick={() => props.setStatusFilter("")}>Clear</button>
    </div>
  ),
}));

vi.mock("../../styles/PaymentHistory.css", () => ({}));

vi.mock("../../services/studentService", () => ({
  myPaymentApi: vi.fn(),
}));

const mockPayments = [
  { id: 1, paid_at: "2024-01-15T00:00:00Z", amount: "500000", classroom: "Lớp A", payment_status: "SUCCESS" },
  { id: 2, paid_at: null, amount: "300000", classroom: "Lớp B", payment_status: "PENDING" },
];

describe("PaymentHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    myPaymentApi.mockResolvedValue(mockPayments);
  });

  it("PMH-001: hiện Loading khi fetch", () => {
    myPaymentApi.mockReturnValue(new Promise(() => {}));
    render(<MemoryRouter><PaymentHistory /></MemoryRouter>);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("PMH-002: render tổng tiền sau khi load", async () => {
    render(<MemoryRouter><PaymentHistory /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("total-paid").textContent).toContain("500.000");
    });
  });

  it("PMH-003: render đúng số lượng payments", async () => {
    render(<MemoryRouter><PaymentHistory /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("payments-count").textContent).toBe("2");
    });
  });

  it("PMH-004: filter theo SUCCESS chỉ còn 1", async () => {
    render(<MemoryRouter><PaymentHistory /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-filter-success"));
    fireEvent.click(screen.getByTestId("btn-filter-success"));
    await waitFor(() => {
      expect(screen.getByTestId("payments-count").textContent).toBe("1");
    });
  });

  it("PMH-005: clear filter trả về tất cả", async () => {
    render(<MemoryRouter><PaymentHistory /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-filter-success"));
    fireEvent.click(screen.getByTestId("btn-filter-success"));
    fireEvent.click(screen.getByTestId("btn-filter-clear"));
    await waitFor(() => {
      expect(screen.getByTestId("payments-count").textContent).toBe("2");
    });
  });

  it("PMH-006: log lỗi khi myPaymentApi fail", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    myPaymentApi.mockRejectedValue(new Error("fail"));
    render(<MemoryRouter><PaymentHistory /></MemoryRouter>);
    await waitFor(() => expect(spy).toHaveBeenCalled());
    spy.mockRestore();
  });

  it("PMH-007: payment có paid_at null thì date hiện '---'", async () => {
    myPaymentApi.mockResolvedValue([
      { id: 10, paid_at: null, amount: "200000", classroom: "Lớp X", payment_status: "PENDING" },
    ]);
    render(<MemoryRouter><PaymentHistory /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("payments-count").textContent).toBe("1");
      expect(screen.getByTestId("total-paid").textContent).toContain("0");
    });
  });
 
  it("PMH-008: amount không hợp lệ thì hiện 0", async () => {
    myPaymentApi.mockResolvedValue([
      { id: 11, paid_at: "2024-03-01T00:00:00Z", amount: null, classroom: null, payment_status: "SUCCESS" },
    ]);
    render(<MemoryRouter><PaymentHistory /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("total-paid").textContent).toContain("0");
    });
  });
});