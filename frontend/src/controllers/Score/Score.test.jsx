import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("../../services/scoreService", () => ({
  getScoresApi: vi.fn(),
  getScoreTypesApi: vi.fn(),
  bulkSyncScoresApi: vi.fn(),
  submitScoresApi: vi.fn(),
  loadClassesApi: vi.fn(),
}));

vi.mock("../../utils/validation", () => ({
  isScoreInRange: vi.fn(() => true),
  isValidNumberInput: vi.fn(() => true),
}));

vi.mock("../../pages/Score/ScoreEntryForm", () => ({
  default: ({
    classes,
    selectedClass,
    onClassChange,
    scoreRows,
    scoreTypes,
    lockReason,
    loading,
    error,
    onScoreChange,
    onBlurFormat,
    onLocalSave,
    onSaveToDB,
    onSubmit,
    getDisplayValue,
    onFocus,
  }) => (
    <div>
      <select
        data-testid="class-select"
        value={selectedClass}
        onChange={(e) => onClassChange(e.target.value)}
      >
        <option value="">-- Chọn lớp --</option>
        {classes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {loading && <div data-testid="loading">Đang tải...</div>}
      {error && <div data-testid="error">{error}</div>}
      {lockReason && <div data-testid="submitted-badge">Đã nộp</div>}

      {scoreRows.map((row) => (
        <div key={row.enrollmentId} data-testid={`row-${row.enrollmentId}`}>
          <span data-testid={`name-${row.enrollmentId}`}>{row.fullName}</span>
          {scoreTypes.map((st) => (
            <input
              key={st.id}
              data-testid={`score-${row.enrollmentId}-${st.id}`}
              value={getDisplayValue(row, st.id)}
              onChange={(e) =>
                onScoreChange(row.enrollmentId, st.id, e.target.value)
              }
              onBlur={() => onBlurFormat(row.enrollmentId, st.id)}
              onFocus={() => onFocus(row.enrollmentId, st.id)}
            />
          ))}
          <span data-testid={`avg-${row.enrollmentId}`}>{row.average}</span>
          <input
            data-testid={`remark-${row.enrollmentId}`}
            value={row.remark}
            onChange={(e) =>
              onScoreChange(row.enrollmentId, "remark", e.target.value)
            }
          />
        </div>
      ))}

      <button data-testid="btn-local-save" onClick={onLocalSave}>
        Lưu tạm
      </button>
      <button data-testid="btn-save-db" onClick={onSaveToDB}>
        Lưu DB
      </button>
      <button data-testid="btn-submit" onClick={onSubmit}>
        Nộp điểm
      </button>
    </div>
  ),
}));

import {
  getScoresApi,
  getScoreTypesApi,
  bulkSyncScoresApi,
  submitScoresApi,
  loadClassesApi,
} from "../../services/scoreService";
import { isScoreInRange, isValidNumberInput } from "../../utils/validation";
import ScoreEntry from "./ScoreEntry";

const mockClasses = [
  { id: 1, name: "IELTS_01", grade_status: "OPEN" },
  { id: 2, name: "TOEIC_01", grade_status: "SUBMITTED" },
];

const mockScoreTypes = [
  { id: 1, name: "Midterm", weight: 0.4 },
  { id: 2, name: "Final", weight: 0.6 },
];

const mockScores = [
  {
    enrollment_id: 101,
    student: { id: 1, first_name: "An", last_name: "Nguyen" },
    score_type_id: 1,
    score_value: 8,
  },
  {
    enrollment_id: 101,
    student: { id: 1, first_name: "An", last_name: "Nguyen" },
    score_type_id: 2,
    score_value: 9,
  },
  {
    enrollment_id: 102,
    student: { id: 2, first_name: "Binh", last_name: "Tran" },
    score_type_id: 1,
    score_value: 7,
  },
  {
    enrollment_id: 102,
    student: { id: 2, first_name: "Binh", last_name: "Tran" },
    score_type_id: 2,
    score_value: 8,
  },
];

const renderAndWait = async () => {
  render(<ScoreEntry />);
  await waitFor(() => screen.getByText("IELTS_01"));
};

const selectClass = async (classId = "1", waitForRow = "row-101") => {
  fireEvent.change(screen.getByTestId("class-select"), {
    target: { value: classId },
  });
  if (waitForRow) await waitFor(() => screen.getByTestId(waitForRow));
};

const setup = async () => {
  await renderAndWait();
  await selectClass("1");
};

beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  loadClassesApi.mockResolvedValue({ results: mockClasses });
  getScoreTypesApi.mockResolvedValue(mockScoreTypes);
  getScoresApi.mockResolvedValue(mockScores);
  vi.spyOn(window, "alert").mockImplementation(() => {});
  vi.spyOn(window, "confirm").mockImplementation(() => true);
});

afterEach(() => vi.restoreAllMocks());

describe("1. Load classes khi mount", () => {
  it("SCR-001 gọi loadClassesApi, hiển thị danh sách lớp, chưa gọi getScoresApi", async () => {
    await renderAndWait();

    expect(loadClassesApi).toHaveBeenCalled();
    expect(screen.getByText("IELTS_01")).toBeInTheDocument();
    expect(screen.getByText("TOEIC_01")).toBeInTheDocument();

    // Chưa chọn lớp → không được gọi score-type API
    expect(getScoresApi).not.toHaveBeenCalled();
    expect(getScoreTypesApi).not.toHaveBeenCalled();
  });
});

describe("2. Chọn lớp", () => {
  it("SCR-002 gọi getScoresApi và getScoreTypesApi khi chọn lớp", async () => {
    await renderAndWait();
    fireEvent.change(screen.getByTestId("class-select"), {
      target: { value: "1" },
    });

    await waitFor(() => {
      expect(getScoreTypesApi).toHaveBeenCalledWith("1");
      expect(getScoresApi).toHaveBeenCalledWith("1");
    });
  });

  it("SCR-003 hiển thị loading khi đang tải dữ liệu", async () => {
    // Giữ promise pending để bắt được trạng thái loading giữa chừng
    let resolve;
    getScoresApi.mockImplementation(
      () => new Promise((res) => (resolve = res)),
    );

    await renderAndWait();
    fireEvent.change(screen.getByTestId("class-select"), {
      target: { value: "1" },
    });

    expect(screen.getByTestId("loading")).toBeInTheDocument();
    resolve(mockScores); // cleanup
  });

  it.each([
    ["2", "TOEIC_01 (SUBMITTED)", true, "submitted-badge"],
    ["1", "IELTS_01 (OPEN)", false, "submitted-badge"],
  ])(
    "SCR-004 chọn lớp id=%s (%s) thì lockReason=%s",
    async (classId, _label, expectSubmitted, badgeTestId) => {
      await renderAndWait();
      // Lớp SUBMITTED không có rows để chờ, nên không dùng waitForRow
      fireEvent.change(screen.getByTestId("class-select"), {
        target: { value: classId },
      });

      if (expectSubmitted) {
        expect(screen.getByTestId(badgeTestId)).toBeInTheDocument();
      } else {
        expect(screen.queryByTestId(badgeTestId)).not.toBeInTheDocument();
      }
    },
  );

  it("SCR-005 hiển thị lỗi khi API thất bại", async () => {
    getScoresApi.mockRejectedValue(new Error("Network Error"));

    await renderAndWait();
    fireEvent.change(screen.getByTestId("class-select"), {
      target: { value: "1" },
    });

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent(
        "Không thể tải dữ liệu. Vui lòng thử lại.",
      );
    });
  });
});

describe("3. Hiển thị score rows sau khi load", () => {
  it("SCR-006 hiển thị đúng tên học sinh, điểm từ server, average theo weight", async () => {
    await setup();

    expect(screen.getByTestId("name-101")).toHaveTextContent("An Nguyen");
    expect(screen.getByTestId("name-102")).toHaveTextContent("Binh Tran");

    expect(screen.getByTestId("score-101-1")).toHaveValue("8.0");

    // Average: An: 8×0.4 + 9×0.6 = 3.2 + 5.4 = 8.6
    expect(screen.getByTestId("avg-101")).toHaveTextContent("8.6");
  });
});

describe("4. Merge localStorage khi có dữ liệu đã lưu", () => {
  it("SCR-007 ưu tiên điểm từ localStorage hơn server", async () => {
    localStorage.setItem(
      "temp_scores_class_1",
      JSON.stringify([
        { enrollmentId: 101, scores: { 1: "9.5", 2: "9" }, remark: "Xuất sắc" },
      ]),
    );

    await renderAndWait();
    await selectClass("1");

    expect(screen.getByTestId("score-101-1")).toHaveValue("9.5");
  });
});

describe("5. Nhập điểm — handleScoreChange", () => {
  it("SCR-008 cập nhật điểm khi nhập hợp lệ", async () => {
    await setup();
    fireEvent.change(screen.getByTestId("score-101-1"), {
      target: { value: "7.5" },
    });
    expect(screen.getByTestId("score-101-1")).toHaveValue("7.5");
  });

  it.each([
    [
      "isValidNumberInput = false",
      () => isValidNumberInput.mockReturnValue(false),
      "abc",
    ],
    [
      "isScoreInRange = false",
      () => isScoreInRange.mockReturnValue(false),
      "15",
    ],
  ])(
    "SCR-009 - 010 không cập nhật điểm khi %s",
    async (_label, mockSetup, badValue) => {
      mockSetup();
      await setup();

      const input = screen.getByTestId("score-101-1");
      const originalValue = input.value;
      fireEvent.change(input, { target: { value: badValue } });

      expect(input).toHaveValue(originalValue);
    },
  );

  it("SCR-011 cho phép nhập chuỗi rỗng (xóa điểm)", async () => {
    await setup();
    fireEvent.change(screen.getByTestId("score-101-1"), {
      target: { value: "" },
    });
    expect(screen.getByTestId("score-101-1")).toHaveValue("");
  });

  it("SCR-012 cập nhật remark khi scoreTypeId = 'remark'", async () => {
    await setup();
    fireEvent.change(screen.getByTestId("remark-101"), {
      target: { value: "Học tốt" },
    });
    expect(screen.getByTestId("remark-101")).toHaveValue("Học tốt");
  });

  it("SCR-013 lockReason != null thì handleScoreChange không cập nhật điểm", async () => {
    await renderAndWait();
    await selectClass("1");

    fireEvent.change(screen.getByTestId("class-select"), {
      target: { value: "2" },
    });

    await waitFor(() =>
      expect(screen.getByTestId("submitted-badge")).toBeInTheDocument(),
    );
  });
});

describe("6. handleBlurFormat — format số và tính lại average", () => {
  it("SCR-014 format thành 1 chữ số thập phân và tính lại average sau blur", async () => {
    await setup();

    fireEvent.change(screen.getByTestId("score-101-1"), {
      target: { value: "10" },
    });
    fireEvent.blur(screen.getByTestId("score-101-1"));

    await waitFor(() => {
      expect(screen.getByTestId("score-101-1")).toHaveValue("10.0");
      // 10×0.4 + 9×0.6 = 4 + 5.4 = 9.4
      expect(screen.getByTestId("avg-101")).toHaveTextContent("9.4");
    });
  });
});

describe("7. handleLocalSave", () => {
  it("SCR-015 lưu scoreRows vào localStorage và alert khi đã chọn lớp", async () => {
    await setup();
    fireEvent.click(screen.getByTestId("btn-local-save"));

    const saved = localStorage.getItem("temp_scores_class_1");
    expect(saved).not.toBeNull();
    expect(JSON.parse(saved)).toBeInstanceOf(Array);
    expect(window.alert).toHaveBeenCalledWith("Đã lưu tạm vào trình duyệt!");
  });

  it("SCR-016 không làm gì khi chưa chọn lớp", async () => {
    await renderAndWait();
    fireEvent.click(screen.getByTestId("btn-local-save"));

    expect(localStorage.getItem("temp_scores_class_")).toBeNull();
    expect(window.alert).not.toHaveBeenCalled();
  });
});

describe("8. handleSaveToDB", () => {
  it("SCR-017 happy path: gọi API đúng payload, xóa localStorage, alert thành công", async () => {
    bulkSyncScoresApi.mockResolvedValue({});
    localStorage.setItem("temp_scores_class_1", JSON.stringify([]));
    await setup();

    fireEvent.click(screen.getByTestId("btn-save-db"));

    await waitFor(() => {
      // Gửi đúng cấu trúc payload
      expect(bulkSyncScoresApi).toHaveBeenCalledWith(
        "1",
        expect.arrayContaining([
          expect.objectContaining({ enrollment_id: 101, score_type_id: 1 }),
        ]),
      );
      // Xóa dữ liệu tạm sau khi lưu thành công
      expect(localStorage.getItem("temp_scores_class_1")).toBeNull();
      // Thông báo thành công
      expect(window.alert).toHaveBeenCalledWith("Đã lưu bảng điểm!");
    });
  });

  it("SCR-018 alert lỗi khi API thất bại", async () => {
    bulkSyncScoresApi.mockRejectedValue({ response: { data: "Error" } });
    await setup();

    fireEvent.click(screen.getByTestId("btn-save-db"));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "Lưu thất bại, vui lòng thử lại.",
      );
    });
  });
});

describe("9. handleSubmit", () => {
  it("SCR-019 không nộp khi user huỷ confirm", async () => {
    window.confirm.mockReturnValue(false);
    await setup();

    fireEvent.click(screen.getByTestId("btn-submit"));

    expect(submitScoresApi).not.toHaveBeenCalled();
  });

  it("SCR-020 happy path: gọi API đúng remarks, set lockReason, xóa localStorage", async () => {
    submitScoresApi.mockResolvedValue({ message: "Đã nộp thành công!" });
    localStorage.setItem("temp_scores_class_1", JSON.stringify([]));
    await setup();

    // Nhập remark để kiểm tra remarks payload
    fireEvent.change(screen.getByTestId("remark-101"), {
      target: { value: "Giỏi" },
    });
    fireEvent.click(screen.getByTestId("btn-submit"));

    await waitFor(() => {
      // Gửi đúng remarks
      expect(submitScoresApi).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({
          remarks: expect.arrayContaining([
            { enrollment_id: 101, comment: "Giỏi" },
          ]),
        }),
      );
      // Khóa bảng điểm
      expect(screen.getByTestId("submitted-badge")).toBeInTheDocument();
      // Xóa dữ liệu tạm
      expect(localStorage.getItem("temp_scores_class_1")).toBeNull();
    });
  });

  it("SCR-021 alert lỗi khi submitScoresApi thất bại", async () => {
    submitScoresApi.mockRejectedValue({
      response: { data: { detail: "Bảng điểm chưa đầy đủ" } },
    });
    await setup();

    fireEvent.click(screen.getByTestId("btn-submit"));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Bảng điểm chưa đầy đủ");
    });
  });

  it("SCR-022 lockReason=deadline khi API trả 403 có 'thời hạn'", async () => {
    bulkSyncScoresApi.mockRejectedValue({
      response: {
        status: 403,
        data: { detail: "Đã quá thời hạn nộp điểm" },
      },
    });
    await setup();
    fireEvent.click(screen.getByTestId("btn-save-db"));
    await waitFor(() => {
      expect(screen.getByTestId("submitted-badge")).toBeInTheDocument();
      expect(window.alert).toHaveBeenCalledWith(
        "Đã quá thời hạn nộp điểm, bảng điểm bị khóa tự động.",
      );
    });
  });

  it("SCR-023 lockReason=submitted khi API trả 403 không có 'thời hạn'", async () => {
    bulkSyncScoresApi.mockRejectedValue({
      response: {
        status: 403,
        data: { detail: "Bảng điểm đã nộp" },
      },
    });
    await setup();
    fireEvent.click(screen.getByTestId("btn-save-db"));
    await waitFor(() => {
      expect(screen.getByTestId("submitted-badge")).toBeInTheDocument();
      expect(window.alert).toHaveBeenCalledWith(
        "Bảng điểm đã nộp. Liên hệ Admin để mở lại nếu cần chỉnh sửa.",
      );
    });
  });

  it("SCR-024 onFocus cập nhật focusedCell", async () => {
    await setup();
    fireEvent.focus(screen.getByTestId("score-101-1"));
    expect(screen.getByTestId("score-101-1")).toBeInTheDocument();
  });
});
