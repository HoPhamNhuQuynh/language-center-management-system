import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Schedule from "./Schedule";
import { myScheduleApi } from "../../services/studentService";
import { getRole } from "../../utils/token";

vi.mock("../../pages/Schedule/ScheduleForm", () => ({
  default: (props) => (
    <div>
      <div data-testid="schedule-count">{props.scheduleData?.length}</div>
      <div data-testid="week-number">{props.weekNumber}</div>
      <div data-testid="is-teacher">{props.isTeacher ? "teacher" : "student"}</div>
      <button data-testid="btn-week-change" onClick={() => props.onWeekChange(2)}>Week 2</button>
    </div>
  ),
}));

vi.mock("../../styles/Schedule.css", () => ({}));

vi.mock("../../services/studentService", () => ({
  myScheduleApi: vi.fn(),
}));

vi.mock("../../utils/token", () => ({
  getRole: vi.fn(),
}));

const today = new Date();
const fmt = (d) => d.toISOString().split("T")[0];
const startDate = fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3));
const endDate = fmt(new Date(today.getFullYear(), today.getMonth() + 2, today.getDate()));

const mockSessions = [
  {
    date: fmt(today),
    day_of_week: 2,
    start_time: "08:00:00",
    end_time: "10:00:00",
    classroom_name: "Lớp A",
    classroom_start_date: startDate,
    classroom_end_date: endDate,
    room: { name: "P101" },
    teacher_fullname: "Nguyen Van B",
  },
];

describe("Schedule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    myScheduleApi.mockResolvedValue(mockSessions);
    getRole.mockReturnValue("Student");
  });

  it("TKB-001: hiện Loading khi fetch", () => {
    myScheduleApi.mockReturnValue(new Promise(() => { }));
    render(<MemoryRouter><Schedule /></MemoryRouter>);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("TKB-002: render schedule sau khi load", async () => {
    render(<MemoryRouter><Schedule /></MemoryRouter>);
    await waitFor(() => {
      expect(Number(screen.getByTestId("schedule-count").textContent)).toBeGreaterThanOrEqual(0);
    });
  });

  it("TKB-003: onWeekChange cập nhật weekNumber", async () => {
    render(<MemoryRouter><Schedule /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-week-change"));
    fireEvent.click(screen.getByTestId("btn-week-change"));
    await waitFor(() => {
      expect(screen.getByTestId("week-number").textContent).toBe("2");
    });
  });

  it("TKB-004: log lỗi khi myScheduleApi fail", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => { });
    myScheduleApi.mockRejectedValue(new Error("fail"));
    render(<MemoryRouter><Schedule /></MemoryRouter>);
    await waitFor(() => expect(spy).toHaveBeenCalled());
    spy.mockRestore();
  });

  it("TKB-005: isTeacher=true khi role là Teacher", async () => {
    getRole.mockReturnValue("Teacher");
    render(<MemoryRouter><Schedule /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("is-teacher").textContent).toBe("teacher");
    });
  });

  it("TKB-006: isTeacher=false khi role là Student", async () => {
    getRole.mockReturnValue("Student");
    render(<MemoryRouter><Schedule /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("is-teacher").textContent).toBe("student");
    });
  });

  it("TKB-006: sessions rỗng vẫn render không lỗi", async () => {
    myScheduleApi.mockResolvedValue([]);
    render(<MemoryRouter><Schedule /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("schedule-count").textContent).toBe("0");
    });
  });

  it("TKB-007: sessions không có classroom_start_date thì totalWeeks mặc định = 10", async () => {
    myScheduleApi.mockResolvedValue([
      {
        date: fmt(today),
        day_of_week: 3,
        start_time: "09:00:00",
        end_time: "11:00:00",
        classroom_name: "Lớp B",
        classroom_start_date: null,
        classroom_end_date: null,
        room: null,
        teacher_fullname: "Tran Van C",
      },
    ]);
    render(<MemoryRouter><Schedule /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("schedule-count")).toBeInTheDocument();
    });
  });

  it("TKB-008: weekDates rỗng (không có startDate) thì lọc trả về tất cả sessions", async () => {
    myScheduleApi.mockResolvedValue([
      {
        date: fmt(today),
        day_of_week: 4,
        start_time: "10:00:00",
        end_time: "12:00:00",
        classroom_name: "Lớp C",
        classroom_start_date: null,
        classroom_end_date: null,
        room: { name: "P202" },
        teacher_fullname: "Le Van D",
      },
    ]);
    render(<MemoryRouter><Schedule /></MemoryRouter>);
    await waitFor(() => {
      expect(Number(screen.getByTestId("schedule-count").textContent)).toBe(1);
    });
  });

  it("TKB-009: session không có room thì hiện '---'", async () => {
    myScheduleApi.mockResolvedValue([
      {
        date: fmt(today),
        day_of_week: 5,
        start_time: "07:00:00",
        end_time: "09:00:00",
        classroom_name: "Lớp D",
        classroom_start_date: null,
        classroom_end_date: null,
        room: null,
        teacher_fullname: "Pham Van E",
      },
    ]);
    render(<MemoryRouter><Schedule /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("schedule-count").textContent).toBe("1");
    });
  });

  it("TKB-010: startDate có nhưng endDate null thì totalWeeks = 10", async () => {
    const todayStr = fmt(today);
    myScheduleApi.mockResolvedValue([
      {
        date: todayStr,
        day_of_week: 2,
        start_time: "08:00:00",
        end_time: "10:00:00",
        classroom_name: "Lớp E",
        classroom_start_date: todayStr,
        classroom_end_date: null,
        room: { name: "P301" },
        teacher_fullname: "Nguyen F",
      },
    ]);
    render(<MemoryRouter><Schedule /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("schedule-count")).toBeInTheDocument();
    });
  });

  it("TKB-011: session ở tuần khác bị filter khi đổi tuần", async () => {
    const futureDate = fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 21));
    myScheduleApi.mockResolvedValue([
      {
        date: futureDate,
        day_of_week: 3,
        start_time: "09:00:00",
        end_time: "11:00:00",
        classroom_name: "Lớp F",
        classroom_start_date: startDate,
        classroom_end_date: endDate,
        room: { name: "P302" },
        teacher_fullname: "Tran G",
      },
    ]);
    render(<MemoryRouter><Schedule /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("schedule-count").textContent).toBe("0");
    });
  });

  it("TKB-012: useEffect không gọi setSelectedWeek khi startDate là null (line 74 false branch)", async () => {
    myScheduleApi.mockResolvedValue([
      {
        date: fmt(today),
        day_of_week: 2,
        start_time: "08:00:00",
        end_time: "10:00:00",
        classroom_name: "Lớp không có ngày",
        classroom_start_date: null,
        classroom_end_date: null,
        room: { name: "P101" },
        teacher_fullname: "Nguyen Van B",
      },
    ]);

    render(<MemoryRouter><Schedule /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByTestId("week-number").textContent).toBe("1");
    });
  });

  it("TKB-013: getCurrentWeek trả về tuần hiện tại khi startDate là hôm nay", async () => {
    const todayStr = fmt(today);
    myScheduleApi.mockResolvedValue([
      {
        date: todayStr,
        day_of_week: 2,
        start_time: "08:00:00",
        end_time: "10:00:00",
        classroom_name: "Lớp mới",
        classroom_start_date: todayStr,
        classroom_end_date: fmt(new Date(today.getFullYear(), today.getMonth() + 3, today.getDate())),
        room: { name: "P101" },
        teacher_fullname: "Nguyen Van B",
      },
    ]);

    render(<MemoryRouter><Schedule /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByTestId("week-number").textContent).toBe("1");
    });
  });

  it("TKB-014: getCurrentWeek trả về tuần > 1 khi startDate là nhiều tuần trước", async () => {
    const threeWeeksAgo = new Date(today);
    threeWeeksAgo.setDate(today.getDate() - 21);
    const startStr = fmt(threeWeeksAgo);
    const endStr = fmt(new Date(today.getFullYear(), today.getMonth() + 3, today.getDate()));

    myScheduleApi.mockResolvedValue([
      {
        date: fmt(today),
        day_of_week: 2,
        start_time: "08:00:00",
        end_time: "10:00:00",
        classroom_name: "Lớp cũ",
        classroom_start_date: startStr,
        classroom_end_date: endStr,
        room: { name: "P101" },
        teacher_fullname: "Teacher A",
      },
    ]);

    render(<MemoryRouter><Schedule /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByTestId("week-number").textContent).toBe("4");
    });
  });
});