import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";

vi.mock("../../services/manageService", () => ({
  getCourses: vi.fn(),
  getLevels: vi.fn(),
  createCourse: vi.fn(),
  updateCourse: vi.fn(),
  deleteCourse: vi.fn(),
}));

vi.mock("../../utils/format", () => ({
  formatDate: vi.fn((d) => d ?? "—"),
}));

vi.mock("react-icons/fa6", () => ({ FaPen: () => <span>Edit</span> }));
vi.mock("react-icons/im", () => ({ ImBin2: () => <span>Delete</span> }));

import {
  getCourses,
  getLevels,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../../services/manageService";
import CourseManagement from "./CourseManagement";

const mockCourses = [
  {
    id: 1,
    name: "IELTS Basic",
    active: true,
    description: "Khóa IELTS cơ bản",
    level: 1,
    level_name: "Beginner",
    price: 3000000,
    total_sessions: 20,
    created_at: "2024-01-01",
    image: null,
  },
  {
    id: 2,
    name: "TOEIC 600",
    active: false,
    description: "Khóa TOEIC 600+",
    level: 2,
    level_name: "Intermediate",
    price: 4000000,
    total_sessions: 25,
    created_at: "2024-02-01",
    image: null,
  },
];

const mockLevels = [
  { id: 1, name: "Beginner" },
  { id: 2, name: "Intermediate" },
];

const renderComponent = () => render(<CourseManagement />);

beforeEach(() => {
  vi.clearAllMocks();
  getCourses.mockResolvedValue({ results: mockCourses });
  getLevels.mockResolvedValue(mockLevels);
});

describe("1. Render & load data", () => {
  it("COU-001 gọi getCourses và getLevels khi mount", async () => {
    renderComponent();

    await waitFor(() => {
      expect(getCourses).toHaveBeenCalled();
      expect(getLevels).toHaveBeenCalled();
    });
  });

  it("COU-002 hiển thị danh sách khóa học sau khi load", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("IELTS Basic")).toBeInTheDocument();
      expect(screen.getByText("TOEIC 600")).toBeInTheDocument();
    });
  });

  it("COU-003 hiển thị trạng thái đúng với từng khóa học", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Đang hoạt động")).toBeInTheDocument();
      expect(screen.getByText("Không hoạt động")).toBeInTheDocument();
      expect(screen.getByText("Beginner")).toBeInTheDocument();
      expect(screen.getByText("Intermediate")).toBeInTheDocument();
    });
  });
});

describe("2. Validate form", () => {
  const openModal = async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Thêm"));
    fireEvent.click(screen.getByText("Thêm"));
    await waitFor(() => screen.getByText("THÊM KHÓA HỌC MỚI"));
  };

  it("COU-004 hiển thị tất cả lỗi khi submit form rỗng", async () => {
    await openModal();
    fireEvent.click(screen.getByText("Lưu"));

    await waitFor(() => {
      expect(
        screen.getByText("Vui lòng nhập tên khóa học"),
      ).toBeInTheDocument();
      expect(screen.getByText("Vui lòng chọn cấp độ")).toBeInTheDocument();
      expect(screen.getByText("Vui lòng nhập mô tả")).toBeInTheDocument();
      expect(screen.getByText("Vui lòng nhập học phí")).toBeInTheDocument();
      expect(screen.getByText("Vui lòng nhập số buổi học")).toBeInTheDocument();
    });

    expect(createCourse).not.toHaveBeenCalled();
  });

  it("COU-005 lỗi học phí khi nhập dưới 2 triệu", async () => {
    await openModal();

    // Nhập đầy đủ các trường hợp lệ
    fireEvent.change(document.querySelector('input[name="name"]'), {
      target: { value: "IELTS Basic" },
    });

    fireEvent.change(document.querySelector('select[name="level"]'), {
      target: { value: "1" },
    });

    fireEvent.change(document.querySelector('textarea[name="description"]'), {
      target: { value: "Mô tả khóa học" },
    });

    fireEvent.change(document.querySelector('input[name="total_sessions"]'), {
      target: { value: "20" },
    });

    // Chỉ để học phí sai
    fireEvent.change(document.querySelector('input[name="price"]'), {
      target: { value: "1000000" },
    });

    fireEvent.click(screen.getByText("Lưu"));

    await waitFor(() => {
      expect(
        screen.getByText("Học phí tối thiểu là 2 triệu VND"),
      ).toBeInTheDocument();
    });

    expect(createCourse).not.toHaveBeenCalled();
  });

  it("COU-006 lỗi số buổi khi nhập dưới 10", async () => {
    await openModal();

    // Nhập đầy đủ các trường hợp lệ
    fireEvent.change(document.querySelector('input[name="name"]'), {
      target: { value: "IELTS Basic" },
    });

    fireEvent.change(document.querySelector('select[name="level"]'), {
      target: { value: "1" },
    });

    fireEvent.change(document.querySelector('textarea[name="description"]'), {
      target: { value: "Mô tả khóa học" },
    });

    fireEvent.change(document.querySelector('input[name="price"]'), {
      target: { value: "3000000" },
    });

    // Chỉ để số buổi sai
    fireEvent.change(document.querySelector('input[name="total_sessions"]'), {
      target: { value: "5" },
    });

    fireEvent.click(screen.getByText("Lưu"));

    await waitFor(() => {
      expect(
        screen.getByText("Số buổi học phải từ 10 đến 30 buổi"),
      ).toBeInTheDocument();
    });

    expect(createCourse).not.toHaveBeenCalled();
  });

  it("COU-007 lỗi số buổi khi nhập trên 30", async () => {
    await openModal();

    // Nhập đầy đủ các trường hợp lệ
    fireEvent.change(document.querySelector('input[name="name"]'), {
      target: { value: "IELTS Basic" },
    });

    fireEvent.change(document.querySelector('select[name="level"]'), {
      target: { value: "1" },
    });

    fireEvent.change(document.querySelector('textarea[name="description"]'), {
      target: { value: "Mô tả khóa học" },
    });

    fireEvent.change(document.querySelector('input[name="price"]'), {
      target: { value: "3000000" },
    });

    // Chỉ để số buổi sai
    fireEvent.change(document.querySelector('input[name="total_sessions"]'), {
      target: { value: "35" },
    });

    fireEvent.click(screen.getByText("Lưu"));

    await waitFor(() => {
      expect(
        screen.getByText("Số buổi học phải từ 10 đến 30 buổi"),
      ).toBeInTheDocument();
    });

    expect(createCourse).not.toHaveBeenCalled();
  });
});

describe("3. Tạo khóa học mới", () => {
  const fillValidForm = async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Thêm"));
    fireEvent.click(screen.getByText("Thêm"));
    await waitFor(() => screen.getByText("THÊM KHÓA HỌC MỚI"));

    fireEvent.change(document.querySelector('input[name="name"]'), {
      target: { value: "IELTS Pro" },
    });

    const priceInput = document.querySelector('input[name="price"]');
    fireEvent.change(priceInput, { target: { value: "3000000" } });

    fireEvent.change(document.querySelector('select[name="level"]'), {
      target: { value: "1" },
    });

    fireEvent.change(document.querySelector('input[name="total_sessions"]'), {
      target: { value: "20" },
    });

    fireEvent.change(document.querySelector('textarea[name="description"]'), {
      target: { value: "Mô tả khóa học" },
    });
  };

  it("COU-008 gọi createCourse với FormData khi form hợp lệ", async () => {
    createCourse.mockResolvedValue({});
    await fillValidForm();

    fireEvent.click(screen.getByText("Lưu"));

    await waitFor(() => {
      expect(createCourse).toHaveBeenCalledWith(expect.any(FormData));
      expect(screen.getByText("Thêm khóa học thành công!")).toBeInTheDocument();
    });
  });

  it("COU-009 đóng modal sau khi tạo thành công", async () => {
    createCourse.mockResolvedValue({});
    await fillValidForm();

    fireEvent.click(screen.getByText("Lưu"));

    await waitFor(() => {
      expect(screen.queryByText("THÊM KHÓA HỌC MỚI")).not.toBeInTheDocument();
    });
  });

  it("COU-010 hiển thị lỗi general khi API trả về lỗi object", async () => {
    createCourse.mockRejectedValue({
      response: { data: { name: ["Tên đã tồn tại"] } },
    });
    await fillValidForm();

    fireEvent.click(screen.getByText("Lưu"));

    await waitFor(() => {
      expect(screen.getByText("Tên đã tồn tại")).toBeInTheDocument();
    });
  });

  it("COU-011 hiển thị lỗi general khi API trả về lỗi array", async () => {
    createCourse.mockRejectedValue({
      response: { data: ["Dữ liệu không hợp lệ"] },
    });
    await fillValidForm();

    fireEvent.click(screen.getByText("Lưu"));

    await waitFor(() => {
      expect(screen.getByText("Dữ liệu không hợp lệ")).toBeInTheDocument();
    });
  });
});

describe("4. Sửa khóa học", () => {
  it("COU-012 mở modal sửa với dữ liệu đúng của khóa học được chọn", async () => {
    renderComponent();
    await waitFor(() => screen.getAllByText("Edit"));

    fireEvent.click(screen.getAllByText("Edit")[0]);

    await waitFor(() => {
      expect(screen.getByText("SỬA KHÓA HỌC")).toBeInTheDocument();
      expect(document.querySelector('input[name="name"]').value).toBe(
        "IELTS Basic",
      );
      expect(document.querySelector('input[name="total_sessions"]').value).toBe(
        "20",
      );
    });
  });

  it("COU-013 gọi updateCourse đúng id khi lưu thành công", async () => {
    updateCourse.mockResolvedValue({});
    renderComponent();
    await waitFor(() => screen.getAllByText("Edit"));

    fireEvent.click(screen.getAllByText("Edit")[0]);
    await waitFor(() => screen.getByText("SỬA KHÓA HỌC"));

    fireEvent.change(document.querySelector('input[name="name"]'), {
      target: { value: "IELTS Basic Updated" },
    });

    fireEvent.click(screen.getByText("Lưu"));

    await waitFor(() => {
      expect(updateCourse).toHaveBeenCalledWith(1, expect.any(FormData));
      expect(
        screen.getByText("Cập nhật khóa học thành công!"),
      ).toBeInTheDocument();
      expect(screen.queryByText("SỬA KHÓA HỌC")).not.toBeInTheDocument();
    });
  });
});

describe("5. Xóa khóa học", () => {
  it("COU-014 mở modal xác nhận với tên đúng khi bấm Delete", async () => {
    renderComponent();
    await waitFor(() => screen.getAllByText("Delete"));

    fireEvent.click(screen.getAllByText("Delete")[0]);

    await waitFor(() => {
      expect(screen.getByText("Xác nhận xóa")).toBeInTheDocument();
      expect(screen.getByText('"IELTS Basic"')).toBeInTheDocument();
    });
  });

  it("COU-015 click Hủy, đóng modal, không gọi deleteCourse", async () => {
    renderComponent();
    await waitFor(() => screen.getAllByText("Delete"));

    fireEvent.click(screen.getAllByText("Delete")[0]);
    await waitFor(() => screen.getByText("Xác nhận xóa"));

    fireEvent.click(screen.getByText("Hủy"));

    await waitFor(() => {
      expect(screen.queryByText("Xác nhận xóa")).not.toBeInTheDocument();
    });
    expect(deleteCourse).not.toHaveBeenCalled();
  });

  it("COU-016 xác nhận xóa thành công và gọi deleteCourse, hiện toast", async () => {
    deleteCourse.mockResolvedValue({});
    renderComponent();
    await waitFor(() => screen.getAllByText("Delete"));

    fireEvent.click(screen.getAllByText("Delete")[0]);
    await waitFor(() => screen.getByText("Xóa"));

    fireEvent.click(screen.getByText("Xóa"));

    await waitFor(() => {
      expect(deleteCourse).toHaveBeenCalledWith(1);
      expect(screen.queryByText("Xác nhận xóa")).not.toBeInTheDocument();
      expect(screen.getByText("Xóa khóa học thành công!")).toBeInTheDocument();
    });
  });

  it("COU-017 xóa thất bại thì hiện lỗi trong modal, không đóng", async () => {
    deleteCourse.mockRejectedValue({
      response: { data: ["Khóa học đang có lớp học"] },
    });
    renderComponent();
    await waitFor(() => screen.getAllByText("Delete"));

    fireEvent.click(screen.getAllByText("Delete")[0]);
    await waitFor(() => screen.getByText("Xóa"));

    fireEvent.click(screen.getByText("Xóa"));

    await waitFor(() => {
      expect(screen.getByText("Khóa học đang có lớp học")).toBeInTheDocument();
      expect(screen.getByText("Xác nhận xóa")).toBeInTheDocument();
    });
  });
});

describe("6. Đóng modal & reset form", () => {
  it("COU-018 bấm Hủy thì đóng modal và reset form", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Thêm"));

    fireEvent.click(screen.getByText("Thêm"));
    await waitFor(() => screen.getByText("THÊM KHÓA HỌC MỚI"));

    fireEvent.change(document.querySelector('input[name="name"]'), {
      target: { value: "Test course" },
    });

    fireEvent.click(screen.getByText("Hủy"));

    await waitFor(() => {
      expect(screen.queryByText("THÊM KHÓA HỌC MỚI")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Thêm"));
    await waitFor(() => {
      expect(document.querySelector('input[name="name"]').value).toBe("");
    });
  });

  it("COU-019 bấm nút X thì đóng modal", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Thêm"));

    fireEvent.click(screen.getByText("Thêm"));
    await waitFor(() => screen.getByText("THÊM KHÓA HỌC MỚI"));

    fireEvent.click(document.querySelector(".modal-close-btn"));

    await waitFor(() => {
      expect(screen.queryByText("THÊM KHÓA HỌC MỚI")).not.toBeInTheDocument();
    });
  });

  it("COU-020 lỗi validate bị xóa khi bắt đầu nhập lại", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Thêm"));

    fireEvent.click(screen.getByText("Thêm"));
    await waitFor(() => screen.getByText("THÊM KHÓA HỌC MỚI"));

    fireEvent.click(screen.getByText("Lưu"));
    await waitFor(() =>
      expect(
        screen.getByText("Vui lòng nhập tên khóa học"),
      ).toBeInTheDocument(),
    );

    fireEvent.change(document.querySelector('input[name="name"]'), {
      target: { value: "IELTS" },
    });

    await waitFor(() => {
      expect(
        screen.queryByText("Vui lòng nhập tên khóa học"),
      ).not.toBeInTheDocument();
    });
  });
});

describe("7. Toast tự ẩn sau 3 giây", () => {
  it("COU-021 toast biến mất sau 3 giây", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    deleteCourse.mockResolvedValue({});

    renderComponent();
    await waitFor(() => screen.getAllByText("Delete"));

    fireEvent.click(screen.getAllByText("Delete")[0]);
    await waitFor(() => screen.getByText("Xóa"));
    fireEvent.click(screen.getByText("Xóa"));

    await waitFor(() =>
      expect(screen.getByText("Xóa khóa học thành công!")).toBeInTheDocument(),
    );

    await act(async () => { // tua nhanh 3 giây để test
      vi.advanceTimersByTime(3000);
    });

    expect(
      screen.queryByText("Xóa khóa học thành công!"),
    ).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});
