function PaymentHistoryForm({ payments, totalPaid, statusFilter, setStatusFilter, formatCurrency }) {
  return (
    <div className="payment-history-page">
      <div className="payment-history-header-row">
        <h1>CHI TIẾT LỊCH SỬ THANH TOÁN</h1>
        <div className="payment-history-filters">
          <span>Lọc theo:</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Tất cả</option>
            <option value="SUCCESS">Đã thanh toán</option>
            <option value="PENDING">Đang xử lý</option>
            <option value="FAILED">Thất bại</option>
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
            {payments.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>Không có giao dịch nào</td></tr>
            ) : (
              payments.map((item) => (
                <tr key={item.id}>
                  <td>{item.paymentCode}</td>
                  <td>{item.date}</td>
                  <td>{item.content}</td>
                  <td>
                    {item.status === "SUCCESS" ? "Giao dịch thành công" :
                      item.status === "PENDING" ? "Giao dịch thất bại" :
                        item.status === "FAILED" ? "Đang xử lý giao dịch" :
                          item.status}
                  </td>
                  <td>{formatCurrency(item.amount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="payment-history-footer-row">
        <div className="payment-history-total">
          TỔNG ĐÃ THANH TOÁN: {totalPaid}
        </div>
      </div>
    </div>
  );
}

export default PaymentHistoryForm;