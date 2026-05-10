import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import ResultAcademic from "./ResultAcademic";
import { myClassResultApi } from "../../services/studentService";
import { classDetailApi } from "../../services/classService";

vi.mock("../../pages/User/ResultAcademicForm", () => ({
  default: (props) => (
    <div>
      <div data-testid="result">{props.result ? JSON.stringify(props.result) : "no-result"}</div>
      <div data-testid="classinfo">{props.classInfo?.name || "no-class"}</div>
    </div>
  ),
}));

vi.mock("../../styles/ResultAcademic.css", () => ({}));

vi.mock("../../services/studentService", () => ({
  myClassResultApi: vi.fn(),
}));

vi.mock("../../services/classService", () => ({
  classDetailApi: vi.fn(),
}));

let mockLocationState = { enrollmentId: "5", classId: 10 };

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useLocation: () => ({ state: mockLocationState }),
  };
});

describe("ResultAcademic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocationState = { enrollmentId: "5", classId: 10 };
  });

  it("RAC-001: hiện Loading khi đang fetch", () => {
    myClassResultApi.mockReturnValue(new Promise(() => {}));
    classDetailApi.mockReturnValue(new Promise(() => {}));
    render(<MemoryRouter><ResultAcademic /></MemoryRouter>);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("RAC-002: render result và classInfo đúng", async () => {
    myClassResultApi.mockResolvedValue([
      { enrollment_id: 5, score: 9 },
      { enrollment_id: 6, score: 7 },
    ]);
    classDetailApi.mockResolvedValue({ name: "Lớp Python" });
    render(<MemoryRouter><ResultAcademic /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("classinfo").textContent).toBe("Lớp Python");
      expect(screen.getByTestId("result").textContent).toContain("enrollment_id");
    });
  });

  it("RAC-003: result = null nếu không tìm thấy enrollmentId", async () => {
    myClassResultApi.mockResolvedValue([{ enrollment_id: 999 }]);
    classDetailApi.mockResolvedValue({ name: "Lớp X" });
    render(<MemoryRouter><ResultAcademic /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("result").textContent).toBe("no-result");
    });
  });

  it("RAC-004: log lỗi khi API fail", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    myClassResultApi.mockRejectedValue(new Error("fail"));
    classDetailApi.mockRejectedValue(new Error("fail"));
    render(<MemoryRouter><ResultAcademic /></MemoryRouter>);
    await waitFor(() => expect(spy).toHaveBeenCalled());
    spy.mockRestore();
  });
});