import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AboutUs from "./pages/AboutUs"
import CourseList from "./pages/CourseList"
import CourseRegister from "./pages/CourseRegister"
import Payment from "./pages/Payment";
import Confirm from "./pages/Confirm";
import BillView from "./pages/BillView";
import Home from "./pages/Home";
import Attendance from "./pages/Attendance";
import ScoreEntry from "./pages/ScoreEntry";
import Schedule from "./pages/Schedule";
import StudentInfo from "./pages/StudentInfo";
import PaymentHistory from "./pages/PaymentHistory";
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<AboutUs />} />
      <Route path="/login" element={<Login />} />
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/register" element={<Register />} />
      <Route path="/course-list" element={<CourseList />} />
      <Route path="/course-register" element={<CourseRegister />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/confirm" element={<Confirm />} />
      <Route path="/bill-view" element={<BillView />} />
      <Route path='/home' element={<Home />} />
      <Route path='/attendance' element={<Attendance />} />
      <Route path='/score-entry' element={<ScoreEntry />} />
      <Route path='/schedule' element={<Schedule />} />
      <Route path="/student-info" element={<StudentInfo />} />
      <Route path="/payment-history" element={<PaymentHistory />} />
    </Routes>
  );
}

export default App;
