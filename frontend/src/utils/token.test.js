import { describe, it, expect, beforeEach } from 'vitest'
import { setTokens, getAccessToken, getRefreshToken, clearTokens, getUser, getRole } from './token'

describe('token utils', () => {

  beforeEach(() => {
    localStorage.clear()  
  })

  // --- setTokens ---
  describe('setTokens', () => {
    it("UTL-008 lưu access_token và refresh_token", () => {
      setTokens("acc_123", "ref_456");
      expect(localStorage.getItem("access_token")).toBe("acc_123");
      expect(localStorage.getItem("refresh_token")).toBe("ref_456");
      expect(localStorage.getItem("user")).toBeNull();
    });

    it("UTL-009 lưu thêm user nếu có truyền vào", () => {
      setTokens("acc_123", "ref_456", { id: 1, role: "student" });
      expect(localStorage.getItem("user")).toBe(
        JSON.stringify({ id: 1, role: "student" }),
      );
    });
  })

  // --- getAccessToken ---
  describe('getAccessToken', () => {
    it("UTL-010 lấy đúng access_token đã lưu", () => {
      localStorage.setItem("access_token", "acc_123");
      expect(getAccessToken()).toBe("acc_123");
    });

    it("UTL-011 trả về null nếu chưa có token", () => {
      expect(getAccessToken()).toBeNull();
    });
  })

  // --- getRefreshToken ---
  describe('getRefreshToken', () => {
    it("UTL-012 lấy đúng refresh_token đã lưu", () => {
      localStorage.setItem("refresh_token", "ref_456");
      expect(getRefreshToken()).toBe("ref_456");
    });

    it("UTL-013 trả về null nếu chưa có token", () => {
      expect(getRefreshToken()).toBeNull();
    });
  })

  // --- clearTokens ---
  describe('clearTokens', () => {
    it("UTL-014 xóa hết token và user", () => {
      setTokens("acc_123", "ref_456", { id: 1 });
      clearTokens();
      expect(getAccessToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();
      expect(localStorage.getItem("user")).toBeNull();
    });
  })

  // --- getUser ---
  describe('getUser', () => {
    it("UTL-015 trả về object user đã lưu", () => {
      localStorage.setItem("user", JSON.stringify({ id: 1, role: "student" }));
      expect(getUser()).toEqual({ id: 1, role: "student" });
    });

    it("UTL-016 trả về null nếu không có user", () => {
      expect(getUser()).toBeNull();
    });

    it('UTL-017 trả về null nếu user là chuỗi "undefined"', () => {
      localStorage.setItem("user", "undefined");
      expect(getUser()).toBeNull();
    });
  })

  // --- getRole ---
  describe('getRole', () => {
    it('trả về đúng role của user', () => {
      localStorage.setItem('user', JSON.stringify({ id: 1, role: 'teacher' }))
      expect(getRole()).toBe('teacher')
    })

    it("UTL-019 trả về undefined nếu không có user", () => {
      expect(getRole()).toBeUndefined();
    });
  })

});