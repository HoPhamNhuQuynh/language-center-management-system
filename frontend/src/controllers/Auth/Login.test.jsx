import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { useGoogleLogin } from "@react-oauth/google";

beforeEach(() => {
  vi.clearAllMocks();
  capturedGoogleOpts = {}; // reset mỗi test
});

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../../services/authService", () => ({
  loginApi: vi.fn(),
  googleLoginApi: vi.fn(),
  facebookLoginApi: vi.fn(),
}));

vi.mock("../../utils/token", () => ({
  setTokens: vi.fn(),
}));

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
  FacebookLoginClient: {
    loadSdk: vi.fn(),
    login: vi.fn(),
  },
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

import { loginApi, googleLoginApi, facebookLoginApi } from "../../services/authService";
import { setTokens } from "../../utils/token";
import { message } from "antd";
import { FacebookLoginClient } from "@greatsumini/react-facebook-login";
import Login from "./Login";

const typeAndLogin = (username = "admin", password = "123456") => {
  fireEvent.change(screen.getByTestId("username"), { target: { value: username } });
  fireEvent.change(screen.getByTestId("password"), { target: { value: password } });
  fireEvent.click(screen.getByTestId("btn-login"));
};

describe("1. Khởi tạo", () => {
  it("render LoginForm và khởi tạo Facebook SDK khi mount", () => {
    render(<Login />);

    expect(screen.getByTestId("btn-login")).toBeInTheDocument();
    expect(FacebookLoginClient.loadSdk).toHaveBeenCalledWith("vi_VN");
  });

  it("không gọi loginApi khi chỉ render", () => {
    render(<Login />);
    expect(loginApi).not.toHaveBeenCalled();
  });
});

describe("2. handleLogin — đăng nhập thường", () => {
  it("gọi loginApi với đúng username và password", async () => {
    loginApi.mockResolvedValue({
      access_token: "acc",
      refresh_token: "ref",
      user: { role: "Student" },
    });

    render(<Login />);
    typeAndLogin("admin", "123456");

    await waitFor(() => {
      expect(loginApi).toHaveBeenCalledWith("admin", "123456");
    });
  });

  it("gọi setTokens với tokens và user từ response", async () => {
    const mockRes = {
      access_token: "acc",
      refresh_token: "ref",
      user: { role: "Student" },
    };
    loginApi.mockResolvedValue(mockRes);

    render(<Login />);
    typeAndLogin();

    await waitFor(() => {
      expect(setTokens).toHaveBeenCalledWith("acc", "ref", mockRes.user);
    });
  });

  it("navigate đến /dashboard khi role = Admin", async () => {
    loginApi.mockResolvedValue({
      access_token: "acc",
      refresh_token: "ref",
      user: { role: "Admin" },
    });

    render(<Login />);
    typeAndLogin();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("navigate đến /schedule khi role = Teacher", async () => {
    loginApi.mockResolvedValue({
      access_token: "acc",
      refresh_token: "ref",
      user: { role: "Teacher" },
    });

    render(<Login />);
    typeAndLogin();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/schedule");
    });
  });

  it("navigate đến / khi role = Student (hoặc role khác)", async () => {
    loginApi.mockResolvedValue({
      access_token: "acc",
      refresh_token: "ref",
      user: { role: "Student" },
    });

    render(<Login />);
    typeAndLogin();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("hiện lỗi 'sai mật khẩu' khi server trả invalid credentials", async () => {
    loginApi.mockRejectedValue({
      response: { data: { error: "invalid credentials" } },
    });

    render(<Login />);
    typeAndLogin();

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith(
        "Tên đăng nhập hoặc mật khẩu không đúng."
      );
    });
  });

  it("hiện lỗi Facebook khi server trả error chứa FACEBOOK", async () => {
    loginApi.mockRejectedValue({
      response: { data: { error: "FACEBOOK_ACCOUNT" } },
    });

    render(<Login />);
    typeAndLogin();

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith(
        "Email này đã được đăng ký qua Facebook. Vui lòng đăng nhập bằng Facebook."
      );
    });
  });

  it("hiện lỗi Google khi server trả error chứa GOOGLE", async () => {
    loginApi.mockRejectedValue({
      response: { data: { error: "GOOGLE_ACCOUNT" } },
    });

    render(<Login />);
    typeAndLogin();

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith(
        "Email này đã được đăng ký qua Google. Vui lòng đăng nhập bằng Google."
      );
    });
  });

  it("hiện lỗi mặc định khi error không xác định", async () => {
    loginApi.mockRejectedValue({
      response: { data: { error: "some unknown error" } },
    });

    render(<Login />);
    typeAndLogin();

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith(
        "Đã có lỗi xảy ra. Vui lòng thử lại."
      );
    });
  });

  it("hiện lỗi mặc định khi response không có error field", async () => {
    loginApi.mockRejectedValue({ response: { data: {} } });

    render(<Login />);
    typeAndLogin();

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith(
        "Đã có lỗi xảy ra. Vui lòng thử lại."
      );
    });
  });
});

describe("3. googleLogin", () => {
  it("gọi googleTrigger khi bấm nút Google", () => {
    render(<Login />);
    fireEvent.click(screen.getByTestId("btn-google"));

    expect(mockGoogleTrigger).toHaveBeenCalled();
  });

  it("useGoogleLogin được khởi tạo với flow=implicit", () => {
    render(<Login />);

    expect(useGoogleLogin).toHaveBeenCalledWith(
      expect.objectContaining({ flow: "implicit" }),
    );
  });

  it("gọi googleLoginApi với access_token từ Google", async () => {
    googleLoginApi.mockResolvedValue({
      access_token: "acc",
      refresh_token: "ref",
      user: { role: "Student" },
    });

    render(<Login />);

    await act(async () => {
      await capturedGoogleOpts.onSuccess({ access_token: "google_token_abc" });
    });

    expect(googleLoginApi).toHaveBeenCalledWith("google_token_abc");
  });

  it("setTokens và navigate về / khi Google login thành công", async () => {
    const mockRes = {
      access_token: "acc",
      refresh_token: "ref",
      user: { role: "Student" },
    };
    googleLoginApi.mockResolvedValue(mockRes);

    render(<Login />);

    await act(async () => {
      await capturedGoogleOpts.onSuccess({ access_token: "google_token_abc" });
    });

    expect(setTokens).toHaveBeenCalledWith("acc", "ref", mockRes.user);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("hiện message.error khi Google login thất bại từ server", async () => {
    googleLoginApi.mockRejectedValue({
      response: { data: { error: "FACEBOOK_ACCOUNT" } },
    });

    render(<Login />);

    await act(async () => {
      await capturedGoogleOpts.onSuccess({ access_token: "bad_token" });
    });

    expect(message.error).toHaveBeenCalledWith(
      "Email này đã được đăng ký qua Facebook. Vui lòng đăng nhập bằng Facebook.",
    );
  });
});

describe("4. facebookLogin", () => {
  it("gọi FacebookLoginClient.login khi bấm nút Facebook", () => {
    render(<Login />);
    fireEvent.click(screen.getByTestId("btn-facebook"));

    expect(FacebookLoginClient.login).toHaveBeenCalled();
  });

  it("gọi facebookLoginApi với accessToken khi status=connected", async () => {
    facebookLoginApi.mockResolvedValue({
      access_token: "acc",
      refresh_token: "ref",
      user: { role: "Student" },
    });

    FacebookLoginClient.login.mockImplementation((callback) => {
      callback({
        status: "connected",
        authResponse: { accessToken: "fb_token_xyz" },
      });
    });

    render(<Login />);
    fireEvent.click(screen.getByTestId("btn-facebook"));

    await waitFor(() => {
      expect(facebookLoginApi).toHaveBeenCalledWith("fb_token_xyz");
    });
  });

  it("setTokens và navigate về / khi Facebook login thành công", async () => {
    const mockRes = {
      access_token: "acc",
      refresh_token: "ref",
      user: { role: "Student" },
    };
    facebookLoginApi.mockResolvedValue(mockRes);

    FacebookLoginClient.login.mockImplementation((callback) => {
      callback({
        status: "connected",
        authResponse: { accessToken: "fb_token_xyz" },
      });
    });

    render(<Login />);
    fireEvent.click(screen.getByTestId("btn-facebook"));

    await waitFor(() => {
      expect(setTokens).toHaveBeenCalledWith("acc", "ref", mockRes.user);
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("hiện message.error khi Facebook login thất bại từ server", async () => {
    facebookLoginApi.mockRejectedValue({
      response: { data: { error: "GOOGLE_ACCOUNT" } },
    });

    FacebookLoginClient.login.mockImplementation((callback) => {
      callback({
        status: "connected",
        authResponse: { accessToken: "fb_token_xyz" },
      });
    });

    render(<Login />);
    fireEvent.click(screen.getByTestId("btn-facebook"));

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith(
        "Email này đã được đăng ký qua Google. Vui lòng đăng nhập bằng Google."
      );
    });
  });

  it("không gọi facebookLoginApi khi status != connected", async () => {
    FacebookLoginClient.login.mockImplementation((callback) => {
      callback({ status: "not_authorized" });
    });

    render(<Login />);
    fireEvent.click(screen.getByTestId("btn-facebook"));

    await waitFor(() => {
      expect(facebookLoginApi).not.toHaveBeenCalled();
    });
  });
});

describe("5. translateError", () => {
  const cases = [
    ["FACEBOOK_ACCOUNT", "Email này đã được đăng ký qua Facebook. Vui lòng đăng nhập bằng Facebook."],
    ["GOOGLE_ACCOUNT",   "Email này đã được đăng ký qua Google. Vui lòng đăng nhập bằng Google."],
    ["invalid password", "Tên đăng nhập hoặc mật khẩu không đúng."],
    ["unauthorized",     "Tên đăng nhập hoặc mật khẩu không đúng."],
    ["No grant",         "Tên đăng nhập hoặc mật khẩu không đúng."],
    ["random error",     "Đã có lỗi xảy ra. Vui lòng thử lại."],
    [undefined,          "Đã có lỗi xảy ra. Vui lòng thử lại."],
  ];

  it.each(cases)(
    'translateError("%s") → "%s" (kiểm tra gián tiếp qua message.error)',
    async (errorMsg, expected) => {
      loginApi.mockRejectedValue({
        response: { data: { error: errorMsg } },
      });

      render(<Login />);
      typeAndLogin();

      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith(expected);
      });
    }
  );
});