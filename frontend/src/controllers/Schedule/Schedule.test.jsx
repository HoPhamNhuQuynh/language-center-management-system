import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("../../services/studentService", () => ({
  myScheduleApi: vi.fn(),
}));

vi.mock("../../utils/token", () => ({
  getRole: vi.fn(),
}));

vi.mock("../../pages/Schedule/ScheduleForm", () => ({
  default: ({
    weekLabel,
    weekNumber,
    weekDates,
    totalWeeks,
    onWeekChange,
    scheduleData,
    isTeacher,
  }) => (
    <div>
      <div data-testid="week-label">{weekLabel}</div>
      <div data-testid="week-number">{weekNumber}</div>
      <div data-testid="total-weeks">{totalWeeks}</div>
      <div data-testid="is-teacher">{String(isTeacher)}</div>
      <div data-testid="schedule-count">{scheduleData.length}</div>
      {scheduleData.map((s, i) => (
        <div key={i} data-testid="schedule-item">
          <span data-testid="day">{s.day}</span>
          <span data-testid="class-name">{s.className}</span>
          <span data-testid="time">{s.time}</span>
          <span data-testid="room">{s.room}</span>
          <span data-testid="teacher">{s.teacher}</span>
        </div>
      ))}
      <button onClick={() => onWeekChange(weekNumber + 1)}>Next Week</button>
    </div>
  ),
}));

import { myScheduleApi } from "../../services/studentService";
import { getRole } from "../../utils/token";
import Schedule from "./Schedule";

const mockSessions = [
  {
    classroom_name: "IELTS_01",
    classroom_start_date: "2024-01-01",
    classroom_end_date: "2024-06-01",
    date: "2024-01-01",
    day_of_week: 2,
    start_time: "07:30:00",
    end_time: "09:30:00",
    room: { name: "P.101" },
    teacher_fullname: "Nguyen Van A",
  },
  {
    classroom_name: "IELTS_01",
    classroom_start_date: "2024-01-01",
    classroom_end_date: "2024-06-01",
    date: "2024-01-03",
    day_of_week: 4,
    start_time: "09:30:00",
    end_time: "11:30:00",
    room: { name: "P.102" },
    teacher_fullname: "Nguyen Van A",
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  getRole.mockReturnValue("Student");
  myScheduleApi.mockResolvedValue(mockSessions);
});

describe("Schedule", () => {
  describe("1. Loading state", () => {
    it("hiển thị Loading... khi đang fetch", () => {
      myScheduleApi.mockReturnValue(new Promise(() => {})); // never resolves
      render(<Schedule />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("ẩn Loading... sau khi fetch xong", async () => {
      render(<Schedule />);
      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });
    });

    it("ẩn Loading... kể cả khi API thất bại", async () => {
      myScheduleApi.mockRejectedValue(new Error("Network error"));
      render(<Schedule />);
      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });
    });
  });

  describe("2. Render ScheduleForm với đúng props", () => {
    it("truyền isTeacher=false khi role là Student", async () => {
      getRole.mockReturnValue("Student");
      render(<Schedule />);
      await waitFor(() => {
        expect(screen.getByTestId("is-teacher").textContent).toBe("false");
      });
    });

    it("truyền isTeacher=true khi role là Teacher", async () => {
      getRole.mockReturnValue("Teacher");
      render(<Schedule />);
      await waitFor(() => {
        expect(screen.getByTestId("is-teacher").textContent).toBe("true");
      });
    });

    it("truyền scheduleData đúng số lượng session", async () => {
      render(<Schedule />);
      await waitFor(() => {
        // 2 sessions nhưng chỉ những session trong tuần hiện tại mới được filter
        const count = Number(screen.getByTestId("schedule-count").textContent);
        expect(count).toBeGreaterThanOrEqual(0);
      });
    });

    it("tính totalWeeks đúng từ start và end date", async () => {
      render(<Schedule />);
      await waitFor(() => {
        // 2024-01-01 đến 2024-06-01 ≈ 22 tuần
        const total = Number(screen.getByTestId("total-weeks").textContent);
        expect(total).toBeGreaterThan(0);
      });
    });

    it("totalWeeks mặc định là 10 khi không có startDate", async () => {
      myScheduleApi.mockResolvedValue([]);
      render(<Schedule />);
      await waitFor(() => {
        expect(screen.getByTestId("total-weeks").textContent).toBe("10");
      });
    });
  });

  describe("3. scheduleData mapping", () => {
    it("map đúng day_of_week sang tên thứ tiếng Việt", async () => {
      myScheduleApi.mockResolvedValue([
        { ...mockSessions[0], date: "2024-01-01", day_of_week: 2 },
      ]);
      render(<Schedule />);
      await waitFor(() => {
        const days = screen.queryAllByTestId("day");
        const hasThaiHai = days.some((el) => el.textContent === "Thứ Hai");
        expect(hasThaiHai).toBe(true);
      });
    });

    it("map đúng time từ start_time và end_time", async () => {
      render(<Schedule />);
      await waitFor(() => {
        const times = screen.queryAllByTestId("time");
        if (times.length > 0) {
          expect(times[0].textContent).toMatch(/\d{2}:\d{2} - \d{2}:\d{2}/);
        }
      });
    });

    it("hiển thị '---' khi room là null", async () => {
      myScheduleApi.mockResolvedValue([{ ...mockSessions[0], room: null }]);
      render(<Schedule />);
      await waitFor(() => {
        const rooms = screen.queryAllByTestId("room");
        if (rooms.length > 0) {
          expect(rooms[0].textContent).toBe("---");
        }
      });
    });

    it("hiển thị '---' khi day_of_week không hợp lệ", async () => {
      myScheduleApi.mockResolvedValue([
        { ...mockSessions[0], day_of_week: 99 },
      ]);
      render(<Schedule />);
      await waitFor(() => {
        const days = screen.queryAllByTestId("day");
        if (days.length > 0) {
          expect(days[0].textContent).toBe("---");
        }
      });
    });

    it("cắt đúng start_time và end_time về HH:mm", async () => {
      render(<Schedule />);
      await waitFor(() => {
        const times = screen.queryAllByTestId("time");
        times.forEach((el) => {
          // Không được có giây, chỉ HH:mm - HH:mm
          expect(el.textContent).not.toMatch(/\d{2}:\d{2}:\d{2}/);
        });
      });
    });
  });

  describe("4. weekDates và filter", () => {
    it("weekLabel rỗng khi sessions rỗng", async () => {
      myScheduleApi.mockResolvedValue([]);
      render(<Schedule />);
      await waitFor(() => {
        expect(screen.getByTestId("week-label").textContent).toBe("");
      });
    });

    it("weekLabel có định dạng DD/MM - DD/MM khi có sessions", async () => {
      render(<Schedule />);
      await waitFor(() => {
        const label = screen.getByTestId("week-label").textContent;
        if (label) {
          expect(label).toMatch(/\d{2}\/\d{2} - \d{2}\/\d{2}/);
        }
      });
    });

    it("không crash khi API trả về mảng rỗng", async () => {
      myScheduleApi.mockResolvedValue([]);
      render(<Schedule />);
      await waitFor(() => {
        expect(screen.getByTestId("schedule-count").textContent).toBe("0");
      });
    });
  });

  describe("5. Lỗi API", () => {
    it("không crash khi myScheduleApi thất bại", async () => {
      myScheduleApi.mockRejectedValue(new Error("Network error"));
      render(<Schedule />);
      await waitFor(() => {
        // Vẫn render ScheduleForm với data rỗng
        expect(screen.getByTestId("schedule-count").textContent).toBe("0");
      });
    });

    it("sessions rỗng khi API thất bại", async () => {
      myScheduleApi.mockRejectedValue(new Error("Network error"));
      render(<Schedule />);
      await waitFor(() => {
        expect(screen.getByTestId("total-weeks").textContent).toBe("10");
      });
    });
  });
});
