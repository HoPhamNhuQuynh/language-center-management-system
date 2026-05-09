import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { act } from "react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AccountManagement from "./AccountManagement";

vi.mock("../../services/manageService", () => ({
  getUsers: vi.fn(),
  updateUser: vi.fn(),
  lockUser: vi.fn(),
  changeUserRole: vi.fn(),
  createTeacher: vi.fn(),
}));

vi.mock("../../utils/format", () => ({
  formatDate: (d) => d ?? "—",
}));

import {
  getUsers,
  updateUser,
  lockUser,
  changeUserRole,
  createTeacher,
} from "../../services/manageService";

const MOCK_USERS = [
  {
    id: 1,
    first_name: "An",
    last_name: "Nguyen",
    email: "an@test.com",
    username: "an_nguyen",
    phone_num: "0901000001",
    is_active: true,
    auth_provider: "local",
    role: "Student",
    last_login: "2024-01-01",
    date_joined: "2023-01-01",
  },
  {
    id: 2,
    first_name: "Binh",
    last_name: "Tran",
    email: "binh@test.com",
    username: "binh_tran",
    phone_num: "0901000002",
    is_active: false,
    auth_provider: "google",
    role: "Teacher",
    last_login: null,
    date_joined: "2023-06-01",
  },
];

const mockGetUsers = (users = MOCK_USERS) =>
  getUsers.mockResolvedValue({ results: users, count: users.length });

beforeEach(() => {
  vi.clearAllMocks();
  mockGetUsers();
});

describe("1. Render & load data", () => {
  it("ACC-001 gọi getUsers khi mount và hiển thị danh sách user", async () => {
    render(<AccountManagement />);

    await waitFor(() => {
      expect(screen.getByText("an_nguyen")).toBeInTheDocument();
    });

    expect(getUsers).toHaveBeenCalledWith(1);
    expect(screen.getByText("binh_tran")).toBeInTheDocument();
  });

  it("ACC-002 hiển thị trạng thái 'Đang hoạt động' và 'Không hoạt động' đúng", async () => {
    render(<AccountManagement />);
    await waitFor(() => screen.getByText("an_nguyen"));

    expect(screen.getByText("Đang hoạt động")).toBeInTheDocument();
    expect(screen.getByText("Không hoạt động")).toBeInTheDocument();
  });

  it("ACC-003 icon khóa đúng theo trạng thái is_active của từng user", async () => {
    render(<AccountManagement />);
    await waitFor(() => screen.getByText("an_nguyen"));

    const lockBtns = screen.getAllByTitle(/Khóa tài khoản|Mở khóa/);
    expect(lockBtns[0]).toHaveAttribute("title", "Khóa tài khoản");
    expect(lockBtns[1]).toHaveAttribute("title", "Mở khóa");
  });
});

describe("2. Phân trang", () => {
  it("ACC-004 render đúng số trang, nút prev disabled ở trang 1", async () => {
    getUsers.mockResolvedValue({ results: MOCK_USERS, count: 40 });

    render(<AccountManagement />);
    await waitFor(() => screen.getByText("an_nguyen"));

    const prevBtn = screen.getByText("«");
    expect(prevBtn).toBeDisabled();

    expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
  });

  it("ACC-005 click trang 2 gọi getUsers(2)", async () => {
    getUsers.mockResolvedValue({ results: MOCK_USERS, count: 40 });

    render(<AccountManagement />);
    await waitFor(() => screen.getByText("an_nguyen"));

    await userEvent.click(screen.getByRole("button", { name: "2" }));

    await waitFor(() => expect(getUsers).toHaveBeenCalledWith(2));
    const nextBtn = screen.getByText("»");
    expect(nextBtn).toBeDisabled();
  });
});

describe("3. Edit user", () => {
  it("ACC-006 mở modal edit với dữ liệu của user được chọn", async () => {
    render(<AccountManagement />);
    await waitFor(() => screen.getByText("an_nguyen"));

    const editSpans = document.querySelectorAll(".icon-edit");
    await userEvent.click(editSpans[0]);

    expect(screen.getByText("SỬA THÔNG TIN")).toBeInTheDocument();
    expect(screen.getByDisplayValue("an@test.com")).toBeInTheDocument();
  });

  it("ACC-007 không cho submit khi bỏ trống tên", async () => {
    render(<AccountManagement />);
    await waitFor(() => screen.getByText("an_nguyen"));

    const editSpans = document.querySelectorAll(".icon-edit");
    await userEvent.click(editSpans[0]);

    const firstNameInput = screen.getByDisplayValue("An");
    await userEvent.clear(firstNameInput);

    await userEvent.click(screen.getByRole("button", { name: /Cập nhật/i }));

    expect(screen.getByText("Vui lòng nhập tên")).toBeInTheDocument();
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("ACC-008 submit thành công: gọi updateUser, đóng modal, hiện toast", async () => {
    updateUser.mockResolvedValue({});
    render(<AccountManagement />);
    await waitFor(() => screen.getByText("an_nguyen"));

    const editSpans = document.querySelectorAll(".icon-edit");
    await userEvent.click(editSpans[0]);

    const phoneInput = screen.getByDisplayValue("0901000001");
    await userEvent.clear(phoneInput);
    await userEvent.type(phoneInput, "0909999999");

    await userEvent.click(screen.getByRole("button", { name: /Cập nhật/i }));

    await waitFor(() => {
      expect(updateUser).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ phone_num: "0909999999" }),
      );
      expect(
        screen.getByText("Cập nhật tài khoản thành công!"),
      ).toBeInTheDocument();
    });

    expect(screen.queryByText("SỬA THÔNG TIN")).not.toBeInTheDocument();
  });

  it("ACC-009 submit thất bại: hiện toast lỗi từ server", async () => {
    updateUser.mockRejectedValue({
      response: { data: { message: "Email đã tồn tại" } },
    });
    render(<AccountManagement />);
    await waitFor(() => screen.getByText("an_nguyen"));

    document.querySelectorAll(".icon-edit")[0].click();
    await waitFor(() => screen.getByRole("button", { name: /Cập nhật/i }));

    fireEvent.click(screen.getByRole("button", { name: /Cập nhật/i }));

    await waitFor(() =>
      expect(screen.getByText("Email đã tồn tại")).toBeInTheDocument(),
    );
  });
});

describe("4. Tạo tài khoản giáo viên", () => {
  const openCreateModal = async () => {
    render(<AccountManagement />);
    await waitFor(() => screen.getByText("an_nguyen"));
    await userEvent.click(
      screen.getByRole("button", { name: /Tạo tài khoản/i }),
    );
    expect(screen.getByText("TẠO TÀI KHOẢN GIÁO VIÊN")).toBeInTheDocument();
  };

  it("ACC-010 validate: hiện lỗi khi submit form rỗng", async () => {
    await openCreateModal();

    await userEvent.click(screen.getByRole("button", { name: /Tạo mới/i }));

    expect(screen.getByText("Vui lòng nhập tên")).toBeInTheDocument();
    expect(screen.getByText("Vui lòng nhập họ")).toBeInTheDocument();
    expect(screen.getByText("Vui lòng nhập email")).toBeInTheDocument();
    expect(createTeacher).not.toHaveBeenCalled();
  });

  it("ACC-011 validate: mật khẩu không khớp", async () => {
    await openCreateModal();

    const inputs = document.querySelectorAll("input");
    fireEvent.change(inputs[0], { target: { value: "Nguyen" } }); // last_name
    fireEvent.change(inputs[1], { target: { value: "An" } }); // first_name
    fireEvent.change(inputs[2], { target: { value: "a@b.com" } }); // email
    fireEvent.change(inputs[3], { target: { value: "an123" } }); // username
    fireEvent.change(inputs[4], { target: { value: "pass123" } }); // password
    fireEvent.change(inputs[5], { target: { value: "different" } }); // confirm_password
    fireEvent.change(inputs[6], { target: { value: "0909000000" } }); // phone_num

    fireEvent.click(screen.getByRole("button", { name: /Tạo mới/i }));

    expect(screen.getByText("Mật khẩu không khớp")).toBeInTheDocument();
    expect(createTeacher).not.toHaveBeenCalled();
  });

  it("ACC-012 submit thành công: không gửi confirm_password, đóng modal, hiện toast", async () => {
    createTeacher.mockResolvedValue({});
    await openCreateModal();

    const inputs = document.querySelectorAll("input");
    fireEvent.change(inputs[0], { target: { value: "Nguyen" } });
    fireEvent.change(inputs[1], { target: { value: "An" } });
    fireEvent.change(inputs[2], { target: { value: "teacher@test.com" } });
    fireEvent.change(inputs[3], { target: { value: "teacher01" } });
    fireEvent.change(inputs[4], { target: { value: "abc12345" } });
    fireEvent.change(inputs[5], { target: { value: "abc12345" } });
    fireEvent.change(inputs[6], { target: { value: "0909000001" } });

    fireEvent.click(screen.getByRole("button", { name: /Tạo mới/i }));

    await waitFor(() => {
      expect(createTeacher).toHaveBeenCalledWith(
        expect.not.objectContaining({ confirm_password: expect.anything() }),
      );
      expect(
        screen.getByText("Tạo tài khoản giáo viên thành công!"),
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByText("TẠO TÀI KHOẢN GIÁO VIÊN"),
    ).not.toBeInTheDocument();
  });
});

describe("5. Khóa / Mở khóa tài khoản", () => {
  const openLockModal = async (userIndex = 0) => {
    render(<AccountManagement />);
    await waitFor(() => screen.getByText("an_nguyen"));

    const lockSpans = document.querySelectorAll(".icon-delete");
    fireEvent.click(lockSpans[userIndex]);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Xác nhận/i }),
      ).toBeInTheDocument();
    });
  };

  it("ACC-013 mở modal xác nhận với tên đúng user", async () => {
    await openLockModal(0);

    expect(
      screen.getByRole("heading", { name: /Khóa tài khoản/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        (content, element) =>
          element?.tagName === "STRONG" && content === "an_nguyen",
      ),
    ).toBeInTheDocument();
  });

  it("ACC-014 click Hủy thì đóng modal, không gọi lockUser", async () => {
    await openLockModal(0);
    await userEvent.click(screen.getByRole("button", { name: /Hủy/i }));

    expect(lockUser).not.toHaveBeenCalled();
    expect(screen.queryByText(/Khóa tài khoản/)).not.toBeInTheDocument();
  });

  it("ACC-015 xác nhận khóa user đang active: gọi API, đóng modal và hiện toast", async () => {
    lockUser.mockResolvedValue({});

    getUsers.mockResolvedValueOnce({
      results: MOCK_USERS,
      count: MOCK_USERS.length,
    });

    getUsers.mockResolvedValueOnce({
      results: [
        {
          ...MOCK_USERS[0],
          is_active: false,
        },
        MOCK_USERS[1],
      ],
      count: MOCK_USERS.length,
    });

    await openLockModal(0);

    await userEvent.click(screen.getByRole("button", { name: /Xác nhận/i }));

    await waitFor(() => {
      expect(lockUser).toHaveBeenCalledWith(1);
    });

    await waitFor(() => {
      expect(screen.getByText("Đã khóa tài khoản!")).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("button", { name: /Xác nhận/i }),
    ).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText("Không hoạt động").length).toBeGreaterThan(0);
    });
  });

  it("ACC-016 xác nhận mở khóa user đang inactive: gọi API, đóng modal và hiện toast", async () => {
    lockUser.mockResolvedValue({});

    getUsers.mockResolvedValueOnce({
      results: MOCK_USERS,
      count: MOCK_USERS.length,
    });

    getUsers.mockResolvedValueOnce({
      results: [
        MOCK_USERS[0],
        {
          ...MOCK_USERS[1],
          is_active: true,
        },
      ],
      count: MOCK_USERS.length,
    });

    await openLockModal(1);

    await userEvent.click(screen.getByRole("button", { name: /Xác nhận/i }));

    await waitFor(() => {
      expect(lockUser).toHaveBeenCalledWith(2);
    });

    await waitFor(() => {
      expect(screen.getByText("Đã mở khóa tài khoản!")).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("button", { name: /Xác nhận/i }),
    ).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText("Đang hoạt động").length).toBeGreaterThan(0);
    });
  });

  it("ACC-017 API thất bại thì hiện lỗi trong modal, không đóng", async () => {
    lockUser.mockRejectedValue({
      response: { data: { message: "Không có quyền" } },
    });
    await openLockModal(0);

    fireEvent.click(screen.getByRole("button", { name: /Xác nhận/i }));

    await waitFor(() =>
      expect(screen.getByText("Không có quyền")).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("button", { name: /Xác nhận/i }),
    ).toBeInTheDocument();
  });
});

describe("6. Đổi vai trò", () => {
  const openRoleModal = async (userIndex = 0) => {
    render(<AccountManagement />);
    await waitFor(() => screen.getByText("an_nguyen"));

    const roleBadges = document.querySelectorAll(".role-badge");
    fireEvent.click(roleBadges[userIndex]);
    await waitFor(() => screen.getByText("PHÂN QUYỀN"));
  };

  it("ACC-018 mở modal phân quyền với role hiện tại của user", async () => {
    await openRoleModal(0); // Student

    await waitFor(() => screen.getByText("PHÂN QUYỀN"));
    expect(screen.getByDisplayValue("Student")).toBeInTheDocument();
  });

  it("ACC-019 đổi sang Teacher và submit thì gọi changeUserRole đúng payload", async () => {
    changeUserRole.mockResolvedValue({});
    await openRoleModal(0);

    await userEvent.selectOptions(screen.getByRole("combobox"), "Teacher");
    await userEvent.click(screen.getByRole("button", { name: /Cập nhật/i }));

    await waitFor(() => {
      expect(changeUserRole).toHaveBeenCalledWith(1, { role: "Teacher" });
      expect(
        screen.getByText("Cập nhật vai trò thành công!"),
      ).toBeInTheDocument();
    });
  });

  it("ACC-020 API thất bại thì hiện lỗi trong modal", async () => {
    changeUserRole.mockRejectedValue({
      response: { data: { message: "Đổi role bị lỗi" } },
    });
    await openRoleModal(0);
    fireEvent.click(screen.getByRole("button", { name: /Cập nhật/i }));

    await waitFor(
      () =>
        expect(
          screen.getByText((content) => content.includes("Đổi role bị lỗi")),
        ).toBeInTheDocument(),
      { timeout: 3000 },
    );
  });
});

describe("7. Toast notification", () => {
  it("ACC-021 toast tự ẩn sau 3 giây", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    updateUser.mockResolvedValue({});

    render(<AccountManagement />);
    await waitFor(() => screen.getByText("an_nguyen"));

    document.querySelectorAll(".icon-edit")[0].click();

    await waitFor(() => screen.getByRole("button", { name: /Cập nhật/i }));
    fireEvent.click(screen.getByRole("button", { name: /Cập nhật/i }));

    await waitFor(() =>
      expect(
        screen.getByText("Cập nhật tài khoản thành công!"),
      ).toBeInTheDocument(),
    );

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(
      screen.queryByText("Cập nhật tài khoản thành công!"),
    ).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});
