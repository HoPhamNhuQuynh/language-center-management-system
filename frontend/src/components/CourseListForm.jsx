import { Input, Button, Card } from "antd";
import { Link } from "react-router-dom";
import { SearchOutlined } from "@ant-design/icons";

function CourseListForm({ search, setSearch, selectedLang, setSelectedLang, courses, onSearch }) {
  const languages = ["ANH", "NHẬT", "HÀN"];

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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <h1 style={{ margin: 0 }}>Khóa học</h1>

              <div style={{ display: "flex", gap: 10 }}>
                {languages.map((lang) => (
                  <Button
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    style={{borderRadius: 20, width: 90, height: 40, fontWeight: "bold",
                      background: selectedLang === lang ? "#ff4d4f" : "#d9d9d9",
                      color: selectedLang === lang ? "white" : "black"
                    }}
                  >
                    {lang}
                  </Button>
                ))}
              </div>
            </div>

            <Input
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={onSearch}
              style={{ width: 350, height: 45, borderRadius: 25 }}
            />
          </div>

          <div style={{ display: "grid", gap: 20 }}>
            {courses.length > 0 ? (
              courses.map((course, index) => (
                <Card key={index} style={{ borderRadius: 15 }}>
                  <h3 style={{ marginBottom: 8 }}>{course.name}</h3>
                  <p style={{ margin: 0 }}>Ngôn ngữ: {course.language}</p>
                  <p style={{ margin: "8px 0 0 0" }}>Học phí: {course.price}</p>
                </Card>
              ))
            ) : (
              <Card style={{ textAlign: "center", borderRadius: 15 }}>
                Chưa có khóa học
              </Card>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default CourseListForm;