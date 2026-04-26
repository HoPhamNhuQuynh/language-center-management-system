import { Card, Divider, Button } from "antd";
import { Link } from "react-router-dom";
import { CloseOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

function ConfirmForm({ data = {}, method, percent, onSubmit, onCancel }) {
  const navigate = useNavigate();
  const getValue = (value) => value || "---";

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
      <Card style={{ width: 700, borderRadius: 20 }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30, paddingBottom: 15, borderBottom: "1px solid #eee" }}>
          <div style={{ fontSize: 28, fontWeight: "bold", color: "#1677ff" }}>
            LOGO
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ textAlign: "right" }}>
              <div>Name: {getValue(data?.name)}</div>
              <div>ID: {getValue(data?.studentId)}</div>
            </div>

            <Link to="/">
              <Button>Đăng xuất</Button>
            </Link>
          </div>
        </div>


        <div style={{ display: "flex", alignItems: "center", border: "1px solid #ccc", borderRadius: 10, padding: "10px 0", textAlign: "center", marginBottom: 20, background: "#f5f5f5" }}>
          <div style={{ width: 32 }} />
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0 }}>XÁC NHẬN</h2>
          </div>

          <Button type="text" icon={<CloseOutlined />} onClick={onCancel} />
        </div>

        <h3 style={{ marginBottom: 15, textAlign: "left" }}>THÔNG TIN HỌC VIÊN</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, textAlign: "left", lineHeight: 1.8 }}>
          <div><b>Mã học viên:</b> {getValue(data?.studentId)}</div>
          <div><b>Tên học viên:</b> {getValue(data?.name)}</div>
          <div><b>Email:</b> {getValue(data?.email)}</div>
          <div><b>SĐT:</b> {getValue(data?.phone)}</div>
        </div>

        <Divider />

        <h3 style={{ marginBottom: 15, textAlign: "left" }}>THÔNG TIN LỚP HỌC</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, textAlign: "left", lineHeight: 1.8 }}>
          <div><b>Mã lớp:</b> {getValue(data?.classId)}</div>
          <div><b>Tên lớp:</b> {getValue(data?.className)}</div>
          <div><b>Khóa học:</b> {getValue(data?.course)}</div>
        </div>


        <h2 style={{ textAlign: "left", marginTop: 25 }}>
          Tổng học phí: {(data?.total || 0).toLocaleString()} VND
        </h2>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 25 }}>
          <Button onClick={onCancel}>HỦY</Button>
          <Button type="primary" onClick={onSubmit}>THANH TOÁN</Button>
        </div>

      </Card>
    </div>
  );
}

export default ConfirmForm;