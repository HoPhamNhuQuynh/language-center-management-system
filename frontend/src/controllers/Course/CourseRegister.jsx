import { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import CourseRegisterForm from "../../pages/Payment/CourseRegisterForm";
import { searchCourseApi, classApi, courseApi } from "../../services/courseService";
import { enrollmentApi, paymentApi, deleteEnrollmentApi } from "../../services/enrollmentService";
import { myPaymentApi } from "../../services/studentService";
import Apis from "../../services/Apis";

function CourseRegister() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedCourse = location.state?.course;

  const [pendingEnrollmentId, setPendingEnrollmentId] = useState(null);
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
  const [paymentStatus, setPaymentStatus] = useState(null);
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
      })
      .catch(console.error);
  }, []);



  useEffect(() => {
    const loadCourseDetail = async () => {
      const courseId = selectedCourse?.id || localStorage.getItem("lastCourseId");
      if (courseId) {
        setLoading(true);
        try {
          const [detail, classes] = await Promise.all([
            courseApi(courseId),
            classApi(courseId),
          ]);
          setCourse({
            ...detail,
            classes: classes?.results ?? classes ?? [],
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
      if (window.opener) {
        window.opener.postMessage({ type: "PAYMENT_SUCCESS", txnRef }, "*");
        window.close();
      }

      const savedCourseId = localStorage.getItem("pendingCourseId");
      localStorage.removeItem("pendingCourseId");

      const formattedDate = payDate
        ? `${payDate.slice(0, 4)}-${payDate.slice(4, 6)}-${payDate.slice(6, 8)}T00:00:00`
        : new Date().toISOString();
      const price = amount ? Number(amount) / 100 : 0;

      setPaymentStatus({
        id: transactionNo,
        status: responseCode === "00" ? "SUCCESS" : "FAILED",
        created_at: formattedDate,
      });
      setMethod("VNPAY");
      setPaid(true);

      Promise.all([
        savedCourseId ? courseApi(savedCourseId) : Promise.resolve(null),
        myPaymentApi(txnRef),
      ]).then(([courseRes, paymentDetail]) => {
        const mergedCourse = {
          ...(courseRes || {}),
          classes: courseRes?.classroom_set || courseRes?.classes || [],
          price,
          total_sessions: paymentDetail?.total_sessions || courseRes?.total_sessions || "---",
        };

          setCourse(mergedCourse);
          setSelectedClass({
            id: paymentDetail?.enrollment || txnRef,
            name: paymentDetail?.classroom || "---",
          });
          setBill(true);
        })
        .catch(() => {
          setCourse({ price, total_sessions: "---" });
          setSelectedClass({ id: txnRef, name: "---" });
          setBill(true);
        });

      window.history.replaceState({}, "", "/course-register");
    }
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === "PAYMENT_SUCCESS") {
        setPaid(true);
        setBill(true);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const handleOpenConfirm = async () => {
    if (!selected_class || !course) {
      alert("Vui lòng chọn lớp học trước khi đăng ký!");
      return;
    }
    setLoading(true);
    try {
      const enrollmentData = await enrollmentApi({ classroom: selected_class.id });
      if (enrollmentData?.id) {
        setPendingEnrollmentId(enrollmentData.id);
        setPayment(false);
        setConfirm(true);
      }
    } catch (ex) {
      const errorData = ex.response?.data;
      let errorMsg = "Lỗi kết nối Server";
      if (errorData) {
        if (typeof errorData === "string") errorMsg = errorData;
        else if (errorData.detail) errorMsg = errorData.detail;
        else if (Array.isArray(errorData)) errorMsg = errorData.join("\n");
        else if (typeof errorData === "object") errorMsg = Object.values(errorData).flat().join("\n");
      }
      alert("Đăng ký thất bại: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!pendingEnrollmentId || !course) return;
    setLoading(true);
    try {
      const res = await paymentApi({
        enrollment: pendingEnrollmentId,
        amount: course.price,
        payment_method: "VNPAY",
      });
      const paymentData = res.data || res;
      if (paymentData?.payment_url) {
        localStorage.setItem("pendingCourseId", course.id);
        localStorage.setItem("lastCourseId", course.id);
        sessionStorage.setItem("pendingClass", JSON.stringify(selected_class));
        setConfirm(false);
        alert("Đang chuyển hướng sang cổng thanh toán VNPay...");
        window.open(paymentData.payment_url, "_blank");
      }
    } catch (ex) {
      alert("Thanh toán thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (pendingEnrollmentId) {
      try {
        await deleteEnrollmentApi(pendingEnrollmentId);
      } catch (ex) {
        console.error("Lỗi hủy enrollment:", ex);
      } finally {
        setPendingEnrollmentId(null);
      }
    }
    setConfirm(false);
    setPayment(true);
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      let res = await searchCourseApi(search);
      const data = res.results || res.data?.results || res.data || res;
      if (data.length > 0) {
        const courseId = data[0].id;
        const [detail, classes] = await Promise.all([
          courseApi(courseId),
          classApi(courseId),
        ]);

        setCourse({
          ...detail,
          classes: classes?.results ?? classes ?? [],
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

  const handleSelectClass = (cls) => {
    setSelectedClass(cls);
    setPaid(false);
    setBill(false);
    setPayment(false);
    setConfirm(false);
    setPaymentStatus(null);
  };

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
        paymentStatus={paymentStatus}
        myEnrollments={myEnrollments}
        onOpenConfirm={handleOpenConfirm}
        onCancelConfirm={handleCancelConfirm}
      />
    </div>
  );
}

export default CourseRegister;