import { useMemo, useState } from "react";
import PaymentHistoryForm from "../../pages/Payment/PaymentHistoryForm";
import "../../styles/PaymentHistory.css";

function PaymentHistory() {
  const user = {
    name: "Le Minh Khoi",
    id: "987654321",
  };

  const [statusFilter, setStatusFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  const payments = [
    {
      id: 1,
      paymentCode: "PAY001",
      date: "22/02/2026",
      content: "Học phí Tiếng Anh nâng cao",
      status: "Đã thanh toán",
      amount: 4500000,
      month: "02/2026",
    },
    {
      id: 2,
      paymentCode: "PAY002",
      date: "24/02/2026",
      content: "Học phí Tiếng Trung giao tiếp",
      status: "Đã thanh toán",
      amount: 4000000,
      month: "02/2026",
    },
    {
      id: 3,
      paymentCode: "PAY003",
      date: "10/03/2026",
      content: "Phí tài liệu",
      status: "Chưa thanh toán",
      amount: 500000,
      month: "03/2026",
    },
  ];

  const filteredPayments = payments.filter((item) => {
    const matchStatus = statusFilter ? item.status === statusFilter : true;
    const matchMonth = monthFilter ? item.month === monthFilter : true;
    return matchStatus && matchMonth;
  });

  const totalPaid = useMemo(() => {
    return filteredPayments
      .filter((item) => item.status === "Đã thanh toán")
      .reduce((sum, item) => sum + item.amount, 0);
  }, [filteredPayments]);

  const formatCurrency = (value) => {
    return `${value.toLocaleString("vi-VN")} vnđ`;
  };

  return (
    <PaymentHistoryForm
      user={user}
      payments={filteredPayments}
      totalPaid={formatCurrency(totalPaid)}
      statusFilter={statusFilter}
      monthFilter={monthFilter}
      setStatusFilter={setStatusFilter}
      setMonthFilter={setMonthFilter}
      formatCurrency={formatCurrency}
    />
  );
}

export default PaymentHistory;