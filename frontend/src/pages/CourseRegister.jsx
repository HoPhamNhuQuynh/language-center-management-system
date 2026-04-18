import { useState } from "react";
import CourseRegisterForm from "../components/CourseRegisterForm";

function CourseRegister() {
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState(null);
  const [selected_class, setSelectedClass] = useState(null);

  const handleSearch = async () => {
    console.log("Search:", search);

    setSelectedClass(null);
  };

  const handleSelectClass = (cls) => {
    setSelectedClass(cls);
  };

  const handlePayment = () => {
    if (!selected_class) {
      alert("Vui lòng chọn lớp!");
      return;
    }

    console.log("Đăng ký lớp:", selected_class);
    alert("Đăng ký thành công!");
  };

  return (
    <div>
      <CourseRegisterForm
        search={search}
        setSearch={setSearch}
        onSearch={handleSearch}
        course={course}
        selected_class={selected_class}
        onSelectClass={handleSelectClass}
        onPayment={handlePayment}
      />
    </div>
  );
}

export default CourseRegister;