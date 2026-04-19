import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
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
      <Route path='/' element={<Login />} />
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
