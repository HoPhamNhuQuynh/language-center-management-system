import { Input, Button, Card, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import classImg from "../../assets/class.jpg";

function CourseListForm({search,setSearch,selectedLang,setSelectedLang, courses, onSearch, onSelectCourse}) {
  const tags = ["ANH","NHẬT","HÀN","TRUNG","PHÁP","ĐỨC","ESP","RUS","ITA","VIE","KOR","JPN"];
  const courseArray = Array.isArray(courses) ? courses : (courses?.results || []);
  const filteredCourses = courseArray.filter((item) => {
    const matchLang = selectedLang ? item.language === selectedLang || item.language_name === selectedLang : true;
    const matchSearch = (item.name || "")
      ?.toLowerCase()
      .includes(search.toLowerCase());
    return matchLang && matchSearch;
  });
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Card style={{ width: 1200, borderRadius: 20 }} styles={{ body: { padding: 0 } }}>
        <div style={{ padding:8 }}>
          <div style={{
            display:"flex",
            justifyContent:"space-between",
            alignItems:"center",
            marginBottom:6
          }}>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, width:650 }}>
              {tags.map(tag => (
                <Tag
                  key={tag}
                  onClick={() =>
                    setSelectedLang(tag === selectedLang ? "" : tag)
                  }
                  style={{
                    padding:"6px 12px",
                    borderRadius:20,
                    cursor:"pointer",
                    background: selectedLang === tag ? "#1677ff" : "#f5f5f5",
                    color: selectedLang === tag ? "#fff" : "#000",
                    border:"1px solid #d9d9d9"
                  }}
                >
                  {tag}
                </Tag>
              ))}
            </div>
            <Input
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
              onPressEnter={onSearch}
              style={{ width:320, height:40, borderRadius:20 }}
            />
          </div>
          <div style={{ display:"grid", gap:12 }}>

            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <Card
                  key={course.id}
                  onClick={() => onSelectCourse(course)}
                  hoverable
                  style={{ borderRadius:12, overflow: "hidden" }}
                  styles={{ body: { padding: 0 } }}
                >
                  <div style={{ display: "flex", alignItems: "center", background:"#191970", color:"#ffffff" }}>
                    <img
                      src={course.image || classImg}
                      alt="logo"
                      style={{width: 200,height: 140,objectFit: "cover"}}
                    />
                    <div style={{ padding: 10, flex: 1, textAlign:"left" }}>
                      <h2 style={{ fontWeight: "bold", marginBottom: 0, textAlign:"left",color:"#ffffff" }}>
                        {course.name}
                      </h2>

                      <div style={{ marginBottom: 4 }}>
                        Ngôn ngữ: {course.language}
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

                      <div style={{ fontWeight: "bold" }}>
                        Học phí: {course.price}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card style={{ textAlign:"center", borderRadius:12 }}>
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