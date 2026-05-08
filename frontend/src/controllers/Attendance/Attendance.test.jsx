import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";

vi.mock("../../services/attendanceService", () => ({
  getSessionsApi: vi.fn(),
  getAttendancesApi: vi.fn(),
  bulkSyncAttendancesApi: vi.fn(),
}));

vi.mock("../../services/scoreService", () => ({
  loadClassesApi: vi.fn(),
}));

vi.mock("../../pages/Attendance/AttendanceForm", () => ({
  default: ({
    classes,
    sessions,
    students,
    selectedClass,
    selectedSession,
    onClassChange,
    onSessionChange,
    onStatusChange,
    onNoteChange,
    onSubmit,
    loading,
    error,
    canAttendance,
  }) => (
    <div>
      <select
        data-testid="class-select"
        value={selectedClass}
        onChange={(e) => onClassChange(e.target.value)}
      >
        <option value="">-- Chọn lớp --</option>
        {classes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* Session selector */}
      <select
        data-testid="session-select"
        value={selectedSession}
        onChange={(e) => onSessionChange(e.target.value)}
      >
        <option value="">-- Chọn buổi --</option>
        {sessions.map((s) => (
          <option key={s.id} value={s.id}>
            {s.date}
          </option>
        ))}
      </select>

      {/* States */}
      {loading && <div data-testid="loading">Đang tải...</div>}
      {error && <div data-testid="error">{error}</div>}
      {!canAttendance && (
        <div data-testid="cannot-attendance">Không thể điểm danh</div>
      )}

      {/* Student rows */}
      {students.map((s) => (
        <div key={s.enrollmentId} data-testid={`row-${s.enrollmentId}`}>
          <span data-testid={`name-${s.enrollmentId}`}>{s.fullName}</span>
          <span data-testid={`code-${s.enrollmentId}`}>{s.studentCode}</span>
          <select
            data-testid={`status-${s.enrollmentId}`}
            value={s.status}
            onChange={(e) => onStatusChange(s.enrollmentId, e.target.value)}
          >
            <option>Có mặt</option>
            <option>Vắng</option>
            <option>Trễ</option>
          </select>
          <input
            data-testid={`note-${s.enrollmentId}`}
            value={s.note}
            onChange={(e) => onNoteChange(s.enrollmentId, e.target.value)}
          />
        </div>
      ))}

      <button data-testid="btn-submit" onClick={onSubmit}>
        Lưu điểm danh
      </button>
    </div>
  ),
}));

import {
  getSessionsApi,
  getAttendancesApi,
  bulkSyncAttendancesApi,
} from "../../services/attendanceService";
import { loadClassesApi } from "../../services/scoreService";
import Attendance from "./Attendance";

const mockClasses = [
  { id: 1, name: "IELTS_01" },
  { id: 2, name: "TOEIC_01" },
];

const mockSessions = [
  { id: 10, date: "2024-01-15" },
  { id: 11, date: "2024-01-22" },
];

const mockAttendanceRes = {
  can_attendance: true,
  attendances: [
    {
      enrollment_id: 101,
      student_name: "An Nguyen",
      student_code: "SV001",
      attendance_status: "PRESENT",
      note: "",
    },
    {
      enrollment_id: 102,
      student_name: "Binh Tran",
      student_code: "SV002",
      attendance_status: "ABSENT",
      note: "Bận việc",
    },
  ],
};

beforeEach(() => {
  vi.resetAllMocks();
  loadClassesApi.mockResolvedValue({ results: mockClasses });
  getSessionsApi.mockResolvedValue(mockSessions);
  getAttendancesApi.mockResolvedValue(mockAttendanceRes);
  bulkSyncAttendancesApi.mockResolvedValue({});
  vi.spyOn(window, "alert").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

const selectClass = async (classId = "1") => {
  await waitFor(() => screen.getByText("IELTS_01"));
  fireEvent.change(screen.getByTestId("class-select"), {
    target: { value: classId },
  });
};

const selectSession = async (sessionId = "10") => {
  await waitFor(() => screen.getByText("2024-01-15"));
  fireEvent.change(screen.getByTestId("session-select"), {
    target: { value: sessionId },
  });
};

describe("1. Load classes khi mount", () => {
  it("gọi loadClassesApi và hiển thị danh sách lớp", async () => {
    render(<Attendance />);

    await waitFor(() => {
      expect(loadClassesApi).toHaveBeenCalled();
      expect(screen.getByText("IELTS_01")).toBeInTheDocument();
      expect(screen.getByText("TOEIC_01")).toBeInTheDocument();
    });
  });

  it("không gọi getSessionsApi khi chưa chọn lớp", async () => {
    render(<Attendance />);
    await waitFor(() => screen.getByText("IELTS_01"));

    expect(getSessionsApi).not.toHaveBeenCalled();
  });

  it("không gọi getAttendancesApi khi chưa chọn lớp", async () => {
    render(<Attendance />);
    await waitFor(() => screen.getByText("IELTS_01"));

    expect(getAttendancesApi).not.toHaveBeenCalled();
  });
});

describe("2. Chọn lớp", () => {
  it("gọi getSessionsApi với đúng classId", async () => {
    render(<Attendance />);
    await selectClass("1");

    await waitFor(() => {
      expect(getSessionsApi).toHaveBeenCalledWith("1");
    });
  });

  it("hiển thị danh sách buổi học sau khi chọn lớp", async () => {
    render(<Attendance />);
    await selectClass("1");

    await waitFor(() => {
      expect(screen.getByText("2024-01-15")).toBeInTheDocument();
      expect(screen.getByText("2024-01-22")).toBeInTheDocument();
    });
  });

  it("reset sessions và students khi đổi lớp", async () => {
    render(<Attendance />);
    await selectClass("1");
    await selectSession("10");
    await waitFor(() => screen.getByTestId("row-101"));

    // Đổi lớp → reset
    fireEvent.change(screen.getByTestId("class-select"), {
      target: { value: "2" },
    });

    await waitFor(() => {
      expect(screen.queryByTestId("row-101")).not.toBeInTheDocument();
    });
  });

  it("reset selectedSession khi đổi lớp", async () => {
    render(<Attendance />);
    await selectClass("1");
    await selectSession("10");

    fireEvent.change(screen.getByTestId("class-select"), {
      target: { value: "2" },
    });

    expect(screen.getByTestId("session-select").value).toBe("");
  });
});

describe("3. Chọn buổi học", () => {
  it("gọi getAttendancesApi với đúng sessionId", async () => {
    render(<Attendance />);
    await selectClass("1");
    await selectSession("10");

    await waitFor(() => {
      expect(getAttendancesApi).toHaveBeenCalledWith("10");
    });
  });

  it("hiển thị loading khi đang tải", async () => {
    let resolve;

    getAttendancesApi.mockImplementation(
      () =>
        new Promise((res) => {
          resolve = res;
        }),
    );

    render(<Attendance />);
    await selectClass("1");

    await waitFor(() => screen.getByText("2024-01-15"));

    await act(async () => {
      fireEvent.change(screen.getByTestId("session-select"), {
        target: { value: "10" },
      });
    });

    expect(screen.getByTestId("loading")).toBeInTheDocument();

    await act(async () => {
      resolve(mockAttendanceRes);
    });

    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });
  });

  it("hiển thị danh sách học sinh sau khi load", async () => {
    render(<Attendance />);
    await selectClass("1");
    await selectSession("10");

    await waitFor(() => {
      expect(screen.getByTestId("row-101")).toBeInTheDocument();
      expect(screen.getByTestId("name-101")).toHaveTextContent("An Nguyen");
      expect(screen.getByTestId("name-102")).toHaveTextContent("Binh Tran");
    });
  });

  it("convert PRESENT → 'Có mặt', ABSENT → 'Vắng' đúng", async () => {
    render(<Attendance />);
    await selectClass("1");
    await selectSession("10");

    await waitFor(() => {
      expect(screen.getByTestId("status-101")).toHaveValue("Có mặt");
      expect(screen.getByTestId("status-102")).toHaveValue("Vắng");
    });
  });

  it("hiển thị note từ server", async () => {
    render(<Attendance />);
    await selectClass("1");
    await selectSession("10");

    await waitFor(() => {
      expect(screen.getByTestId("note-102")).toHaveValue("Bận việc");
    });
  });

  it("set canAttendance theo res.can_attendance", async () => {
    getAttendancesApi.mockResolvedValue({
      ...mockAttendanceRes,
      can_attendance: false,
    });

    render(<Attendance />);
    await selectClass("1");
    await selectSession("10");

    await waitFor(() => {
      expect(screen.getByTestId("cannot-attendance")).toBeInTheDocument();
    });
  });

  it("reset canAttendance = true khi chọn buổi mới", async () => {
    getAttendancesApi.mockResolvedValue({
      ...mockAttendanceRes,
      can_attendance: false,
    });

    render(<Attendance />);
    await selectClass("1");
    await selectSession("10");

    await waitFor(() => screen.getByTestId("cannot-attendance"));

    getAttendancesApi.mockResolvedValue({
      ...mockAttendanceRes,
      can_attendance: true,
    });

    fireEvent.change(screen.getByTestId("session-select"), {
      target: { value: "11" },
    });

    await waitFor(() => {
      expect(screen.queryByTestId("cannot-attendance")).not.toBeInTheDocument();
    });
  });

  it("hiển thị lỗi khi getAttendancesApi thất bại", async () => {
    getAttendancesApi.mockRejectedValue(new Error("Network Error"));

    render(<Attendance />);
    await selectClass("1");
    await selectSession("10");

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent(
        "Không thể tải danh sách điểm danh.",
      );
    });
  });
});

describe("4. handleStatusChange", () => {
  const setup = async () => {
    render(<Attendance />);
    await selectClass("1");
    await selectSession("10");
    await waitFor(() => screen.getByTestId("row-101"));
  };

  it("cập nhật status khi chọn trạng thái mới", async () => {
    await setup();

    fireEvent.change(screen.getByTestId("status-101"), {
      target: { value: "Trễ" },
    });

    expect(screen.getByTestId("status-101")).toHaveValue("Trễ");
  });

  it("chỉ cập nhật đúng enrollment, không ảnh hưởng enrollment khác", async () => {
    await setup();

    fireEvent.change(screen.getByTestId("status-101"), {
      target: { value: "Vắng" },
    });

    expect(screen.getByTestId("status-102")).toHaveValue("Vắng"); // giá trị ban đầu
  });
});

describe("5. handleNoteChange", () => {
  const setup = async () => {
    render(<Attendance />);
    await selectClass("1");
    await selectSession("10");
    await waitFor(() => screen.getByTestId("row-101"));
  };

  it("cập nhật note khi nhập ghi chú", async () => {
    await setup();

    fireEvent.change(screen.getByTestId("note-101"), {
      target: { value: "Có phép" },
    });

    expect(screen.getByTestId("note-101")).toHaveValue("Có phép");
  });

  it("chỉ cập nhật đúng enrollment", async () => {
    await setup();

    fireEvent.change(screen.getByTestId("note-101"), {
      target: { value: "Ghi chú mới" },
    });

    // enrollment 102 giữ nguyên
    expect(screen.getByTestId("note-102")).toHaveValue("Bận việc");
  });
});

describe("6. handleSubmit", () => {
  const setup = async () => {
    render(<Attendance />);
    await selectClass("1");
    await selectSession("10");
    await waitFor(() => screen.getByTestId("row-101"));
  };

  it("alert khi chưa chọn lớp", async () => {
    render(<Attendance />);
    await waitFor(() => screen.getByText("IELTS_01"));

    fireEvent.click(screen.getByTestId("btn-submit"));

    expect(window.alert).toHaveBeenCalledWith("Vui lòng chọn lớp và buổi học.");
    expect(bulkSyncAttendancesApi).not.toHaveBeenCalled();
  });

  it("alert khi đã chọn lớp nhưng chưa chọn buổi", async () => {
    render(<Attendance />);
    await selectClass("1");

    fireEvent.click(screen.getByTestId("btn-submit"));

    expect(window.alert).toHaveBeenCalledWith("Vui lòng chọn lớp và buổi học.");
    expect(bulkSyncAttendancesApi).not.toHaveBeenCalled();
  });

  it("gọi bulkSyncAttendancesApi với đúng payload", async () => {
    await setup();

    fireEvent.click(screen.getByTestId("btn-submit"));

    await waitFor(() => {
      expect(bulkSyncAttendancesApi).toHaveBeenCalledWith("1", {
        session_id: 10,
        attendances: expect.arrayContaining([
          expect.objectContaining({
            enrollment_id: 101,
            attendance_status: "PRESENT",
          }),
          expect.objectContaining({
            enrollment_id: 102,
            attendance_status: "ABSENT",
            note: "Bận việc",
          }),
        ]),
      });
    });
  });

  it("convert FE status sang BE đúng trước khi gửi", async () => {
    await setup();

    // Đổi status 101 sang Trễ
    fireEvent.change(screen.getByTestId("status-101"), {
      target: { value: "Trễ" },
    });

    fireEvent.click(screen.getByTestId("btn-submit"));

    await waitFor(() => {
      expect(bulkSyncAttendancesApi).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({
          attendances: expect.arrayContaining([
            expect.objectContaining({
              enrollment_id: 101,
              attendance_status: "LATE", // "Trễ" → "LATE"
            }),
          ]),
        }),
      );
    });
  });

  it("alert thành công sau khi nộp", async () => {
    await setup();

    fireEvent.click(screen.getByTestId("btn-submit"));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Điểm danh thành công!");
    });
  });

  it("alert lỗi detail từ server khi thất bại", async () => {
    bulkSyncAttendancesApi.mockRejectedValue({
      response: { data: { detail: "Buổi học đã bị khóa" } },
    });
    await setup();

    fireEvent.click(screen.getByTestId("btn-submit"));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Buổi học đã bị khóa");
    });
  });

  it("alert lỗi mặc định khi server không trả detail", async () => {
    bulkSyncAttendancesApi.mockRejectedValue({ response: {} });
    await setup();

    fireEvent.click(screen.getByTestId("btn-submit"));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "Điểm danh thất bại, vui lòng thử lại.",
      );
    });
  });
});
