import { Input, Button, Card, Table } from "antd";
import { useNavigate } from "react-router-dom";
import { SearchOutlined } from "@ant-design/icons";
import PaymentForm from "./PaymentForm";
import ConfirmForm from "./ConfirmForm";
import BillViewForm from "./BillViewForm";

function CourseRegisterForm({ search, course, selected_class, payment, method, percent, confirm, bill, paid,
  setPercent, setMethod, setSearch, setPayment, setConfirm, setBill, setPaid, onSearch, onSelectClass, onSubmit }) {
  const user = localStorage.getItem("user");
  const currentUser = user ? JSON.parse(user) : null;
  const navigate = useNavigate();
  const isPaid = paid;
  const columns = [
    { title: "Mã lớp", dataIndex: "id", key: "id" },
    { title: "Tên lớp", dataIndex: "name", key: "name" },
    { title: "Chỗ trống", dataIndex: "remaining_slots", key: "remaining_slots" },
    { title: "Ngày bắt đầu", dataIndex: "start_date", key: "start_date" },
    { title: "Ngày kết thúc", dataIndex: "end_date", key: "end_date" },
  ];
  const sharedData = {
    ...(course || {}),
    classId: selected_class?.id,
    className: selected_class?.name,
    courseName: course?.name,
    total: course?.price,
    studentId: currentUser?.id,
    studentname: `${currentUser?.last_name || ""} ${currentUser?.first_name || ""}`.trim(),
    email: currentUser?.email,
    phone: currentUser?.profile?.phone_num || "",
  }
  return (
    <div style={{ padding: "20px", minHeight: "100vh", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Card style={{ width: 1200, borderRadius: 20, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} styles={{ body: { padding: 20 } }}>
          <div style={{ padding: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: 35, margin: 0, color: "#191970" }}>{course?.name || "COURSE NAME"}</h1>
              </div>
              <div style={{ flex: 1, textAlign: "left", lineHeight: 1.8, paddingLeft: 20 }}>
                <p style={{ margin: 0 }}><b>Level:</b> {course?.level_name || "N/A"}</p>
                <p style={{ margin: 0 }}><b>Số buổi:</b> {course?.total_sessions || "0"}</p>
                <p style={{ margin: 0 }}><b>Mô tả:</b> {course?.description || "Chưa có mô tả."}</p>
              </div>
              <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
                <Input
                  prefix={<SearchOutlined />}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onPressEnter={onSearch}
                  placeholder="Tìm lớp học..."
                  style={{ width: 300, height: 45, borderRadius: 25 }}
                />
              </div>
            </div>

            <Card style={{ marginBottom: 20, borderRadius: 15, overflow: "hidden" }}>
              <Table
                columns={columns}
                dataSource={course?.classes || []}
                rowKey="id"
                pagination={false}
                rowSelection={{
                  type: "radio",
                  selectedRowKeys: selected_class ? [selected_class.id] : [],
                  onChange: (_, selectedRows) => onSelectClass(selectedRows[0]),
                }}
                onRow={(record) => ({
                  onClick: () => onSelectClass(record),
                })}
              />
            </Card>

            <Card style={{ borderRadius: 15, background: "#f9f9f9" }}>
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 20 }}>
                <h3 style={{ margin: 0 }}>
                  Học phí: <span style={{ color: "#d4380d" }}>{course?.price ? Number(course.price).toLocaleString('vi-VN') : "0"} VND</span>
                </h3>
                <Button
                  type="primary"
                  style={{ width: 200, height: 50, borderRadius: 25, fontWeight: "bold", background: "#191970", border: "none" }}
                  onClick={() => {
                    if (!selected_class) return alert("Vui lòng chọn lớp!");
                    setPayment(true);
                  }}
                >
                  ĐĂNG KÝ NGAY
                </Button>
              </div>
            </Card>
          </div>
        </Card>
      </div>

      {(payment || confirm || bill) && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999
        }}>
          <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            {payment && (
              <PaymentForm
                data={sharedData}
                method={method} setMethod={setMethod}
                percent={percent} setPercent={setPercent}
                onSubmit={() => {
                  setPayment(false);
                  setConfirm(true);
                }}
                setPayment={setPayment}
                setBill={setBill} 
                isPaid={paid}
                onClose={() => {
                  setPayment(false);
                }}
              />
            )}

            {confirm && (
              <ConfirmForm
                data={sharedData}
                onSubmit={() => { 
                  onSubmit(); }}
                setBill={setBill} isPaid={paid}
                onCancel={() => { 
                  setConfirm(false); 
                }}
                onClose={() => { setConfirm(false); setPayment(true); }}
              />
            )}

            {bill && (
              <BillViewForm
                data={{ 
                  ...sharedData, 
                  total: selected_class?.price,
                  paymentMethod: method,
                  paymentStatus: status,
                }}
                onClose={() => {
                  setBill(false);
                  navigate("/course-list");
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseRegisterForm;
