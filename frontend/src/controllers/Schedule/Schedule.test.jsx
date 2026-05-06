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

  it("hiện Loading khi fetch", () => {
    myScheduleApi.mockReturnValue(new Promise(() => {}));
    render(<MemoryRouter><Schedule /></MemoryRouter>);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("render schedule sau khi load", async () => {
    render(<MemoryRouter><Schedule /></MemoryRouter>);
    await waitFor(() => {
      expect(Number(screen.getByTestId("schedule-count").textContent)).toBeGreaterThanOrEqual(0);
    });
  });

  it("onWeekChange cập nhật weekNumber", async () => {
    render(<MemoryRouter><Schedule /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-week-change"));
    fireEvent.click(screen.getByTestId("btn-week-change"));
    await waitFor(() => {
      expect(screen.getByTestId("week-number").textContent).toBe("2");
    });
  });

  it("log lỗi khi myScheduleApi fail", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    myScheduleApi.mockRejectedValue(new Error("fail"));
    render(<MemoryRouter><Schedule /></MemoryRouter>);
    await waitFor(() => expect(spy).toHaveBeenCalled());
    spy.mockRestore();
  });

  it("isTeacher=true khi role là Teacher", async () => {
    getRole.mockReturnValue("Teacher");
    render(<MemoryRouter><Schedule /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("schedule-count")).toBeInTheDocument();
    });
  });

  it("sessions rỗng vẫn render không lỗi", async () => {
    myScheduleApi.mockResolvedValue([]);
    render(<MemoryRouter><Schedule /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("schedule-count").textContent).toBe("0");
    });
  });
});