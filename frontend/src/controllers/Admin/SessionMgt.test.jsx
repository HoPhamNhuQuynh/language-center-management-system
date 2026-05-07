import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  cleanup,
} from "@testing-library/react";

vi.mock("react-router-dom", () => ({
  useParams: () => ({ classId: "42" }),
}));

vi.mock("../../services/manageService", () => ({
  getSessionsByClass: vi.fn(),
  createSession: vi.fn(),
  updateSession: vi.fn(),
  deleteSession: vi.fn(),
  getRooms: vi.fn(),
  getTeachers: vi.fn(),
}));

vi.mock("../../utils/format", () => ({
  formatDate: vi.fn((d) => d ?? "—"),
}));

vi.mock("react-icons/fa6", () => ({ FaPen: () => <span>Edit</span> }));
vi.mock("react-icons/im", () => ({ ImBin2: () => <span>Delete</span> }));

vi.mock("react-datepicker", () => ({
  default: ({ selected, onChange, placeholderText }) => (
    <input
      data-testid="date-picker"
      placeholder={placeholderText}
      value={selected ? selected.toISOString().split("T")[0] : ""}
      onChange={(e) =>
        onChange(e.target.value ? new Date(e.target.value) : null)
      }
    />
  ),
}));

vi.mock("date-fns/locale", () => ({ vi: {} }));
vi.mock("react-datepicker/dist/react-datepicker.css", () => ({}));

import {
  getSessionsByClass,
  createSession,
  updateSession,
  deleteSession,
  getRooms,
  getTeachers,
} from "../../services/manageService";
import SessionManagement from "./SessionManagement";

const futureDate = "2099-12-31";
const pastDate = "2000-01-01";

const mockRooms = [
  { id: 1, name: "P.101" },
  { id: 2, name: "P.202" },
];
const mockTeachers = [
  { id: 10, last_name: "Nguyen", first_name: "An" },
  { id: 11, last_name: "Tran", first_name: "Binh" },
];

const makeSession = (overrides = {}) => ({
  id: 1,
  date: futureDate,
  start_time: "07:30:00",
  end_time: "09:30:00",
  room: { id: 1, name: "P.101" },
  teacher_fullname: "An Nguyen",
  active: true,
  created_at: "2024-01-01",
  user: 10,
  ...overrides,
});

const mockSessionsRes = (sessions = [makeSession()]) => ({
  sessions,
  classroom_name: "IELTS_01",
});

beforeEach(() => {
  vi.clearAllMocks();
  getSessionsByClass.mockResolvedValue(mockSessionsRes());
  getRooms.mockResolvedValue(mockRooms);
  getTeachers.mockResolvedValue(mockTeachers);
});

afterEach(() => cleanup());

const renderComp = () => render(<SessionManagement />);

const waitForLoad = () =>
  waitFor(() => expect(screen.getByText("IELTS_01")).toBeInTheDocument());

const openCreateModal = async () => {
  renderComp();
  await waitForLoad();
  fireEvent.click(screen.getByText("Tạo buổi học bù"));
  await waitFor(() => screen.getByText("TẠO BUỔI HỌC BÙ"));
};

const fillValidForm = () => {
  fireEvent.change(screen.getByTestId("date-picker"), {
    target: { value: futureDate },
  });
  fireEvent.change(screen.getByDisplayValue("-- Chọn phòng --"), {
    target: { value: "1" },
  });
};

describe("1. Load data khi mount", () => {
  it("gọi getSessionsByClass, getRooms, getTeachers với classId đúng", async () => {
    renderComp();

    await waitFor(() => {
      expect(getSessionsByClass).toHaveBeenCalledWith("42");
      expect(getRooms).toHaveBeenCalled();
      expect(getTeachers).toHaveBeenCalled();
    });
  });

  it("hiển thị tên lớp và số buổi học", async () => {
    renderComp();
    await waitForLoad();

    expect(screen.getByText("IELTS_01")).toBeInTheDocument();
    expect(screen.getByText("1 buổi học")).toBeInTheDocument();
  });

  it("hiển thị danh sách buổi học", async () => {
    renderComp();
    await waitForLoad();

    expect(screen.getByText("P.101")).toBeInTheDocument();
    expect(screen.getByText("An Nguyen")).toBeInTheDocument();
  });

  it("hiển thị 'Không có buổi học' khi danh sách rỗng", async () => {
    getSessionsByClass.mockResolvedValue(mockSessionsRes([]));
    renderComp();

    await waitFor(() => {
      expect(screen.getByText("Không có buổi học")).toBeInTheDocument();
    });
  });

  it("hiển thị 'Chưa phân công' khi teacher_fullname là null", async () => {
    getSessionsByClass.mockResolvedValue(
      mockSessionsRes([makeSession({ teacher_fullname: null })]),
    );
    renderComp();

    await waitFor(() => {
      expect(screen.getByText("Chưa phân công")).toBeInTheDocument();
    });
  });

  it("không crash khi getSessionsByClass thất bại", async () => {
    getSessionsByClass.mockRejectedValue(new Error("Network Error"));
    renderComp();

    await waitFor(() => {
      expect(screen.getByText("Tạo buổi học bù")).toBeInTheDocument();
    });
  });
});

describe("2. getStatusFromDate", () => {
  it("hiển thị 'Chưa diễn ra' cho buổi học tương lai", async () => {
    renderComp();
    await waitForLoad();

    expect(screen.getByText("Chưa diễn ra")).toBeInTheDocument();
  });

  it("hiển thị 'Đã hoàn thành' cho buổi học quá khứ", async () => {
    getSessionsByClass.mockResolvedValue(
      mockSessionsRes([makeSession({ date: pastDate })]),
    );
    renderComp();

    await waitFor(() => {
      expect(screen.getByText("Đã hoàn thành")).toBeInTheDocument();
    });
  });

  it("nút Edit bị disabled (opacity 0.4) cho buổi học quá khứ", async () => {
    getSessionsByClass.mockResolvedValue(
      mockSessionsRes([makeSession({ date: pastDate })]),
    );
    renderComp();
    await waitFor(() => screen.getByText("Edit"));

    const editIcon = screen.getByText("Edit").closest(".icon-edit");
    expect(editIcon).toHaveStyle({ opacity: 0.4 });
  });

  it("click Edit trên buổi học quá khứ không mở modal", async () => {
    getSessionsByClass.mockResolvedValue(
      mockSessionsRes([makeSession({ date: pastDate })]),
    );
    renderComp();
    await waitFor(() => screen.getByText("Edit"));

    fireEvent.click(screen.getByText("Edit"));

    expect(screen.queryByText("SỬA BUỔI HỌC")).not.toBeInTheDocument();
  });
});

describe("3. Modal tạo buổi học", () => {
  it("mở modal khi bấm 'Tạo buổi học bù'", async () => {
    await openCreateModal();
    expect(screen.getByText("TẠO BUỔI HỌC BÙ")).toBeInTheDocument();
  });

  it("đóng modal khi bấm nút X", async () => {
    await openCreateModal();

    fireEvent.click(document.querySelector(".modal-close-btn"));

    await waitFor(() => {
      expect(screen.queryByText("TẠO BUỔI HỌC BÙ")).not.toBeInTheDocument();
    });
  });

  it("đóng modal khi bấm Hủy", async () => {
    await openCreateModal();

    fireEvent.click(screen.getByText("Hủy"));

    await waitFor(() => {
      expect(screen.queryByText("TẠO BUỔI HỌC BÙ")).not.toBeInTheDocument();
    });
  });

  it("hiển thị danh sách phòng trong select", async () => {
    await openCreateModal();

    const roomSelect = screen.getByDisplayValue("-- Chọn phòng --");
    expect(roomSelect).toBeInTheDocument();
    expect(roomSelect).toContainHTML("P.101");
    expect(roomSelect).toContainHTML("P.202");
  });

  it("hiển thị danh sách giáo viên trong select", async () => {
    await openCreateModal();

    expect(screen.getByText("Nguyen An")).toBeInTheDocument();
    expect(screen.getByText("Tran Binh")).toBeInTheDocument();
  });
});

describe("4. Validate form", () => {
  it("hiển thị lỗi khi submit không có ngày và phòng", async () => {
    await openCreateModal();

    fireEvent.click(screen.getByText("Tạo mới"));

    await waitFor(() => {
      expect(screen.getByText("Vui lòng chọn ngày học")).toBeInTheDocument();
      expect(screen.getByText("Vui lòng chọn phòng học")).toBeInTheDocument();
    });

    expect(createSession).not.toHaveBeenCalled();
  });

  it("hiển thị lỗi chỉ thiếu phòng khi đã có ngày", async () => {
    await openCreateModal();

    fireEvent.change(screen.getByTestId("date-picker"), {
      target: { value: futureDate },
    });
    fireEvent.click(screen.getByText("Tạo mới"));

    await waitFor(() => {
      expect(
        screen.queryByText("Vui lòng chọn ngày học"),
      ).not.toBeInTheDocument();
      expect(screen.getByText("Vui lòng chọn phòng học")).toBeInTheDocument();
    });
  });

  it("lỗi validate bị xóa khi chọn phòng", async () => {
    await openCreateModal();

    fireEvent.click(screen.getByText("Tạo mới"));
    await waitFor(() => screen.getByText("Vui lòng chọn phòng học"));

    fireEvent.change(screen.getByDisplayValue("-- Chọn phòng --"), {
      target: { value: "1" },
    });

    await waitFor(() => {
      expect(
        screen.queryByText("Vui lòng chọn phòng học"),
      ).not.toBeInTheDocument();
    });
  });
});

describe("5. Tạo buổi học mới", () => {
  it("gọi createSession với payload đúng", async () => {
    createSession.mockResolvedValue({});
    await openCreateModal();
    fillValidForm();

    fireEvent.click(screen.getByText("Tạo mới"));

    await waitFor(() => {
      expect(createSession).toHaveBeenCalledWith(
        expect.objectContaining({
          classroom_id: "42",
          date: futureDate,
          start_time: "07:30",
          end_time: "09:30",
          room: "1",
        }),
      );
    });
  });

  it("gọi createSession với teacher = null khi không chọn giáo viên", async () => {
    createSession.mockResolvedValue({});
    await openCreateModal();
    fillValidForm();

    fireEvent.click(screen.getByText("Tạo mới"));

    await waitFor(() => {
      expect(createSession).toHaveBeenCalledWith(
        expect.objectContaining({ user: null }),
      );
    });
  });

  it("gọi createSession với teacher đúng khi chọn giáo viên", async () => {
    createSession.mockResolvedValue({});
    await openCreateModal();
    fillValidForm();

    fireEvent.change(screen.getByDisplayValue("-- Chọn giáo viên --"), {
      target: { value: "10" },
    });
    fireEvent.click(screen.getByText("Tạo mới"));

    await waitFor(() => {
      expect(createSession).toHaveBeenCalledWith(
        expect.objectContaining({ user: 10 }),
      );
    });
  });

  it("đóng modal và hiện toast sau khi tạo thành công", async () => {
    createSession.mockResolvedValue({});
    await openCreateModal();
    fillValidForm();

    fireEvent.click(screen.getByText("Tạo mới"));

    await waitFor(() => {
      expect(screen.queryByText("TẠO BUỔI HỌC BÙ")).not.toBeInTheDocument();
      expect(
        screen.getByText("Tạo buổi học bù thành công!"),
      ).toBeInTheDocument();
    });
  });

  it("hiện toast lỗi khi createSession thất bại", async () => {
    createSession.mockRejectedValue({
      response: { data: { message: "Phòng đã bị trùng" } },
    });
    await openCreateModal();
    fillValidForm();

    fireEvent.click(screen.getByText("Tạo mới"));

    await waitFor(() => {
      expect(screen.getByText("Phòng đã bị trùng")).toBeInTheDocument();
    });
  });

  it("hiện toast lỗi mặc định khi không có message từ server", async () => {
    createSession.mockRejectedValue({ response: { data: {} } });
    await openCreateModal();
    fillValidForm();

    fireEvent.click(screen.getByText("Tạo mới"));

    await waitFor(() => {
      expect(
        screen.getByText("Có lỗi xảy ra, vui lòng thử lại"),
      ).toBeInTheDocument();
    });
  });
});

describe("6. Sửa buổi học", () => {
  it("mở modal sửa với dữ liệu đúng", async () => {
    renderComp();
    await waitForLoad();

    fireEvent.click(screen.getByText("Edit"));

    await waitFor(() => {
      expect(screen.getByText("SỬA BUỔI HỌC")).toBeInTheDocument();
    });
  });

  it("gọi updateSession với đúng id và payload", async () => {
    updateSession.mockResolvedValue({});
    renderComp();
    await waitForLoad();

    fireEvent.click(screen.getByText("Edit"));
    await waitFor(() => screen.getByText("SỬA BUỔI HỌC"));

    fireEvent.click(screen.getByText("Cập nhật"));

    await waitFor(() => {
      expect(updateSession).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          date: futureDate,
          start_time: "07:30",
          end_time: "09:30",
          room: 1,
        }),
      );
    });
  });

  it("hiện toast 'Cập nhật buổi học thành công!' sau khi sửa", async () => {
    updateSession.mockResolvedValue({});
    renderComp();
    await waitForLoad();

    fireEvent.click(screen.getByText("Edit"));
    await waitFor(() => screen.getByText("SỬA BUỔI HỌC"));

    fireEvent.click(screen.getByText("Cập nhật"));

    await waitFor(() => {
      expect(
        screen.getByText("Cập nhật buổi học thành công!"),
      ).toBeInTheDocument();
    });
  });

  it("hiện toast lỗi khi updateSession thất bại", async () => {
    updateSession.mockRejectedValue({
      response: { data: { message: "Không thể cập nhật" } },
    });
    renderComp();
    await waitForLoad();

    fireEvent.click(screen.getByText("Edit"));
    await waitFor(() => screen.getByText("SỬA BUỔI HỌC"));

    fireEvent.click(screen.getByText("Cập nhật"));

    await waitFor(() => {
      expect(screen.getByText("Không thể cập nhật")).toBeInTheDocument();
    });
  });
});

describe("7. Xóa buổi học", () => {
  it("mở modal xác nhận với ngày đúng khi bấm Delete", async () => {
    renderComp();
    await waitForLoad();

    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() => {
      expect(screen.getByText("Xác nhận xóa")).toBeInTheDocument();
    });
  });

  it("click Hủy đóng modal, không gọi deleteSession", async () => {
    renderComp();
    await waitForLoad();

    fireEvent.click(screen.getByText("Delete"));
    await waitFor(() => screen.getByText("Xác nhận xóa"));

    fireEvent.click(screen.getByText("Hủy"));

    await waitFor(() => {
      expect(screen.queryByText("Xác nhận xóa")).not.toBeInTheDocument();
    });
    expect(deleteSession).not.toHaveBeenCalled();
  });

  it("gọi deleteSession đúng id và hiện toast khi xóa thành công", async () => {
    deleteSession.mockResolvedValue({});
    renderComp();
    await waitForLoad();

    fireEvent.click(screen.getByText("Delete"));
    await waitFor(() => screen.getByText("Xác nhận xóa"));

    fireEvent.click(screen.getByRole("button", { name: "Xóa" }));

    await waitFor(() => {
      expect(deleteSession).toHaveBeenCalledWith(1);
      expect(screen.getByText("Xóa buổi học thành công!")).toBeInTheDocument();
    });
  });

  it("đóng modal sau khi xóa thành công", async () => {
    deleteSession.mockResolvedValue({});
    renderComp();
    await waitForLoad();

    fireEvent.click(screen.getByText("Delete"));
    await waitFor(() => screen.getByText("Xác nhận xóa"));

    fireEvent.click(screen.getByRole("button", { name: "Xóa" }));

    await waitFor(() => {
      expect(screen.queryByText("Xác nhận xóa")).not.toBeInTheDocument();
    });
  });

  it("hiện lỗi trong modal khi deleteSession thất bại, không đóng", async () => {
    deleteSession.mockRejectedValue({
      response: { data: { message: "Buổi học đã có điểm danh" } },
    });
    renderComp();
    await waitForLoad();

    fireEvent.click(screen.getByText("Delete"));
    await waitFor(() => screen.getByText("Xác nhận xóa"));

    fireEvent.click(screen.getByRole("button", { name: "Xóa" }));

    await waitFor(() => {
      expect(screen.getByText(/Buổi học đã có điểm danh/)).toBeInTheDocument();
      expect(screen.getByText("Xác nhận xóa")).toBeInTheDocument();
    });
  });

  it("hiện lỗi mặc định khi server không trả message", async () => {
    deleteSession.mockRejectedValue({ response: { data: {} } });
    renderComp();
    await waitForLoad();

    fireEvent.click(screen.getByText("Delete"));
    await waitFor(() => screen.getByText("Xác nhận xóa"));

    fireEvent.click(screen.getByRole("button", { name: "Xóa" }));

    await waitFor(() => {
      expect(
        screen.getByText(/Xóa thất bại, vui lòng thử lại/),
      ).toBeInTheDocument();
    });
  });

  it("click Delete trên buổi học quá khứ không mở modal", async () => {
    getSessionsByClass.mockResolvedValue(
      mockSessionsRes([makeSession({ date: pastDate })]),
    );
    renderComp();
    await waitFor(() => screen.getByText("Delete"));

    fireEvent.click(screen.getByText("Delete"));

    expect(screen.queryByText("Xác nhận xóa")).not.toBeInTheDocument();
  });
});

describe("8. Toast tự ẩn sau 3 giây", () => {
  it("toast biến mất sau 3000ms", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    deleteSession.mockResolvedValue({});

    renderComp();
    await waitForLoad();

    fireEvent.click(screen.getByText("Delete"));
    await waitFor(() => screen.getByText("Xác nhận xóa"));
    fireEvent.click(screen.getByRole("button", { name: "Xóa" }));

    await waitFor(() =>
      expect(screen.getByText("Xóa buổi học thành công!")).toBeInTheDocument(),
    );

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(
      screen.queryByText("Xóa buổi học thành công!"),
    ).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});
