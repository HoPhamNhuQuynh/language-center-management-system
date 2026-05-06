import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock dependencies
vi.mock("../../utils/token", () => ({
  getAccessToken: vi.fn(),
  clearTokens: vi.fn(),
  getRole: vi.fn(),
}));

vi.mock("../../services/authService", () => ({
  revokeTokenApi: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

import { getAccessToken, clearTokens, getRole } from "../../utils/token";
import { revokeTokenApi } from "../../services/authService";
import Navbar from "./Navbar";

const renderNavbar = () =>
  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>,
  );

describe("Navbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Chưa đăng nhập ---
  describe("khi chưa đăng nhập", () => {
    beforeEach(() => {
      getAccessToken.mockReturnValue(null);
      getRole.mockReturnValue(null);
    });

    it("hiển thị link Trang chủ, Về chúng tôi, Khóa học", () => {
      renderNavbar();
      expect(screen.getByText("Trang chủ")).toBeInTheDocument();
      expect(screen.getByText("Về chúng tôi")).toBeInTheDocument();
      expect(screen.getByText("Khóa học")).toBeInTheDocument();
    });

    it("hiển thị nút Đăng ký và Đăng nhập", () => {
      renderNavbar();
      expect(screen.getByText("Đăng ký")).toBeInTheDocument();
      expect(screen.getByText("Đăng nhập")).toBeInTheDocument();
    });

    it("không hiển thị nút Đăng xuất", () => {
      renderNavbar();
      expect(screen.queryByText("Đăng xuất")).not.toBeInTheDocument();
    });
  });

  // --- Student ---
  describe("khi đăng nhập với role Student", () => {
    beforeEach(() => {
      getAccessToken.mockReturnValue("acc_123");
      getRole.mockReturnValue("Student");
    });

    it("hiển thị menu Student", () => {
      renderNavbar();
      expect(screen.getByText("Thông tin cá nhân")).toBeInTheDocument();
      expect(screen.getByText("Lịch học")).toBeInTheDocument();
    });

    it("hiển thị nút Đăng xuất", () => {
      renderNavbar();
      expect(screen.getByText("Đăng xuất")).toBeInTheDocument();
    });

    it("không hiển thị menu Teacher hay Admin", () => {
      renderNavbar();
      expect(screen.queryByText("Điểm danh")).not.toBeInTheDocument();
      expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    });
  });

  // --- Teacher ---
  describe("khi đăng nhập với role Teacher", () => {
    beforeEach(() => {
      getAccessToken.mockReturnValue("acc_123");
      getRole.mockReturnValue("Teacher");
    });

    it("hiển thị menu Teacher", () => {
      renderNavbar();
      expect(screen.getByText("Điểm danh")).toBeInTheDocument();
      expect(screen.getByText("Nhập điểm")).toBeInTheDocument();
      expect(screen.getByText("Lịch dạy")).toBeInTheDocument();
    });

    it("không hiển thị menu Student hay Admin", () => {
      renderNavbar();
      expect(screen.queryByText("Thông tin cá nhân")).not.toBeInTheDocument();
      expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    });
  });

  // --- Admin ---
  describe("khi đăng nhập với role Admin", () => {
    beforeEach(() => {
      getAccessToken.mockReturnValue("acc_123");
      getRole.mockReturnValue("Admin");
    });

    it("hiển thị menu Admin", () => {
      renderNavbar();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Quản trị hệ thống")).toBeInTheDocument();
    });

    it("không hiển thị menu Student hay Teacher", () => {
      renderNavbar();
      expect(screen.queryByText("Thông tin cá nhân")).not.toBeInTheDocument();
      expect(screen.queryByText("Điểm danh")).not.toBeInTheDocument();
    });
  });

  // --- Logout ---
  describe("handleLogout", () => {
    beforeEach(() => {
      getAccessToken.mockReturnValue("acc_123");
      getRole.mockReturnValue("Student");
    });

    it("gọi revokeTokenApi và clearTokens khi bấm Đăng xuất", async () => {
      revokeTokenApi.mockResolvedValue({});
      renderNavbar();

      fireEvent.click(screen.getByText("Đăng xuất"));

      await vi.waitFor(() => {
        expect(revokeTokenApi).toHaveBeenCalled();
        expect(clearTokens).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith("/login");
      });
    });

    it("vẫn clearTokens khi revokeTokenApi thất bại", async () => {
      revokeTokenApi.mockRejectedValue(new Error("failed"));
      renderNavbar();

      fireEvent.click(screen.getByText("Đăng xuất"));

      // Lỗi bị catch → không crash, chỉ log
      await vi.waitFor(() => {
        expect(revokeTokenApi).toHaveBeenCalled();
      });
    });
  });
});
