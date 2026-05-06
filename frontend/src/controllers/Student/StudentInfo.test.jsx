import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import StudentInfo from "./StudentInfo";
import {
  studentApi, updateStudentApi, updateStudentAvatarApi, myEnrollmentApi,
} from "../../services/studentService";

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
    vi.spyOn(window, "alert").mockImplementation(() => {});
    studentApi.mockResolvedValue(mockUser);
    myEnrollmentApi.mockResolvedValue(mockEnrollments);
  });

  afterEach(() => vi.restoreAllMocks());

  it("hiện Loading khi đang fetch", () => {
    studentApi.mockReturnValue(new Promise(() => {}));
    myEnrollmentApi.mockReturnValue(new Promise(() => {}));
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("hiện lỗi khi studentApi fail", async () => {
    studentApi.mockRejectedValue(new Error("fail"));
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText("Failed to load user information.")).toBeInTheDocument();
    });
  });

  it("render đúng fullName và học phí", async () => {
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("fullname").textContent).toBe("Nguyen Van A");
      expect(screen.getByTestId("paid").textContent).toContain("500.000");
      expect(screen.getByTestId("remaining").textContent).toContain("100.000");
    });
  });

  it("mở modal khi click Edit", async () => {
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-open-modal"));
    fireEvent.click(screen.getByTestId("btn-open-modal"));
    expect(screen.getByTestId("modal").textContent).toBe("open");
  });

  it("đóng modal khi click Close", async () => {
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-open-modal"));
    fireEvent.click(screen.getByTestId("btn-open-modal"));
    fireEvent.click(screen.getByTestId("btn-close-modal"));
    expect(screen.getByTestId("modal").textContent).toBe("closed");
  });

  it("handleSaveProfile gọi updateStudentApi và đóng modal", async () => {
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

  it("handleSaveProfile alert lỗi khi updateStudentApi fail", async () => {
    updateStudentApi.mockRejectedValue({ response: { data: { detail: "err" } } });
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-open-modal"));
    fireEvent.click(screen.getByTestId("btn-open-modal"));
    fireEvent.click(screen.getByTestId("btn-save"));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalled();
    });
  });

  it("handleAvatarChange gọi updateStudentAvatarApi", async () => {
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

  it("handleAvatarChange alert lỗi khi upload fail", async () => {
    updateStudentAvatarApi.mockRejectedValue({ response: { data: { detail: "upload fail" } } });
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-avatar"));
    fireEvent.click(screen.getByTestId("btn-avatar"));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining("upload fail"));
    });
  });

  it("render course từ enrollment", async () => {
    render(<MemoryRouter><StudentInfo /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("course-1").textContent).toBe("Lớp React");
    });
  });

  it("schedule với day_of_week=8 hiện Chủ nhật", async () => {
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
});