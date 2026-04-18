import { useState } from 'react';
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AboutUs from "./pages/AboutUs"
import CourseList from "./pages/CourseList"
import CourseRegister from "./pages/CourseRegister"
import Payment from "./pages/Payment";
import Confirm from "./pages/Confirm";
import BillView from "./pages/BillView";
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<AboutUs />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/course-list" element={<CourseList />} />
      <Route path="/course-register" element={<CourseRegister />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/confirm" element={<Confirm />} />
      <Route path="/bill-view" element={<BillView />} />
    </Routes>
  );
}

export default App;
