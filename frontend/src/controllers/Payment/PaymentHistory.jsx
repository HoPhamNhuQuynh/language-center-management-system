import { useMemo, useState, useEffect } from "react";
import PaymentHistoryForm from "../../pages/Payment/PaymentHistoryForm";
import "../../styles/PaymentHistory.css";
import { myPaymentApi } from "../../services/studentService";

function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const res = await myPaymentApi();
        setPayments(res);
      } catch (ex) {
        console.error("Failed to load payment history:", ex);
      } finally {
        setLoading(false);
      }
    };
    loadPayments();
  }, []);

  const mappedPayments = useMemo(() => {
    return payments.map(payment => ({
      id: payment.id,
      paymentCode: `PAY${payment.id.toString().padStart(3, '0')}`,
      date: payment.paid_at
        ? new Date(payment.paid_at).toLocaleDateString('vi-VN')
        : "---",
      amount: Number(payment.amount) || 0,
      content: `Học phí lớp ${payment.classroom || "---"}`, 
      status: payment.payment_status,
    }));
  }, [payments]);

  const filteredPayments = mappedPayments.filter(item =>
    status ? item.status === status : true
  );

  const totalPaid = useMemo(() => {
    return filteredPayments
      .filter(item => item.status === "SUCCESS")
      .reduce((sum, item) => sum + item.amount, 0);
  }, [filteredPayments]);

  const formatCurrency = (value) => `${value.toLocaleString('vi-VN')} VND`;

  if (loading) return <div>Loading...</div>;

  return (
    <PaymentHistoryForm
      payments={filteredPayments}
      totalPaid={formatCurrency(totalPaid)}
      statusFilter={status}
      setStatusFilter={setStatus}
      formatCurrency={formatCurrency}
    />
  );
}

export default PaymentHistory;