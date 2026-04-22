import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CourseRegisterForm from "../../components/forms/CourseRegisterForm";
import Apis, { endpoints } from "../../services/Apis";

function CourseRegister() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedCourse = location.state?.course;

  const [search, setSearch] = useState("");
  const [course, setCourse] = useState(null);
  const [selected_class, setSelectedClass] = useState(null);
  const [payment, setPayment] = useState(false);
  const [method, setMethod] = useState("momo");
  const [percent, setPercent] = useState(100);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCourseDetail = async () => {
      if (selectedCourse) {
        setLoading(true);
        try {
          const res = await Apis.get(`${endpoints['course']}${selectedCourse.id}/`);
          setCourse(res.data);
        } catch (ex) {
          console.error("Lỗi lấy chi tiết khóa học:", ex);
        } finally {
          setLoading(false);
        }
      }
    };

    loadCourseDetail();
  }, [selectedCourse]);

  const handleSubmit = async () => {
    if (!selected_class || !course) {
      alert("Vui lòng chọn lớp học trước khi đăng ký!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        class_id: selected_class.id,
        payment_method: method,
        discount_percent: percent
      };
      
      const res = await Apis.post(`${endpoints['course']}${selectedCourse.id}/register/`, payload);

      if (res.status === 201 || res.status === 200) {
        alert("Đăng ký thành công!");
        setPayment(false);
        navigate("/bill-view", {
          state: {
            course,
            selected_class,
            method,
            percent,
            bill: res.data
          }
        });
      }
    } catch (ex) {
      console.error("Lỗi đăng ký:", ex);
      alert("Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      let res = await Apis.get(`${endpoints["course"]}?q=${search}`);
      const data = res.data.results || res.data;
      if (data.length > 0) {
        const detail = await Apis.get(`${endpoints['course']}${data[0].id}/`);
        setCourse(detail.data);
        setSelectedClass(null);
      } 
    } catch (ex) {
      console.error("Lỗi khi tìm kiếm khóa học:", ex);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    if (!selected_class) {
      alert("Vui lòng chọn lớp!");
      return;
    }
    setPayment(true);
  };

  const handleSelectClass = (cls) => {
  setSelectedClass(cls);
  };

  console.log("Dữ liệu course hiện tại:", course);
  console.log("Danh sách lớp tìm thấy:", course?.classroom_set);  return (
    <div>
      <CourseRegisterForm
        course={course}
        search={search}
        setSearch={setSearch}
        onSearch={handleSearch}
        course={course}
        selected_class={selected_class}
        onSelectClass={handleSelectClass}
        onPayment={handlePayment}
        onSubmit={handleSubmit}
        method={method}
        setMethod={setMethod} 
        payment={payment}
        setPayment={setPayment}
        percent={percent}   
        setPercent={setPercent}
        loading={loading}
      />
    </div>
  );
}

export default CourseRegister;