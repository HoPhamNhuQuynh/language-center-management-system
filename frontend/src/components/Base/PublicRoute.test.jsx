import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

vi.mock("../../utils/token", () => ({
  getAccessToken: vi.fn(),
  getRole: vi.fn(),
}));

import { getAccessToken, getRole } from "../../utils/token";
import PublicRoute from "./PublicRoute";

const renderPublicRoute = () =>
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<div>Trang Login</div>} />
          <Route path="/register" element={<div>Trang Register</div>} />
        </Route>
        <Route path="/" element={<div>Trang chủ</div>} />
        <Route path="/dashboard" element={<div>Trang Dashboard</div>} />
        <Route path="/attendance" element={<div>Trang Attendance</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe("PublicRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Chưa đăng nhập ---
  it("hiển thị trang login khi chưa đăng nhập", () => {
    getAccessToken.mockReturnValue(null);
    getRole.mockReturnValue(null);

    renderPublicRoute();

    expect(screen.getByText("Trang Login")).toBeInTheDocument();
  });

  // --- Đã đăng nhập theo role ---
  it("redirect Admin về /dashboard", () => {
    getAccessToken.mockReturnValue("acc_123");
    getRole.mockReturnValue("Admin");

    renderPublicRoute();

    expect(screen.getByText("Trang Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Trang Login")).not.toBeInTheDocument();
  });

  it("redirect Teacher về /attendance", () => {
    getAccessToken.mockReturnValue("acc_123");
    getRole.mockReturnValue("Teacher");

    renderPublicRoute();

    expect(screen.getByText("Trang Attendance")).toBeInTheDocument();
  });

  it("redirect Student về /", () => {
    getAccessToken.mockReturnValue("acc_123");
    getRole.mockReturnValue("Student");

    renderPublicRoute();

    expect(screen.getByText("Trang chủ")).toBeInTheDocument();
  });

  it("redirect về / khi role không xác định", () => {
    getAccessToken.mockReturnValue("acc_123");
    getRole.mockReturnValue(null);

    renderPublicRoute();

    expect(screen.getByText("Trang chủ")).toBeInTheDocument();
  });
});
