import { Input, Button, Card, Table } from "antd";
import { Link } from "react-router-dom";
import { SearchOutlined } from "@ant-design/icons";

function CourseRegisterForm({ search, course, selected_class, setSearch, onSearch, onPayment, onSelectClass }) {
  const columns = [
    { title: "Mã lớp", dataIndex: "id" },
    { title: "Tên lớp", dataIndex: "name" },
    { title: "Sĩ số", dataIndex: "capacity" },
    { title: "Thời gian", dataIndex: "time" },
  ];

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Card style={{ width: 1200, borderRadius: 20 }} bodyStyle={{ padding: 0 }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30, padding: 20, borderBottom: "1px solid #eee", background: "#e0e0e0" }}>
          <div style={{ fontSize: 28, fontWeight: "bold", color: "#1677ff" }}>
            LOGO
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ textAlign: "right" }}>
              <div>Name:</div>
              <div>ID:</div>
            </div>

            <Link to="/">
              <Button style={{ borderRadius: 8, minWidth: 100 }}>
                Đăng xuất
              </Button>
            </Link>
          </div>
        </div>

        <div style={{ padding: 10 }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: 0 }}>
                {course?.name || "COURSE NAME"}
              </h1>
            </div>

            <div style={{ flex: 1, textAlign: "center", lineHeight: 1.8 }}>
              <p style={{ margin: 0 }}>Level: {course?.level || ""}</p>
              <p style={{ margin: 0 }}>Số buổi: {course?.sessions || ""}</p>
              <p style={{ margin: 0 }}>Sĩ số: {course?.capacity || ""}</p>
              <p style={{ margin: 0 }}>Mô tả: {course?.description || ""}</p>
            </div>

            <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
              <Input
                placeholder="Tìm khóa học..."
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
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 20 }}>
              <h3 style={{ margin: 0 }}>
                Học phí: {selected_class ? selected_class.price?.toLocaleString() : "0"} VND
              </h3>

              <Button
                style={{width: 180, height: 45, borderRadius: 25, fontWeight: "bold", background: "#ccc",}}
                onClick={onPayment}
              >
                ĐĂNG KÝ
              </Button>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
}

export default CourseRegisterForm;