import { describe, it, expect } from "vitest";
import { formatDate } from "./format";

describe("formatDate", () => {
  it("UTL-001 format đúng ngày bình thường", () => {
    expect(formatDate("2024-01-15")).toBe("15/01/2024");
  });

  it("UTL-002 format đúng khi có khoảng trắng thay vì T", () => {
    expect(formatDate("2024-01-15 10:30:00")).toBe("15/01/2024");
  });

  it("UTL-003 format đúng khi truyền chuỗi ISO chuẩn", () => {
    expect(formatDate("2024-12-31T23:59:59")).toBe("31/12/2024");
  });

  it("UTL-004 trả về — khi truyền null", () => {
    expect(formatDate(null)).toBe("—");
  });

  it("UTL-005 trả về — khi truyền undefined", () => {
    expect(formatDate(undefined)).toBe("—");
  });

  it("UTL-006 trả về — khi truyền chuỗi rỗng", () => {
    expect(formatDate("")).toBe("—");
  });

  it("UTL-007 trả về — khi truyền chuỗi không phải ngày", () => {
    expect(formatDate("abc-xyz")).toBe("—");
  });
});
