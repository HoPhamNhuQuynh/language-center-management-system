import { Routes, Route } from "react-router-dom";
import Login from "./controllers/Auth/Login";
import Register from "./controllers/Auth/Register";
import AboutUs from "./controllers/Home/AboutUs";
import CourseList from "./controllers/Course/CourseList";
import CourseRegister from "./controllers/Course/CourseRegister";
import Payment from "./controllers/Payment/Payment";
import Confirm from "./controllers/Payment/Confirm";
import BillView from "./controllers/Payment/BillView";
import Home from "./controllers/Home/Home";
import Attendance from "./controllers/Attendance/Attendance";
import ScoreEntry from "./controllers/Score/ScoreEntry";
import Schedule from "./controllers/Schedule/Schedule";
import StudentInfo from "./controllers/Student/StudentInfo";
import PaymentHistory from "./controllers/Payment/PaymentHistory";
import './App.css'
import MainLayout from "./components/Base/MainLayout";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AdminView from "./controllers/Admin/AdminView";
import ProtectedRoute from "./components/Base/ProtectedRoute";
import Dashboard from "./controllers/Admin/Dashboard";
import CourseManagement from "./controllers/Admin/CourseManagement";
import ClassManagement from "./controllers/Admin/ClassManagement";
import AccountManagement from "./controllers/Admin/AccountManagement";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Routes>
        <Route element={<MainLayout />}>
          {/* AI CŨNG XEM ĐƯỢC */}
          <Route path="/" element={<Home />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/course-list" element={<CourseList />} />

          {/* CHỈ HỌC VIÊN (STUDENT) MỚI VÀO ĐƯỢC */}
          <Route element={<ProtectedRoute allowedRoles={["Student"]} />}>
            <Route path="/course-register" element={<CourseRegister />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/student-info" element={<StudentInfo />} />
            <Route path="/payment-history" element={<PaymentHistory />} />
            {/* <Route path="/schedule" element={<Schedule />} /> */}
          </Route>

          {/* CHỈ GIẢNG VIÊN (TEACHER) MỚI VÀO ĐƯỢC */}
          <Route element={<ProtectedRoute allowedRoles={["Teacher"]} />}>
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/score-entry" element={<ScoreEntry />} />
            <Route path="/schedule" element={<Schedule />} />
          </Route>

          {/* CHỈ ADMIN MỚI VÀO ĐƯỢC */}
          <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/course-config" element={<CourseManagement />} />
            <Route path="/class-config" element={<ClassManagement />} />
            <Route path="/account-config" element={<AccountManagement />} />
            <Route path="/setting" element={<AdminView />} />
          </Route>
        </Route>

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </GoogleOAuthProvider>
  );
}

export default App;
