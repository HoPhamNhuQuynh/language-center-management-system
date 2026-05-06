import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const exportDashboardCSV = ({
  summary,
  revenueSummary,
  revenueByQuarter,
  paymentStatusStats,
  passRateStats,
  selectedYear,
  selectedQuarter,
}) => {
  const rows = [
    ["=== DASHBOARD REPORT ==="],
    [],
    ["-- Summary --"],
    ["Tổng học viên", summary.total_students],
    ["Tổng khóa học", summary.total_courses],
    ["Tổng lớp học", summary.total_classes],
    ["Tổng đăng ký", summary.total_enrollments],
    [],
    ["-- Doanh thu --"],
    ["Tổng doanh thu", revenueSummary.total],
    ["Tăng trưởng (%)", revenueSummary.growth_rate ?? "N/A"],
    [],
    ["-- Doanh thu theo quý --"],
    ["Quý", "Doanh thu"],
    ...revenueByQuarter.map((q) => [q.label, q.total]),
    [],
    ["-- Trạng thái thanh toán --"],
    ["Trạng thái", "Số lượng"],
    ...paymentStatusStats.map((s) => [s.label, s.count]),
    [],
    ["-- Tỉ lệ đạt --"],
    ["Đạt", passRateStats.passed],
    ["Chưa đạt", passRateStats.failed],
    ["Tỉ lệ (%)", passRateStats.pass_rate],
  ];

  const csvContent = "\uFEFF" + rows.map((e) => e.join(",")).join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `dashboard_${selectedYear}_Q${selectedQuarter}.csv`;
  link.click();
};

export const exportDashboardPDF = async (selector, fileName = "report.pdf") => {
  const element = document.querySelector(selector);
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2, // tăng nét
    useCORS: true,
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");

  const pageWidth = 210;
  const pageHeight = 297;

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * pageWidth) / canvas.width;

  let position = 0;

  while (position < imgHeight) {
    pdf.addImage(imgData, "PNG", 0, -position, imgWidth, imgHeight);
    position += pageHeight;

    if (position < imgHeight) pdf.addPage();
  }

  pdf.save(fileName);
};
