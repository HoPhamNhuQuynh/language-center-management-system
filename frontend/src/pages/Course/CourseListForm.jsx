import { Input, Button, Card, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import classImg from "../../assets/class.jpg";

function CourseListForm({ search, setSearch, selectedLang, setSelectedLang, courses, onSearch, onSelectCourse, tags }) {
  const displayTags = (tags && tags.length > 0) ? tags : [];
  const courseArray = Array.isArray(courses) ? courses : (courses?.results || []);
  const filteredCourses = courseArray.filter((item) => {
    const matchLang = selectedLang
      ? item.tags?.some(tag => tag.name === selectedLang)
      : true;
    const matchSearch = (item.name || "")
      ?.toLowerCase()
      .includes(search.toLowerCase());
    return matchLang && matchSearch;
  });
  return (
    
    
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Card style={{ width: "100%", maxWidth: "1400px", borderRadius: 20 }} styles={{ body: { padding: 0 } }}>
        <div style={{ padding: 8 }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6
          }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, width: 650 }}>
              {displayTags.map(tag => (
                <Tag
                  key={tag.id}
                  onClick={() =>
                    setSelectedLang(tag.name === selectedLang ? "" : tag.name)
                  }
                  style={{
                    padding: "6px 12px",
                    borderRadius: 40,
                    cursor: "pointer",
                    background: selectedLang === tag.name ? "#191970" : "#f5f5f5",
                    color: selectedLang === tag.name ? "#fff" : "#000",
                    border: "1px solid #d9d9d9"
                  }}
                >
                  {tag.name}
                </Tag>
              ))}
            </div>
            <Input
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={onSearch}
              style={{ width: 320, height: 40, borderRadius: 20 }}
            />
          </div>
          <div style={{ display: "grid", gap: 12 }}>

            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <Card
                  key={course.id}
                  onClick={() => onSelectCourse(course)}
                  hoverable
                  style={{ borderRadius: 12, overflow: "hidden" }}
                  styles={{ body: { padding: 0 } }}
                >
                  <div style={{ display: "flex", alignItems: "center", background: "#191970", color: "#ffffff" }}>
                    <img
                      src={course.image || classImg}
                      alt="logo"
                      style={{ width: 200, height: 140, objectFit: "cover" }}
                    />
                    <div style={{ padding: 10, flex: 1, textAlign: "left" }}>
                      <h2 style={{
                        fontWeight: "bold",
                        marginBottom: 10,
                        marginTop: 0,
                        textAlign: "left",
                        color: "#ffffff",
                        letterSpacing: "0.8px",
                        fontSize: "22px"
                      }}>
                        {course.name}
                      </h2>

                      <div style={{ marginBottom: 4 }}>
                        Tags: {course.tags && course.tags.length > 0
                          ? course.tags.map(t => <Tag key={t.id}
                            style={{
                              borderRadius: 15,
                              padding: "2px 10px",
                              fontSize: "12px",
                              marginRight: 6,
                              marginBottom: 4,
                              background: "#e6f7ff",
                              color: "#191970",
                              border: "1px solid #91d5ff",
                            }}
                          >
                            {t.name}</Tag>)
                          : "đang cập nhật"}
                      </div>

                      {course.level && (
                        <div style={{ marginBottom: 4 }}>
                          Cấp độ: {course.level}
                        </div>
                      )}

                      {course.description && (
                        <div style={{ marginBottom: 4 }}>
                          Mô tả: {course.description}
                        </div>
                      )}

                      {/* {console.log(`Đang render khóa ${course.name} với giá:`, course.price)} */}

                      <div style={{ fontWeight: "bold"}}>
                        Học phí: {course.price ? `${Number(course.price).toLocaleString()} VNĐ` : "Đang cập nhật"}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card style={{ textAlign: "center", borderRadius: 12 }}>
                Không có khóa học phù hợp
              </Card>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default CourseListForm;