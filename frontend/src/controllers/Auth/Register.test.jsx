import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  cleanup,
} from "@testing-library/react";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../../services/authService", () => ({
  registerApi: vi.fn(),
  googleLoginApi: vi.fn(),
  facebookLoginApi: vi.fn(),
}));

vi.mock("../../utils/token", () => ({ setTokens: vi.fn() }));

vi.mock("antd", () => ({
  message: { error: vi.fn(), success: vi.fn() },
}));

let capturedGoogleOpts = {};
const mockGoogleTrigger = vi.fn();

vi.mock("@react-oauth/google", () => ({
  useGoogleLogin: vi.fn((opts) => {
    capturedGoogleOpts = opts;
    return mockGoogleTrigger;
  }),
}));

vi.mock("@greatsumini/react-facebook-login", () => ({
  FacebookLoginClient: { loadSdk: vi.fn(), login: vi.fn() },
}));

vi.mock("../../pages/Auth/RegisterForm", () => ({
  default: ({ onRegister, onGoogleLogin, onFacebookLogin }) => (
    <div>
      <button
        data-testid="btn-register"
        onClick={() =>
          onRegister({
            last_name: "Nguyen",
            first_name: "An",
            phone_num: "0901234567",
            username: "annguyen",
            email: "an@gmail.com",
            password: "Password123",
          })
        }
      >
        Đăng ký
      </button>
      <button data-testid="btn-google" onClick={onGoogleLogin}>
        Google
      </button>
      <button data-testid="btn-facebook" onClick={onFacebookLogin}>
        Facebook
      </button>
    </div>
  ),
}));

import {
  registerApi,
  googleLoginApi,
  facebookLoginApi,
} from "../../services/authService";
import { setTokens } from "../../utils/token";
import { message } from "antd";
import { useGoogleLogin } from "@react-oauth/google";
import { FacebookLoginClient } from "@greatsumini/react-facebook-login";
import Register from "./Register";

const renderRegister = () => render(<Register />);
const clickRegister = () => fireEvent.click(screen.getByTestId("btn-register"));

const makeRes = () => ({
  access: "acc",
  refresh: "ref",
  user: { role: "Student" },
});

beforeEach(() => {
  vi.clearAllMocks();
  capturedGoogleOpts = {};
});

afterEach(() => cleanup());

describe("1. Khởi tạo", () => {
  it("AUTH-016 render đúng UI, load Facebook SDK, không tự gọi registerApi", () => {
    renderRegister();

    expect(screen.getByTestId("btn-register")).toBeInTheDocument();
    expect(screen.getByTestId("btn-google")).toBeInTheDocument();
    expect(screen.getByTestId("btn-facebook")).toBeInTheDocument();

    expect(FacebookLoginClient.loadSdk).toHaveBeenCalledWith("vi_VN");

    expect(registerApi).not.toHaveBeenCalled();
  });
});

describe("2. handleRegister", () => {
  it("AUTH-017 đăng ký thành công: gọi API đúng payload, lưu token, thông báo, navigate /", async () => {
    const res = makeRes();
    registerApi.mockResolvedValue(res);

    renderRegister();
    clickRegister();

    await waitFor(() => {
      expect(registerApi).toHaveBeenCalledWith({
        last_name: "Nguyen",
        first_name: "An",
        phone_num: "0901234567",
        username: "annguyen",
        email: "an@gmail.com",
        password: "Password123",
      });

      expect(setTokens).toHaveBeenCalledWith("acc", "ref", res.user);

      expect(message.success).toHaveBeenCalledWith("Đăng ký thành công!");
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it.each([
    [{ username: ["Username already exists"] }, "Tài khoản đã tồn tại"],
    [{ email: ["Email already exists"] }, "Tài khoản đã tồn tại"],
    [{ password: ["Password too weak"] }, "Mật khẩu không hợp lệ"],
    [{ phone_num: ["Invalid phone"] }, "Số điện thoại không hợp lệ"],
    [{}, "Đăng ký thất bại"],
  ])(
    'AUTH-018 - 021 server trả %o thì hiển thị "%s"',
    async (data, expectedMessage) => {
      registerApi.mockRejectedValue({ response: { data } });

      renderRegister();
      clickRegister();

      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith(expectedMessage);
      });
    },
  );
});

describe("3. googleLogin", () => {
  it("AUTH-011 happy path: implicit flow → trigger → gọi API → lưu token → navigate /", async () => {
    const res = {
      access_token: "acc",
      refresh_token: "ref",
      user: { role: "Student" },
    };
    googleLoginApi.mockResolvedValue(res);

    renderRegister();

    expect(useGoogleLogin).toHaveBeenCalledWith(
      expect.objectContaining({ flow: "implicit" }),
    );

    fireEvent.click(screen.getByTestId("btn-google"));
    expect(mockGoogleTrigger).toHaveBeenCalled();

    await act(async () => {
      await capturedGoogleOpts.onSuccess({ access_token: "google_token_abc" });
    });

    expect(googleLoginApi).toHaveBeenCalledWith("google_token_abc");
    expect(setTokens).toHaveBeenCalledWith("acc", "ref", res.user);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("AUTH-012 server từ chối Google token → hiển thị lỗi đúng", async () => {
    googleLoginApi.mockRejectedValue({
      response: { data: { error: "some error" } },
    });

    renderRegister();

    await act(async () => {
      await capturedGoogleOpts.onSuccess({ access_token: "bad_token" });
    });

    expect(message.error).toHaveBeenCalledWith("Google login thất bại");
  });

  it.each([
    [{ message: "popup_closed" }],
    [{ response: { data: { detail: "some error" } } }],
  ])("AUTH-022 và 023 onError không crash với err = %o", (errPayload) => {
    renderRegister();
    expect(() => capturedGoogleOpts.onError(errPayload)).not.toThrow();
  });
});

describe("4. facebookLogin", () => {
  it("AUTH-013 happy path: bấm nút, FB connected, gọi API, lưu token, navigate /", async () => {
    const res = {
      access_token: "acc",
      refresh_token: "ref",
      user: { role: "Student" },
    };
    facebookLoginApi.mockResolvedValue(res);

    FacebookLoginClient.login.mockImplementation((callback) => {
      callback({
        status: "connected",
        authResponse: { accessToken: "fb_token_xyz" },
      });
    });

    renderRegister();
    fireEvent.click(screen.getByTestId("btn-facebook"));

    expect(FacebookLoginClient.login).toHaveBeenCalled();

    await waitFor(() => {
      expect(facebookLoginApi).toHaveBeenCalledWith("fb_token_xyz");
      expect(setTokens).toHaveBeenCalledWith("acc", "ref", res.user);
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("AUTH-024 status != connected thì hiển thị lỗi, không gọi facebookLoginApi", async () => {
    FacebookLoginClient.login.mockImplementation((callback) => {
      callback({ status: "not_authorized" });
    });

    renderRegister();
    fireEvent.click(screen.getByTestId("btn-facebook"));

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith("Facebook login thất bại");
      expect(facebookLoginApi).not.toHaveBeenCalled();
    });
  });

  it.each([
    [{ response: { data: { detail: "some error" } } }],
    [new Error("Network Error")],
  ])(
    "không crash khi facebookLoginApi reject với err = %o",
    async (errPayload) => {
      facebookLoginApi.mockRejectedValue(errPayload);

      FacebookLoginClient.login.mockImplementation((callback) => {
        callback({
          status: "connected",
          authResponse: { accessToken: "fb_token_xyz" },
        });
      });

      renderRegister();
      fireEvent.click(screen.getByTestId("btn-facebook"));

      await waitFor(() => expect(facebookLoginApi).toHaveBeenCalled());

      // Không throw, không chuyển trang
      expect(mockNavigate).not.toHaveBeenCalled();
    },
  );
});
