import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Confirm from "./Confirm";

vi.mock("../../pages/Payment/ConfirmForm", () => ({
  default: (props) => (
    <div>
      <div data-testid="method">{props.method}</div>
      <button data-testid="btn-submit" onClick={props.onSubmit}>Confirm</button>
      <button data-testid="btn-cancel" onClick={props.onCancel}>Cancel</button>
    </div>
  ),
}));

const mockedNavigate = vi.fn();
let mockLocationState = { data: { id: 1 }, method: "momo", percent: 100 };

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
    useLocation: () => ({ state: mockLocationState }),
  };
});

const renderConfirm = () =>
  render(
    <MemoryRouter initialEntries={["/confirm"]}>
      <Routes>
        <Route path="/confirm" element={<Confirm />} />
        <Route path="/bill-view" element={<div>Bill View</div>} />
        <Route path="/payment" element={<div>Payment</div>} />
      </Routes>
    </MemoryRouter>
  );

describe("Confirm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocationState = { data: { id: 1 }, method: "momo", percent: 100 };
  });

  it("render method từ location.state", () => {
    renderConfirm();
    expect(screen.getByTestId("method").textContent).toBe("momo");
  });

  it("handleSubmit navigate đến /bill-view", () => {
    renderConfirm();
    fireEvent.click(screen.getByTestId("btn-submit"));
    expect(mockedNavigate).toHaveBeenCalledWith("/bill-view", expect.any(Object));
  });

  it("handleCancel navigate đến /payment", () => {
    renderConfirm();
    fireEvent.click(screen.getByTestId("btn-cancel"));
    expect(mockedNavigate).toHaveBeenCalledWith("/payment", expect.any(Object));
  });

  it("state null vẫn render không crash", () => {
    mockLocationState = null;
    renderConfirm();
    expect(screen.getByTestId("btn-submit")).toBeInTheDocument();
  });
});