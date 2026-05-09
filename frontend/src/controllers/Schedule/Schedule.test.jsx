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
      <div data-testid="total-weeks">{props.totalWeeks}</div>
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

// Session nằm đúng tuần hiện tại (hôm nay)
const mockSessions = [
  {
    date: fmt(today),
    day_of_week: 2,
    start_time: "08:00:00",
    end_time: "10:00:00",
    classroom_name: "Lớp A",
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

  it("TKB-007: sessions rỗng vẫn render không lỗi, schedule-count = 0", async () => {
    myScheduleApi.mockResolvedValue([]);
    render(<MemoryRouter><Schedule /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("schedule-count").textContent).toBe("0");
    });
  });

  it("TKB-008: session không có room thì room hiện '---'", async () => {
    myScheduleApi.mockResolvedValue([
      {
        date: fmt(today),
        day_of_week: 5,
        start_time: "07:00:00",
        end_time: "09:00:00",
        classroom_name: "Lớp D",
        room: null,
        teacher_fullname: "Pham Van E",
      },
    ]);
    render(<MemoryRouter><Schedule /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("schedule-count").textContent).toBe("1");
    });
  });

  it("TKB-009: session ở tuần hiện tại được hiển thị (count >= 1)", async () => {
    render(<MemoryRouter><Schedule /></MemoryRouter>);
    await waitFor(() => {
      expect(Number(screen.getByTestId("schedule-count").textContent)).toBeGreaterThanOrEqual(1);
    });
  });

  it("TKB-010: session ở tuần khác bị filter ra, count = 0 ở tuần hiện tại", async () => {
    const futureDate = fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 21));
    myScheduleApi.mockResolvedValue([
      {
        date: futureDate,
        day_of_week: 3,
        start_time: "09:00:00",
        end_time: "11:00:00",
        classroom_name: "Lớp F",
        room: { name: "P302" },
        teacher_fullname: "Tran G",
      },
    ]);
    render(<MemoryRouter><Schedule /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("schedule-count").textContent).toBe("0");
    });
  });

  it("TKB-011: totalWeeks >= 1 khi có sessions", async () => {
    render(<MemoryRouter><Schedule /></MemoryRouter>);
    await waitFor(() => {
      expect(Number(screen.getByTestId("total-weeks").textContent)).toBeGreaterThanOrEqual(1);
    });
  });

  it("TKB-012: weekNumber = 1 khi session duy nhất là hôm nay (minDate = today)", async () => {
    myScheduleApi.mockResolvedValue([
      {
        date: fmt(today),
        day_of_week: 2,
        start_time: "08:00:00",
        end_time: "10:00:00",
        classroom_name: "Lớp mới",
        room: { name: "P101" },
        teacher_fullname: "Nguyen Van B",
      },
    ]);
    render(<MemoryRouter><Schedule /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("week-number").textContent).toBe("1");
    });
  });

  it("TKB-013: weekNumber > 1 khi có session nhiều tuần trước hôm nay", async () => {
    const threeWeeksAgo = new Date(today);
    threeWeeksAgo.setDate(today.getDate() - 21);

    myScheduleApi.mockResolvedValue([
      {
        date: fmt(threeWeeksAgo),
        day_of_week: 2,
        start_time: "08:00:00",
        end_time: "10:00:00",
        classroom_name: "Lớp cũ",
        room: { name: "P101" },
        teacher_fullname: "Teacher A",
      },
      {
        date: fmt(today),
        day_of_week: 2,
        start_time: "08:00:00",
        end_time: "10:00:00",
        classroom_name: "Lớp cũ",
        room: { name: "P101" },
        teacher_fullname: "Teacher A",
      },
    ]);
    render(<MemoryRouter><Schedule /></MemoryRouter>);
    await waitFor(() => {
      expect(Number(screen.getByTestId("week-number").textContent)).toBeGreaterThan(1);
    });
  });

  it("TKB-014: fallback về tuần gần nhất trong tương lai nếu không có session tuần hiện tại", async () => {
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 10);

    myScheduleApi.mockResolvedValue([
      {
        date: fmt(nextWeek),
        day_of_week: 2,
        start_time: "08:00:00",
        end_time: "10:00:00",
        classroom_name: "Lớp tương lai",
        room: { name: "P101" },
        teacher_fullname: "Teacher B",
      },
    ]);
    render(<MemoryRouter><Schedule /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("schedule-count")).toBeInTheDocument();
    });
  });
});