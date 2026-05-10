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

  it("NAV-005 hiển thị trang đăng nhập khi chưa đăng nhập", () => {
    getAccessToken.mockReturnValue(null);
    getRole.mockReturnValue(null);

    renderPublicRoute();
    expect(screen.getByText("Trang Login")).toBeInTheDocument();
  });

  it("NAV-006 redirect Admin về dashboard", () => {
    getAccessToken.mockReturnValue("acc_123");
    getRole.mockReturnValue("Admin");

    renderPublicRoute();

    expect(screen.getByText("Trang Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Trang Login")).not.toBeInTheDocument();
  });

  it("NAV-007 redirect Teacher về trang điểm danh", () => {
    getAccessToken.mockReturnValue("acc_123");
    getRole.mockReturnValue("Teacher");

    renderPublicRoute();

    expect(screen.getByText("Trang Attendance")).toBeInTheDocument();
  });

  it("NAV-008 redirect Student về trang chủ", () => {
    getAccessToken.mockReturnValue("acc_123");
    getRole.mockReturnValue("Student");

    renderPublicRoute();

    expect(screen.getByText("Trang chủ")).toBeInTheDocument();
  });

  it("NAV-009 redirect về trang chủ khi role không xác định", () => {
    getAccessToken.mockReturnValue("acc_123");
    getRole.mockReturnValue(null);

    renderPublicRoute();

    expect(screen.getByText("Trang chủ")).toBeInTheDocument();
  });
});
