import { Card, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

function BillViewForm({ data = {} }) {
  const navigate = useNavigate();
  const getValue = (v) => v || "---";

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Card style={{ width: 750, borderRadius: 8, textAlign: "center", position: "relative" }}>

          <CloseOutlined
            onClick={() => navigate("/course-register")}
            style={{ position: "absolute", right: 20, top: 20, fontSize: 16, cursor: "pointer" }}
          />

          <h2 style={{ marginBottom: 5, fontWeight: "bold" }}>BIÊN LAI THU PHÍ</h2>
          <div>Số chứng từ: {getValue(data.receiptId)}</div>
          <div>Ngày: {getValue(data.date)}</div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 30, fontWeight: 500 }}>
            <div>HỌ VÀ TÊN: {getValue(data.name)}</div>
            <div>MÃ SỐ HỌC VIÊN: {getValue(data.studentId)}</div>
          </div>

          <div style={{ borderTop: "1px solid #000", margin: "20px 0" }} />

          <div style={{ textAlign: "left", marginBottom: 10 }}>
            <div style={{ marginBottom: 10 }}>
              <b>PHƯƠNG THỨC THANH TOÁN:</b> {getValue(data.method)}
            </div>
            <div>
              <b>TRẠNG THÁI THANH TOÁN:</b> {getValue(data.status)}
            </div>
          </div>

          <div style={{ border: "1px solid #000", marginTop: 20 }}>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr", borderBottom: "1px solid #000", fontWeight: "bold", padding: 10 }}>
              <div>CLASS NAME</div>
              <div>MS</div>
              <div>BUỔI</div>
              <div>TỔNG</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr", padding: 10, alignItems: "center" }}>
              <div>{getValue(data.className)}</div>
              <div>{getValue(data.classId)}</div>
              <div>{getValue(data.sessions)}</div>
              <div style={{ color: "red", fontWeight: "bold" }}>
                {(data.total || 0).toLocaleString()} VND
              </div>
            </div>

          </div>

          <div style={{ marginTop: 30 }}>
            <Button style={{ background: "#000", color: "#fff", borderRadius: 20, padding: "6px 25px" }}>
              XUẤT BIÊN LAI
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default BillViewForm;