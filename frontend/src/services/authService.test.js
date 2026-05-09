import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./Apis", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
  },
}));

import Apis from "./Apis";
import axios from "axios";
import {
  loginApi,
  registerApi,
  googleLoginApi,
  facebookLoginApi,
  revokeTokenApi,
  refreshTokenApi,
} from "./authService";

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- loginApi ---
  describe("loginApi", () => {
    it("SER-013 gọi đúng endpoint với username và password", async () => {
      Apis.post.mockResolvedValue({ data: { access_token: "acc_123" } });

      const result = await loginApi("student01", "123456");

      expect(Apis.post).toHaveBeenCalledWith(
        "auth/login/",
        { username: "student01", password: "123456" },
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
      );
      expect(result).toEqual({ access_token: "acc_123" });
    });

    it("SER-014 throw lỗi khi sai username/password", async () => {
      Apis.post.mockRejectedValue(new Error("Unauthorized"));

      await expect(loginApi("wrong", "wrong")).rejects.toThrow("Unauthorized");
    });
  });

  // --- registerApi ---
  describe("registerApi", () => {
    it("SER-015 gọi đúng endpoint với data đăng ký", async () => {
      const data = {
        username: "newuser",
        email: "new@gmail.com",
        password: "Abc123@",
      };
      Apis.post.mockResolvedValue({ data: { access_token: "acc_123" } });

      const result = await registerApi(data);

      expect(Apis.post).toHaveBeenCalledWith("auth/register/", data);
      expect(result).toEqual({ access_token: "acc_123" });
    });

    it("SER-016 throw lỗi khi email đã tồn tại", async () => {
      Apis.post.mockRejectedValue(new Error("Email already exists"));

      await expect(registerApi({})).rejects.toThrow("Email already exists");
    });
  });

  // --- googleLoginApi ---
  describe("googleLoginApi", () => {
    it("SER-017 gọi đúng endpoint với provider GOOGLE", async () => {
      Apis.post.mockResolvedValue({ data: { access_token: "google_acc" } });

      const result = await googleLoginApi("google_token_abc");

      expect(Apis.post).toHaveBeenCalledWith("auth/social-login/", {
        provider: "GOOGLE",
        access_token: "google_token_abc",
      });
      expect(result).toEqual(
        { access_token: "google_acc" },
        { provider: "GOOGLE" },
      );
    });

    it("SER-018 throw lỗi khi google token không hợp lệ", async () => {
      Apis.post.mockRejectedValue(new Error("Invalid token"));

      await expect(googleLoginApi("invalid")).rejects.toThrow("Invalid token");
    });
  });

  // --- facebookLoginApi ---
  describe("facebookLoginApi", () => {
    it("SER-019 gọi đúng endpoint với provider FACEBOOK", async () => {
      Apis.post.mockResolvedValue({ data: { access_token: "fb_acc" } });

      const result = await facebookLoginApi("fb_token_abc");

      expect(Apis.post).toHaveBeenCalledWith("auth/social-login/", {
        provider: "FACEBOOK",
        access_token: "fb_token_abc",
      });
      expect(result).toEqual({ access_token: "fb_acc" });
    });

    it("SER-020 throw lỗi khi facebook token không hợp lệ", async () => {
      Apis.post.mockRejectedValue(new Error("Invalid token"));

      await expect(facebookLoginApi("invalid")).rejects.toThrow(
        "Invalid token",
      );
    });
  });

  // --- revokeTokenApi ---
  describe("revokeTokenApi", () => {
    it("SER-021 gọi đúng endpoint logout với refresh token", async () => {
      Apis.post.mockResolvedValue({ status: 200 });

      const result = await revokeTokenApi("ref_123");

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

    it("SER-022 throw lỗi khi logout thất bại", async () => {
      Apis.post.mockRejectedValue(new Error("Logout failed"));

      await expect(revokeTokenApi("ref_123")).rejects.toThrow("Logout failed");
    });
  });

  describe("refreshTokenApi", () => {
    it("SER-023 gọi axios trực tiếp (không qua Apis) với refresh_token", async () => {
      axios.post.mockResolvedValue({ data: { access_token: "new_acc" } });

      const result = await refreshTokenApi("ref_123");

      expect(axios.post).toHaveBeenCalledWith(
        "auth/refresh/",
        { refresh_token: "ref_123" },
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
      );
      expect(result).toEqual({ access_token: "new_acc" });
    });

    it("SER-024 không đi qua Apis (interceptor) khi refresh", async () => {
      axios.post.mockResolvedValue({ data: { access_token: "new_acc" } });

      await refreshTokenApi("ref_123");

      expect(Apis.post).not.toHaveBeenCalled();
    });

    it("SER-025 throw lỗi khi refresh thất bại", async () => {
      axios.post.mockRejectedValue(new Error("Token expired"));

      await expect(refreshTokenApi("bad_token")).rejects.toThrow(
        "Token expired",
      );
    });
  });
});
