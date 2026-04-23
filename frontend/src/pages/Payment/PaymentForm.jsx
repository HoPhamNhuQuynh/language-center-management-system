import { Card, Divider, Radio, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";

function PaymentForm({ data, method, setMethod, percent, setPercent, onSubmit, onClose, setBill, isPaid, setPayment }) {
  const getValue = (value) => value || "---";

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
      <Card style={{ width: 700, borderRadius: 20 }}>
        <div style={{
          display: "flex", alignItems: "center", border: "1px solid #ccc",
          borderRadius: 10, padding: "10px 0", marginBottom: 20, background: "#1a1059"
        }}>          <div style={{ width: 32 }} />
          <div style={{ flex: 1, textAlign: "center" }}>
            <h2 style={{ margin: 0, color: "#ffffff" }}>THANH TOÁN HỌC PHÍ</h2>
          </div>
          <Button type="text" icon={<CloseOutlined />} onClick={onClose} style={{ color: "#ffffff" }} />        </div>
        <h3 style={{ marginBottom: 15, textAlign: "left" }}>THÔNG TIN HỌC VIÊN</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, textAlign: "left", lineHeight: 1.8 }}>
          <div><b>Mã học viên:</b> {getValue(data?.studentId)}</div>
          <div><b>Tên học viên:</b> {getValue(data?.studentname)}</div>
          <div><b>Email:</b> {getValue(data?.email)}</div>
          <div><b>SĐT:</b> {getValue(data?.phone)}</div>
        </div>
        <Divider style={{ margin: "15px 0" }} />
        <h3 style={{ marginBottom: 15, textAlign: "left" }}>THÔNG TIN LỚP HỌC</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, textAlign: "left", lineHeight: 1.8 }}>
          <div><b>Mã lớp:</b> {getValue(data?.classId)}</div>
          <div><b>Tên lớp:</b> {getValue(data?.className)}</div>
          <div><b>Khóa học:</b> {getValue(data?.courseName)}</div>
        </div>
        <Divider style={{ margin: "15px 0" }} />
        <h3 style={{ marginBottom: 15, textAlign: "left" }}>THÔNG TIN THANH TOÁN</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: 280, textAlign: "left" }}>
              <b>Phương thức thanh toán:</b>
            </div>
            <Radio.Group disabled={isPaid} value={method} onChange={(e) => setMethod(e.target.value)} disabled={isPaid}>
              <Radio value="momo" style={{ marginRight: 60 }}>Momo</Radio>
              <Radio value="vnpay">VNPay</Radio>
            </Radio.Group>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: 280, textAlign: "left" }}>
              <b>Mức thanh toán:</b>
            </div>
            <Radio.Group disabled={isPaid} value={percent} onChange={(e) => setPercent(e.target.value)} disabled={isPaid}>
              <Radio value={100} style={{ marginRight: 60 }}>100%</Radio>
              <Radio value={50}>50%</Radio>
            </Radio.Group>
          </div>
        </div>
        <h2 style={{ textAlign: "center", marginTop: 25 }}>
          Tổng học phí: {(data?.total || 0).toLocaleString()} VND
        </h2>
        <div style={{ textAlign: "center", marginTop: 25 }}>
          {!isPaid ? (
            <Button
              style={{ background: "#1a1059", fontWeight: "bold" }}
              type="primary"
              onClick={onSubmit}
            >
              THANH TOÁN
            </Button>
          ) : (
            <Button
              style={{ background: "#1a1059", fontWeight: "bold", color: "#fff" }}
              onClick={() => {
                if (setPayment) setPayment(false);
                setBill(true);
              }}
            >
              XEM BIÊN LAI
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

export default PaymentForm;