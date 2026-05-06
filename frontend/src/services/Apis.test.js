import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../utils/token", () => ({
  getAccessToken: vi.fn(),
  setTokens: vi.fn(),
  clearTokens: vi.fn(),
}));

vi.mock("./authService", () => ({
  refreshTokenApi: vi.fn(),
}));

import { getAccessToken, setTokens, clearTokens } from "../utils/token";
import { refreshTokenApi } from "./authService";
import Apis from "./Apis";

describe("Apis interceptor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Request interceptor ---
  describe("request interceptor", () => {
    it("gắn Bearer token vào header khi có token", async () => {
      getAccessToken.mockReturnValue("acc_123");

      const config = await Apis.interceptors.request.handlers[0].fulfilled({
        headers: {},
      });

      expect(config.headers.Authorization).toBe("Bearer acc_123");
    });

    it("không gắn Authorization khi không có token", async () => {
      getAccessToken.mockReturnValue(null);

      const config = await Apis.interceptors.request.handlers[0].fulfilled({
        headers: {},
      });

      expect(config.headers.Authorization).toBeUndefined();
    });
  });

  // --- Response interceptor ---
  describe("response interceptor", () => {
    it("trả về response bình thường khi không lỗi", async () => {
      const res = { data: "ok" };
      const result =
        await Apis.interceptors.response.handlers[0].fulfilled(res);
      expect(result).toEqual(res);
    });

    it("tự động refresh token khi gặp lỗi 401", async () => {
      refreshTokenApi.mockResolvedValue({
        access_token: "new_acc",
        refresh_token: "new_ref",
      });

      // Mock Apis call lại sau refresh
      vi.spyOn(Apis, "request").mockResolvedValue({ data: "retry ok" });

      const err = {
        config: { headers: {}, _retry: false }, // ← mỗi test tạo object mới
        response: { status: 401 },
      };

      await Apis.interceptors.response.handlers[0]
        .rejected(err)
        .catch(() => {});

      expect(setTokens).toHaveBeenCalledWith("new_acc", "new_ref");
    });

    it("clear token và redirect khi refresh thất bại", async () => {
      refreshTokenApi.mockRejectedValue(new Error("refresh failed"));

      Object.defineProperty(window, "location", {
        value: { href: "" },
        writable: true,
      });

      const err = {
        config: { headers: {}, _retry: false }, // ← object mới, _retry: false
        response: { status: 401 },
      };

      await Apis.interceptors.response.handlers[0]
        .rejected(err)
        .catch(() => {});

      expect(clearTokens).toHaveBeenCalled();
      expect(window.location.href).toBe("/login");
    });
  });
});
