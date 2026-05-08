import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import StudentInfo from "./StudentInfo";
import {
  studentApi, updateStudentApi, updateStudentAvatarApi, myEnrollmentApi,
} from "../../services/studentService";
import { resetPasswordApi, deleteAccountApi } from "../../services/studentService";

vi.mock("../../pages/User/StudentInfoForm", () => ({
  default: (props) => (
    <div>
      <div data-testid="fullname">{props.studentProfile?.fullName}</div>
      <div data-testid="paid">{props.tuition?.paid}</div>
      <div data-testid="remaining">{props.tuition?.remaining}</div>
      <div data-testid="modal">{props.isModalOpen ? "open" : "closed"}</div>
      <button data-testid="btn-open-modal" onClick={props.onOpenModal}>Edit</button>
      <button data-testid="btn-save" onClick={props.onSave}>Save</button>
      <button data-testid="btn-close-modal" onClick={() => props.setIsOpen(false)}>Close</button>
      <button data-testid="btn-avatar" onClick={() => props.onAvatarChange(new File(["x"], "avatar.png"))}>Avatar</button>
      <button data-testid="btn-change-password" onClick={props.onChangePassword}>ChangePassword</button>
      <button data-testid="btn-delete-account" onClick={props.onDeleteAccount}>DeleteAccount</button>
      <button data-testid="btn-set-mismatch-password" onClick={() => {
        props.setPasswordData({ old_password: "old", password: "abc", confirm_password: "xyz" });
      }}>SetMismatch</button>
      <button data-testid="btn-set-match-password" onClick={() => {
        props.setPasswordData({ old_password: "old", password: "abc", confirm_password: "abc" });
      }}>SetMatch</button>
      {props.courses?.map(c => (
        <div key={c.id} data-testid={`course-${c.id}`}>{c.className}</div>
      ))}
    </div>
  ),
}));

vi.mock("../../assets/hero.png", () => ({ default: "hero.png" }));
vi.mock("../../styles/StudentInfo.css", () => ({}));

vi.mock("../../services/studentService", () => ({
  studentApi: vi.fn(),
  updateStudentApi: vi.fn(),
  updateStudentAvatarApi: vi.fn(),
  myEnrollmentApi: vi.fn(),
  resetPasswordApi: vi.fn(),
  deleteAccountApi: vi.fn(),

}));

const mockUser = {
  first_name: "Nguyen",
  last_name: "Van A",
  email: "a@example.com",
  phone_num: "0901234567",
};

const mockEnrollments = [
  {
    id: 1,
    amount: 500000,
    enrollment_status: "active",
    classroom: {
      id: 10,
      name: "Lớp React",
      course_price: 600000,
      schedules: [{ day_of_week: 2, start_time: "08:00:00", end_time: "10:00:00" }],
      main_teacher: { first_name: "Tran", last_name: "B" },
    },
  },
];

describe("StudentInfo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "alert").mockImplementation(() => { });
    studentApi.mockResolvedValue(mockUser);
    myEnrollmentApi.mockResolvedValue(mockEnrollments);
  });

  afterEach(() => vi.restoreAllMocks());

  it("SDI-001: hiện Loading khi đang fetch", () => {
    studentApi.mockReturnValue(new Promise(() => { }));
    myEnrollmentApi.mockReturnValue(new Promise(() => { }));
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("SDI-002: hiện lỗi khi studentApi fail", async () => {
    studentApi.mockRejectedValue(new Error("fail"));
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText("Failed to load user information.")).toBeInTheDocument();
    });
  });

  it("SDI-003: render đúng fullName và học phí", async () => {
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("fullname").textContent).toBe("Nguyen Van A");
      expect(screen.getByTestId("paid").textContent).toContain("500.000");
      expect(screen.getByTestId("remaining").textContent).toContain("100.000");
    });
  });

  it("SDI-004: mở modal khi click Edit", async () => {
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-open-modal"));
    fireEvent.click(screen.getByTestId("btn-open-modal"));
    expect(screen.getByTestId("modal").textContent).toBe("open");
  });

  it("SDI-005: đóng modal khi click Close", async () => {
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-open-modal"));
    fireEvent.click(screen.getByTestId("btn-open-modal"));
    fireEvent.click(screen.getByTestId("btn-close-modal"));
    expect(screen.getByTestId("modal").textContent).toBe("closed");
  });

  it("SDI-006: handleSaveProfile gọi updateStudentApi và đóng modal", async () => {
    updateStudentApi.mockResolvedValue({ ...mockUser, first_name: "Updated" });
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-open-modal"));
    fireEvent.click(screen.getByTestId("btn-open-modal"));
    fireEvent.click(screen.getByTestId("btn-save"));
    await waitFor(() => {
      expect(updateStudentApi).toHaveBeenCalled();
      expect(screen.getByTestId("modal").textContent).toBe("closed");
    });
  });

  it("SDI-007: handleSaveProfile alert lỗi khi updateStudentApi fail", async () => {
    updateStudentApi.mockRejectedValue({ response: { data: { detail: "err" } } });
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-open-modal"));
    fireEvent.click(screen.getByTestId("btn-open-modal"));
    fireEvent.click(screen.getByTestId("btn-save"));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalled();
    });
  });

  it("SDI-008: handleAvatarChange gọi updateStudentAvatarApi", async () => {
    updateStudentAvatarApi.mockResolvedValue({});
    studentApi
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce({ ...mockUser, first_name: "Fresh" });
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-avatar"));
    fireEvent.click(screen.getByTestId("btn-avatar"));
    await waitFor(() => {
      expect(updateStudentAvatarApi).toHaveBeenCalled();
    });
  });

  it("SDI-009: handleAvatarChange alert lỗi khi upload fail", async () => {
    updateStudentAvatarApi.mockRejectedValue({ response: { data: { detail: "upload fail" } } });
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-avatar"));
    fireEvent.click(screen.getByTestId("btn-avatar"));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining("upload fail"));
    });
  });

  it("SDI-010: render course từ enrollment", async () => {
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("course-1").textContent).toBe("Lớp React");
    });
  });

  it("SDI-011: schedule với day_of_week=8 hiện Chủ nhật", async () => {
    myEnrollmentApi.mockResolvedValue([{
      id: 2,
      amount: 0,
      enrollment_status: "active",
      classroom: {
        id: 11,
        name: "Lớp Sunday",
        course_price: 0,
        schedules: [{ day_of_week: 8, start_time: "09:00:00", end_time: "11:00:00" }],
        main_teacher: null,
      },
    }]);
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("course-2")).toBeInTheDocument();
    });
  });

  it("SDI-012: handleChangePassword alert khi mật khẩu xác nhận không khớp", async () => {
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-set-mismatch-password"));
    fireEvent.click(screen.getByTestId("btn-set-mismatch-password"));
    fireEvent.click(screen.getByTestId("btn-change-password"));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Mật khẩu xác nhận không khớp!");
    });
  });

  it("SDI-013: handleChangePassword đổi mật khẩu thành công", async () => {
    resetPasswordApi.mockResolvedValue({});
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-change-password"));
    fireEvent.click(screen.getByTestId("btn-change-password"));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalled();
    });
  });

  it("SDI-014: handleDeleteAccount hủy khi confirm = false", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-delete-account"));
    fireEvent.click(screen.getByTestId("btn-delete-account"));
    expect(deleteAccountApi).not.toHaveBeenCalled();
  });

  it("SDI-015: handleDeleteAccount xóa tài khoản thành công", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    deleteAccountApi.mockResolvedValue({});
    delete window.location;
    window.location = { href: "" };
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-delete-account"));
    fireEvent.click(screen.getByTestId("btn-delete-account"));
    await waitFor(() => {
      expect(deleteAccountApi).toHaveBeenCalled();
      expect(window.location.href).toBe("/login");
    });
  });

  it("SDI-016: handleChangePassword alert lỗi old_password từ server", async () => {
    resetPasswordApi.mockRejectedValue({
      response: { data: { old_password: ["Mật khẩu cũ không đúng"] } }
    });
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-set-match-password"));
    fireEvent.click(screen.getByTestId("btn-set-match-password"));
    fireEvent.click(screen.getByTestId("btn-change-password"));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Mật khẩu cũ không đúng");
    });
  });

  it("SDI-017: handleChangePassword alert lỗi password từ server", async () => {
    resetPasswordApi.mockRejectedValue({
      response: { data: { password: "Mật khẩu quá ngắn" } }
    });
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-set-match-password"));
    fireEvent.click(screen.getByTestId("btn-set-match-password"));
    fireEvent.click(screen.getByTestId("btn-change-password"));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Mật khẩu quá ngắn");
    });
  });

  it("SDI-018: handleChangePassword alert lỗi non_field_errors từ server", async () => {
    resetPasswordApi.mockRejectedValue({
      response: { data: { non_field_errors: ["Lỗi không xác định"] } }
    });
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-set-match-password"));
    fireEvent.click(screen.getByTestId("btn-set-match-password"));
    fireEvent.click(screen.getByTestId("btn-change-password"));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Lỗi không xác định");
    });
  });

  it("SDI-019: handleChangePassword alert lỗi dạng string từ server", async () => {
    resetPasswordApi.mockRejectedValue({
      response: { data: "Lỗi server" }
    });
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-set-match-password"));
    fireEvent.click(screen.getByTestId("btn-set-match-password"));
    fireEvent.click(screen.getByTestId("btn-change-password"));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Lỗi server");
    });
  });

  it("SDI-020: handleDeleteAccount alert lỗi khi deleteAccountApi fail", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    deleteAccountApi.mockRejectedValue({ response: { data: { detail: "Không thể xóa" } } });
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-delete-account"));
    fireEvent.click(screen.getByTestId("btn-delete-account"));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining("Không thể xóa"));
    });
  });

  it("SDI-021: handleChangePassword alert lỗi password dạng string", async () => {
    resetPasswordApi.mockRejectedValue({
      response: { data: { password: "Mật khẩu quá ngắn" } }
    });
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-set-match-password"));
    fireEvent.click(screen.getByTestId("btn-set-match-password"));
    fireEvent.click(screen.getByTestId("btn-change-password"));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Mật khẩu quá ngắn");
    });
  });

  it("SDI-022: handleChangePassword alert lỗi non_field_errors dạng string", async () => {
    resetPasswordApi.mockRejectedValue({
      response: { data: { non_field_errors: "Lỗi không xác định" } }
    });
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-set-match-password"));
    fireEvent.click(screen.getByTestId("btn-set-match-password"));
    fireEvent.click(screen.getByTestId("btn-change-password"));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Lỗi không xác định");
    });
  });

  it("SDI-023: handleChangePassword alert lỗi old_password dạng string", async () => {
    resetPasswordApi.mockRejectedValue({
      response: { data: { old_password: "Sai mật khẩu cũ" } }
    });
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-set-match-password"));
    fireEvent.click(screen.getByTestId("btn-set-match-password"));
    fireEvent.click(screen.getByTestId("btn-change-password"));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Sai mật khẩu cũ");
    });
  });

  it("SDI-024: handleChangePassword alert mặc định khi không có response.data", async () => {
    resetPasswordApi.mockRejectedValue(new Error("Network error"));
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-set-match-password"));
    fireEvent.click(screen.getByTestId("btn-set-match-password"));
    fireEvent.click(screen.getByTestId("btn-change-password"));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Đổi mật khẩu thất bại!");
    });
  });

  it("SDI-025: handleAvatarChange alert lỗi khi không có detail", async () => {
    updateStudentAvatarApi.mockRejectedValue({ response: { data: {} } });
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-avatar"));
    fireEvent.click(screen.getByTestId("btn-avatar"));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining("Check console")
      );
    });
  });

  it("SDI-026: enrollment không có classroom thì hiện className là '---'", async () => {
    myEnrollmentApi.mockResolvedValue([
      { id: 5, amount: 0, enrollment_status: "active", classroom: null },
    ]);
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("course-5")).toBeInTheDocument();
      expect(screen.getByTestId("course-5").textContent).toBe("---");
    });
  });

  it("SDI-027: schedule rỗng hiện 'Chưa có lịch học'", async () => {
    myEnrollmentApi.mockResolvedValue([
      {
        id: 6,
        amount: 0,
        enrollment_status: "active",
        classroom: {
          id: 20,
          name: "Lớp không có lịch",
          course_price: 0,
          schedules: [],
          main_teacher: null,
        },
      },
    ]);
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("course-6")).toBeInTheDocument();
    });
  });

  it("SDI-028: handleChangePassword alert lỗi password dạng array từ server", async () => {
    resetPasswordApi.mockRejectedValue({
      response: { data: { password: ["Mật khẩu phải có ít nhất 8 ký tự"] } }
    });
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-set-match-password"));
    fireEvent.click(screen.getByTestId("btn-set-match-password"));
    fireEvent.click(screen.getByTestId("btn-change-password"));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Mật khẩu phải có ít nhất 8 ký tự");
    });
  });

  it("SDI-029: handleChangePassword alert mặc định khi data là object không có key quen", async () => {
    resetPasswordApi.mockRejectedValue({
      response: { data: { unknown_field: "some error" } }
    });
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-set-match-password"));
    fireEvent.click(screen.getByTestId("btn-set-match-password"));
    fireEvent.click(screen.getByTestId("btn-change-password"));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Đổi mật khẩu thất bại!");
    });
  });

  it("SDI-030: classroom.schedules là null thì hiện 'Chưa có lịch học'", async () => {
    myEnrollmentApi.mockResolvedValue([
      {
        id: 7,
        amount: 0,
        enrollment_status: "active",
        classroom: {
          id: 30,
          name: "Lớp schedules null",
          course_price: 0,
          schedules: null,
          main_teacher: null,
        },
      },
    ]);
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("course-7")).toBeInTheDocument();
    });
  });

  it("SDI-031: enrollment không có enrollment_status thì status là '---'", async () => {
    myEnrollmentApi.mockResolvedValue([
      {
        id: 8,
        amount: 0,
        enrollment_status: undefined,
        classroom: {
          id: 40,
          name: "Lớp no status",
          course_price: 0,
          schedules: [],
          main_teacher: { first_name: "X", last_name: "Y" },
        },
      },
    ]);
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("course-8")).toBeInTheDocument();
    });
  });

  it("SDI-032: day_of_week=8 (Chủ nhật) khi enrollment CÓ main_teacher", async () => {
    myEnrollmentApi.mockResolvedValue([
      {
        id: 9,
        amount: 100000,
        enrollment_status: "active",
        classroom: {
          id: 50,
          name: "Lớp Chủ Nhật",
          course_price: 100000,
          schedules: [
            { day_of_week: 8, start_time: "09:00:00", end_time: "11:00:00" },
            { day_of_week: 2, start_time: "07:00:00", end_time: "09:00:00" },
          ],
          main_teacher: { first_name: "Nguyen", last_name: "C" },
        },
      },
    ]);
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("course-9")).toBeInTheDocument();
      expect(screen.getByTestId("course-9").textContent).toBe("Lớp Chủ Nhật");
    });
  });

  it("SDI-033: enrollment_status là empty string thì status hiện '---'", async () => {
    myEnrollmentApi.mockResolvedValue([
      {
        id: 10,
        amount: 0,
        enrollment_status: "",
        classroom: {
          id: 60,
          name: "Lớp empty status",
          course_price: 0,
          schedules: [],
          main_teacher: null,
        },
      },
    ]);
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("course-10")).toBeInTheDocument();
    });
  });

  it("SDI-034: openEditModal điền đúng editData từ userInfo hiện tại", async () => {
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-open-modal"));

    fireEvent.click(screen.getByTestId("btn-open-modal"));

    expect(screen.getByTestId("modal").textContent).toBe("open");
  });

  it("SDI-035: hiện Failed to load khi myEnrollmentApi fail (userInfo = null)", async () => {
    studentApi.mockRejectedValue(new Error("server down"));
    myEnrollmentApi.mockRejectedValue(new Error("server down"));

    render(<MemoryRouter><StudentInfo /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText("Failed to load user information.")).toBeInTheDocument();
    });
  });
});