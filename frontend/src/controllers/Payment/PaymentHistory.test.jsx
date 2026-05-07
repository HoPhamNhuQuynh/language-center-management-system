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

  it("hiện Loading khi fetch", () => {
    myPaymentApi.mockReturnValue(new Promise(() => {}));
    render(<MemoryRouter><PaymentHistory /></MemoryRouter>);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("render tổng tiền sau khi load", async () => {
    render(<MemoryRouter><PaymentHistory /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("total-paid").textContent).toContain("500.000");
    });
  });

  it("render đúng số lượng payments", async () => {
    render(<MemoryRouter><PaymentHistory /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("payments-count").textContent).toBe("2");
    });
  });

  it("filter theo SUCCESS chỉ còn 1", async () => {
    render(<MemoryRouter><PaymentHistory /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-filter-success"));
    fireEvent.click(screen.getByTestId("btn-filter-success"));
    await waitFor(() => {
      expect(screen.getByTestId("payments-count").textContent).toBe("1");
    });
  });

  it("clear filter trả về tất cả", async () => {
    render(<MemoryRouter><PaymentHistory /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-filter-success"));
    fireEvent.click(screen.getByTestId("btn-filter-success"));
    fireEvent.click(screen.getByTestId("btn-filter-clear"));
    await waitFor(() => {
      expect(screen.getByTestId("payments-count").textContent).toBe("2");
    });
  });

  it("log lỗi khi myPaymentApi fail", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    myPaymentApi.mockRejectedValue(new Error("fail"));
    render(<MemoryRouter><PaymentHistory /></MemoryRouter>);
    await waitFor(() => expect(spy).toHaveBeenCalled());
    spy.mockRestore();
  });
});