import { describe, it, expect } from "vitest";
import {
  validatePassword,
  isValidNumberInput,
  isScoreInRange,
} from "./validation";

describe("validatePassword", () => {
  it("trả về null khi password hợp lệ", () => {
    expect(validatePassword("Abc123@")).toBeNull();
  });

  it("báo lỗi khi password dưới 6 ký tự", () => {
    expect(validatePassword("Ab1@")).toBe("Password phải có ít nhất 6 ký tự");
  });

  it("báo lỗi khi không có chữ in hoa", () => {
    expect(validatePassword("abc123@")).toBe("Phải có ít nhất 1 chữ in hoa");
  });

  it("báo lỗi khi không có chữ thường", () => {
    expect(validatePassword("ABC123@")).toBe("Phải có ít nhất 1 chữ thường");
  });

  it("báo lỗi khi không có chữ số", () => {
    expect(validatePassword("Abcdef@")).toBe("Phải có ít nhất 1 chữ số");
  });

  it("báo lỗi khi không có ký tự đặc biệt", () => {
    expect(validatePassword("Abc1234")).toBe(
      "Phải có ít nhất 1 ký tự đặc biệt",
    );
  });
});

describe("isValidNumberInput", () => {
  it("hợp lệ với số nguyên", () => {
    expect(isValidNumberInput("123")).toBe(true);
  });

  it("hợp lệ với số thập phân", () => {
    expect(isValidNumberInput("9.5")).toBe(true);
  });

  it("hợp lệ với chuỗi rỗng", () => {
    expect(isValidNumberInput("")).toBe(true);
  });

  it("không hợp lệ khi có chữ cái", () => {
    expect(isValidNumberInput("12a")).toBe(false);
  });

  it("không hợp lệ khi có 2 dấu chấm", () => {
    expect(isValidNumberInput("1.2.3")).toBe(false);
  });
});

describe("isScoreInRange", () => {
  it("hợp lệ với điểm 0", () => {
    expect(isScoreInRange("0")).toBe(true);
  });

  it("hợp lệ với điểm 10", () => {
    expect(isScoreInRange("10")).toBe(true);
  });

  it("hợp lệ với điểm thập phân", () => {
    expect(isScoreInRange("7.5")).toBe(true);
  });

  it("hợp lệ với chuỗi rỗng", () => {
    expect(isScoreInRange("")).toBe(true);
  });

  it("hợp lệ với dấu chấm đơn", () => {
    expect(isScoreInRange(".")).toBe(true);
  });

  it("không hợp lệ khi điểm âm", () => {
    expect(isScoreInRange("-1")).toBe(false);
  });

  it("không hợp lệ khi điểm vượt 10", () => {
    expect(isScoreInRange("11")).toBe(false);
  });
});
