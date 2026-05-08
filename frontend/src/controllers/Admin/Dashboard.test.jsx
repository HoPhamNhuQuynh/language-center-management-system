import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("../../services/manageService", () => ({
  getDashboardApi: vi.fn(),
}));

vi.mock("../../utils/exportFile", () => ({
  exportDashboardCSV: vi.fn(),
  exportDashboardPDF: vi.fn(),
}));

vi.mock("recharts", () => ({
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => null,
  Cell: () => null,
  Legend: () => null,
}));

vi.mock("antd", () => ({
  Layout: ({ children }) => <div>{children}</div>,
  Row: ({ children }) => <div>{children}</div>,
  Col: ({ children }) => <div>{children}</div>,
  Card: ({ children, title }) => (
    <div>
      {title && <div>{title}</div>}
      {children}
    </div>
  ),
  Statistic: ({ title, value }) => (
    <div>
      <span>{title}</span>
      <span>{value}</span>
    </div>
  ),
  Button: ({ children, onClick }) => (
    <button onClick={onClick}>{children}</button>
  ),
  Typography: {
    Text: ({ children }) => <span>{children}</span>,
  },
  Spin: ({ children }) => <div>{children}</div>,
}));

vi.mock("@ant-design/icons", () => ({
  ArrowUpOutlined: () => <span>UpIcon</span>,
  ArrowDownOutlined: () => <span>DownIcon</span>,
  DownloadOutlined: () => <span>DownloadIcon</span>,
  PrinterOutlined: () => <span>PrinterIcon</span>,
}));

import { getDashboardApi } from "../../services/manageService";
import { exportDashboardCSV, exportDashboardPDF } from "../../utils/exportFile";
import Dashboard from "./Dashboard";

const mockData = {
  summary: {
    total_students: 120,
    total_courses: 10,
    total_classes: 25,
    total_enrollments: 300,
  },
  revenue_summary: {
    total: 50000000,
    prev_total: 40000000,
    growth_rate: 25,
  },
  revenue_by_quarter: [
    { label: "Tháng 1", total: 10000000 },
    { label: "Tháng 2", total: 20000000 },
    { label: "Tháng 3", total: 20000000 },
  ],
  payment_status_stats: [
    { status: "SUCCESS", label: "Thành công", count: 80 },
    { status: "FAILED", label: "Thất bại", count: 10 },
    { status: "PENDING", label: "Đang chờ", count: 5 },
  ],
  pass_rate_stats: {
    total: 100,
    passed: 80,
    failed: 20,
    pass_rate: 80,
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  getDashboardApi.mockResolvedValue(mockData);
});

describe("Dashboard", () => {
  describe("1. Load dữ liệu", () => {
    it("DAS-001 gọi getDashboardApi với năm và quý mặc định khi mount", async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(getDashboardApi).toHaveBeenCalledWith("2026", "1");
      });
    });

    it("DAS-002 hiển thị đúng các số liệu summary", async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText("Tổng học viên")).toBeInTheDocument();
        expect(screen.getByText("Tổng khóa học")).toBeInTheDocument();
        expect(screen.getByText("Tổng lớp học")).toBeInTheDocument();
        expect(screen.getByText("Tổng đăng ký")).toBeInTheDocument();
      });
    });

    it("DAS-003 hiển thị doanh thu đúng định dạng VND", async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(/50\.000\.000/)).toBeInTheDocument();
      });
    });

    it("DAS-004 hiển thị tỉ lệ đạt đúng", async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText("Đạt")).toBeInTheDocument();
        expect(screen.getByText("Chưa đạt")).toBeInTheDocument();
      });
    });

    it("DAS-005 hiển thị đúng legend trạng thái giao dịch", async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText("Thành công")).toBeInTheDocument();
        expect(screen.getByText("Thất bại")).toBeInTheDocument();
        expect(screen.getByText("Đang chờ")).toBeInTheDocument();
      });
    });
  });

  describe("2. renderGrowthRate", () => {
    it("DAS-006 hiển thị tăng trưởng khi growth_rate > 0", async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(
          screen.getByText(/Tăng 25% so với quý trước/),
        ).toBeInTheDocument();
      });
    });

    it("DAS-007 hiển thị giảm khi growth_rate < 0", async () => {
      getDashboardApi.mockResolvedValue({
        ...mockData,
        revenue_summary: {
          total: 30000000,
          prev_total: 40000000,
          growth_rate: -10,
        },
      });
      render(<Dashboard />);

      await waitFor(() => {
        expect(
          screen.getByText(/Giảm 10% so với quý trước/),
        ).toBeInTheDocument();
      });
    });

    it("DAS-008 hiển thị 'Chưa có dữ liệu quý trước' khi growth_rate là null", async () => {
      getDashboardApi.mockResolvedValue({
        ...mockData,
        revenue_summary: { total: 50000000, prev_total: 0, growth_rate: null },
      });
      render(<Dashboard />);

      await waitFor(() => {
        expect(
          screen.getByText("Chưa có dữ liệu quý trước"),
        ).toBeInTheDocument();
      });
    });

    it("DAS-009 hiển thị tăng 0% khi growth_rate === 0", async () => {
      getDashboardApi.mockResolvedValue({
        ...mockData,
        revenue_summary: {
          total: 50000000,
          prev_total: 50000000,
          growth_rate: 0,
        },
      });
      render(<Dashboard />);

      await waitFor(() => {
        expect(
          screen.getByText(/Tăng 0% so với quý trước/),
        ).toBeInTheDocument();
      });
    });
  });

  describe("3. Filter năm và quý", () => {
    it("DAS-012 gọi lại API khi đổi năm", async () => {
      render(<Dashboard />);
      await waitFor(() =>
        expect(getDashboardApi).toHaveBeenCalledWith("2026", "1"),
      );

      fireEvent.change(screen.getByDisplayValue("2026"), {
        target: { value: "2025" },
      });

      await waitFor(() => {
        expect(getDashboardApi).toHaveBeenCalledWith("2025", "1");
      });
    });

    it("DAS-011 gọi lại API khi đổi quý", async () => {
      render(<Dashboard />);
      await waitFor(() =>
        expect(getDashboardApi).toHaveBeenCalledWith("2026", "1"),
      );

      fireEvent.change(screen.getByDisplayValue("Quý 1"), {
        target: { value: "3" },
      });

      await waitFor(() => {
        expect(getDashboardApi).toHaveBeenCalledWith("2026", "3");
      });
    });

    it("DAS-010 gọi lại API khi đổi cả năm lẫn quý", async () => {
      render(<Dashboard />);
      await waitFor(() => getDashboardApi.mock.calls.length > 0);

      fireEvent.change(screen.getByDisplayValue("2026"), {
        target: { value: "2025" },
      });
      fireEvent.change(screen.getByDisplayValue("Quý 1"), {
        target: { value: "2" },
      });

      await waitFor(() => {
        expect(getDashboardApi).toHaveBeenCalledWith("2025", "2");
      });
    });
  });

  describe("4. Export", () => {
    it("DAS-013 gọi exportDashboardCSV khi click Xuất báo cáo", async () => {
      render(<Dashboard />);
      await waitFor(() => screen.getByText("Xuất báo cáo"));

      fireEvent.click(screen.getByText("Xuất báo cáo"));

      expect(exportDashboardCSV).toHaveBeenCalledWith(
        expect.objectContaining({
          summary: mockData.summary,
          revenueSummary: mockData.revenue_summary,
          selectedYear: "2026",
          selectedQuarter: "1",
        }),
      );
    });

    it("DAS-014 gọi exportDashboardPDF khi click In báo cáo", async () => {
      render(<Dashboard />);
      await waitFor(() => screen.getByText("In báo cáo"));

      fireEvent.click(screen.getByText("In báo cáo"));

      expect(exportDashboardPDF).toHaveBeenCalledWith(
        ".dashboard-content",
        "dashboard_2026_Q1.pdf",
      );
    });

    it("DAS-015 exportDashboardPDF tên file đúng khi đổi năm và quý", async () => {
      render(<Dashboard />);
      await waitFor(() => getDashboardApi.mock.calls.length > 0);

      fireEvent.change(screen.getByDisplayValue("2026"), {
        target: { value: "2025" },
      });
      fireEvent.change(screen.getByDisplayValue("Quý 1"), {
        target: { value: "3" },
      });

      await waitFor(() => screen.getByText("In báo cáo"));
      fireEvent.click(screen.getByText("In báo cáo"));

      expect(exportDashboardPDF).toHaveBeenCalledWith(
        ".dashboard-content",
        "dashboard_2025_Q3.pdf",
      );
    });
  });

  describe("5. Dữ liệu rỗng", () => {
    it("hiển thị 0 khi summary rỗng", async () => {
      getDashboardApi.mockResolvedValue({
        ...mockData,
        summary: {
          total_students: 0,
          total_courses: 0,
          total_classes: 0,
          total_enrollments: 0,
        },
      });
      render(<Dashboard />);

      await waitFor(() => {
        const zeros = screen.getAllByText("0");
        expect(zeros.length).toBeGreaterThanOrEqual(4);
      });
    });

    it("DAS-016 hiển thị 0% khi pass_rate = 0", async () => {
      getDashboardApi.mockResolvedValue({
        ...mockData,
        pass_rate_stats: {
          total: 0,
          passed: 0,
          failed: 0,
          pass_rate: 0,
        },
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getAllByText(/^0%$/).length).toBeGreaterThan(0);
      });
    });
  });

  describe("6. Lỗi API", () => {
    it("không crash khi getDashboardApi thất bại", async () => {
      getDashboardApi.mockRejectedValue(new Error("Network error"));
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText("Tổng học viên")).toBeInTheDocument();
      });
    });
  });
});
