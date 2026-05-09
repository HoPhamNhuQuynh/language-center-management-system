import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { getAccessToken, getRole } from "../../utils/token";
import ProtectedRoute from "./ProtectedRoute";

vi.mock("../../utils/token", () => ({
  getAccessToken: vi.fn(),
  getRole: vi.fn(),
}));

const renderProtectedRoute = (allowedRoles) => {
  return render(
    <MemoryRouter initialEntries={["/protected"]}>
      <Routes>
        <Route element={<ProtectedRoute allowedRoles={allowedRoles} />}>
          <Route path="/protected" element={<div>Trang được bảo vệ</div>} />
        </Route>
        <Route path="/login" element={<div>Trang Login</div>} />
        <Route path="/" element={<div>Trang chủ</div>} />
      </Routes>
    </MemoryRouter>,
  );
};

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("khi chưa có token", () => {
    beforeEach(() => {
      getAccessToken.mockReturnValue(null);
      getRole.mockReturnValue(null);
    });

    it("NAV-001 redirect về trang đăng nhập", () => {
      renderProtectedRoute(["Admin"]);
      expect(screen.getByText("Trang Login")).toBeInTheDocument();
      expect(screen.queryByText("Trang được bảo vệ")).not.toBeInTheDocument();
    });
  });

  describe("khi có token và đúng role", () => {
    beforeEach(() => {
      getAccessToken.mockReturnValue("acc_123");
      getRole.mockReturnValue("Admin");
    });

    it("NAV-002 cho vào khi role nằm trong danh sách allowedRoles", () => {
      renderProtectedRoute(["Admin", "Teacher"]);
      expect(screen.getByText("Trang được bảo vệ")).toBeInTheDocument();
    });
  });

  describe("khi có token nhưng sai role", () => {
    beforeEach(() => {
      getAccessToken.mockReturnValue("acc_123");
      getRole.mockReturnValue("Student");
    });

    it("NAV-003 redirect về trang chủ khi không đủ quyền", () => {
      renderProtectedRoute(["Admin"]);
      expect(screen.getByText("Trang chủ")).toBeInTheDocument();
      expect(screen.queryByText("Trang được bảo vệ")).not.toBeInTheDocument();
    });
  });

  describe("khi không truyền allowedRoles", () => {
    beforeEach(() => {
      getAccessToken.mockReturnValue("acc_123");
      getRole.mockReturnValue("Student");
    });

    it("NAV-004 cho vào bất kể role khi không có allowedRoles", () => {
      renderProtectedRoute(undefined);
      expect(screen.getByText("Trang được bảo vệ")).toBeInTheDocument();
    });
  });
});
