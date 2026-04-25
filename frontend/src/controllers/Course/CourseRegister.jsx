import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CourseRegisterForm from "../../pages/Payment/CourseRegisterForm";
import Apis, { endpoints } from "../../services/Apis";

function CourseRegister() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedCourse = location.state?.course;

  const [search, setSearch] = useState("");
  const [course, setCourse] = useState(null);
  const [selected_class, setSelectedClass] = useState(null);
  const [payment, setPayment] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [paid, setPaid] = useState(false);
  const [bill, setBill] = useState(false);
  const [method, setMethod] = useState("momo");
  const [percent, setPercent] = useState(100);
  const [loading, setLoading] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);

  useEffect(() => {
    const loadCourseDetail = async () => {
      if (selectedCourse) {
        setLoading(true);
        try {
          const res = await Apis.get(`${endpoints['course']}${selectedCourse.id}/`);
          setCourse(res.data);
          console.log("Chi tiết khóa học đã tải:", res.data.classes);
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
        classroom: selected_class.id,
        payment_method: method.toUpperCase(),
        discount_percent: percent
      };

      const res = await Apis.post(endpoints['enrollment'], payload);

      if (res.status === 201 || res.status === 200) {
        setEnrollmentStatus(res.data);
        setPayment(false);
        setConfirm(false);
        alert("Đăng ký thành công!");
        setPaid(true);
        setBill(true);
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
        setCourse({
          ...detail.data,
          classes: detail.data.classroom_set
        });
        setSelectedClass(null);
      } else {
        alert("Không tìm thấy khóa học nào phù hợp.");
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
  console.log("Danh sách lớp tìm thấy:", course?.classes);

  const openBill = () => {
    setPayment(false);
    setConfirm(false);
    setBill(true);
  };
  const openConfirm = () => {
    setPayment(false);
    setConfirm(true);
    setBill(false);
  };

  const backToCourse = () => {
    setPayment(false);
    setConfirm(false);
    setBill(false);
    navigate("/course-list");
  };



  return (
    <div>
      <CourseRegisterForm
        course={course}
        search={search}
        setSearch={setSearch}
        onSearch={handleSearch}
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
        paid={paid}
        setPaid={setPaid}
        bill={bill}
        setBill={setBill}
        confirm={confirm}
        setConfirm={setConfirm}
        openBill={openBill}
        openConfirm={openConfirm}
        backToCourse={backToCourse}
        enrollmentStatus={enrollmentStatus}
      />
    </div>
  );
}

export default CourseRegister;