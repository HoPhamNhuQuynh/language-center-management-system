import { Card, Divider, Button } from "antd";
import { Link } from "react-router-dom";
import { CloseOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

function ConfirmForm({
  data = {},
  method,
  percent,
  onSubmit,
  onCancel,
  onClose,
}) {
  const navigate = useNavigate();
  const getValue = (value) => value || "---";

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
      <Card style={{ width: 700, borderRadius: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: "1px solid #ccc",
            borderRadius: 10,
            padding: "10px 0",
            textAlign: "center",
            marginBottom: 20,
            background: "#1a1059",
          }}
        >
          <div style={{ width: 32 }} />
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, color: "#ffff" }}>XÁC NHẬN</h2>
          </div>
        </div>

        <h3 style={{ marginBottom: 15, textAlign: "left" }}>
          THÔNG TIN HỌC VIÊN
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            textAlign: "left",
            lineHeight: 1.8,
          }}
        >
          <div>
            <b>Mã học viên:</b> {getValue(data?.studentId)}
          </div>
          <div>
            <b>Tên học viên:</b> {getValue(data?.studentname)}
          </div>
          <div>
            <b>Email:</b> {getValue(data?.email)}
          </div>
          <div>
            <b>SĐT:</b> {getValue(data?.phone)}
          </div>
        </div>

        <Divider />

        <h3 style={{ marginBottom: 15, textAlign: "left" }}>
          THÔNG TIN LỚP HỌC
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 12,
            textAlign: "left",
            lineHeight: 1.8,
          }}
        >
          <div>
            <b>Mã lớp:</b> {getValue(data?.classId)}
          </div>
          <div>
            <b>Tên lớp:</b> {getValue(data?.className)}
          </div>
          <div>
            <b>Khóa học:</b> {getValue(data?.courseName)}
          </div>
        </div>

        <h2 style={{ textAlign: "center", marginTop: 25 }}>
          Tổng học phí:{" "}
          {data?.total ? Number(data.total).toLocaleString("vi-VN") : "0"} VND
        </h2>

        <div
          style={{
            display: "flex",
            justifyContent: "right",
            gap: 15,
            marginTop: 25,
          }}
        >
          <Button style={{ fontWeight: "bold" }} onClick={onCancel}>
            HỦY
          </Button>
          <Button
            style={{ background: "#1a1059", fontWeight: "bold" }}
            type="primary"
            onClick={onSubmit}
          >
            THANH TOÁN
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default ConfirmForm;
