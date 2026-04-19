import { Link } from "react-router-dom";
function PaymentHistoryForm({ user, payments, totalPaid, statusFilter, monthFilter, setStatusFilter, setMonthFilter, formatCurrency,}) {
  return (
    <div className="payment-history-page">
      <div className="payment-history-header-row">
        <h1>CHI TIẾT LỊCH SỬ THANH TOÁN</h1>

        <div className="payment-history-filters">
          <span>Lọc theo:</span>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Trạng thái</option>
            <option value="Đã thanh toán">Đã thanh toán</option>
            <option value="Chưa thanh toán">Chưa thanh toán</option>
          </select>

          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
          >
            <option value="">Tháng/Năm</option>
            <option value="02/2026">02/2026</option>
            <option value="03/2026">03/2026</option>
          </select>
        </div>
      </div>

      <div className="payment-history-table-wrapper">
        <table className="payment-history-table">
          <thead>
            <tr>
              <th>MÃ GIAO DỊCH</th>
              <th>NGÀY GIAO DỊCH</th>
              <th>NỘI DUNG</th>
              <th>TRẠNG THÁI</th>
              <th>SỐ TIỀN</th>
            </tr>
          </thead>

          <tbody>
            {payments.map((item) => (
              <tr key={item.id}>
                <td>{item.paymentCode}</td>
                <td>{item.date}</td>
                <td>{item.content}</td>
                <td>{item.status}</td>
                <td>{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="payment-history-footer-row">
        <div className="payment-history-total">TỔNG ĐÃ THANH TOÁN: {totalPaid}</div>
      </div>
    </div>
  );
}

export default PaymentHistoryForm;