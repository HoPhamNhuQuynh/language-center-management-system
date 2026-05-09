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

const reqFulfilled = () => Apis.interceptors.request.handlers[0].fulfilled;
const resFulfilled = () => Apis.interceptors.response.handlers[0].fulfilled;
const resRejected = () => Apis.interceptors.response.handlers[0].rejected;

describe("Apis interceptor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Request interceptor", () => {
    it("SER-001 gắn Bearer token vào header khi có token", async () => {
      getAccessToken.mockReturnValue("acc_123");

      const config = await reqFulfilled()({ headers: {} });

      expect(config.headers.Authorization).toBe("Bearer acc_123");
    });

    it("SER-002 không gắn Authorization khi không có token", async () => {
      getAccessToken.mockReturnValue(null);

      const config = await reqFulfilled()({ headers: {} });

      expect(config.headers.Authorization).toBeUndefined();
    });

    it("SER-003 trả về config dù không có token", async () => {
      getAccessToken.mockReturnValue(null);

      const config = await reqFulfilled()({ headers: { "x-custom": "abc" } });
      expect(config.headers["x-custom"]).toBe("abc");
    });
  });

  describe("Response interceptor — success", () => {
    it("SER-004 trả về response nguyên vẹn khi không có lỗi", async () => {
      const res = { status: 200, data: { id: 1 } };

      const result = await resFulfilled()(res);
      expect(result).toEqual(res);
    });
  });

  describe("Response interceptor — 401 refresh token", () => {
    it("SER-005 tự động refresh và retry request khi gặp 401", async () => {
      refreshTokenApi.mockResolvedValue({
        access_token: "new_acc",
        refresh_token: "new_ref",
      });
      Apis.defaults.adapter = vi.fn().mockResolvedValue({
        data: "retry ok",
        status: 200,
        headers: {},
        config: {},
      });

      const err = {
        config: {
          headers: {},
          _retry: false,
          url: "/test",
          method: "get",
        },
        response: { status: 401 },
      };

      const result = await resRejected()(err);

      expect(setTokens).toHaveBeenCalledWith("new_acc", "new_ref");
      expect(err.config.headers.Authorization).toBe("Bearer new_acc");
      expect(result.data).toBe("retry ok");
    });

    it("SER-006 gắn _retry = true để tránh vòng lặp vô tận", async () => {
      refreshTokenApi.mockResolvedValue({
        access_token: "new_acc",
        refresh_token: "new_ref",
      });
      vi.spyOn(Apis, "request").mockResolvedValue({});

      const err = {
        config: { headers: {}, _retry: false },
        response: { status: 401 },
      };

      await resRejected()(err);

      expect(err.config._retry).toBe(true);
    });

    it("SER-007 không retry nếu _retry đã là true (tránh loop)", async () => {
      const err = {
        config: { headers: {}, _retry: true },
        response: { status: 401 },
      };

      await expect(resRejected()(err)).rejects.toEqual(err);
      expect(refreshTokenApi).not.toHaveBeenCalled();
    });

    it("SER-008 clearTokens và redirect /login khi refresh thất bại", async () => {
      refreshTokenApi.mockRejectedValue(new Error("refresh failed"));
      Object.defineProperty(window, "location", {
        value: { href: "" },
        writable: true,
      });

      const err = {
        config: { headers: {}, _retry: false },
        response: { status: 401 },
      };

      await resRejected()(err).catch(() => {});

      expect(clearTokens).toHaveBeenCalled();
      expect(window.location.href).toBe("/login");
    });

    it("SER-009 không gọi setTokens khi refresh thất bại", async () => {
      refreshTokenApi.mockRejectedValue(new Error("refresh failed"));
      Object.defineProperty(window, "location", {
        value: { href: "" },
        writable: true,
      });

      const err = {
        config: { headers: {}, _retry: false },
        response: { status: 401 },
      };

      await resRejected()(err).catch(() => {});

      expect(setTokens).not.toHaveBeenCalled();
    });
  });

  describe("Response interceptor — lỗi không phải 401", () => {
    it("SER-010 reject thẳng khi lỗi 403 (không refresh)", async () => {
      const err = {
        config: { headers: {}, _retry: false },
        response: { status: 403 },
      };

      await expect(resRejected()(err)).rejects.toEqual(err);
      expect(refreshTokenApi).not.toHaveBeenCalled();
    });

    it("SER-011 reject thẳng khi lỗi 500", async () => {
      const err = {
        config: { headers: {}, _retry: false },
        response: { status: 500 },
      };

      await expect(resRejected()(err)).rejects.toEqual(err);
      expect(refreshTokenApi).not.toHaveBeenCalled();
    });

    it("SER-012 reject thẳng khi không có response (network error)", async () => {
      const err = {
        config: { headers: {}, _retry: false },
        response: undefined,
      };

      await expect(resRejected()(err)).rejects.toEqual(err);
      expect(refreshTokenApi).not.toHaveBeenCalled();
    });
  });
});
