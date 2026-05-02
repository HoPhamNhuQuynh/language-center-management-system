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

  const fetchDashboard = async (year, quarter) => {
    try {
      setLoading(true);
      const data = await getDashboardApi(year, quarter);
      setSummary(data.summary);
      setRevenueSummary(data.revenue_summary);
      setRevenueByQuarter(data.revenue_by_quarter);
      setPaymentStatusStats(data.payment_status_stats);
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
              <div className="filter-item">
                <label>Năm</label>
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              </div>
              <div className="filter-item">
                <label>Quý</label>
                <select value={selectedQuarter} onChange={(e) => setSelectedQuarter(e.target.value)}>
                  <option value="1">Quý 1</option>
                  <option value="2">Quý 2</option>
                  <option value="3">Quý 3</option>
                  <option value="4">Quý 4</option>
                </select>
              </div>
            </div>
          </div>

          <Spin spinning={loading} description="Đang tải...">
            <Row gutter={[16, 16]}>
              {[
                { title: "Tổng học viên",  value: summary.total_students,    color: "#104c82" },
                { title: "Tổng khóa học",  value: summary.total_courses,     color: "#d4a04d" },
                { title: "Tổng lớp học",   value: summary.total_classes,     color: "#6395b9" },
                { title: "Tổng đăng ký",   value: summary.total_enrollments, color: "#44a66a" },
              ].map((item, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                  <Card className="stat-card" style={{ backgroundColor: item.color }}>
                    <Statistic
                      title={<span style={{ color: "#fff" }}>{item.title}</span>}
                      value={item.value}
                      styles={{ content: { color: "#fff", fontSize: "28px", fontWeight: "bold" } }}
                    />
                  </Card>
                </Col>
              ))}
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: "20px" }}>

              <Col lg={6} md={24}>
                <Card title="DOANH THU" className="revenue-card dark-card">
                  <div className="revenue-value">{formatVND(revenueSummary.total)} ₫</div>
                  <div style={{ marginTop: 8 }}>{renderGrowthRate()}</div>
                </Card>
              </Col>

              <Col lg={12} md={24}>
                <Card title="THU NHẬP THEO QUÝ" className="chart-card">
                  <div style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueByQuarter}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="label" />
                        <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} />
                        <Tooltip formatter={(v) => `${formatVND(v)} ₫`} />
                        <Bar dataKey="total" fill="#1890ff" radius={[4, 4, 0, 0]} name="Doanh thu" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>

              <Col lg={6} md={24}>
                <Card title="TRẠNG THÁI GIAO DỊCH" className="chart-card">
                  <div style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentStatusStats}
                          dataKey="count"
                          nameKey="label"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={4}
                        >
                          {paymentStatusStats.map((entry) => (
                            <Cell
                              key={entry.status}
                              fill={STATUS_COLORS[entry.status] ?? "#8884d8"}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v, name) => [`${v} giao dịch`, name]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>

            </Row>
          </Spin>

          <div className="action-buttons">
            <Button type="primary" size="large" icon={<DownloadOutlined />}>XUẤT BÁO CÁO</Button>
            <Button size="large" icon={<PrinterOutlined />}>IN BÁO CÁO</Button>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;