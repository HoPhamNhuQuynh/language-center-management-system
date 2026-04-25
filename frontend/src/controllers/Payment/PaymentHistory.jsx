import { useMemo, useState, useEffect } from "react";
import PaymentHistoryForm from "../../pages/Payment/PaymentHistoryForm";
import "../../styles/PaymentHistory.css";
import Apis, { endpoints } from "../../services/Apis";

function PaymentHistory() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [month, setMonth] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await Apis.get(endpoints['profile']);
        setUser(res.data);
      } catch (ex) {
        console.error("Failed to load payment history:", ex);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const payments = useMemo(() => {
    if (!user?.enrollments) return [];
    return user.enrollments.map(enrollment => {
      const displayAmount = Number(enrollment.amount) > 0
        ? Number(enrollment.amount)
        : (Number(enrollment.classroom?.course_price) || 0); return {
          id: enrollment.id,
          paymentCode: `PAY${enrollment.id.toString().padStart(3, '0')}`,
          date: enrollment.created_at ? new Date(enrollment.created_at).toLocaleDateString() : "---",
          amount: displayAmount,
          month: enrollment.created_at ? new Date(enrollment.created_at).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' }) : "",
          content: `Học phí lớp ${enrollment.classroom?.name || "---"}`,
          status: enrollment.enrollment_status,
        };
    });
  }, [user]);

  const filteredPayments = payments.filter((item) => {
    const matchStatus = status ? item.status === status : true;
    const matchMonth = month ? item.month === month : true;
    return matchStatus && matchMonth;
  });

  const totalPaid = useMemo(() => {
    return filteredPayments
      .filter(item => item.status === "SUCCESS")
      .reduce((sum, item) => sum + item.amount, 0);
  }, [filteredPayments]);

  const formatCurrency = (value) => {
    return `${value.toLocaleString('vi-VN')} VND`;
  };

  const totalPaidFormatted = formatCurrency(totalPaid);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <PaymentHistoryForm
      user={user}
      payments={filteredPayments}
      totalPaid={formatCurrency(totalPaid)}
      statusFilter={status}
      monthFilter={month}
      setStatusFilter={setStatus}
      setMonthFilter={setMonth}
      formatCurrency={formatCurrency}
    />
  );
}

export default PaymentHistory;