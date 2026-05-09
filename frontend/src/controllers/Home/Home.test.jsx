import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Home from "./Home";

vi.mock("../../pages/Home/HomeContent", () => ({
  default: (props) => (
    <div>
      <div data-testid="courses-count">{props.courses?.length}</div>
      <div data-testid="languages-count">{props.languages?.length}</div>
    </div>
  ),
}));

vi.mock("../../assets/china-flag.png", () => ({ default: "china.png" }));
vi.mock("../../assets/england-flag.png", () => ({ default: "england.png" }));
vi.mock("../../assets/japan-flag.png", () => ({ default: "japan.png" }));
vi.mock("../../assets/korea-flag.png", () => ({ default: "korea.png" }));
vi.mock("../../styles/Home.css", () => ({}));
vi.mock("react-icons/fa", () => ({ FaBook: () => <span>FaBook</span> }));
vi.mock("react-icons/gi", () => ({
  GiTeacher: () => <span>GiTeacher</span>,
  GiLaptop: () => <span>GiLaptop</span>,
}));

describe("Home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => vi.restoreAllMocks());

  it("HOM-001: fetch courses và truyền vào HomeContent (tối đa 3)", async () => {
    global.fetch.mockResolvedValue({
      json: () => Promise.resolve([
        { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 },
      ]),
    });
    render(<MemoryRouter><Home /></MemoryRouter>);
    await waitFor(() => {
      expect(Number(screen.getByTestId("courses-count").textContent)).toBeLessThanOrEqual(3);
    });
  });

  it("HOM-002: xử lý khi API trả về { results: [] }", async () => {
    global.fetch.mockResolvedValue({
      json: () => Promise.resolve({ results: [{ id: 1 }] }),
    });
    render(<MemoryRouter><Home /></MemoryRouter>);
    await waitFor(() => {
      expect(Number(screen.getByTestId("courses-count").textContent)).toBeLessThanOrEqual(3);
    });
  });

  it("HOM-003: log lỗi khi fetch fail", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    global.fetch.mockRejectedValue(new Error("network fail"));
    render(<MemoryRouter><Home /></MemoryRouter>);
    await waitFor(() => expect(spy).toHaveBeenCalled());
    spy.mockRestore();
  });

  it("HOM-004: luôn render đủ 4 languages", async () => {
    global.fetch.mockResolvedValue({ json: () => Promise.resolve([]) });
    render(<MemoryRouter><Home /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("languages-count").textContent).toBe("4");
    });
  });

  it("HOM-005: fetch trả về object không có results thì courses = []", async () => {
    global.fetch.mockResolvedValue({
      json: () => Promise.resolve({ count: 0 }), 
    });
    render(<MemoryRouter><Home /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByTestId("courses-count").textContent).toBe("0");
    });
  });
});