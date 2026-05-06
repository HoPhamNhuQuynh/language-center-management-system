import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./Apis", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import Apis from "./Apis";
import {
  loginApi,
  registerApi,
  googleLoginApi,
  facebookLoginApi,
  revokeTokenApi,
} from "./authService";

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- loginApi ---
  describe("loginApi", () => {
    it("gọi đúng endpoint với username và password", async () => {
      Apis.post.mockResolvedValue({ data: { access_token: "acc_123" } });

      const result = await loginApi("student01", "123456");

      expect(Apis.post).toHaveBeenCalledWith(
        "auth/login/",
        { username: "student01", password: "123456" },
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
      );
      expect(result).toEqual({ access_token: "acc_123" });
    });

    it("throw lỗi khi sai username/password", async () => {
      Apis.post.mockRejectedValue(new Error("Unauthorized"));

      await expect(loginApi("wrong", "wrong")).rejects.toThrow("Unauthorized");
    });
  });

  // --- registerApi ---
  describe("registerApi", () => {
    it("gọi đúng endpoint với data đăng ký", async () => {
      const data = {
        username: "newuser",
        email: "new@gmail.com",
        password: "Abc123@",
      };
      Apis.post.mockResolvedValue({ data: { id: 1, ...data } });

      const result = await registerApi(data);

      expect(Apis.post).toHaveBeenCalledWith("auth/register/", data);
      expect(result).toEqual({ id: 1, ...data });
    });

    it("throw lỗi khi email đã tồn tại", async () => {
      Apis.post.mockRejectedValue(new Error("Email already exists"));

      await expect(registerApi({})).rejects.toThrow("Email already exists");
    });
  });

  // --- googleLoginApi ---
  describe("googleLoginApi", () => {
    it("gọi đúng endpoint với provider GOOGLE", async () => {
      Apis.post.mockResolvedValue({ data: { access_token: "google_acc" } });

      const result = await googleLoginApi("google_token_abc");

      expect(Apis.post).toHaveBeenCalledWith("auth/social-login/", {
        provider: "GOOGLE",
        access_token: "google_token_abc",
      });
      expect(result).toEqual({ access_token: "google_acc" });
    });

    it("throw lỗi khi google token không hợp lệ", async () => {
      Apis.post.mockRejectedValue(new Error("Invalid token"));

      await expect(googleLoginApi("invalid")).rejects.toThrow("Invalid token");
    });
  });

  // --- facebookLoginApi ---
  describe("facebookLoginApi", () => {
    it("gọi đúng endpoint với provider FACEBOOK", async () => {
      Apis.post.mockResolvedValue({ data: { access_token: "fb_acc" } });

      const result = await facebookLoginApi("fb_token_abc");

      expect(Apis.post).toHaveBeenCalledWith("auth/social-login/", {
        provider: "FACEBOOK",
        access_token: "fb_token_abc",
      });
      expect(result).toEqual({ access_token: "fb_acc" });
    });

    it("throw lỗi khi facebook token không hợp lệ", async () => {
      Apis.post.mockRejectedValue(new Error("Invalid token"));

      await expect(facebookLoginApi("invalid")).rejects.toThrow(
        "Invalid token",
      );
    });
  });

  // --- revokeTokenApi ---
  describe("revokeTokenApi", () => {
    it("gọi đúng endpoint logout với refresh token", async () => {
      Apis.post.mockResolvedValue({ status: 200 });

      const result = await revokeTokenApi("ref_123");

      // Kiểm tra gọi đúng endpoint
      expect(Apis.post).toHaveBeenCalledWith(
        "auth/logout/",
        expect.any(URLSearchParams),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
      );

      // Kiểm tra URLSearchParams chứa đúng token
      const calledParams = Apis.post.mock.calls[0][1];
      expect(calledParams.get("token")).toBe("ref_123");

      expect(result).toEqual({ status: 200 });
    });

    it("throw lỗi khi logout thất bại", async () => {
      Apis.post.mockRejectedValue(new Error("Logout failed"));

      await expect(revokeTokenApi("ref_123")).rejects.toThrow("Logout failed");
    });
  });
});
