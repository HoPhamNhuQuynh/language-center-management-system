import { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import CourseRegisterForm from "../../pages/Payment/CourseRegisterForm";
import { courseDetailApi, searchCourseApi } from "../../services/courseService";
import { enrollmentApi, paymentApi, enrollmentDetailApi } from "../../services/enrollmentService";
import { myPaymentApi } from "../../services/studentService";
import Apis from "../../services/Apis";

function CourseRegister() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  const [myEnrollments, setMyEnrollments] = useState([]);

  useEffect(() => {
    const responseCode = searchParams.get("vnp_ResponseCode");
    if (responseCode) {
      window.history.pushState(null, "", "/course-register");
      const handlePopState = () => {
        navigate("/course-list", { replace: true });
      };
      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, [searchParams]);

  useEffect(() => {
    Apis.get("users/me/enrollments/")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.results ?? [];
        setMyEnrollments(data);
        console.log("myEnrollments:", JSON.stringify(data[0]));
      })
      .catch(console.error);
  }, []);



  useEffect(() => {
    const loadCourseDetail = async () => {
      const courseId = selectedCourse?.id || localStorage.getItem("lastCourseId");
      if (courseId) {
        setLoading(true);
        try {
          const res = await courseDetailApi(courseId);
          setCourse({
            ...res,
            classes: res.classroom_set || res.classes || [],
          });
        } catch (ex) {
          console.error("Lỗi lấy chi tiết khóa học:", ex);
        } finally {
          setLoading(false);
        }
      }
    };
    loadCourseDetail();
  }, [selectedCourse]);

  useEffect(() => {
    const responseCode = searchParams.get("vnp_ResponseCode");
    const transactionNo = searchParams.get("vnp_TransactionNo");
    const txnRef = searchParams.get("vnp_TxnRef");
    const payDate = searchParams.get("vnp_PayDate");
    const amount = searchParams.get("vnp_Amount");

    if (responseCode && txnRef) {
      const savedCourseId = localStorage.getItem("pendingCourseId");
      localStorage.removeItem("pendingCourseId");

      const formattedDate = payDate
        ? `${payDate.slice(0, 4)}-${payDate.slice(4, 6)}-${payDate.slice(6, 8)}T00:00:00`
        : new Date().toISOString();
      const price = amount ? Number(amount) / 100 : 0;

      setEnrollmentStatus({
        id: transactionNo,
        status: responseCode === "00" ? "SUCCESS" : "FAILED",
        created_at: formattedDate,
      });
      setMethod("VNPAY");
      setPaid(true);

      Promise.all([
        savedCourseId ? courseDetailApi(savedCourseId) : Promise.resolve(null),
        myPaymentApi(),
      ]).then(([courseRes, payments]) => {
        const found = payments.find(p => String(p.id) === String(txnRef));

        const mergedCourse = {
          ...(courseRes || {}),
          classes: courseRes?.classroom_set || courseRes?.classes || [],
          price,
          total_sessions: found?.total_sessions || courseRes?.total_sessions || "---",
        };

        setCourse(mergedCourse);
        setSelectedClass({
          id: found?.enrollment || txnRef,
          name: found?.classroom || "---",
        });
        setBill(true);
      }).catch(() => {
        setCourse({ price, total_sessions: "---" });
        setSelectedClass({ id: txnRef, name: "---" });
        setBill(true);
      });

      window.history.replaceState({}, "", "/course-register");
    }
  }, []);

  const handleSubmit = async () => {
    if (!selected_class || !course) {
      alert("Vui lòng chọn lớp học trước khi đăng ký!");
      return;
    }

    setLoading(true);
    try {
      const enrollmentData = await enrollmentApi({ classroom: selected_class.id });
      console.log("Đã tạo Enrollment:", enrollmentData);
      if (enrollmentData?.id) {
        const paymentPayload = {
          enrollment: enrollmentData.id,
          amount: course.price,
          payment_method: "VNPAY",
        };

        const res = await paymentApi(paymentPayload);
        const paymentData = res.data || res;

        console.log("Dữ liệu payment:", paymentData);
        console.log("Link thanh toán:", paymentData.payment_url);

        if (paymentData && paymentData.payment_url) {
          localStorage.setItem("pendingCourseId", course.id);
          localStorage.setItem("lastCourseId", course.id);
          sessionStorage.setItem("pendingClass", JSON.stringify(selected_class));

          setPayment(false);
          setConfirm(false);
          alert("Đang chuyển hướng sang cổng thanh toán VNPay...");
          window.location.href = paymentData.payment_url;
        } else {
          alert("Không tìm thấy link trong paymentData rồi!");
          console.log("Dữ liệu payment:", paymentData);

        }
      }
    } catch (ex) {
      console.error("Lỗi đăng ký:", ex.response?.data);
      const errorData = ex.response?.data;
      let errorMsg = "Lỗi kết nối Server";

      if (errorData) {
        if (typeof errorData === "string") {
          errorMsg = errorData;
        } else if (errorData.detail) {
          errorMsg = errorData.detail;
        } else if (Array.isArray(errorData)) {
          errorMsg = errorData.join("\n");
        } else if (typeof errorData === "object") {
          errorMsg = Object.values(errorData).flat().join("\n");
        }
      }
      alert("Đăng ký thất bại: " + errorMsg);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      let res = await searchCourseApi(search);
      const data = res.results || res;
      if (data.length > 0) {
        const detail = await courseDetailApi(data[0].id);
        setCourse({
          ...detail,
          classes: detail.classroom_set
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
    setPaid(false);     
    setBill(false);      
    setPayment(false);   
    setConfirm(false);   
    setEnrollmentStatus(null);
  };

  // console.log("Dữ liệu course hiện tại:", course);
  // console.log("Danh sách lớp tìm thấy:", course?.classes);

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
        myEnrollments={myEnrollments}
      />
    </div>
  );
}

export default CourseRegister;