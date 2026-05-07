import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import CourseList from "./CourseList";
import { courseApi, tagApi } from "../../services/courseService";

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
    </div>
  ),
}));

vi.mock("../../services/courseService", () => ({
  courseApi: vi.fn(),
  tagApi: vi.fn(),
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
    courseApi.mockResolvedValue(mockCourses);
    tagApi.mockResolvedValue(mockTags);
  });

  it("nên lọc danh sách khi người dùng chọn ngôn ngữ", async () => {
    render(<MemoryRouter><CourseList /></MemoryRouter>);

    // Đợi tags load xong
    const pythonFilter = await screen.findByTestId("tag-python");
    fireEvent.click(pythonFilter);

    await waitFor(() => {
      expect(screen.queryByText(/React Basic/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Python Core/i)).toBeInTheDocument();
    });
  });

  it("nên tự động lọc nếu có ngôn ngữ truyền từ trang Home (location.state)", async () => {
    mockLocationState = { selectedLang: "javascript" };

    render(<MemoryRouter><CourseList /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText("React Basic")).toBeInTheDocument();
      expect(screen.queryByText("Python Core")).not.toBeInTheDocument();
    });
  });

  it("vẫn phải chuyển trang ngay cả khi API lấy chi tiết khóa học bị lỗi", async () => {
    courseApi.mockResolvedValueOnce(mockCourses);
    courseApi.mockRejectedValueOnce(new Error("Detail API sập"));

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

  it("nên log lỗi khi cả courseApi và tagApi đều oẳng", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    courseApi.mockRejectedValue(new Error("Major Fail"));
    tagApi.mockRejectedValue(new Error("Tag Fail"));

    render(<MemoryRouter><CourseList /></MemoryRouter>);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
    consoleSpy.mockRestore();
  });
});