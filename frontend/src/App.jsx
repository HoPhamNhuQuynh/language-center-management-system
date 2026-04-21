import { Routes, Route } from "react-router-dom";
import Navbar from "./components/common/Navbar/Navbar";
import Footer from "./components/common/Footer/Footer";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import AboutUs from "./pages/Home/AboutUs"
import CourseList from "./pages/Course/CourseList"
import CourseRegister from "./pages/Course/CourseRegister"
import Payment from "./pages/Payment/Payment";
import Confirm from "./pages/Payment/Confirm";
import BillView from "./pages/Payment/BillView";
import Home from "./pages/Home/Home";
import Attendance from "./pages/Attendance/Attendance";
import ScoreEntry from "./pages/Score/ScoreEntry";
import Schedule from "./pages/Schedule/Schedule";
import StudentInfo from "./pages/Student/StudentInfo";
import PaymentHistory from "./pages/Payment/PaymentHistory";
import './App.css'
import MainLayout from "./components/common/Base/MainLayout";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/course-list" element={<CourseList />} />
        <Route path="/course-register" element={<CourseRegister />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/confirm" element={<Confirm />} />
        <Route path="/bill-view" element={<BillView />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/score-entry" element={<ScoreEntry />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/student-info" element={<StudentInfo />} />
        <Route path="/payment-history" element={<PaymentHistory />} />
      </Route>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
