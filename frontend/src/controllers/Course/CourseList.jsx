import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CourseListForm from "../../pages/Course/CourseListForm";
import { courseApi, tagApi, courseDetailApi } from "../../services/courseService";

function CourseList() {
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState("");
  const [selectedLang, setSelectedLang] = useState("");
  const [courses, setCourses] = useState([]);
  const [AllCourses, setAllCourses] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0,0);
  }, []);

  useEffect(() => {
    if (location.state) {
      const langFromHome = location.state.selectedLang || location.state.selectedLanguage;

      if (langFromHome) {
        const langName = typeof langFromHome === 'object' ? langFromHome.name : langFromHome;
        setSelectedLang(langName);
      }
    }
  }, [location.state]);
  
  useEffect(() => {
    handleSearch();
  }, [selectedLang, AllCourses, search]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      let currentCourses = [];

      try {
        const data = await courseApi();

        console.log("Data từ Backend nè:", data);

        setCourses(data);
        setAllCourses(data);
        currentCourses = data;
      } catch (ex) {
        console.error("Lỗi lấy danh sách khóa học:", ex);
      }
      try {
        const tagData = await tagApi();
        console.log("Danh sách tag:", tagData);
        setTags(tagData);
      } catch (ex) {
        console.error("Lỗi lấy danh sách tag:", ex);
      }

      if (currentCourses.length === 0) {
        console.warn("Danh sách khóa học trống sau khi tải.");
      }

    } catch (ex) {
      console.error("Lỗi lấy danh sách:", ex);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadCourses();
  }, []);


  const handleSearch = () => {
    if (!AllCourses || AllCourses.length === 0) {
      console.warn("Danh sách khóa học trống, không thể lọc.");
      return;
    }
    let result = [...AllCourses];

    if (selectedLang) {
      const targetLang = selectedLang.toString().trim().toLowerCase();

      result = result.filter((c) => {
        return c.tags?.some((tag) => {
          const tagName = typeof tag === 'object' ? tag.name : tag;
          return String(tagName || "").trim().toLowerCase() === targetLang;
        });
      });
    }

    console.log("Kết quả sau lọc:", result);
    setCourses(result);
  };

  const handleSelectCourse = async (course) => {
    try {
      const res = await courseDetailApi(course.id);
      console.log("Dữ liệu Detail đầy đủ:", res);
      navigate("/course-register", {
        state: { course: res },
      });
    } catch (ex) {
      console.error("Lỗi lấy chi tiết khóa học:", ex);
      navigate("/course-register", { state: { course } });
    }
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
      loading={loading}
      tags={tags}
    />
  );
}

export default CourseList;