import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CourseListForm from "../../pages/Course/CourseListForm";
import { courseApi, tagApi, coursePageApi } from "../../services/courseService";

const PAGE_SIZE = 10;

function CourseList() {
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState("");
  const [selectedLang, setSelectedLang] = useState("");
  const [courses, setCourses] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (location.state) {
      const langFromHome = location.state.selectedLang || location.state.selectedLanguage;
      if (langFromHome) {
        const langName = typeof langFromHome === "object" ? langFromHome.name : langFromHome;
        setSelectedLang(langName);
      }
    }
  }, [location.state]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLang, search]);

  useEffect(() => {
    loadCourses();
  }, [currentPage, selectedLang, search]);

  useEffect(() => {
    tagApi().then(setTags).catch(console.error);
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        page_size: PAGE_SIZE,
      };
      if (search) params.search = search;
      if (selectedLang) params.tag = selectedLang;
      const data = await coursePageApi(null, params);
      setCourses(data.results || []);
      setTotalCount(data.count || 0);
    } catch (ex) {
      console.error("Lỗi lấy danh sách khóa học:", ex);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCourse = async (course) => {
    try {
      const res = await coursePageApi(course.id);
      navigate("/course-register", { state: { course: res } });
    } catch (ex) {
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
      onSelectCourse={handleSelectCourse}
      loading={loading}
      tags={tags}
      currentPage={currentPage}
      totalCount={totalCount}
      pageSize={PAGE_SIZE}
      onPageChange={setCurrentPage}
    />
  );
}

export default CourseList;