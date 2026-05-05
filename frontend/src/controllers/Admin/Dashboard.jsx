import {
  Layout, Row, Col, Card, Statistic, Button, Typography, Spin,
} from "antd";
import { ArrowUpOutlined, ArrowDownOutlined, DownloadOutlined, PrinterOutlined } from "@ant-design/icons";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import "../../styles/Dashboard.css";
import { Content } from "antd/es/layout/layout";
import { useEffect, useState } from "react";
import { getDashboardApi } from "../../services/manageService";

const { Text } = Typography;

const STATUS_COLORS = {
  SUCCESS: "#44a66a",
  FAILED:  "#e05c5c",
  PENDING: "#d4a04d",
};

const formatVND = (value) =>
  new Intl.NumberFormat("vi-VN").format(value);

const Dashboard = () => {
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedQuarter, setSelectedQuarter] = useState("1");
  const [loading, setLoading] = useState(false);

  const [summary, setSummary] = useState({
    total_students: 0,
    total_courses: 0,
    total_classes: 0,
    total_enrollments: 0,
  });
  const [revenueSummary, setRevenueSummary] = useState({
    total: 0,
    prev_total: 0,
    growth_rate: null,
  });
  const [revenueByQuarter, setRevenueByQuarter] = useState([]);   
  const [paymentStatusStats, setPaymentStatusStats] = useState([]);   
  const [passRateStats, setPassRateStats] = useState({
    total: 0,
    passed: 0,
    failed: 0,
    pass_rate: 0,
  });

  const fetchDashboard = async (year, quarter) => {
    try {
      setLoading(true);
      const data = await getDashboardApi(year, quarter);
      console.info(data)
      setSummary(data.summary);
      setRevenueSummary(data.revenue_summary);
      setRevenueByQuarter(data.revenue_by_quarter);
      setPaymentStatusStats(data.payment_status_stats);
      setPassRateStats(data.pass_rate_stats);
    } catch (ex) {
      console.error(ex);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(selectedYear, selectedQuarter);
  }, [selectedYear, selectedQuarter]);


  const renderGrowthRate = () => {
    const { growth_rate } = revenueSummary;
    if (growth_rate === null) return <Text style={{ color: "#aaa" }}>Chưa có dữ liệu quý trước</Text>;
    if (growth_rate >= 0)
      return <Text style={{ color: "#44a66a" }}><ArrowUpOutlined /> Tăng {growth_rate}% so với quý trước</Text>;
    return <Text style={{ color: "#e05c5c" }}><ArrowDownOutlined /> Giảm {Math.abs(growth_rate)}% so với quý trước</Text>;
  };

  return (
    <Layout className="dashboard-layout">
      <Layout>
        <Content className="dashboard-content">
          <div className="content-header">
            <div className="dashboard-filters">
              <div className="ds-filter-item">
                <label>Năm</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              </div>
              <div className="ds-filter-item">
                <label>Quý</label>
                <select
                  value={selectedQuarter}
                  onChange={(e) => setSelectedQuarter(e.target.value)}
                >
                  <option value="1">Quý 1</option>
                  <option value="2">Quý 2</option>
                  <option value="3">Quý 3</option>
                  <option value="4">Quý 4</option>
                </select>
              </div>
            </div>
            <div className="action-buttons">
              <Button type="primary" size="large" icon={<DownloadOutlined />}>
                Xuất báo cáo
              </Button>
              <Button size="large" icon={<PrinterOutlined />}>
                In báo cáo
              </Button>
            </div>
          </div>

          <Spin spinning={loading}>
            {/* ── Top stat cards ── */}
            <Row gutter={[14, 14]}>
              {[
                {
                  title: "Tổng học viên",
                  value: summary.total_students,
                  cls: "navy",
                },
                {
                  title: "Tổng khóa học",
                  value: summary.total_courses,
                  cls: "gold",
                },
                {
                  title: "Tổng lớp học",
                  value: summary.total_classes,
                  cls: "accent",
                },
                {
                  title: "Tổng đăng ký",
                  value: summary.total_enrollments,
                  cls: "teal",
                },
              ].map((item, i) => (
                <Col xs={24} sm={12} lg={6} key={i}>
                  <Card className={`stat-card ${item.cls}`}>
                    <Statistic title={item.title} value={item.value} />
                  </Card>
                </Col>
              ))}
            </Row>

            {/* ── Main row ── */}
            <Row gutter={[14, 14]} style={{ marginTop: 14 }}>
              <Col
                lg={5}
                md={24}
                style={{ display: "flex", flexDirection: "column" }}
              >
                <Card
                  title="Doanh thu"
                  className="dark-card"
                  style={{ marginBottom: 14 }}
                >
                  <div className="revenue-value">
                    {formatVND(revenueSummary.total)} ₫
                  </div>
                  <div style={{ marginTop: 10 }}>{renderGrowthRate()}</div>
                </Card>

                <Card
                  title="Trạng thái giao dịch"
                  className="chart-card"
                  style={{ flex: 1, display: "flex", flexDirection: "column" }}
                  styles={{
                    body: { flex: 1, display: "flex", flexDirection: "column" },
                  }}
                >
                  <div style={{ flex: 1, minHeight: 180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentStatusStats}
                          dataKey="count"
                          nameKey="label"
                          innerRadius={48}
                          outerRadius={72}
                          paddingAngle={3}
                        >
                          {paymentStatusStats.map((entry) => (
                            <Cell
                              key={entry.status}
                              fill={STATUS_COLORS[entry.status] ?? "#8884d8"}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v, name) => [`${v} giao dịch`, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="legend-list">
                    {paymentStatusStats.map((entry) => (
                      <div className="legend-row-item" key={entry.status}>
                        <div className="legend-dot-label">
                          <span
                            className="legend-dot"
                            style={{
                              background:
                                STATUS_COLORS[entry.status] ?? "#8884d8",
                            }}
                          />
                          {entry.label}
                        </div>
                        <span className="legend-count">{entry.count}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>

              <Col lg={13} md={24}>
                <Card
                  title="Thu nhập theo quý"
                  className="chart-card"
                  style={{ height: "100%" }}
                >
                  <div style={{ height: 360 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueByQuarter} barSize={48}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#e8eef5"
                        />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 12, fill: "#6b7d94" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tickFormatter={(v) =>
                            `${(v / 1_000_000).toFixed(0)}M`
                          }
                          tick={{ fontSize: 12, fill: "#6b7d94" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          formatter={(v) => [`${formatVND(v)} ₫`, "Doanh thu"]}
                          cursor={{ fill: "#f0f4f9" }}
                          contentStyle={{
                            borderRadius: 8,
                            border: "1px solid #d0dae8",
                            fontSize: 12,
                          }}
                        />
                        <Bar
                          dataKey="total"
                          fill="#2d7dd2"
                          radius={[6, 6, 0, 0]}
                          name="Doanh thu"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>

              <Col lg={6} md={24}>
                <Card
                  title="Tỉ lệ đạt điểm trung bình"
                  className="chart-card"
                  style={{ height: "100%" }}
                >
                  <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
                    <div
                      style={{
                        fontSize: 48,
                        fontWeight: 700,
                        color: "#1a8a6e",
                        lineHeight: 1,
                      }}
                    >
                      {passRateStats.pass_rate}%
                    </div>
                    <div
                      style={{ fontSize: 12, color: "#6b7d94", marginTop: 6 }}
                    >
                      học viên đạt điểm ≥ 5.0
                    </div>
                  </div>

                  <div className="progress-wrap">
                    <div className="progress-bg">
                      <div
                        className="progress-fill"
                        style={{ width: `${passRateStats.pass_rate}%` }}
                      />
                    </div>
                    <div className="progress-labels">
                      <span>0%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <div className="pass-stat-grid">
                    <div className="pass-stat-box pass">
                      <div className="pass-stat-num">
                        {passRateStats.passed}
                      </div>
                      <div className="pass-stat-label">Đạt</div>
                    </div>
                    <div className="pass-stat-box fail">
                      <div className="pass-stat-num">
                        {passRateStats.failed}
                      </div>
                      <div className="pass-stat-label">Chưa đạt</div>
                    </div>
                  </div>

                  <div style={{ height: 160, marginTop: 16 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            {
                              label: "Đạt (≥ 5.0)",
                              count: passRateStats.passed,
                            },
                            {
                              label: "Chưa đạt (< 5.0)",
                              count: passRateStats.failed,
                            },
                          ]}
                          dataKey="count"
                          nameKey="label"
                          innerRadius={42}
                          outerRadius={65}
                          paddingAngle={3}
                          startAngle={90}
                          endAngle={-270}
                        >
                          <Cell fill="#1a8a6e" />
                          <Cell fill="#c0392b" />
                        </Pie>
                        <Tooltip
                          formatter={(v, name) => [`${v} học viên`, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="legend-list">
                    {[
                      {
                        color: "#1a8a6e",
                        label: "Đạt (≥ 5.0)",
                        count: passRateStats.passed,
                      },
                      {
                        color: "#c0392b",
                        label: "Chưa đạt (< 5.0)",
                        count: passRateStats.failed,
                      },
                    ].map((item) => (
                      <div className="legend-row-item" key={item.label}>
                        <div className="legend-dot-label">
                          <span
                            className="legend-dot"
                            style={{ background: item.color }}
                          />
                          {item.label}
                        </div>
                        <span className="legend-count">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>
            </Row>
          </Spin>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;