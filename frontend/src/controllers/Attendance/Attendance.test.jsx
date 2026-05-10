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

      {loading && <div data-testid="loading">Đang tải...</div>}
      {error && <div data-testid="error">{error}</div>}
      {!canAttendance && (
        <div data-testid="cannot-attendance">Không thể điểm danh</div>
      )}

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

const renderAndWait = async () => {
  render(<Attendance />);
  await waitFor(() => screen.getByText("IELTS_01"));
};

const selectClass = async (classId = "1") => {
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

const setup = async () => {
  await renderAndWait();
  selectClass("1");
  await selectSession("10");
  await waitFor(() => screen.getByTestId("row-101"));
};

beforeEach(() => {
  vi.resetAllMocks();
  loadClassesApi.mockResolvedValue({ results: mockClasses });
  getSessionsApi.mockResolvedValue(mockSessions);
  getAttendancesApi.mockResolvedValue(mockAttendanceRes);
  bulkSyncAttendancesApi.mockResolvedValue({});
  vi.spyOn(window, "alert").mockImplementation(() => {});
});

afterEach(() => vi.restoreAllMocks());

describe("1. Load classes khi mount", () => {
  it("ATT-001 gọi loadClassesApi, hiển thị danh sách lớp, chưa gọi sessions/attendances API", async () => {
    await renderAndWait();

    expect(loadClassesApi).toHaveBeenCalled();
    expect(screen.getByText("IELTS_01")).toBeInTheDocument();
    expect(screen.getByText("TOEIC_01")).toBeInTheDocument();

    expect(getSessionsApi).not.toHaveBeenCalled();
    expect(getAttendancesApi).not.toHaveBeenCalled();
  });
});

describe("2. Chọn lớp", () => {
  it("ATT-002 gọi getSessionsApi và hiển thị danh sách buổi học", async () => {
    await renderAndWait();
    selectClass("1");

    await waitFor(() => {
      expect(getSessionsApi).toHaveBeenCalledWith("1");
      expect(screen.getByText("2024-01-15")).toBeInTheDocument();
      expect(screen.getByText("2024-01-22")).toBeInTheDocument();
    });
  });

  it("ATT-003 đổi lớp thì reset rows học sinh và selectedSession về rỗng", async () => {
    await renderAndWait();
    selectClass("1");
    await selectSession("10");
    await waitFor(() => screen.getByTestId("row-101"));

    // Đổi sang lớp 2
    selectClass("2");

    await waitFor(() => {
      expect(screen.queryByTestId("row-101")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("session-select").value).toBe("");
  });
});

describe("3. Chọn buổi học", () => {
  it("ATT-004 gọi getAttendancesApi đúng sessionId và hiển thị tên, status, note học sinh", async () => {
    await renderAndWait();
    selectClass("1");
    await selectSession("10");

    await waitFor(() => {
      expect(getAttendancesApi).toHaveBeenCalledWith("10");

      // Tên
      expect(screen.getByTestId("name-101")).toHaveTextContent("An Nguyen");
      expect(screen.getByTestId("name-102")).toHaveTextContent("Binh Tran");

      // PRESENT → "Có mặt", ABSENT → "Vắng"
      expect(screen.getByTestId("status-101")).toHaveValue("Có mặt");
      expect(screen.getByTestId("status-102")).toHaveValue("Vắng");

      // Note từ server
      expect(screen.getByTestId("note-102")).toHaveValue("Bận việc");
    });
  });

  it("ATT-005 hiển thị loading khi đang tải, ẩn sau khi xong", async () => {
    let resolve;
    getAttendancesApi.mockImplementation(
      () => new Promise((res) => (resolve = res)),
    );

    await renderAndWait();
    selectClass("1");
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

  it("ATT-006 can_attendance=false thì hiển thị badge 'không thể điểm danh'", async () => {
    getAttendancesApi.mockResolvedValue({
      ...mockAttendanceRes,
      can_attendance: false,
    });

    await renderAndWait();
    selectClass("1");
    await selectSession("10");

    // Chờ data load xong (rows xuất hiện) rồi mới assert badge
    await waitFor(() => screen.getByTestId("row-101"));
    expect(screen.getByTestId("cannot-attendance")).toBeInTheDocument();
  });

  it("ATT-007 can_attendance=true thì không hiển thị badge 'không thể điểm danh'", async () => {
    // mockAttendanceRes mặc định đã có can_attendance: true
    await renderAndWait();
    selectClass("1");
    await selectSession("10");

    await waitFor(() => screen.getByTestId("row-101"));
    expect(screen.queryByTestId("cannot-attendance")).not.toBeInTheDocument();
  });

  it("ATT-008 reset canAttendance = true khi chọn buổi mới", async () => {
    // Buổi đầu: không thể điểm danh
    getAttendancesApi.mockResolvedValue({
      ...mockAttendanceRes,
      can_attendance: false,
    });

    await renderAndWait();
    selectClass("1");
    await selectSession("10");
    await waitFor(() => screen.getByTestId("cannot-attendance"));

    // Buổi mới: có thể điểm danh
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

  it("ATT-009 hiển thị lỗi khi getAttendancesApi thất bại", async () => {
    getAttendancesApi.mockRejectedValue(new Error("Network Error"));

    await renderAndWait();
    selectClass("1");
    await selectSession("10");

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent(
        "Không thể tải danh sách điểm danh.",
      );
    });
  });
});

describe("4. handleStatusChange", () => {
  it("ATT-010 cập nhật status đúng enrollment, không ảnh hưởng enrollment khác", async () => {
    await setup();

    fireEvent.change(screen.getByTestId("status-101"), {
      target: { value: "Trễ" },
    });

    // Enrollment 101 được cập nhật
    expect(screen.getByTestId("status-101")).toHaveValue("Trễ");
    // Enrollment 102 giữ nguyên giá trị ban đầu
    expect(screen.getByTestId("status-102")).toHaveValue("Vắng");
  });
});

describe("5. handleNoteChange", () => {
  it("ATT-011 cập nhật note đúng enrollment, không ảnh hưởng enrollment khác", async () => {
    await setup();

    fireEvent.change(screen.getByTestId("note-101"), {
      target: { value: "Có phép" },
    });

    // Enrollment 101 được cập nhật
    expect(screen.getByTestId("note-101")).toHaveValue("Có phép");
    // Enrollment 102 giữ nguyên
    expect(screen.getByTestId("note-102")).toHaveValue("Bận việc");
  });
});

describe("6. handleSubmit", () => {
  it.each([
    [
      "chưa chọn lớp lẫn buổi",
      async () => {
        await renderAndWait();
      },
    ],
    [
      "chọn lớp nhưng chưa chọn buổi",
      async () => {
        await renderAndWait();
        selectClass("1");
      },
    ],
  ])("ATT-012 %s thì alert và không gọi API", async (_label, doSetup) => {
    await doSetup();
    fireEvent.click(screen.getByTestId("btn-submit"));

    expect(window.alert).toHaveBeenCalledWith("Vui lòng chọn lớp và buổi học.");
    expect(bulkSyncAttendancesApi).not.toHaveBeenCalled();
  });

  it("ATT-013 happy path: gọi API đúng payload (kể cả convert status FE→BE), alert thành công", async () => {
    await setup();

    // Đổi status 101 sang "Trễ" để test convert FE→BE
    fireEvent.change(screen.getByTestId("status-101"), {
      target: { value: "Trễ" },
    });
    fireEvent.click(screen.getByTestId("btn-submit"));

    await waitFor(() => {
      expect(bulkSyncAttendancesApi).toHaveBeenCalledWith("1", {
        session_id: 10,
        attendances: expect.arrayContaining([
          // "Trễ" → "LATE"
          expect.objectContaining({
            enrollment_id: 101,
            attendance_status: "LATE",
          }),
          // 102 giữ nguyên "Vắng" → "ABSENT"
          expect.objectContaining({
            enrollment_id: 102,
            attendance_status: "ABSENT",
            note: "Bận việc",
          }),
        ]),
      });
      expect(window.alert).toHaveBeenCalledWith("Điểm danh thành công!");
    });
  });

  it.each([
    [
      { response: { data: { detail: "Buổi học đã bị khóa" } } },
      "Buổi học đã bị khóa",
    ],
    [{ response: {} }, "Điểm danh thất bại, vui lòng thử lại."],
  ])(
    "API thất bại với err=%o → alert đúng message",
    async (errPayload, expectedMsg) => {
      bulkSyncAttendancesApi.mockRejectedValue(errPayload);
      await setup();

      fireEvent.click(screen.getByTestId("btn-submit"));

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(expectedMsg);
      });
    },
  );
});
