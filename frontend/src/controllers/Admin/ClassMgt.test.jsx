import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock services
vi.mock("../../services/manageService", () => ({
  getClasses: vi.fn(),
  getCourses: vi.fn(),
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

// Mock DatePicker — component phức tạp không cần test UI
vi.mock("react-datepicker", () => ({
  default: ({ placeholderText, onChange }) => (
    <input
      placeholder={placeholderText}
      onChange={(e) => onChange && onChange(new Date(e.target.value))}
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
  getCourses,
  getTeachers,
  getRooms,
  createClass,
  updateClass,
  deleteClass,
} from "../../services/manageService";
import ClassManagement from "./ClassManagement";

// Data mẫu
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

describe("ClassManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getClasses.mockResolvedValue(mockClasses);
    getCourses.mockResolvedValue(mockCourses);
    getTeachers.mockResolvedValue(mockTeachers);
    getRooms.mockResolvedValue(mockRooms);
  });

  // --- Load data ---
  describe("load danh sách", () => {
    it("hiển thị danh sách lớp học sau khi load", async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("IELTS_01")).toBeInTheDocument();
        expect(screen.getByText("TOEIC_01")).toBeInTheDocument();
      });
    });

    it("gọi đủ 4 API khi khởi tạo", async () => {
      renderComponent();

      await waitFor(() => {
        expect(getClasses).toHaveBeenCalled();
        expect(getCourses).toHaveBeenCalled();
        expect(getTeachers).toHaveBeenCalled();
        expect(getRooms).toHaveBeenCalled();
      });
    });

    it("hiển thị trạng thái đúng", async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Đang hoạt động")).toBeInTheDocument();
        expect(screen.getByText("Không hoạt động")).toBeInTheDocument();
      });
    });

    it("hiển thị — khi không có giáo viên chính", async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("—")).toBeInTheDocument();
      });
    });
  });

  // --- Navigate ---
  describe("navigate", () => {
    it("navigate đến trang session khi click tên lớp", async () => {
      renderComponent();

      await waitFor(() => screen.getByText("IELTS_01"));
      fireEvent.click(screen.getByText("IELTS_01"));

      expect(mockNavigate).toHaveBeenCalledWith("/session-config/1");
    });
  });

  // --- validate ---
  describe("validate form", () => {
    it("hiển thị lỗi khi submit form trống", async () => {
      renderComponent();

      await waitFor(() => screen.getByText("Thêm"));
      fireEvent.click(screen.getByText("Thêm"));

      await waitFor(() => screen.getByText("THÊM LỚP HỌC MỚI"));
      fireEvent.click(screen.getByText("Lưu"));

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

    it("hiển thị lỗi khi sĩ số ngoài khoảng 10-50", async () => {
      renderComponent();

      await waitFor(() => screen.getByText("Thêm"));
      fireEvent.click(screen.getByText("Thêm"));

      await waitFor(() => screen.getByText("THÊM LỚP HỌC MỚI"));

      const capacityInput = document.querySelector('input[name="capacity"]');
      fireEvent.change(capacityInput, { target: { value: "5" } });
      fireEvent.click(screen.getByText("Lưu"));

      await waitFor(() => {
        expect(
          screen.getByText("Sĩ số phải từ 10 đến 50 học viên"),
        ).toBeInTheDocument();
      });
    });
  });

  // --- toggleDay ---
  describe("toggleDay", () => {
    it("chọn và bỏ chọn ngày học", async () => {
      renderComponent();

      await waitFor(() => screen.getByText("Thêm"));
      fireEvent.click(screen.getByText("Thêm"));

      await waitFor(() => screen.getByRole("button", { name: "Thứ 2" }));

      // Chọn Thứ 2
      fireEvent.click(screen.getByRole("button", { name: "Thứ 2" }));

      // Sau khi chọn → có span label "Thứ 2" trong schedule row
      await waitFor(() => {
        const spans = screen.getAllByText("Thứ 2");
        expect(spans.length).toBe(2); // 1 button + 1 span label
      });

      // Bỏ chọn → click button
      fireEvent.click(screen.getByRole("button", { name: "Thứ 2" }));

      // Sau khi bỏ chọn → chỉ còn button, không còn span label
      await waitFor(() => {
        const spans = screen.getAllByText("Thứ 2");
        expect(spans.length).toBe(1); // chỉ còn button
      });
    });
  });

  // --- handleDelete ---
  describe("handleDelete", () => {
    it("mở modal xác nhận khi bấm Delete", async () => {
      renderComponent();

      await waitFor(() => screen.getAllByText("Delete"));
      fireEvent.click(screen.getAllByText("Delete")[0]);

      await waitFor(() => {
        expect(screen.getByText("Xác nhận xóa")).toBeInTheDocument();
        expect(screen.getByText('"IELTS_01"')).toBeInTheDocument();
      });
    });

    it("gọi deleteClass và hiển thị toast thành công", async () => {
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

    it("hiển thị lỗi trong modal khi deleteClass thất bại", async () => {
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

    it("đóng modal khi bấm Hủy", async () => {
      renderComponent();

      await waitFor(() => screen.getAllByText("Delete"));
      fireEvent.click(screen.getAllByText("Delete")[0]);

      await waitFor(() => screen.getByText("Xác nhận xóa"));
      fireEvent.click(screen.getByText("Hủy"));

      await waitFor(() => {
        expect(screen.queryByText("Xác nhận xóa")).not.toBeInTheDocument();
      });
    });
  });

  // --- handleSave (create) ---
  describe("handleSave - tạo mới", () => {
    it("gọi createClass khi form hợp lệ", async () => {
      createClass.mockResolvedValue({});
      renderComponent();

      await waitFor(() => screen.getByText("Thêm"));
      fireEvent.click(screen.getByText("Thêm"));

      await waitFor(() => screen.getByText("THÊM LỚP HỌC MỚI"));

      // Điền form
      fireEvent.change(document.querySelector('input[name="name"]'), {
        target: { value: "IELTS_02" },
      });
      fireEvent.change(document.querySelector('select[name="course"]'), {
        target: { value: "1" },
      });
      fireEvent.change(document.querySelector('input[name="capacity"]'), {
        target: { value: "20" },
      });

      // Chọn ngày học qua DatePicker mock
      const datePickers = document.querySelectorAll(
        'input[placeholder="DD/MM/YYYY"]',
      );
      fireEvent.change(datePickers[0], { target: { value: "2024-01-01" } });
      fireEvent.change(datePickers[1], { target: { value: "2024-06-01" } });

      // Chọn ngày học + phòng
      fireEvent.click(screen.getByText("Thứ 2"));
      await waitFor(() => screen.getAllByRole("combobox"));
      const roomSelects = document.querySelectorAll("select");
      // Chọn phòng cho Thứ 2 (select cuối cùng trong schedule row)
      fireEvent.change(roomSelects[roomSelects.length - 1], {
        target: { value: "1" },
      });

      fireEvent.click(screen.getByText("Lưu"));

      await waitFor(() => {
        expect(createClass).toHaveBeenCalled();
        expect(
          screen.getByText("Thêm lớp học thành công!"),
        ).toBeInTheDocument();
      });
    });
  });

  // --- handleEdit ---
  describe("handleEdit", () => {
    it("mở modal sửa với dữ liệu đúng khi bấm Edit", async () => {
      renderComponent();

      await waitFor(() => screen.getAllByText("Edit"));
      fireEvent.click(screen.getAllByText("Edit")[0]);

      await waitFor(() => {
        expect(screen.getByText("SỬA LỚP HỌC")).toBeInTheDocument();
        expect(document.querySelector('input[name="name"]').value).toBe(
          "IELTS_01",
        );
      });
    });

    it("gọi updateClass khi lưu form sửa hợp lệ", async () => {
      updateClass.mockResolvedValue({});
      renderComponent();

      await waitFor(() => screen.getAllByText("Edit"));
      fireEvent.click(screen.getAllByText("Edit")[0]);

      await waitFor(() => screen.getByText("SỬA LỚP HỌC"));

      // Sửa tên lớp
      fireEvent.change(document.querySelector('input[name="name"]'), {
        target: { value: "IELTS_01_UPDATED" },
      });

      // Chọn ngày học
      fireEvent.click(screen.getByText("Thứ 2"));
      await waitFor(() => document.querySelectorAll("select"));
      const roomSelects = document.querySelectorAll("select");
      fireEvent.change(roomSelects[roomSelects.length - 1], {
        target: { value: "1" },
      });

      fireEvent.click(screen.getByText("Lưu"));

      await waitFor(() => {
        expect(updateClass).toHaveBeenCalledWith(1, expect.any(Object));
        expect(
          screen.getByText("Cập nhật lớp học thành công!"),
        ).toBeInTheDocument();
      });
    });
  });

  // --- handleClose ---
  describe("handleClose", () => {
    it("đóng modal và reset form khi bấm Hủy", async () => {
      renderComponent();

      await waitFor(() => screen.getByText("Thêm"));
      fireEvent.click(screen.getByText("Thêm"));

      await waitFor(() => screen.getByText("THÊM LỚP HỌC MỚI"));
      fireEvent.click(screen.getByText("Hủy"));

      await waitFor(() => {
        expect(screen.queryByText("THÊM LỚP HỌC MỚI")).not.toBeInTheDocument();
      });
    });
  });
});
