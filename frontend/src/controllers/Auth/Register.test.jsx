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

beforeEach(() => {
  vi.clearAllMocks();
  capturedGoogleOpts = {};
});

afterEach(() => {
  cleanup();
});

describe("1. Khởi tạo", () => {
  it("render RegisterForm và khởi tạo Facebook SDK khi mount", () => {
    render(<Register />);

    expect(screen.getByTestId("btn-register")).toBeInTheDocument();
    expect(FacebookLoginClient.loadSdk).toHaveBeenCalledWith("vi_VN");
  });

  it("không gọi registerApi khi chỉ render", () => {
    render(<Register />);
    expect(registerApi).not.toHaveBeenCalled();
  });
});

describe("2. handleRegister", () => {
  it("gọi registerApi với đúng payload", async () => {
    registerApi.mockResolvedValue({
      access: "acc",
      refresh: "ref",
      user: { role: "Student" },
    });

    render(<Register />);
    fireEvent.click(screen.getByTestId("btn-register"));

    await waitFor(() => {
      expect(registerApi).toHaveBeenCalledWith({
        last_name: "Nguyen",
        first_name: "An",
        phone_num: "0901234567",
        username: "annguyen",
        email: "an@gmail.com",
        password: "Password123",
      });
    });
  });

  it("gọi setTokens với access, refresh, user từ response", async () => {
    const mockRes = {
      access: "acc",
      refresh: "ref",
      user: { role: "Student" },
    };
    registerApi.mockResolvedValue(mockRes);

    render(<Register />);
    fireEvent.click(screen.getByTestId("btn-register"));

    await waitFor(() => {
      expect(setTokens).toHaveBeenCalledWith("acc", "ref", mockRes.user);
    });
  });

  it("navigate về / sau khi đăng ký thành công", async () => {
    registerApi.mockResolvedValue({
      access: "acc",
      refresh: "ref",
      user: { role: "Student" },
    });

    render(<Register />);
    fireEvent.click(screen.getByTestId("btn-register"));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("hiện message.success sau khi đăng ký thành công", async () => {
    registerApi.mockResolvedValue({
      access: "acc",
      refresh: "ref",
      user: { role: "Student" },
    });

    render(<Register />);
    fireEvent.click(screen.getByTestId("btn-register"));

    await waitFor(() => {
      expect(message.success).toHaveBeenCalledWith("Đăng ký thành công!");
    });
  });

  it("hiện lỗi 'Tài khoản đã tồn tại' khi server trả data.username", async () => {
    registerApi.mockRejectedValue({
      response: { data: { username: ["Username already exists"] } },
    });

    render(<Register />);
    fireEvent.click(screen.getByTestId("btn-register"));

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith("Tài khoản đã tồn tại");
    });
  });

  it("hiện lỗi 'Tài khoản đã tồn tại' khi server trả data.email", async () => {
    registerApi.mockRejectedValue({
      response: { data: { email: ["Email already exists"] } },
    });

    render(<Register />);
    fireEvent.click(screen.getByTestId("btn-register"));

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith("Tài khoản đã tồn tại");
    });
  });

  it("hiện lỗi 'Mật khẩu không hợp lệ' khi server trả data.password", async () => {
    registerApi.mockRejectedValue({
      response: { data: { password: ["Password too weak"] } },
    });

    render(<Register />);
    fireEvent.click(screen.getByTestId("btn-register"));

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith("Mật khẩu không hợp lệ");
    });
  });

  it("hiện lỗi 'Số điện thoại không hợp lệ' khi server trả data.phone_num", async () => {
    registerApi.mockRejectedValue({
      response: { data: { phone_num: ["Invalid phone"] } },
    });

    render(<Register />);
    fireEvent.click(screen.getByTestId("btn-register"));

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith("Số điện thoại không hợp lệ");
    });
  });

  it("hiện lỗi mặc định khi server không trả field cụ thể", async () => {
    registerApi.mockRejectedValue({
      response: { data: {} },
    });

    render(<Register />);
    fireEvent.click(screen.getByTestId("btn-register"));

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith("Đăng ký thất bại");
    });
  });

  it("hiện lỗi mặc định khi không có response (network error)", async () => {
    registerApi.mockRejectedValue(new Error("Network Error"));

    render(<Register />);
    fireEvent.click(screen.getByTestId("btn-register"));

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith("Đăng ký thất bại");
    });
  });
});

describe("3. googleLogin", () => {
  it("gọi googleTrigger khi bấm nút Google", () => {
    render(<Register />);
    fireEvent.click(screen.getByTestId("btn-google"));

    expect(mockGoogleTrigger).toHaveBeenCalled();
  });

  it("useGoogleLogin được khởi tạo với flow=implicit", () => {
    render(<Register />);

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

    render(<Register />);

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

    render(<Register />);

    await act(async () => {
      await capturedGoogleOpts.onSuccess({ access_token: "google_token_abc" });
    });

    expect(setTokens).toHaveBeenCalledWith("acc", "ref", mockRes.user);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("hiện message.error khi Google login thất bại", async () => {
    googleLoginApi.mockRejectedValue({
      response: { data: { error: "some error" } },
    });

    render(<Register />);

    await act(async () => {
      await capturedGoogleOpts.onSuccess({ access_token: "bad_token" });
    });

    expect(message.error).toHaveBeenCalledWith("Google login thất bại");
  });

  it("onError: không crash khi err không có response.data", () => {
    render(<Register />);

    // capturedGoogleOpts.onError được set khi component mount
    expect(() => {
      capturedGoogleOpts.onError({ message: "popup_closed" });
    }).not.toThrow();
  });

  it("onError: không crash khi err có response.data", () => {
    render(<Register />);

    expect(() => {
      capturedGoogleOpts.onError({
        response: { data: { detail: "some error" } },
      });
    }).not.toThrow();
  });
});

describe("4. facebookLogin", () => {
  it("gọi FacebookLoginClient.login khi bấm nút Facebook", () => {
    render(<Register />);
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

    render(<Register />);
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

    render(<Register />);
    fireEvent.click(screen.getByTestId("btn-facebook"));

    await waitFor(() => {
      expect(setTokens).toHaveBeenCalledWith("acc", "ref", mockRes.user);
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("hiện message.error khi status != connected", async () => {
    FacebookLoginClient.login.mockImplementation((callback) => {
      callback({ status: "not_authorized" });
    });

    render(<Register />);
    fireEvent.click(screen.getByTestId("btn-facebook"));

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith("Facebook login thất bại");
    });
  });

  it("không gọi facebookLoginApi khi status != connected", async () => {
    FacebookLoginClient.login.mockImplementation((callback) => {
      callback({ status: "not_authorized" });
    });

    render(<Register />);
    fireEvent.click(screen.getByTestId("btn-facebook"));

    await waitFor(() => {
      expect(facebookLoginApi).not.toHaveBeenCalled();
    });
  });

  it("không crash khi facebookLoginApi reject với response.data", async () => {
    facebookLoginApi.mockRejectedValue({
      response: { data: { detail: "some error" } },
    });

    FacebookLoginClient.login.mockImplementation((callback) => {
      callback({
        status: "connected",
        authResponse: { accessToken: "fb_token_xyz" },
      });
    });

    render(<Register />);

    await expect(async () => {
      fireEvent.click(screen.getByTestId("btn-facebook"));
      await waitFor(() => expect(facebookLoginApi).toHaveBeenCalled());
    }).not.toThrow();
  });

  it("không crash khi facebookLoginApi reject không có response", async () => {
    facebookLoginApi.mockRejectedValue(new Error("Network Error"));

    FacebookLoginClient.login.mockImplementation((callback) => {
      callback({
        status: "connected",
        authResponse: { accessToken: "fb_token_xyz" },
      });
    });

    render(<Register />);
    fireEvent.click(screen.getByTestId("btn-facebook"));

    await waitFor(() => expect(facebookLoginApi).toHaveBeenCalled());
    // Không throw, không navigate
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
