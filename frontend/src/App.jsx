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

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
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
    </GoogleOAuthProvider>
  );
}

export default App;
