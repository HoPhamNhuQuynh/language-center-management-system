import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock services
vi.mock("../../services/manageService", () => ({
  getUsers: vi.fn(),
  updateUser: vi.fn(),
  lockUser: vi.fn(),
  changeUserRole: vi.fn(),
  createTeacher: vi.fn(),
}));

// Mock utils
vi.mock("../../utils/format", () => ({
  formatDate: vi.fn((d) => d ?? "—"),
}));

// Mock react-icons
vi.mock("react-icons/fa6", () => ({
  FaLock: () => <span>Lock</span>,
  FaUnlock: () => <span>Unlock</span>,
  FaPen: () => <span>Edit</span>,
}));

import {
  getUsers,
  updateUser,
  lockUser,
  changeUserRole,
  createTeacher,
} from "../../services/manageService";
import AccountManagement from "./AccountManagement";

// Data mẫu
const mockUsers = [
  {
    id: 1,
    first_name: "An",
    last_name: "Nguyen",
    email: "an@gmail.com",
    username: "student01",
    phone_num: "0901234567",
    is_active: true,
    role: "Student",
    auth_provider: "local",
    last_login: null,
    date_joined: null,
  },
  {
    id: 2,
    first_name: "Binh",
    last_name: "Tran",
    email: "binh@gmail.com",
    username: "teacher01",
    phone_num: "0912345678",
    is_active: false,
    role: "Teacher",
    auth_provider: "google",
    last_login: null,
    date_joined: null,
  },
];

const renderComponent = () => render(<AccountManagement />);

describe("AccountManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUsers.mockResolvedValue({ results: mockUsers, count: 2 });
  });

  // --- Load users ---
  describe("load danh sách users", () => {
    it("hiển thị danh sách users sau khi load", async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("student01")).toBeInTheDocument();
        expect(screen.getByText("teacher01")).toBeInTheDocument();
      });
    });

    it("gọi getUsers với page 1 khi khởi tạo", async () => {
      renderComponent();

      await waitFor(() => {
        expect(getUsers).toHaveBeenCalledWith(1);
      });
    });

    it("hiển thị trạng thái Đang hoạt động / Không hoạt động đúng", async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Đang hoạt động")).toBeInTheDocument();
        expect(screen.getByText("Không hoạt động")).toBeInTheDocument();
      });
    });
  });

  // --- validate create form ---
  describe("validateCreate", () => {
    it("hiển thị lỗi khi submit form tạo tài khoản trống", async () => {
      renderComponent();
      await waitFor(() => screen.getByText("Tạo tài khoản"));

      fireEvent.click(screen.getByText("Tạo tài khoản"));

      await waitFor(() => {
        fireEvent.click(screen.getByText("Tạo mới"));
      });

      await waitFor(() => {
        expect(screen.getByText("Vui lòng nhập tên")).toBeInTheDocument();
        expect(screen.getByText("Vui lòng nhập họ")).toBeInTheDocument();
        expect(screen.getByText("Vui lòng nhập email")).toBeInTheDocument();
      });
    });

    it("hiển thị lỗi mật khẩu không khớp", async () => {
      renderComponent();

      await waitFor(() => screen.getByText("Tạo tài khoản"));
      fireEvent.click(screen.getByText("Tạo tài khoản"));

      await waitFor(() => screen.getByText("TẠO TÀI KHOẢN GIÁO VIÊN"));

      const passwordInputs = document.querySelectorAll(
        'input[type="password"]',
      );
      fireEvent.change(passwordInputs[0], { target: { value: "Abc123@" } });
      fireEvent.change(passwordInputs[1], {
        target: { value: "DifferentPass" },
      });

      fireEvent.click(screen.getByText("Tạo mới"));

      await waitFor(() => {
        expect(screen.getByText("Mật khẩu không khớp")).toBeInTheDocument();
      });
    });
  });

  // --- validate edit form ---
  describe("validate edit form", () => {
    it("hiển thị lỗi khi submit form sửa trống", async () => {
      renderComponent();

      await waitFor(() => screen.getByText("student01"));

      // Bấm Edit user đầu tiên
      const editButtons = screen.getAllByText("Edit");
      fireEvent.click(editButtons[0]);

      // Xóa trắng field tên
      const firstNameInput = screen.getByDisplayValue("An");
      fireEvent.change(firstNameInput, { target: { value: "" } });

      fireEvent.click(screen.getByText("Cập nhật"));

      await waitFor(() => {
        expect(screen.getByText("Vui lòng nhập tên")).toBeInTheDocument();
      });
    });
  });

  // --- handleSubmitEdit ---
  describe("handleSubmitEdit", () => {
    it("gọi updateUser và hiển thị toast thành công", async () => {
      updateUser.mockResolvedValue({});
      renderComponent();

      await waitFor(() => screen.getByText("student01"));

      const editButtons = screen.getAllByText("Edit");
      fireEvent.click(editButtons[0]);

      fireEvent.click(screen.getByText("Cập nhật"));

      await waitFor(() => {
        expect(updateUser).toHaveBeenCalledWith(1, expect.any(Object));
        expect(
          screen.getByText("Cập nhật tài khoản thành công!"),
        ).toBeInTheDocument();
      });
    });
  });

  // --- handleLock ---
  describe("handleLock", () => {
    it("mở modal xác nhận khi bấm icon lock", async () => {
      renderComponent();

      await waitFor(() => screen.getByText("student01"));

      const lockButtons = screen.getAllByText("Lock");
      fireEvent.click(lockButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("Khóa tài khoản")).toBeInTheDocument();
        expect(screen.getByText("Xác nhận")).toBeInTheDocument();
      });
    });

    it("gọi lockUser và hiển thị toast khi xác nhận", async () => {
      lockUser.mockResolvedValue({});
      renderComponent();

      await waitFor(() => screen.getByText("student01"));

      fireEvent.click(screen.getAllByText("Lock")[0]);

      await waitFor(() => screen.getByText("Xác nhận"));
      fireEvent.click(screen.getByText("Xác nhận"));

      await waitFor(() => {
        expect(lockUser).toHaveBeenCalledWith(1);
        expect(screen.getByText("Đã khóa tài khoản!")).toBeInTheDocument();
      });
    });

    it("hiển thị lỗi trong modal khi lockUser thất bại", async () => {
      lockUser.mockRejectedValue({
        response: { data: { message: "Không thể khóa" } },
      });
      renderComponent();

      await waitFor(() => screen.getByText("student01"));

      fireEvent.click(screen.getAllByText("Lock")[0]);
      await waitFor(() => screen.getByText("Xác nhận"));
      fireEvent.click(screen.getByText("Xác nhận"));

      await waitFor(() => {
        expect(screen.getByText("⚠️ Không thể khóa")).toBeInTheDocument();
      });
    });
  });

  // --- handleChangeRole ---
  describe("handleChangeRole", () => {
    it("mở modal phân quyền khi bấm vào role badge", async () => {
      renderComponent();

      await waitFor(() => screen.getByText("Student"));
      fireEvent.click(screen.getByText("Student"));

      await waitFor(() => {
        expect(screen.getByText("PHÂN QUYỀN")).toBeInTheDocument();
      });
    });

    it("gọi changeUserRole và hiển thị toast thành công", async () => {
      changeUserRole.mockResolvedValue({});
      renderComponent();

      await waitFor(() => screen.getByText("Student"));
      fireEvent.click(screen.getByText("Student"));

      await waitFor(() => screen.getByText("Cập nhật"));
      fireEvent.click(screen.getByText("Cập nhật"));

      await waitFor(() => {
        expect(changeUserRole).toHaveBeenCalledWith(1, { role: "Student" });
        expect(
          screen.getByText("Cập nhật vai trò thành công!"),
        ).toBeInTheDocument();
      });
    });
  });

  // --- handleCreate ---
  describe("handleCreate", () => {
    it("gọi createTeacher và hiển thị toast thành công", async () => {
      createTeacher.mockResolvedValue({});
      renderComponent();

      await waitFor(() => screen.getByText("Tạo tài khoản"));
      fireEvent.click(screen.getByText("Tạo tài khoản"));

      await waitFor(() => screen.getByText("TẠO TÀI KHOẢN GIÁO VIÊN"));

      // Lấy tất cả input text và password theo thứ tự trong form
      const textInputs = document.querySelectorAll('input[type="text"]');
      const passwordInputs = document.querySelectorAll(
        'input[type="password"]',
      );

      // Thứ tự: Họ, Tên, Email, Username, Số điện thoại
      fireEvent.change(textInputs[0], { target: { value: "Nguyen" } }); // Họ
      fireEvent.change(textInputs[1], { target: { value: "An" } }); // Tên
      fireEvent.change(textInputs[2], { target: { value: "an@gmail.com" } }); // Email
      fireEvent.change(textInputs[3], { target: { value: "teacher02" } }); // Username
      fireEvent.change(textInputs[4], { target: { value: "0901234567" } }); // Số điện thoại

      fireEvent.change(passwordInputs[0], { target: { value: "Abc123@" } }); // Mật khẩu
      fireEvent.change(passwordInputs[1], { target: { value: "Abc123@" } }); // Xác nhận

      fireEvent.click(screen.getByText("Tạo mới"));

      await waitFor(() => {
        expect(createTeacher).toHaveBeenCalled();
        expect(
          screen.getByText("Tạo tài khoản giáo viên thành công!"),
        ).toBeInTheDocument();
      });
    });
  });
});
