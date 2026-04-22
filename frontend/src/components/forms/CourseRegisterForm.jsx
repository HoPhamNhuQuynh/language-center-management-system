import { Input, Button, Card, Table } from "antd";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { SearchOutlined } from "@ant-design/icons";
import PaymentForm from "./PaymentForm";

function CourseRegisterForm({search,course,selected_class,payment,method,percent,
  setPercent,setMethod,setSearch,setPayment,onSearch,onSelectClass}) {
  const navigate = useNavigate();
  const columns = [
    { title: "Mã lớp", dataIndex: "id", key: "id" },
    { title: "Tên lớp", dataIndex: "name", key: "name" },
    { title: "Chỗ trống", dataIndex: "remaining_slots", key: "remaining_slots" },
    { title: "Ngày bắt đầu", dataIndex: "start_date", key: "start_date" },
    { title: "Ngày kết thúc", dataIndex: "end_date", key: "end_date" },
  ];
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Card style={{ width: 1200, borderRadius: 20 }} bodyStyle={{ padding: 10 }}>
        <div style={{ padding: 10 }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20
          }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 35, margin: 0 }}>
                {course?.name || "COURSE NAME"}
              </h1>
            </div>
            <div style={{ flex: 1, textAlign: "left", lineHeight: 1.8 }}>
              <p style={{ margin: 0 }}>Level: {course?.level_name || ""}</p>
              <p style={{ margin: 0 }}>Số buổi: {course?.total_sessions || ""}</p>
              <p style={{ margin: 0 }}>Mô tả: {course?.description || ""}</p>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
              <Input
                prefix={<SearchOutlined />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onPressEnter={onSearch}
                style={{ width: 320, height: 45, borderRadius: 25 }}
              />
            </div>
          </div>
          <Card style={{ marginBottom: 20, borderRadius: 15 }}>
            <Table
              columns={columns}
              dataSource={course?.classes || []}
              rowKey="id"
              pagination={false}
              rowSelection={{
                type: "radio",
                selectedRowKeys: selected_class ? [selected_class.id] : [],
                onChange: (_, selectedRows) => {
                  onSelectClass(selectedRows[0]);
                },
              }}
              onRow={(record) => ({
                onClick: () => onSelectClass(record),
              })}
            />
          </Card>
          <Card style={{ borderRadius: 15 }}>
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 20
            }}>
              <h3 style={{ margin: 0 }}>
                Học phí: {course?.price ? Number(course.price).toLocaleString('vi-VN') : "0"} VND
              </h3>
              <Button
                style={{
                  width: 180,
                  height: 45,
                  borderRadius: 25,
                  fontWeight: "bold",
                  color: "#fff",
                  background: "#191970"
                }}
                onClick={() => {
                  if (!selected_class) {
                    alert("Vui lòng chọn lớp!");
                    return;
                  }

                  setPayment(true);
                }}
              >
                ĐĂNG KÝ NGAY
              </Button>
            </div>
          </Card>
        </div>
      </Card>
      {payment && ( 
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(3px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999
        }}>
          <PaymentForm
            data={{
              ...(course || {}),
              classId: selected_class?.id,
              className: selected_class?.name,
              total: selected_class?.price
            }}
            method={method}
            setMethod={setMethod}
            percent={percent}
            setPercent={setPercent}
            onSubmit={() => {
              setPayment(false);
              navigate("/bill-view", {
                state: {course,selected_class, method,percent}
              });
            }}
            onClose={() => setPayment(false)}
          />
        </div>
      )}
    </div>
  );
}

export default CourseRegisterForm;
