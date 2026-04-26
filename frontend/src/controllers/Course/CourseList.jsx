import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CourseListForm from "../../pages/Course/CourseListForm";

function CourseList() {
  const navigate = useNavigate();

  // fake data đúng field mà component đang dùng
  const fakeCourses = [
    { id: 1, name: "Khóa học tiếng Anh cơ bản", language: "ANH", level:"beggin", description:" Học vỡ lòng",price: "2.000.000đ" },
    { id: 2, name: "Khóa học tiếng Nhật N5", language: "NHẬT", price: "3.000.000đ" },
    { id: 3, name: "Khóa học tiếng Hàn sơ cấp", language: "HÀN", price: "2.500.000đ" },
  ];

  const [search, setSearch] = useState("");
  const [selectedLang, setSelectedLang] = useState("");
  const [courses, setCourses] = useState(fakeCourses);

  const handleSearch = () => {
    let result = fakeCourses;

    if (search) {
      result = result.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedLang) {
      result = result.filter((c) => c.language === selectedLang);
    }

    setCourses(result);
  };

  const handleSelectCourse = (course) => {
    navigate("/course-register", {
      state: { course },
    });
  };

  return (
    <CourseListForm
      search={search}
      setSearch={setSearch}
      selectedLang={selectedLang}
      setSelectedLang={setSelectedLang}
      courses={courses}
      onSearch={handleSearch}
      onSelectCourse={handleSelectCourse}
    />
  );
}

export default CourseList;