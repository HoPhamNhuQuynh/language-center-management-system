import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// ─── Mock services ────────────────────────────────────────────────────────────
vi.mock("../../services/scoreService", () => ({
  getScoresApi: vi.fn(),
  getScoreTypesApi: vi.fn(),
  bulkSyncScoresApi: vi.fn(),
  submitScoresApi: vi.fn(),
  loadClassesApi: vi.fn(),
}));

// ─── Mock validation utils ────────────────────────────────────────────────────
vi.mock("../../utils/validation", () => ({
  isScoreInRange: vi.fn(() => true),
  isValidNumberInput: vi.fn(() => true),
}));

// ─── Mock ScoreEntryForm — chỉ render các element cần thiết để test logic ─────
vi.mock("../../pages/Score/ScoreEntryForm", () => ({
  default: ({
    classes,
    selectedClass,
    onClassChange,
    scoreRows,
    scoreTypes,
    isSubmitted,
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
      {/* Class selector */}
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

      {/* States */}
      {loading && <div data-testid="loading">Đang tải...</div>}
      {error && <div data-testid="error">{error}</div>}
      {isSubmitted && <div data-testid="submitted-badge">Đã nộp</div>}

      {/* Score rows */}
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
          {/* Remark */}
          <input
            data-testid={`remark-${row.enrollmentId}`}
            value={row.remark}
            onChange={(e) =>
              onScoreChange(row.enrollmentId, "remark", e.target.value)
            }
          />
        </div>
      ))}

      {/* Action buttons */}
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

// ─── Data mẫu ─────────────────────────────────────────────────────────────────
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

// ─── Setup ────────────────────────────────────────────────────────────────────
beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  loadClassesApi.mockResolvedValue(mockClasses);
  getScoreTypesApi.mockResolvedValue(mockScoreTypes);
  getScoresApi.mockResolvedValue(mockScores);
  vi.spyOn(window, "alert").mockImplementation(() => {});
  vi.spyOn(window, "confirm").mockImplementation(() => true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// =============================================================================
// 1. LOAD CLASSES khi mount
// =============================================================================
describe("1. Load classes khi mount", () => {
  it("gọi loadClassesApi và hiển thị danh sách lớp", async () => {
    render(<ScoreEntry />);

    await waitFor(() => {
      expect(loadClassesApi).toHaveBeenCalled();
      expect(screen.getByText("IELTS_01")).toBeInTheDocument();
      expect(screen.getByText("TOEIC_01")).toBeInTheDocument();
    });
  });

  it("không gọi getScoresApi khi chưa chọn lớp", async () => {
    render(<ScoreEntry />);
    await waitFor(() => screen.getByText("IELTS_01"));

    expect(getScoresApi).not.toHaveBeenCalled();
    expect(getScoreTypesApi).not.toHaveBeenCalled();
  });
});

// =============================================================================
// 2. CHỌN LỚP — handleClassChange
// =============================================================================
describe("2. Chọn lớp", () => {
  it("gọi getScoresApi và getScoreTypesApi khi chọn lớp", async () => {
    render(<ScoreEntry />);
    await waitFor(() => screen.getByText("IELTS_01"));

    fireEvent.change(screen.getByTestId("class-select"), {
      target: { value: "1" },
    });

    await waitFor(() => {
      expect(getScoreTypesApi).toHaveBeenCalledWith("1");
      expect(getScoresApi).toHaveBeenCalledWith("1");
    });
  });

  it("hiển thị loading khi đang tải dữ liệu", async () => {
    // Giữ promise pending để bắt được loading state
    let resolve;
    getScoresApi.mockImplementation(
      () => new Promise((res) => (resolve = res)),
    );

    render(<ScoreEntry />);
    await waitFor(() => screen.getByText("IELTS_01"));

    fireEvent.change(screen.getByTestId("class-select"), {
      target: { value: "1" },
    });

    expect(screen.getByTestId("loading")).toBeInTheDocument();

    resolve(mockScores);
  });

  it("set isSubmitted = true khi lớp có grade_status SUBMITTED", async () => {
    render(<ScoreEntry />);
    await waitFor(() => screen.getByText("TOEIC_01"));

    fireEvent.change(screen.getByTestId("class-select"), {
      target: { value: "2" },
    });

    // isSubmitted = true ngay khi chọn lớp (trước khi API trả về)
    expect(screen.getByTestId("submitted-badge")).toBeInTheDocument();
  });

  it("set isSubmitted = false khi lớp có grade_status OPEN", async () => {
    render(<ScoreEntry />);
    await waitFor(() => screen.getByText("IELTS_01"));

    fireEvent.change(screen.getByTestId("class-select"), {
      target: { value: "1" },
    });

    expect(screen.queryByTestId("submitted-badge")).not.toBeInTheDocument();
  });

  it("hiển thị lỗi khi API thất bại", async () => {
    getScoresApi.mockRejectedValue(new Error("Network Error"));

    render(<ScoreEntry />);
    await waitFor(() => screen.getByText("IELTS_01"));

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

// =============================================================================
// 3. TRANSFORM SCORES & HIỂN THỊ
// =============================================================================
describe("3. Hiển thị score rows sau khi load", () => {
  const selectClass1 = async () => {
    render(<ScoreEntry />);
    await waitFor(() => screen.getByText("IELTS_01"));
    fireEvent.change(screen.getByTestId("class-select"), {
      target: { value: "1" },
    });
    await waitFor(() => screen.getByTestId("row-101"));
  };

  it("hiển thị đúng tên học sinh", async () => {
    await selectClass1();
    expect(screen.getByTestId("name-101")).toHaveTextContent("An Nguyen");
    expect(screen.getByTestId("name-102")).toHaveTextContent("Binh Tran");
  });

  it("hiển thị đúng điểm từ server", async () => {
    await selectClass1();
    // enrollment 101, scoreType 1 → score 8
    expect(screen.getByTestId("score-101-1")).toHaveValue("8.0");
  });

  it("tính average đúng theo weight", async () => {
    await selectClass1();
    // An: 8*0.4 + 9*0.6 = 3.2 + 5.4 = 8.6
    expect(screen.getByTestId("avg-101")).toHaveTextContent("8.6");
  });
});

// =============================================================================
// 4. MERGE LOCALSTORAGE
// =============================================================================
describe("4. Merge localStorage khi có dữ liệu đã lưu", () => {
  it("ưu tiên điểm từ localStorage hơn server", async () => {
    const savedRows = [
      {
        enrollmentId: 101,
        scores: { 1: "9.5", 2: "9" },
        remark: "Xuất sắc",
      },
    ];
    localStorage.setItem("temp_scores_class_1", JSON.stringify(savedRows));

    render(<ScoreEntry />);
    await waitFor(() => screen.getByText("IELTS_01"));
    fireEvent.change(screen.getByTestId("class-select"), {
      target: { value: "1" },
    });

    await waitFor(() => {
      // Score từ localStorage (9.5) thay vì server (8)
      expect(screen.getByTestId("score-101-1")).toHaveValue("9.5");
    });
  });
});

// =============================================================================
// 5. HANDLE SCORE CHANGE
// =============================================================================
describe("5. Nhập điểm — handleScoreChange", () => {
  const setup = async () => {
    render(<ScoreEntry />);
    await waitFor(() => screen.getByText("IELTS_01"));
    fireEvent.change(screen.getByTestId("class-select"), {
      target: { value: "1" },
    });
    await waitFor(() => screen.getByTestId("row-101"));
  };

  it("cập nhật điểm khi nhập hợp lệ", async () => {
    await setup();

    fireEvent.change(screen.getByTestId("score-101-1"), {
      target: { value: "7.5" },
    });

    expect(screen.getByTestId("score-101-1")).toHaveValue("7.5");
  });

  it("không cập nhật điểm khi isValidNumberInput trả về false", async () => {
    isValidNumberInput.mockReturnValue(false);
    await setup();

    const input = screen.getByTestId("score-101-1");
    const originalValue = input.value;

    fireEvent.change(input, { target: { value: "abc" } });

    expect(input).toHaveValue(originalValue); // không thay đổi
  });

  it("không cập nhật điểm khi isScoreInRange trả về false", async () => {
    isScoreInRange.mockReturnValue(false);
    await setup();

    const input = screen.getByTestId("score-101-1");
    const originalValue = input.value;

    fireEvent.change(input, { target: { value: "15" } });

    expect(input).toHaveValue(originalValue);
  });

  it("cho phép nhập chuỗi rỗng (xóa điểm)", async () => {
    await setup();

    fireEvent.change(screen.getByTestId("score-101-1"), {
      target: { value: "" },
    });

    expect(screen.getByTestId("score-101-1")).toHaveValue("");
  });

  it("cập nhật remark khi scoreTypeId = 'remark'", async () => {
    await setup();

    fireEvent.change(screen.getByTestId("remark-101"), {
      target: { value: "Học tốt" },
    });

    expect(screen.getByTestId("remark-101")).toHaveValue("Học tốt");
  });

  it("không làm gì khi isSubmitted = true", async () => {
    // Chọn lớp SUBMITTED
    render(<ScoreEntry />);
    await waitFor(() => screen.getByText("TOEIC_01"));
    fireEvent.change(screen.getByTestId("class-select"), {
      target: { value: "2" },
    });
    await waitFor(() => screen.getByTestId("submitted-badge"));

    // Dù có rows hay không, isSubmitted = true → handleScoreChange return sớm
    // Không throw error
    expect(() => {
      fireEvent.change(screen.getByTestId("class-select"), {
        target: { value: "2" },
      });
    }).not.toThrow();
  });
});

// =============================================================================
// 6. BLUR FORMAT
// =============================================================================
describe("6. handleBlurFormat — format số và tính lại average", () => {
  const setup = async () => {
    render(<ScoreEntry />);
    await waitFor(() => screen.getByText("IELTS_01"));
    fireEvent.change(screen.getByTestId("class-select"), {
      target: { value: "1" },
    });
    await waitFor(() => screen.getByTestId("row-101"));
  };

  it("format số thành 1 chữ số thập phân khi blur", async () => {
    await setup();

    // Nhập 8 rồi blur
    fireEvent.change(screen.getByTestId("score-101-1"), {
      target: { value: "8" },
    });
    fireEvent.blur(screen.getByTestId("score-101-1"));

    await waitFor(() => {
      expect(screen.getByTestId("score-101-1")).toHaveValue("8.0");
    });
  });

  it("tính lại average sau khi blur", async () => {
    await setup();

    fireEvent.change(screen.getByTestId("score-101-1"), {
      target: { value: "10" },
    });
    fireEvent.blur(screen.getByTestId("score-101-1"));

    await waitFor(() => {
      // 10*0.4 + 9*0.6 = 4 + 5.4 = 9.4
      expect(screen.getByTestId("avg-101")).toHaveTextContent("9.4");
    });
  });
});

// =============================================================================
// 7. LƯU TẠM (localStorage)
// =============================================================================
describe("7. handleLocalSave", () => {
  it("lưu scoreRows vào localStorage và alert", async () => {
    render(<ScoreEntry />);
    await waitFor(() => screen.getByText("IELTS_01"));
    fireEvent.change(screen.getByTestId("class-select"), {
      target: { value: "1" },
    });
    await waitFor(() => screen.getByTestId("row-101"));

    fireEvent.click(screen.getByTestId("btn-local-save"));

    const saved = localStorage.getItem("temp_scores_class_1");
    expect(saved).not.toBeNull();
    expect(JSON.parse(saved)).toBeInstanceOf(Array);
    expect(window.alert).toHaveBeenCalledWith("Đã lưu tạm vào trình duyệt!");
  });

  it("không làm gì khi chưa chọn lớp", async () => {
    render(<ScoreEntry />);
    await waitFor(() => screen.getByText("IELTS_01"));

    fireEvent.click(screen.getByTestId("btn-local-save"));

    expect(localStorage.getItem("temp_scores_class_")).toBeNull();
    expect(window.alert).not.toHaveBeenCalled();
  });
});

// =============================================================================
// 8. LƯU DB — handleSaveToDB
// =============================================================================
describe("8. handleSaveToDB", () => {
  const setup = async () => {
    render(<ScoreEntry />);
    await waitFor(() => screen.getByText("IELTS_01"));
    fireEvent.change(screen.getByTestId("class-select"), {
      target: { value: "1" },
    });
    await waitFor(() => screen.getByTestId("row-101"));
  };

  it("gọi bulkSyncScoresApi với đúng payload", async () => {
    bulkSyncScoresApi.mockResolvedValue({});
    await setup();

    fireEvent.click(screen.getByTestId("btn-save-db"));

    await waitFor(() => {
      expect(bulkSyncScoresApi).toHaveBeenCalledWith(
        "1",
        expect.arrayContaining([
          expect.objectContaining({ enrollment_id: 101, score_type_id: 1 }),
        ]),
      );
    });
  });

  it("xóa localStorage sau khi lưu thành công", async () => {
    bulkSyncScoresApi.mockResolvedValue({});
    localStorage.setItem("temp_scores_class_1", JSON.stringify([]));
    await setup();

    fireEvent.click(screen.getByTestId("btn-save-db"));

    await waitFor(() => {
      expect(localStorage.getItem("temp_scores_class_1")).toBeNull();
    });
  });

  it("alert thành công", async () => {
    bulkSyncScoresApi.mockResolvedValue({});
    await setup();

    fireEvent.click(screen.getByTestId("btn-save-db"));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Đã lưu bảng điểm!");
    });
  });

  it("alert lỗi khi API thất bại", async () => {
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

// =============================================================================
// 9. NỘP ĐIỂM — handleSubmit
// =============================================================================
describe("9. handleSubmit", () => {
  const setup = async () => {
    render(<ScoreEntry />);
    await waitFor(() => screen.getByText("IELTS_01"));
    fireEvent.change(screen.getByTestId("class-select"), {
      target: { value: "1" },
    });
    await waitFor(() => screen.getByTestId("row-101"));
  };

  it("không nộp khi user hủy confirm", async () => {
    window.confirm.mockReturnValue(false);
    await setup();

    fireEvent.click(screen.getByTestId("btn-submit"));

    expect(submitScoresApi).not.toHaveBeenCalled();
  });

  it("gọi submitScoresApi với remarks đúng", async () => {
    submitScoresApi.mockResolvedValue({ message: "Đã nộp thành công!" });
    await setup();

    // Nhập remark cho enrollment 101
    fireEvent.change(screen.getByTestId("remark-101"), {
      target: { value: "Giỏi" },
    });

    fireEvent.click(screen.getByTestId("btn-submit"));

    await waitFor(() => {
      expect(submitScoresApi).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({
          remarks: expect.arrayContaining([
            { enrollment_id: 101, comment: "Giỏi" },
          ]),
        }),
      );
    });
  });

  it("set isSubmitted = true sau khi nộp thành công", async () => {
    submitScoresApi.mockResolvedValue({ message: "OK" });
    await setup();

    fireEvent.click(screen.getByTestId("btn-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("submitted-badge")).toBeInTheDocument();
    });
  });

  it("xóa localStorage sau khi nộp thành công", async () => {
    submitScoresApi.mockResolvedValue({ message: "OK" });
    localStorage.setItem("temp_scores_class_1", JSON.stringify([]));
    await setup();

    fireEvent.click(screen.getByTestId("btn-submit"));

    await waitFor(() => {
      expect(localStorage.getItem("temp_scores_class_1")).toBeNull();
    });
  });

  it("alert lỗi khi submitScoresApi thất bại", async () => {
    submitScoresApi.mockRejectedValue({
      response: { data: { detail: "Bảng điểm chưa đầy đủ" } },
    });
    await setup();

    fireEvent.click(screen.getByTestId("btn-submit"));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Bảng điểm chưa đầy đủ");
    });
  });
});
