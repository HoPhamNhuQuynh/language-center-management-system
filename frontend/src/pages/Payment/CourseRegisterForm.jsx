import { Input, Button, Card, Table } from "antd";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SearchOutlined } from "@ant-design/icons";
import PaymentForm from "./PaymentForm";
import ConfirmForm from "./ConfirmForm";
import BillViewForm from "./BillViewForm";
import { studentApi } from "../../services/studentService";
import { myPaymentApi } from "../../services/studentService";

function CourseRegisterForm({ search, course, selected_class, payment, method, percent, confirm, bill, paid,
  setPercent, setMethod, setSearch, setPayment, setConfirm, setBill, setPaid, onSearch, onSelectClass, onSubmit,
  paymentStatus, myEnrollments = [], onCancelConfirm, onOpenConfirm }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [billData, setBillData] = useState(null);

  const handleViewBill = async () => {
    if (!selected_class) return alert("Vui lòng chọn lớp!");

    try {
      const payments = await myPaymentApi();
      const found = payments.find(p => {
        const enrolled = myEnrollments.find(e => {
          const cId = e.classroom?.id || e.classroom;
          return String(cId) === String(selected_class.id);
        });
        return enrolled && String(p.enrollment) === String(enrolled.id);
      });

      if (found) {
        setBillData({
          receiptId: found.transaction_id || found.id,
          created_at: found.paid_at || new Date().toISOString(),
          paymentStatus: found.payment_status,
          paymentMethod: found.payment_method,
          total: found.amount,
          className: found.classroom,
          classId: selected_class?.id,
          total_sessions: found.total_sessions,
          studentId: currentUser?.id,
          studentname: `${currentUser?.last_name || ""} ${currentUser?.first_name || ""}`.trim(),
        });
        setBill(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setBillData(null);
  }, [selected_class]);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const res = await studentApi();
        const userData = res.data || res;
        setCurrentUser(userData);
      } catch (ex) {
        console.error("Error fetching user profile:", ex);
      }
    };

    loadUserProfile();
  }, []);

  const navigate = useNavigate();
  const isPaid = paid;
  const columns = [
    { title: "Mã lớp", dataIndex: "id", key: "id" },
    { title: "Tên lớp", dataIndex: "name", key: "name" },
    { title: "Chỗ trống", dataIndex: "remaining_slots", key: "remaining_slots" },
    { title: "Ngày bắt đầu", dataIndex: "start_date", key: "start_date" },
    { title: "Ngày kết thúc", dataIndex: "end_date", key: "end_date" },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => {
        const enrolled = myEnrollments.find(e => {
          const cId = e.classroom?.id || e.classroom;
          return String(cId) === String(record.id);
        });
        if (enrolled) {
          return (
            <span style={{ color: "green", fontWeight: "bold" }}>✓ Đã đăng ký</span>
          );
        }
        return null;
      }
    }
  ];
  const sharedData = {
    ...(course || {}),
    classId: selected_class?.id,
    className: selected_class?.name,
    courseName: course?.name,
    total: percent === 50 ? (course?.price / 2) : course?.price,
    studentId: currentUser?.id,
    studentname: `${currentUser?.last_name || ""} ${currentUser?.first_name || ""}`.trim(),
    email: currentUser?.email,
    phone: currentUser?.phone_num || "",
    total_sessions: course?.total_sessions || "",
  }

  const isEnrolled = (classId) => {
    return myEnrollments.some(e => {
      const cId = e.classroom?.id || e.classroom;
      return String(cId) === String(classId);
    });
  };

  const enrolledAlready = selected_class && isEnrolled(selected_class.id);

  console.log("course:", course);
  console.log("sharedData total_sessions:", course?.total_sessions);

  return (
    <div style={{ padding: "20px", minHeight: "100vh", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Card style={{ width: "100%", maxWidth: "1400px", borderRadius: 20, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} styles={{ body: { padding: 20 } }}>
          <div style={{ padding: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: 35, margin: 0, color: "#191970" }}>{course?.name || "COURSE NAME"}</h1>
              </div>
              <div style={{ flex: 1, textAlign: "left", lineHeight: 1.8, paddingLeft: 20 }}>
                <p style={{ margin: 0 }}><b>Level:</b> {course?.level_name || "N/A"}</p>
                <p style={{ margin: 0 }}><b>Số buổi:</b> {course?.total_sessions || "0"}</p>
                <p style={{ margin: 0 }}><b>Mô tả:</b> {course?.description || "Chưa có mô tả."}</p>
              </div>
              <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
                <Input
                  prefix={<SearchOutlined />}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onPressEnter={onSearch}
                  placeholder="Tìm lớp học..."
                  style={{ width: 300, height: 45, borderRadius: 25 }}
                />
              </div>
            </div>

            <Card style={{ marginBottom: 20, borderRadius: 15, overflow: "hidden" }}>
              <Table
                columns={columns}
                dataSource={course?.classes || []}
                rowKey="id"
                pagination={false}
                rowSelection={{
                  type: "radio",
                  selectedRowKeys: selected_class ? [selected_class.id] : [],
                  onChange: (_, selectedRows) => onSelectClass(selectedRows[0]),
                  getCheckboxProps: (record) => ({
                    disabled: myEnrollments.some(e => {
                      const cId = e.classroom?.id || e.classroom;
                      return String(cId) === String(record.id);
                    }),
                  }),
                }}
                onRow={(record) => ({
                  onClick: () => onSelectClass(record),
                })}
              />
            </Card>

            <Card style={{ borderRadius: 15, background: "#f9f9f9" }}>
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 20 }}>
                <h3 style={{ margin: 0 }}>
                  Học phí: <span style={{ color: "#d4380d" }}>{course?.price ? Number(course.price).toLocaleString('vi-VN') : "0"} VND</span>
                </h3>
                <Button
                  type="primary"
                  style={{
                    width: 200, height: 50, borderRadius: 25, fontWeight: "bold",
                    background: "#191970",
                    border: "none"
                  }}
                  onClick={() => {
                    if (enrolledAlready) {
                      handleViewBill();
                      return;
                    }
                    if (!selected_class) return alert("Vui lòng chọn lớp!");
                    setPayment(true);
                  }}
                >
                  {enrolledAlready ? "XEM BIÊN LAI" : "ĐĂNG KÝ NGAY"}
                </Button>
              </div>
            </Card>
          </div>
        </Card>
      </div>

      {(payment || confirm || bill) && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999
        }}>
          <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            {payment && (
              <PaymentForm
                data={sharedData}
                method={method} setMethod={setMethod}
                percent={percent} setPercent={setPercent}
                onSubmit={() => {
                  onOpenConfirm();
                }}
                setPayment={setPayment}
                setBill={setBill}
                isPaid={paid}
                onClose={() => {
                  setPayment(false);
                }}
              />
            )}

            {confirm && (
              <ConfirmForm
                data={sharedData}
                onSubmit={() => {
                  onSubmit();
                }}
                setBill={setBill} isPaid={paid}
                onCancel={onCancelConfirm}
                onClose={() => { setConfirm(false); }}
              />
            )}

            {bill && (
              <BillViewForm
                data={{
                  ...sharedData,
                  ...(billData || {}),
                  total: billData?.total || (percent === 50 ? course?.price * 0.5 : course?.price),
                  paymentMethod: billData?.paymentMethod || method.toUpperCase(),
                  paymentStatus: billData?.paymentStatus || paymentStatus?.status,
                  receiptId: billData?.receiptId || paymentStatus?.id,
                  created_at: billData?.created_at || paymentStatus?.created_at,
                }}
                onClose={() => {
                  setBill(false);
                  setBillData(null);
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseRegisterForm;
