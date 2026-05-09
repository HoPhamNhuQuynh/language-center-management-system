import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Payment from "./Payment";

vi.mock("../../pages/Payment/PaymentForm", () => ({
  default: (props) => (
    <div>
      <div data-testid="method">{props.method}</div>
      <div data-testid="percent">{props.percent}</div>
      <button data-testid="btn-submit" onClick={props.onSubmit}>Submit</button>
      <button data-testid="btn-method" onClick={() => props.setMethod("vnpay")}>Set VNPay</button>
    </div>
  ),
}));

const mockedNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

const renderPayment = () =>
  render(
    <MemoryRouter initialEntries={["/payment"]}>
      <Routes>
        <Route path="/payment" element={<Payment />} />
        <Route path="/bill-view" element={<div>Bill View</div>} />
      </Routes>
    </MemoryRouter>
  );

describe("Payment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("PMC-001: render với method mặc định là momo", () => {
    renderPayment();
    expect(screen.getByTestId("method").textContent).toBe("momo");
    expect(screen.getByTestId("percent").textContent).toBe("100");
  });

  it("PMC-002: handleSubmit navigate đến /bill-view", () => {
    renderPayment();
    fireEvent.click(screen.getByTestId("btn-submit"));
    expect(mockedNavigate).toHaveBeenCalledWith("/bill-view", expect.any(Object));
  });

  it("PMC-003: setMethod thay đổi method", () => {
    renderPayment();
    fireEvent.click(screen.getByTestId("btn-method"));
    expect(screen.getByTestId("method").textContent).toBe("vnpay");
  });
});