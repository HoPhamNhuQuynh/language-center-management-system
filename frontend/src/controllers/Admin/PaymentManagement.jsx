import { useEffect, useState } from "react";
import "../../styles/PaymentManagement.css";
import "../../styles/Styles.css";
import { FaPen, FaSearch } from "react-icons/fa";
import { getPayments } from "../../services/manageService";
import { formatDate } from "../../utils/format";
import { ImBin2 } from "react-icons/im";

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  const loadPayments = async (page = 1, search = "", status = "") => {
    try {
      let res = await getPayments(page, search, status);
      console.info(res.results);
      setPayments(res.results);
      setTotalPages(Math.ceil(res.count / 20));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadPayments(currentPage, debouncedKeyword, status);
  }, [currentPage, debouncedKeyword, status]);

  useEffect(() => {
    const delay = setTimeout(() => {
      setDebouncedKeyword(keyword);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(delay);
  }, [keyword]);

  return (
    <div className="page-layout">
      <div className="page-header">
        <h1>Quản lý doanh thu trung tâm</h1>
        <div className="filter-group">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Tìm theo mã giao dịch..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <select
            className="status-select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Pending</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table payment-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ và tên</th>
              <th>Email</th>
              <th>Số tiền</th>
              <th>Phương thức</th>
              <th>Lớp học</th>
              <th>Trạng thái</th>
              <th>Mã giao dịch</th>
              <th>Thời gian giao dịch</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.student_name}</td>
                <td>{p.student_email}</td>
                <td>{p.amount}</td>
                <td>{p.payment_method}</td>
                <td>{p.classroom}</td>
                <td>{p.payment_status}</td>
                <td>{p.transaction_id}</td>
                <td>{formatDate(p.paid_at)}</td>
                <td>{formatDate(p.created_at)}</td>
                <td>
                  <span
                    className="icon-edit"
                    onClick={() => handleEdit(classroom)}
                  >
                    <FaPen />
                  </span>
                  <span
                    className="icon-delete"
                    onClick={() =>
                      setDeleteModal({
                        show: true,
                        classId: classroom.id,
                        className: classroom.name,
                        error: "",
                      })
                    }
                  >
                    <ImBin2 />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          className="page-btn"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          &laquo;
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(
            (p) =>
              p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2,
          )
          .reduce((acc, p, idx, arr) => {
            if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
            acc.push(p);
            return acc;
          }, [])
          .map((p, idx) =>
            p === "..." ? (
              <span key={`ellipsis-${idx}`} className="page-ellipsis">
                ...
              </span>
            ) : (
              <button
                key={p}
                className={`page-btn ${currentPage === p ? "active" : ""}`}
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </button>
            ),
          )}

        <button
          className="page-btn"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          &raquo;
        </button>
      </div>
    </div>
  );
};

export default PaymentManagement;
