import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";

let capturedGoogleOpts = {};
const mockGoogleTrigger = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../../services/authService", () => ({
  loginApi: vi.fn(),
  googleLoginApi: vi.fn(),
  facebookLoginApi: vi.fn(),
}));

vi.mock("../../utils/token", () => ({ setTokens: vi.fn() }));

vi.mock("antd", () => ({
  message: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("@react-oauth/google", () => ({
  useGoogleLogin: vi.fn((opts) => {
    capturedGoogleOpts = opts;
    return mockGoogleTrigger;
  }),
}));

vi.mock("@greatsumini/react-facebook-login", () => ({
  FacebookLoginClient: { loadSdk: vi.fn(), login: vi.fn() },
}));

vi.mock("../../pages/Auth/LoginForm", () => ({
  default: ({ onLogin, onGoogleLogin, onFacebookLogin }) => (
    <div>
      <input data-testid="username" defaultValue="" />
      <input data-testid="password" defaultValue="" type="password" />
      <button
        data-testid="btn-login"
        onClick={() => {
          const u = document.querySelector('[data-testid="username"]').value;
          const p = document.querySelector('[data-testid="password"]').value;
          onLogin(u, p);
        }}
      >
        Đăng nhập
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

const mockNavigate = vi.fn();

import {
  loginApi,
  googleLoginApi,
  facebookLoginApi,
} from "../../services/authService";
import { setTokens } from "../../utils/token";
import { message } from "antd";
import { FacebookLoginClient } from "@greatsumini/react-facebook-login";
import { useGoogleLogin } from "@react-oauth/google";
import Login from "./Login";

const renderLogin = () => render(<Login />);

const typeAndLogin = (username = "admin", password = "123456") => {
  fireEvent.change(screen.getByTestId("username"), {
    target: { value: username },
  });
  fireEvent.change(screen.getByTestId("password"), {
    target: { value: password },
  });
  fireEvent.click(screen.getByTestId("btn-login"));
};

const makeRes = (role = "Student") => ({
  access_token: "acc",
  refresh_token: "ref",
  user: { role },
});

beforeEach(() => {
  vi.clearAllMocks();
  capturedGoogleOpts = {};
});

describe("1. Khởi tạo", () => {
  it("AUTH-001 render đúng UI và khởi tạo Facebook SDK, không tự gọi loginApi", () => {
    renderLogin();

    expect(screen.getByTestId("btn-login")).toBeInTheDocument();
    expect(screen.getByTestId("btn-google")).toBeInTheDocument();
    expect(screen.getByTestId("btn-facebook")).toBeInTheDocument();

    expect(FacebookLoginClient.loadSdk).toHaveBeenCalledWith("vi_VN");

    expect(loginApi).not.toHaveBeenCalled();
  });
});

describe("2. handleLogin — đăng nhập thường", () => {
  it.each([
    ["Admin", "/dashboard"],
    ["Teacher", "/schedule"],
    ["Student", "/"],
  ])(
    "AUTH-002 role=%s thì gọi API đúng tham số, lưu token, navigate đến %s",
    async (role, expectedPath) => {
      const res = makeRes(role);
      loginApi.mockResolvedValue(res);

      renderLogin();
      typeAndLogin("admin", "123456");

      await waitFor(() => {
        expect(loginApi).toHaveBeenCalledWith("admin", "123456");

        expect(setTokens).toHaveBeenCalledWith("acc", "ref", res.user);

        expect(mockNavigate).toHaveBeenCalledWith(expectedPath);
      });
    },
  );

  it.each([
    [
      "FACEBOOK_ACCOUNT",
      "Email này đã được đăng ký qua Facebook. Vui lòng đăng nhập bằng Facebook.",
    ],
    [
      "GOOGLE_ACCOUNT",
      "Email này đã được đăng ký qua Google. Vui lòng đăng nhập bằng Google.",
    ],
    ["invalid credentials", "Tên đăng nhập hoặc mật khẩu không đúng."],
    ["invalid password", "Tên đăng nhập hoặc mật khẩu không đúng."],
    ["unauthorized", "Tên đăng nhập hoặc mật khẩu không đúng."],
    ["No grant", "Tên đăng nhập hoặc mật khẩu không đúng."],
    ["random error", "Đã có lỗi xảy ra. Vui lòng thử lại."],
    [undefined, "Đã có lỗi xảy ra. Vui lòng thử lại."],
  ])(
    'AUTH-003 - 010 server lỗi "%s" thì hiển thị "%s"',
    async (errorMsg, expectedMessage) => {
      loginApi.mockRejectedValue({ response: { data: { error: errorMsg } } });

      renderLogin();
      typeAndLogin();

      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith(expectedMessage);
      });
    },
  );
});

describe("3. googleLogin", () => {
  it("AUTH-011 happy path: init implicit flow, gọi trigger, gọi API, lưu token, sau đó navigate về trang chủ", async () => {
    const res = makeRes("Student");
    googleLoginApi.mockResolvedValue(res);

    renderLogin();

    // useGoogleLogin phải dùng implicit flow (lấy access_token trực tiếp, không qua code exchange)
    expect(useGoogleLogin).toHaveBeenCalledWith(
      expect.objectContaining({ flow: "implicit" }),
    );

    fireEvent.click(screen.getByTestId("btn-google"));
    expect(mockGoogleTrigger).toHaveBeenCalled();

    // Giả lập Google popup thành công, truyền access_token vào onSuccess
    await act(async () => {
      await capturedGoogleOpts.onSuccess({ access_token: "google_token_abc" });
    });

    expect(googleLoginApi).toHaveBeenCalledWith("google_token_abc");
    expect(setTokens).toHaveBeenCalledWith("acc", "ref", res.user);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("AUTH-012 server từ chối Google token thì hiển thị lỗi đúng", async () => {
    googleLoginApi.mockRejectedValue({
      response: { data: { error: "FACEBOOK_ACCOUNT" } },
    });

    renderLogin();

    await act(async () => {
      await capturedGoogleOpts.onSuccess({ access_token: "bad_token" });
    });

    expect(message.error).toHaveBeenCalledWith(
      "Email này đã được đăng ký qua Facebook. Vui lòng đăng nhập bằng Facebook.",
    );
  });
});

describe("4. facebookLogin", () => {
  it("AUTH-013 happy path: bấm nút → FB connected → gọi API → lưu token → navigate /", async () => {
    const res = makeRes("Student");
    facebookLoginApi.mockResolvedValue(res);

    // Giả lập FB SDK gọi callback ngay với status connected
    FacebookLoginClient.login.mockImplementation((callback) => {
      callback({
        status: "connected",
        authResponse: { accessToken: "fb_token_xyz" },
      });
    });

    renderLogin();
    fireEvent.click(screen.getByTestId("btn-facebook"));

    expect(FacebookLoginClient.login).toHaveBeenCalled();

    await waitFor(() => {
      expect(facebookLoginApi).toHaveBeenCalledWith("fb_token_xyz");
      expect(setTokens).toHaveBeenCalledWith("acc", "ref", res.user);
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("AUTH-014 server từ chối Facebook token thì hiển thị lỗi đúng", async () => {
    facebookLoginApi.mockRejectedValue({
      response: { data: { error: "GOOGLE_ACCOUNT" } },
    });

    FacebookLoginClient.login.mockImplementation((callback) => {
      callback({
        status: "connected",
        authResponse: { accessToken: "fb_token_xyz" },
      });
    });

    renderLogin();
    fireEvent.click(screen.getByTestId("btn-facebook"));

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith(
        "Email này đã được đăng ký qua Google. Vui lòng đăng nhập bằng Google.",
      );
    });
  });

  it("AUTH-015 user huỷ Facebook popup thì không gọi facebookLoginApi", async () => {
    FacebookLoginClient.login.mockImplementation((callback) => {
      callback({ status: "not_authorized" });
    });

    renderLogin();
    fireEvent.click(screen.getByTestId("btn-facebook"));

    await waitFor(() => {
      expect(facebookLoginApi).not.toHaveBeenCalled();
    });
  });
});
