import { Card, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

function BillViewForm({ data = {}, onClose }) {
  const navigate = useNavigate();
  const getValue = (v) => v || "---";

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Card style={{ width: 750, borderRadius: 8, textAlign: "center", position: "relative", overflow: "hidden" }}>

          <style>
            {`
              @media print {
                .no-print { 
                display: none !important; 
                }
                html, body {
                  height: 100%;
                  overflow: hidden;
                }
              }
            `}
          </style>

          <CloseOutlined
            onClick={onClose}
            className="no-print"
            style={{ position: "absolute", right: 20, top: 20, fontSize: 16, cursor: "pointer" }}
          />

          <h2 style={{ marginBottom: 5, fontWeight: "bold" }}>BIÊN LAI THU PHÍ</h2>
          <div>Số chứng từ: {getValue(data.receiptId)}</div>
          <div>Ngày: {getValue(data.created_at?.split("T")[0])}</div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 30, fontWeight: 500, paddingRight: 50 }}>
            <div>HỌ VÀ TÊN: {getValue(data.studentname)}</div>
            <div>MÃ SỐ HỌC VIÊN: {getValue(data.studentId)}</div>
          </div>

          <div style={{ borderTop: "1px solid #000", margin: "20px 0" }} />

          <div style={{ textAlign: "left", marginBottom: 10 }}>
            <div style={{ marginBottom: 10 }}>
              <b>PHƯƠNG THỨC THANH TOÁN:</b> {getValue(data.paymentMethod)}
            </div>
            <div>
              <b>TRẠNG THÁI THANH TOÁN:</b> {getValue(data.paymentStatus)}
            </div>
          </div>

          <div style={{ border: "1px solid #000", marginTop: 20 }}>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr", borderBottom: "1px solid #000", fontWeight: "bold", padding: 10 }}>
              <div>TÊN LỚP</div>
              <div>MÃ LỚP</div>
              <div>BUỔI</div>
              <div>TỔNG HỌC PHÍ</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr", padding: 10, alignItems: "center" }}>
              <div>{getValue(data.className)}</div>
              <div>{getValue(data.classId)}</div>
              <div>{getValue(data.total_sessions)}</div>
              <div style={{ color: "red", fontWeight: "bold" }}>
                {((data.total ?? data.price) || 0).toLocaleString()} VND
              </div>
            </div>

          </div>

          <div style={{ marginTop: 30 }}>
            <Button
              onClick={() => window.print()}
              className="no-print"
              style={{ background: "#1a1059", color: "#fff", borderRadius: 20, padding: "6px 25px", fontWeight: "bold" }}>
              XUẤT BIÊN LAI
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default BillViewForm;