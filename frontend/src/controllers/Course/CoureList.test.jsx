import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import CourseList from "./CourseList";
import { courseApi, tagApi, coursePageApi } from "../../services/courseService";

vi.mock("../../pages/Course/CourseListForm", () => ({
  default: (props) => (
    <div>
      <div data-testid="loading">{props.loading ? "loading" : "idle"}</div>
      {props.tags?.map((tag) => (
        <button
          key={tag.name}
          data-testid={`tag-${tag.name}`}
          onClick={() => props.setSelectedLang(tag.name)}
        >
          {tag.name}
        </button>
      ))}
      {props.courses?.map((c) => (
        <div
          key={c.id}
          data-testid={`course-${c.id}`}
          onClick={() => props.onSelectCourse(c)}
        >
          {c.name}
        </div>
      ))}
      <button
        data-testid="btn-page-2"
        onClick={() => props.onPageChange(2)}
      >
        Page 2
      </button>
      <button
        data-testid="btn-set-search"
        onClick={() => props.setSearch("react")}
      >
        Search React
      </button>
      <div data-testid="current-page">{props.currentPage}</div>
    </div>
  ),
}));

vi.mock("../../services/courseService", () => ({
  courseApi: vi.fn(),
  tagApi: vi.fn(),
  coursePageApi: vi.fn(),
}));

const mockedUsedNavigate = vi.fn();
let mockLocationState = null;

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedUsedNavigate,
    useLocation: () => ({ state: mockLocationState }),
  };
});

describe("CourseList Component Coverage Rescue", () => {
  const mockCourses = [
    { id: 1, name: "React Basic", tags: [{ name: "javascript" }] },
    { id: 2, name: "Python Core", tags: [{ name: "python" }] },
  ];
  const mockTags = [{ name: "javascript" }, { name: "python" }];

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocationState = null;

    coursePageApi.mockImplementation((id, params) => {
      if (params?.tag === "python") {
        return Promise.resolve({
          results: [{ id: 2, name: "Python Core", tags: [{ name: "python" }] }],
          count: 1,
        });
      }
      if (params?.tag === "javascript") {
        return Promise.resolve({
          results: [{ id: 1, name: "React Basic", tags: [{ name: "javascript" }] }],
          count: 1,
        });
      }
      return Promise.resolve({
        results: mockCourses,
        count: mockCourses.length,
      });
    });

    tagApi.mockResolvedValue(mockTags);
  });

  it("VCL-001: nên lọc danh sách khi người dùng chọn ngôn ngữ", async () => {
    render(<MemoryRouter><CourseList /></MemoryRouter>);

    const pythonFilter = await screen.findByTestId("tag-python");
    fireEvent.click(pythonFilter);

    await waitFor(() => {
      expect(screen.queryByText(/React Basic/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Python Core/i)).toBeInTheDocument();
    });
  });

  it("VCL-002: nên tự động lọc nếu có ngôn ngữ truyền từ trang Home (location.state)", async () => {
    mockLocationState = { selectedLang: "javascript" };

    render(<MemoryRouter><CourseList /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText("React Basic")).toBeInTheDocument();
      expect(screen.queryByText("Python Core")).not.toBeInTheDocument();
    });
  });

  it("VCL-003: vẫn phải chuyển trang ngay cả khi API lấy chi tiết khóa học bị lỗi", async () => {
    coursePageApi.mockResolvedValueOnce({ results: mockCourses, count: 2 });
    coursePageApi.mockRejectedValueOnce(new Error("Detail API sập"));

    render(<MemoryRouter><CourseList /></MemoryRouter>);
    await waitFor(() => screen.getByText("React Basic"));

    fireEvent.click(screen.getByText("React Basic"));

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith(
        "/course-register",
        expect.any(Object)
      );
    });
  });

  it("VCL-004: nên log lỗi khi cả coursePageApi và tagApi đều oẳng", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => { });
    coursePageApi.mockRejectedValue(new Error("Major Fail"));
    tagApi.mockRejectedValue(new Error("Tag Fail"));

    render(<MemoryRouter><CourseList /></MemoryRouter>);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
    consoleSpy.mockRestore();
  });

  it("VCL-005: tự động lọc khi location.state.selectedLang là object { name }", async () => {
    mockLocationState = { selectedLang: { name: "python" } };

    render(<MemoryRouter><CourseList /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText("Python Core")).toBeInTheDocument();
      expect(screen.queryByText("React Basic")).not.toBeInTheDocument();
    });
  });

  it("VCL-006: tự động lọc khi location.state.selectedLanguage là object { name }", async () => {
    mockLocationState = { selectedLanguage: { name: "javascript" } };

    render(<MemoryRouter><CourseList /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText("React Basic")).toBeInTheDocument();
      expect(screen.queryByText("Python Core")).not.toBeInTheDocument();
    });
  });

  it("VCL-007: navigate với dữ liệu từ API khi coursePageApi(course.id) thành công", async () => {
    const mockDetail = { id: 1, name: "React Basic", tags: [{ name: "javascript" }], description: "chi tiết" };
    coursePageApi
      .mockResolvedValueOnce({ results: mockCourses, count: 2 })
      .mockResolvedValueOnce(mockDetail);

    render(<MemoryRouter><CourseList /></MemoryRouter>);
    await waitFor(() => screen.getByText("React Basic"));

    fireEvent.click(screen.getByText("React Basic"));

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith(
        "/course-register",
        { state: { course: mockDetail } }
      );
    });
  });

  it("VCL-008: onPageChange cập nhật currentPage và gọi lại API", async () => {
    coursePageApi.mockResolvedValue({ results: mockCourses, count: 2 });
    render(<MemoryRouter><CourseList /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-page-2"));

    coursePageApi.mockClear();
    fireEvent.click(screen.getByTestId("btn-page-2"));

    await waitFor(() => {
      expect(coursePageApi).toHaveBeenCalledWith(
        null,
        expect.objectContaining({ page: 2 })
      );
    });
  });

  it("VCL-009: gọi coursePageApi với search param khi setSearch", async () => {
    coursePageApi.mockResolvedValue({ results: mockCourses, count: 2 });
    render(<MemoryRouter><CourseList /></MemoryRouter>);
    await waitFor(() => screen.getByTestId("btn-set-search"));

    coursePageApi.mockClear();
    fireEvent.click(screen.getByTestId("btn-set-search"));

    await waitFor(() => {
      expect(coursePageApi).toHaveBeenCalledWith(
        null,
        expect.objectContaining({ search: "react" })
      );
    });
  });
});
