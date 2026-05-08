import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");
  return {
    ...actual,
    Dropdown: ({ menu, children }) => (
      <div>
        {children}
        <button
          data-testid="dropdown-classes"
          onClick={() => menu.onClick({ key: "classes" })}
        >
          Quản lý lớp học
        </button>
        <button
          data-testid="dropdown-courses"
          onClick={() => menu.onClick({ key: "courses" })}
        >
          Quản lý khóa học
        </button>
        <button
          data-testid="dropdown-payments"
          onClick={() => menu.onClick({ key: "payments" })}
        >
          Quản lý học phí
        </button>
        <button
          data-testid="dropdown-accounts"
          onClick={() => menu.onClick({ key: "accounts" })}
        >
          Cấu hình hệ thống
        </button>
      </div>
    ),
    Space: ({ children }) => <span>{children}</span>,
  };
});

vi.mock("../../utils/token", () => ({
  getAccessToken: vi.fn(),
  clearTokens: vi.fn(),
  getRole: vi.fn(),
}));

vi.mock("../../services/authService", () => ({
  revokeTokenApi: vi.fn(),
}));

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

    it("NAV-010 hiển thị link Trang chủ, Về chúng tôi, Khóa học và 2 nút đăng ký và đăng nhập, không hiển thị nút Đăng xuất", () => {
      renderNavbar();
      expect(screen.getByText("Trang chủ")).toBeInTheDocument();
      expect(screen.getByText("Về chúng tôi")).toBeInTheDocument();
      expect(screen.getByText("Khóa học")).toBeInTheDocument();
      expect(screen.getByText("Đăng ký")).toBeInTheDocument();
      expect(screen.getByText("Đăng nhập")).toBeInTheDocument();
      expect(screen.queryByText("Đăng xuất")).not.toBeInTheDocument();
    });
  });

  // --- Student ---
  describe("khi đăng nhập với role Student", () => {
    beforeEach(() => {
      getAccessToken.mockReturnValue("acc_123");
      getRole.mockReturnValue("Student");
    });

    it("NAV-011 hiển thị menu Student", () => {
      renderNavbar();
      expect(screen.getByText("Thông tin cá nhân")).toBeInTheDocument();
      expect(screen.getByText("Lịch học")).toBeInTheDocument();
      expect(screen.getByText("Trang chủ")).toBeInTheDocument();
      expect(screen.getByText("Về chúng tôi")).toBeInTheDocument();
      expect(screen.getByText("Khóa học")).toBeInTheDocument();
    });

    it("NAV-011 hiển thị nút Đăng xuất và không có Đăng ký và Đăng nhập", () => {
      renderNavbar();
      expect(screen.getByText("Đăng xuất")).toBeInTheDocument();
      expect(screen.queryByText("Đăng ký")).not.toBeInTheDocument();
      expect(screen.queryByText("Đăng nhập")).not.toBeInTheDocument();
    });

    it("NAV-011 không hiển thị menu Teacher hay Admin", () => {
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

    it("NAV-012 hiển thị menu Teacher", () => {
      renderNavbar();
      expect(screen.getByText("Điểm danh")).toBeInTheDocument();
      expect(screen.getByText("Nhập điểm")).toBeInTheDocument();
      expect(screen.getByText("Lịch dạy")).toBeInTheDocument();
    });

    it("NAV-012 không hiển thị menu Student hay Admin", () => {
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

    it("NAV-013 hiển thị menu Admin", () => {
      renderNavbar();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Quản trị hệ thống")).toBeInTheDocument();
    });

    it("NAV-013 không hiển thị menu Student hay Teacher", () => {
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

    it("NAV-014 gọi revokeTokenApi và clearTokens khi bấm Đăng xuất", async () => {
      revokeTokenApi.mockResolvedValue({});
      renderNavbar();

      fireEvent.click(screen.getByText("Đăng xuất"));

      await vi.waitFor(() => {
        expect(revokeTokenApi).toHaveBeenCalled();
        expect(clearTokens).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith("/login");
      });
    });

    it("NAV-015 vẫn clearTokens khi revokeTokenApi thất bại", async () => {
      revokeTokenApi.mockRejectedValue(new Error("failed"));
      renderNavbar();

      fireEvent.click(screen.getByText("Đăng xuất"));

      await vi.waitFor(() => {
        expect(revokeTokenApi).toHaveBeenCalled();
        expect(clearTokens).toHaveBeenCalled();
      });
    });
  });
  describe("Admin dropdown menu", () => {
    beforeEach(() => {
      getAccessToken.mockReturnValue("acc_123");
      getRole.mockReturnValue("Admin");
    });

    it("NAV-016 click item classes gọi navigate đúng path", () => {
      renderNavbar();

      fireEvent.click(screen.getByTestId("dropdown-classes"));

      expect(mockNavigate).toHaveBeenCalledWith("/class-config");
    });

    it("NAV-017 click Django Admin mở window mới", () => {
      const windowOpen = vi.spyOn(window, "open").mockImplementation(() => {});
      renderNavbar();

      const djangoLink = screen.getByText("Django Admin");
      fireEvent.click(djangoLink);

      expect(windowOpen).toHaveBeenCalledWith(
        "https://localhost:8000/admin",
        "django_admin",
      );

      windowOpen.mockRestore();
    });
  });
});