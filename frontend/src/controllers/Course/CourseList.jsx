import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CourseListForm from "../../pages/Course/CourseListForm";
import Apis, { endpoints } from "../../services/Apis";

function CourseList() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [selectedLang, setSelectedLang] = useState("");
  const [courses, setCourses] = useState([]);
  const [AllCourses, setAllCourses] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);


  const loadCourses = async () => {
    try {
      setLoading(true);
      try {
        let res = await Apis.get(endpoints['course']);

        console.log("Data từ Backend nè:", res.data);

        const data = res.data.results || (Array.isArray(res.data) ? res.data : []);
        setCourses(data);
        setAllCourses(data);
      } catch (ex) {
        console.error("Lỗi lấy danh sách khóa học:", ex);
      }
      try {
        const tagRes = await Apis.get(endpoints['tag']);
        const tagData = tagRes.data.results || (Array.isArray(tagRes.data) ? tagRes.data : []);
        console.log("Danh sách tag:", tagRes.data);
        setTags(tagData);
      } catch (ex) {
        console.error("Lỗi lấy danh sách tag:", ex);
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
    let result = AllCourses;

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

  const handleSelectCourse = async (course) => {
    try {
      const res = await Apis.get(`${endpoints['course']}${course.id}/`);
      console.log("Dữ liệu Detail đầy đủ:", res.data);
      navigate("/course-register", {
        state: { course: res.data },
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