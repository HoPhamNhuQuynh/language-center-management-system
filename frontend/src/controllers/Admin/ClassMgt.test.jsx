import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("../../services/manageService", () => ({
  getClasses: vi.fn(),
  getAllCourses: vi.fn(),
  getTeachers: vi.fn(),
  getRooms: vi.fn(),
  createClass: vi.fn(),
  updateClass: vi.fn(),
  deleteClass: vi.fn(),
}));

vi.mock("../../utils/format", () => ({
  formatDate: vi.fn((d) => d ?? "—"),
}));

vi.mock("react-icons/fa6", () => ({ FaPen: () => <span>Edit</span> }));
vi.mock("react-icons/im", () => ({ ImBin2: () => <span>Delete</span> }));

vi.mock("react-datepicker", () => ({
  default: ({ placeholderText, onChange }) => (
    <input
      placeholder={placeholderText}
      onChange={(e) => onChange?.(new Date(e.target.value))}
    />
  ),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

import {
  getClasses,
  getAllCourses,
  getTeachers,
  getRooms,
  createClass,
  updateClass,
  deleteClass,
} from "../../services/manageService";
import ClassManagement from "./ClassManagement";

const mockClasses = [
  {
    id: 1,
    name: "IELTS_01",
    active: true,
    course_id: 1,
    course_name: "IELTS Basic",
    capacity: 20,
    remaining_slots: 5,
    main_teacher: { id: 1, first_name: "An", last_name: "Nguyen" },
    start_date: "2024-01-01",
    end_date: "2024-06-01",
    created_at: "2024-01-01",
    schedules: [],
  },
  {
    id: 2,
    name: "TOEIC_01",
    active: false,
    course_id: 2,
    course_name: "TOEIC",
    capacity: 30,
    remaining_slots: 0,
    main_teacher: null,
    start_date: "2024-02-01",
    end_date: "2024-07-01",
    created_at: "2024-01-15",
    schedules: [],
  },
];

const mockCourses = [
  { id: 1, name: "IELTS Basic" },
  { id: 2, name: "TOEIC" },
];
const mockTeachers = [{ id: 1, first_name: "An", last_name: "Nguyen" }];
const mockRooms = [
  { id: 1, name: "P.101" },
  { id: 2, name: "P.102" },
];

const renderComponent = () =>
  render(
    <MemoryRouter>
      <ClassManagement />
    </MemoryRouter>,
  );

const openCreateModal = async () => {
  fireEvent.click(screen.getByText("Thêm"));

  await waitFor(() => {
    expect(screen.getByText("THÊM LỚP HỌC MỚI")).toBeInTheDocument();
  });
};

const fillDates = (start, end) => {
  const dateInputs = screen.getAllByPlaceholderText("DD/MM/YYYY");

  fireEvent.change(dateInputs[0], {
    target: { value: start },
  });

  fireEvent.change(dateInputs[1], {
    target: { value: end },
  });
};

const fillBasicForm = async ({
  name = "IELTS_02",
  course = "1",
  capacity = "20",
  start = "2024-01-01",
  end = "2024-06-01",
} = {}) => {
  fireEvent.change(document.querySelector('input[name="name"]'), {
    target: { value: name },
  });

  fireEvent.change(document.querySelector('select[name="course"]'), {
    target: { value: course },
  });

  fireEvent.change(document.querySelector('input[name="capacity"]'), {
    target: { value: capacity },
  });

  fillDates(start, end);
};

const addSchedule = async ({
  day = "Thứ 2",
  room = "1",
  time = "07:30-09:30",
} = {}) => {
  fireEvent.click(screen.getByRole("button", { name: day }));

  await waitFor(() => {
    expect(screen.getAllByRole("combobox").length).toBeGreaterThan(0);
  });

  const selects = document.querySelectorAll("select");

  fireEvent.change(selects[selects.length - 2], {
    target: { value: time },
  });

  fireEvent.change(selects[selects.length - 1], {
    target: { value: room },
  });
};

const submitForm = () => {
  fireEvent.click(screen.getByText("Lưu"));
};

describe("ClassManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getClasses.mockResolvedValue({
      results: mockClasses,
      count: mockClasses.length,
    });

    getAllCourses.mockResolvedValue(mockCourses);
    getTeachers.mockResolvedValue(mockTeachers);
    getRooms.mockResolvedValue(mockRooms);
  });

  describe("1. load danh sách", () => {
    it("CLS-001 hiển thị danh sách lớp học sau khi load", async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("IELTS_01")).toBeInTheDocument();
      });
    });

    it("CLS-002 gọi đủ 4 API khi khởi tạo", async () => {
      renderComponent();

      await waitFor(() => {
        expect(getClasses).toHaveBeenCalled();
        expect(getAllCourses).toHaveBeenCalled();
        expect(getTeachers).toHaveBeenCalled();
        expect(getRooms).toHaveBeenCalled();
      });
    });

    it("CLS-003 hiển thị trạng thái đúng", async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Đang hoạt động")).toBeInTheDocument();
        expect(screen.getByText("Không hoạt động")).toBeInTheDocument();
      });
    });

    it("CLS-004 hiển thị — khi không có giáo viên chính", async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("—")).toBeInTheDocument();
      });
    });
  });

  describe("2. navigate", () => {
    it("CLS-005 navigate đến trang session khi click tên lớp", async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("IELTS_01")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("IELTS_01"));

      expect(mockNavigate).toHaveBeenCalledWith("/session-config/1");
    });
  });

  describe("3. validate form", () => {
    it("CLS-006 hiển thị lỗi khi submit form trống", async () => {
      renderComponent();

      await openCreateModal();

      submitForm();

      await waitFor(() => {
        expect(
          screen.getByText("Vui lòng nhập tên lớp học"),
        ).toBeInTheDocument();

        expect(screen.getByText("Vui lòng chọn khóa học")).toBeInTheDocument();

        expect(
          screen.getByText("Vui lòng nhập sĩ số tối đa"),
        ).toBeInTheDocument();
        expect(
          screen.getByText("Vui lòng chọn ít nhất một ngày học"),
        ).toBeInTheDocument();
      });
    });

    it("CLS-007 hiển thị lỗi khi sĩ số dưới 10 học viên", async () => {
      renderComponent();

      await openCreateModal();

      await fillBasicForm({
        capacity: "5",
      });

      submitForm();

      await waitFor(() => {
        expect(
          screen.getByText("Sĩ số phải từ 10 đến 50 học viên"),
        ).toBeInTheDocument();
      });
    });

    it("CLS-008 hiển thị lỗi khi sĩ số vượt quá 50", async () => {
      renderComponent();

      await openCreateModal();

      await fillBasicForm({
        capacity: "100",
      });

      submitForm();

      await waitFor(() => {
        expect(
          screen.getByText("Sĩ số phải từ 10 đến 50 học viên"),
        ).toBeInTheDocument();
      });
    });

    it("CLS-009 không báo lỗi khi sĩ số đúng biên 10", async () => {
      createClass.mockResolvedValue({});
      renderComponent();

      fireEvent.click(screen.getByText("Thêm"));
      await waitFor(() => screen.getByText("THÊM LỚP HỌC MỚI"));

      fireEvent.change(document.querySelector('input[name="capacity"]'), {
        target: { value: "10" },
      });
      fireEvent.click(screen.getByText("Lưu"));

      await waitFor(() => {
        expect(
          screen.queryByText("Sĩ số phải từ 10 đến 50 học viên"),
        ).not.toBeInTheDocument();
      });
    });

    it("CLS-010 hiển thị lỗi khi ngày kết thúc trước ngày khai giảng", async () => {
      renderComponent();

      await openCreateModal();

      await fillBasicForm({
        start: "2024-06-01",
        end: "2024-06-01",
      });

      submitForm();

      await waitFor(() => {
        expect(
          screen.getByText("Ngày kết thúc phải sau ngày khai giảng"),
        ).toBeInTheDocument();
      });
    });

    it("CLS-011 hiển thị lỗi khi chọn ngày học nhưng chưa chọn phòng", async () => {
      renderComponent();

      await openCreateModal();

      await fillBasicForm();

      fireEvent.click(
        screen.getByRole("button", {
          name: "Thứ 2",
        }),
      );

      submitForm();

      await waitFor(() => {
        expect(
          screen.getByText("Vui lòng chọn phòng học cho tất cả các ngày"),
        ).toBeInTheDocument();
      });
    });

    it("CLS-012 có thể chọn nhiều ngày học", async () => {
      renderComponent();
      fireEvent.click(screen.getByText("Thêm"));
      await waitFor(() => screen.getByRole("button", { name: "Thứ 2" }));

      fireEvent.click(screen.getByRole("button", { name: "Thứ 2" }));
      fireEvent.click(screen.getByRole("button", { name: "Thứ 4" }));
      fireEvent.click(screen.getByRole("button", { name: "Thứ 6" }));

      await waitFor(() => {
        expect(screen.getAllByText("Thứ 2").length).toBe(2);
        expect(screen.getAllByText("Thứ 4").length).toBe(2);
        expect(screen.getAllByText("Thứ 6").length).toBe(2);
      });
    });
  });

  describe("4. toggleDay", () => {
    it("CLS-013 chọn và bỏ chọn ngày học", async () => {
      renderComponent();

      await waitFor(() => screen.getByText("Thêm"));
      fireEvent.click(screen.getByText("Thêm"));

      await waitFor(() => screen.getByRole("button", { name: "Thứ 2" }));

      fireEvent.click(screen.getByRole("button", { name: "Thứ 2" }));

      await waitFor(() => {
        const spans = screen.getAllByText("Thứ 2");
        expect(spans.length).toBe(2);
      });

      fireEvent.click(screen.getByRole("button", { name: "Thứ 2" }));

      await waitFor(() => {
        const spans = screen.getAllByText("Thứ 2");
        expect(spans.length).toBe(1);
      });
    });
  });

  describe("5. handleDelete", () => {
    it("CLS-014 mở modal xác nhận khi bấm Delete", async () => {
      renderComponent();

      await waitFor(() => screen.getAllByText("Delete"));
      fireEvent.click(screen.getAllByText("Delete")[0]);

      await waitFor(() => {
        expect(screen.getByText("Xác nhận xóa")).toBeInTheDocument();
        expect(screen.getByText('"IELTS_01"')).toBeInTheDocument();
      });
    });

    it("CLS-015 gọi deleteClass và hiển thị toast thành công", async () => {
      deleteClass.mockResolvedValue({});
      renderComponent();

      await waitFor(() => screen.getAllByText("Delete"));
      fireEvent.click(screen.getAllByText("Delete")[0]);

      await waitFor(() => screen.getByText("Xóa"));
      fireEvent.click(screen.getByText("Xóa"));

      await waitFor(() => {
        expect(deleteClass).toHaveBeenCalledWith(1);
        expect(screen.getByText("Xóa lớp học thành công!")).toBeInTheDocument();
      });
    });

    it("CLS-016 hiển thị lỗi trong modal khi deleteClass thất bại", async () => {
      deleteClass.mockRejectedValue({
        response: { data: ["Lớp học đang có học viên"] },
      });
      renderComponent();

      await waitFor(() => screen.getAllByText("Delete"));
      fireEvent.click(screen.getAllByText("Delete")[0]);

      await waitFor(() => screen.getByText("Xóa"));
      fireEvent.click(screen.getByText("Xóa"));

      await waitFor(() => {
        expect(screen.getByText("⚠️")).toBeInTheDocument();
        expect(
          screen.getByText("Lớp học đang có học viên"),
        ).toBeInTheDocument();
      });
    });

    it("CLS-017 đóng modal khi bấm Hủy", async () => {
      renderComponent();

      await waitFor(() => screen.getAllByText("Delete"));
      fireEvent.click(screen.getAllByText("Delete")[0]);

      await waitFor(() => screen.getByText("Xác nhận xóa"));
      fireEvent.click(screen.getByText("Hủy"));
      expect(deleteClass).not.toHaveBeenCalled();

      await waitFor(() => {
        expect(screen.queryByText("Xác nhận xóa")).not.toBeInTheDocument();
      });
    });

    it("CLS-018 toast tự ẩn sau 3 giây", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      deleteClass.mockResolvedValue({});
      renderComponent();

      await waitFor(() => screen.getAllByText("Delete"));
      fireEvent.click(screen.getAllByText("Delete")[0]);
      await waitFor(() => screen.getByText("Xóa"));
      fireEvent.click(screen.getByText("Xóa"));

      await waitFor(() =>
        expect(screen.getByText("Xóa lớp học thành công!")).toBeInTheDocument(),
      );

      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      expect(
        screen.queryByText("Xóa lớp học thành công!"),
      ).not.toBeInTheDocument();
      vi.useRealTimers();
    });

    it("CLS-019 hiển thị lỗi mặc định khi deleteClass thất bại không có message", async () => {
      deleteClass.mockRejectedValue({ response: { data: {} } });
      renderComponent();

      await waitFor(() => screen.getAllByText("Delete"));
      fireEvent.click(screen.getAllByText("Delete")[0]);
      await waitFor(() => screen.getByText("Xóa"));
      fireEvent.click(screen.getByText("Xóa"));

      await waitFor(() => {
        expect(
          screen.getByText("Xóa thất bại, vui lòng thử lại."),
        ).toBeInTheDocument();
      });
    });
  });

  describe("6. handleSave - tạo mới", () => {
    it("CLS-020 gọi createClass với payload đúng khi form hợp lệ", async () => {
      createClass.mockResolvedValue({});

      renderComponent();

      await openCreateModal();

      await fillBasicForm();

      await addSchedule();

      submitForm();

      await waitFor(() => {
        expect(createClass).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "IELTS_02",
            course: "1",
            capacity: "20",
            schedules_input: [
              {
                day_of_week: 0,
                start_time: "07:30",
                end_time: "09:30",
                room: "1",
              },
            ],
          }),
        );

        expect(
          screen.getByText("Thêm lớp học thành công!"),
        ).toBeInTheDocument();
      });
    });

    it("CLS-021 hiển thị lỗi general khi server trả về array", async () => {
      createClass.mockRejectedValue({
        response: { data: ["Dữ liệu không hợp lệ"] },
      });
      renderComponent();

      fireEvent.click(screen.getByText("Thêm"));
      await waitFor(() => screen.getByText("THÊM LỚP HỌC MỚI"));

      fireEvent.change(document.querySelector('input[name="name"]'), {
        target: { value: "IELTS_01" },
      });
      fireEvent.change(document.querySelector('select[name="course"]'), {
        target: { value: "1" },
      });
      fireEvent.change(document.querySelector('input[name="capacity"]'), {
        target: { value: "20" },
      });

      const datePickers = document.querySelectorAll(
        'input[placeholder="DD/MM/YYYY"]',
      );
      fireEvent.change(datePickers[0], { target: { value: "2024-01-01" } });
      fireEvent.change(datePickers[1], { target: { value: "2024-06-01" } });

      fireEvent.click(screen.getByText("Thứ 2"));
      await waitFor(() => document.querySelectorAll("select"));
      const roomSelects = document.querySelectorAll("select");
      fireEvent.change(roomSelects[roomSelects.length - 1], {
        target: { value: "1" },
      });

      fireEvent.click(screen.getByText("Lưu"));

      await waitFor(() => {
        expect(screen.getByText("Dữ liệu không hợp lệ")).toBeInTheDocument();
      });
    });

    it("CLS-022 disable nút lưu khi saving", async () => {
      createClass.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000)),
      );

      renderComponent();

      await openCreateModal();

      await fillBasicForm();

      await addSchedule();

      submitForm();

      expect(screen.getByText("Đang lưu...")).toBeDisabled();
    });

    it("CLS-023 hiển thị lỗi server", async () => {
      createClass.mockRejectedValue({
        response: {
          data: {
            name: ["Tên lớp đã tồn tại"],
          },
        },
      });

      renderComponent();

      await openCreateModal();

      await fillBasicForm();

      await addSchedule();

      submitForm();

      await waitFor(() => {
        expect(screen.getByText("Tên lớp đã tồn tại")).toBeInTheDocument();
      });
    });

    it("CLS-024 payload schedules_input đúng cấu trúc khi tạo mới", async () => {
      createClass.mockResolvedValue({});
      renderComponent();

      fireEvent.click(screen.getByText("Thêm"));
      await waitFor(() => screen.getByText("THÊM LỚP HỌC MỚI"));

      fireEvent.change(document.querySelector('input[name="name"]'), {
        target: { value: "IELTS_02" },
      });
      fireEvent.change(document.querySelector('select[name="course"]'), {
        target: { value: "1" },
      });
      fireEvent.change(document.querySelector('input[name="capacity"]'), {
        target: { value: "20" },
      });

      const datePickers = document.querySelectorAll(
        'input[placeholder="DD/MM/YYYY"]',
      );
      fireEvent.change(datePickers[0], { target: { value: "2024-01-01" } });
      fireEvent.change(datePickers[1], { target: { value: "2024-06-01" } });

      fireEvent.click(screen.getByText("Thứ 2"));
      await waitFor(() => document.querySelectorAll("select"));
      const roomSelects = document.querySelectorAll("select");
      fireEvent.change(roomSelects[roomSelects.length - 1], {
        target: { value: "1" },
      });

      fireEvent.click(screen.getByText("Lưu"));

      await waitFor(() => {
        expect(createClass).toHaveBeenCalledWith(
          expect.objectContaining({
            schedules_input: [
              expect.objectContaining({
                day_of_week: 0,
                start_time: "07:30",
                end_time: "09:30",
                room: "1",
              }),
            ],
          }),
        );
      });
    });
  });

  describe("7. handleEdit", () => {
    it("CLS-025 mở modal sửa với dữ liệu đúng khi bấm Edit", async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getAllByText("Edit").length).toBeGreaterThan(0);
      });

      fireEvent.click(screen.getAllByText("Edit")[0]);

      await waitFor(() => {
        expect(document.querySelector('input[name="name"]').value).toBe(
          "IELTS_01",
        );
      });
    });

    it("CLS-026 hiển thị lỗi general khi updateClass thất bại", async () => {
      updateClass.mockRejectedValue({
        response: { data: { name: ["Tên lớp đã tồn tại"] } },
      });
      renderComponent();

      await waitFor(() => screen.getAllByText("Edit"));
      fireEvent.click(screen.getAllByText("Edit")[0]);
      await waitFor(() => screen.getByText("SỬA LỚP HỌC"));

      fireEvent.click(screen.getByText("Thứ 2"));
      await waitFor(() => document.querySelectorAll("select"));
      const roomSelects = document.querySelectorAll("select");
      fireEvent.change(roomSelects[roomSelects.length - 1], {
        target: { value: "1" },
      });

      fireEvent.click(screen.getByText("Lưu"));

      await waitFor(() => {
        expect(screen.getByText("Tên lớp đã tồn tại")).toBeInTheDocument();
      });
    });

    it("CLS-027 cập nhật khung giờ khi thay đổi select giờ", async () => {
      renderComponent();
      fireEvent.click(screen.getByText("Thêm"));
      await waitFor(() => screen.getByRole("button", { name: "Thứ 2" }));

      fireEvent.click(screen.getByRole("button", { name: "Thứ 2" }));
      await waitFor(() => screen.getAllByRole("combobox"));

      const selects = document.querySelectorAll("select");
      fireEvent.change(selects[selects.length - 2], {
        target: { value: "09:30-11:30" },
      });

      expect(selects[selects.length - 2].value).toBe("09:30-11:30");
    });

    it("CLS-028 form reset về rỗng sau khi đóng modal sửa", async () => {
      renderComponent();

      await waitFor(() => screen.getAllByText("Edit"));
      fireEvent.click(screen.getAllByText("Edit")[0]);
      await waitFor(() => screen.getByText("SỬA LỚP HỌC"));

      fireEvent.click(screen.getByText("Hủy"));
      await waitFor(() =>
        expect(screen.queryByText("SỬA LỚP HỌC")).not.toBeInTheDocument(),
      );

      fireEvent.click(screen.getByText("Thêm"));
      await waitFor(() => screen.getByText("THÊM LỚP HỌC MỚI"));

      expect(document.querySelector('input[name="name"]').value).toBe("");
    });
  });

  describe("8. handleClose", () => {
    it("CLS-029 đóng modal khi bấm Hủy", async () => {
      renderComponent();

      await waitFor(() => screen.getByText("Thêm"));
      fireEvent.click(screen.getByText("Thêm"));

      await waitFor(() => screen.getByText("THÊM LỚP HỌC MỚI"));
      fireEvent.click(screen.getByText("Hủy"));

      await waitFor(() => {
        expect(screen.queryByText("THÊM LỚP HỌC MỚI")).not.toBeInTheDocument();
      });
    });

    it("CLS-030 đóng modal khi bấm nút X", async () => {
      renderComponent();
      fireEvent.click(screen.getByText("Thêm"));
      await waitFor(() => screen.getByText("THÊM LỚP HỌC MỚI"));

      fireEvent.click(screen.getByText("×"));

      await waitFor(() => {
        expect(screen.queryByText("THÊM LỚP HỌC MỚI")).not.toBeInTheDocument();
      });
    });
  });

  describe("9. grade_deadline và grade_status", () => {
    it("CLS-031 hiển thị 'Chưa quy định' khi grade_deadline null", async () => {
      renderComponent();
      await waitFor(() => screen.getByText("IELTS_01"));
      expect(screen.getAllByText("Chưa quy định").length).toBeGreaterThan(0);
    });

    it("hiển thị grade_deadline đã format khi có giá trị", async () => {
      getClasses.mockResolvedValue({
        results: [{ ...mockClasses[0], grade_deadline: "2024-05-01" }],
        count: 1,
      });
      renderComponent();
      await waitFor(() => screen.getByText("IELTS_01"));
      expect(screen.getByText("2024-05-01")).toBeInTheDocument();
    });

    it("CLS-032 payload gửi lên có grade_deadline và grade_status khi tạo mới", async () => {
      createClass.mockResolvedValue({});
      renderComponent();

      await waitFor(() => screen.getByText("Thêm"));
      fireEvent.click(screen.getByText("Thêm"));
      await waitFor(() => screen.getByText("THÊM LỚP HỌC MỚI"));

      fireEvent.change(document.querySelector('input[name="name"]'), {
        target: { value: "IELTS_02" },
      });
      fireEvent.change(document.querySelector('select[name="course"]'), {
        target: { value: "1" },
      });
      fireEvent.change(document.querySelector('input[name="capacity"]'), {
        target: { value: "20" },
      });

      const datePickers = document.querySelectorAll(
        'input[placeholder="DD/MM/YYYY"]',
      );
      fireEvent.change(datePickers[0], { target: { value: "2024-01-01" } });
      fireEvent.change(datePickers[1], { target: { value: "2024-06-01" } });

      fireEvent.change(document.querySelector('select[name="grade_status"]'), {
        target: { value: "DRAFT" },
      });

      fireEvent.click(screen.getByText("Thứ 2"));
      await waitFor(() => document.querySelectorAll("select"));
      const roomSelects = document.querySelectorAll("select");
      fireEvent.change(roomSelects[roomSelects.length - 1], {
        target: { value: "1" },
      });

      fireEvent.click(screen.getByText("Lưu"));

      await waitFor(() => {
        expect(createClass).toHaveBeenCalledWith(
          expect.objectContaining({ grade_status: "DRAFT" }),
        );
      });
    });

    it("CLS-033 payload gửi grade_status là null khi không chọn", async () => {
      createClass.mockResolvedValue({});
      renderComponent();

      fireEvent.click(screen.getByText("Thêm"));
      await waitFor(() => screen.getByText("THÊM LỚP HỌC MỚI"));

      fireEvent.change(document.querySelector('input[name="name"]'), {
        target: { value: "IELTS_02" },
      });
      fireEvent.change(document.querySelector('select[name="course"]'), {
        target: { value: "1" },
      });
      fireEvent.change(document.querySelector('input[name="capacity"]'), {
        target: { value: "20" },
      });

      const datePickers = document.querySelectorAll(
        'input[placeholder="DD/MM/YYYY"]',
      );
      fireEvent.change(datePickers[0], { target: { value: "2024-01-01" } });
      fireEvent.change(datePickers[1], { target: { value: "2024-06-01" } });

      fireEvent.click(screen.getByText("Thứ 2"));
      await waitFor(() => document.querySelectorAll("select"));
      const roomSelects = document.querySelectorAll("select");
      fireEvent.change(roomSelects[roomSelects.length - 1], {
        target: { value: "1" },
      });

      fireEvent.click(screen.getByText("Lưu"));

      await waitFor(() => {
        expect(createClass).toHaveBeenCalledWith(
          expect.objectContaining({ grade_status: null }),
        );
      });
    });

    it("CLS-034 payload gửi grade_deadline là null khi không chọn", async () => {
      createClass.mockResolvedValue({});
      renderComponent();

      fireEvent.click(screen.getByText("Thêm"));
      await waitFor(() => screen.getByText("THÊM LỚP HỌC MỚI"));

      fireEvent.change(document.querySelector('input[name="name"]'), {
        target: { value: "IELTS_02" },
      });
      fireEvent.change(document.querySelector('select[name="course"]'), {
        target: { value: "1" },
      });
      fireEvent.change(document.querySelector('input[name="capacity"]'), {
        target: { value: "20" },
      });

      const datePickers = document.querySelectorAll(
        'input[placeholder="DD/MM/YYYY"]',
      );
      fireEvent.change(datePickers[0], { target: { value: "2024-01-01" } });
      fireEvent.change(datePickers[1], { target: { value: "2024-06-01" } });

      fireEvent.click(screen.getByText("Thứ 2"));
      await waitFor(() => document.querySelectorAll("select"));
      const roomSelects = document.querySelectorAll("select");
      fireEvent.change(roomSelects[roomSelects.length - 1], {
        target: { value: "1" },
      });

      fireEvent.click(screen.getByText("Lưu"));

      await waitFor(() => {
        expect(createClass).toHaveBeenCalledWith(
          expect.objectContaining({ grade_deadline: null }),
        );
      });
    });
  });

  describe("10. Phân trang", () => {
    it("CLS-035 nút prev disabled ở trang 1", async () => {
      getClasses.mockResolvedValue({ results: mockClasses, count: 40 });
      renderComponent();
      await waitFor(() => screen.getByText("IELTS_01"));

      expect(screen.getByText("«")).toBeDisabled();
    });

    it("CLS-036 nút next disabled khi ở trang cuối", async () => {
      getClasses.mockResolvedValue({
        results: mockClasses,
        count: mockClasses.length,
      });
      renderComponent();
      await waitFor(() => screen.getByText("IELTS_01"));

      expect(screen.getByText("»")).toBeDisabled();
    });

    it("CLS-037 click trang 2 gọi getClasses(2)", async () => {
      getClasses.mockResolvedValue({ results: mockClasses, count: 40 });
      renderComponent();
      await waitFor(() => screen.getByText("IELTS_01"));

      fireEvent.click(screen.getByRole("button", { name: "2" }));

      await waitFor(() => expect(getClasses).toHaveBeenCalledWith(2));
    });
  });

  describe("11. handleSave - lỗi server", () => {
    it("CLS-038 hiển thị lỗi general khi createClass thất bại", async () => {
      createClass.mockRejectedValue({
        response: { data: { name: ["Tên lớp đã tồn tại"] } },
      });
      renderComponent();

      await waitFor(() => screen.getByText("Thêm"));
      fireEvent.click(screen.getByText("Thêm"));
      await waitFor(() => screen.getByText("THÊM LỚP HỌC MỚI"));

      fireEvent.change(document.querySelector('input[name="name"]'), {
        target: { value: "IELTS_01" },
      });
      fireEvent.change(document.querySelector('select[name="course"]'), {
        target: { value: "1" },
      });
      fireEvent.change(document.querySelector('input[name="capacity"]'), {
        target: { value: "20" },
      });

      const datePickers = document.querySelectorAll(
        'input[placeholder="DD/MM/YYYY"]',
      );
      fireEvent.change(datePickers[0], { target: { value: "2024-01-01" } });
      fireEvent.change(datePickers[1], { target: { value: "2024-06-01" } });

      fireEvent.click(screen.getByText("Thứ 2"));
      await waitFor(() => document.querySelectorAll("select"));
      const roomSelects = document.querySelectorAll("select");
      fireEvent.change(roomSelects[roomSelects.length - 1], {
        target: { value: "1" },
      });

      fireEvent.click(screen.getByText("Lưu"));

      await waitFor(() => {
        expect(screen.getByText("Tên lớp đã tồn tại")).toBeInTheDocument();
      });
    });
  });
});
