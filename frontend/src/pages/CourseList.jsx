import { useState } from "react";
import CourseListForm from "../components/CourseListForm";

function CourseList() {
  const [search, setSearch] = useState("");
  const [selectedLang, setSelectedLang] = useState("");
  const [courses, setCourses] = useState([]);

  const handleSearch = async () => {
    console.log(search);
    console.log(selectedLang);
    setCourses([]);
  };

  return (
    <CourseListForm
      search={search}
      setSearch={setSearch}
      selectedLang={selectedLang}
      setSelectedLang={setSelectedLang}
      courses={courses}
      onSearch={handleSearch}
    />
  );
}

export default CourseList;