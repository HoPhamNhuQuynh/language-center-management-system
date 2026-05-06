import { useState, useEffect } from 'react';
import { FaBook } from 'react-icons/fa';
import { GiTeacher, GiLaptop } from "react-icons/gi";
import HomeContent from "../../pages/Home/HomeContent";
import chinaFlag from "../../assets/china-flag.png";
import englandFlag from "../../assets/england-flag.png";
import japanFlag from "../../assets/japan-flag.png";
import koreaFlag from "../../assets/korea-flag.png";
import "../../styles/Home.css";

function Home() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch("/api/courses/")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.results ?? [];
        const shuffled = [...list].sort(() => Math.random() - 0.5).slice(0, 3);
        setCourses(shuffled);
      })
      .catch((err) => console.error("Failed to fetch courses:", err));
  }, []);

  const languages = [
    { id: 1, name: "English", description: "Học kỹ năng giao tiếp toàn cầu.", image: englandFlag },
    { id: 2, name: "Japanese", description: "Cải thiện tiếng Nhật trong công việc và đời sống hàng ngày.", image: japanFlag },
    { id: 3, name: "Korean", description: "Khám phá ngôn ngữ và văn hóa Hàn Quốc.", image: koreaFlag },
    { id: 4, name: "Chinese", description: "Xây dựng khả năng giao tiếp mạnh mẽ.", image: chinaFlag },
  ];

  const reasons = [
    { id: 1, icon: <GiTeacher size={64} color="#6f93d8" />, title: "Giáo viên có kinh nghiệm", description: "Học cùng với những giáo viên tận tâm." },
    { id: 2, icon: <FaBook size={64} color="#d8ab62" />, title: "Lộ trình học linh hoạt", description: "Chọn các khóa học phù hợp với trình độ của bạn." },
    { id: 3, icon: <GiLaptop size={64} color="#6aa8c9" />, title: "Môi trường học tập hiện đại", description: "Sử dụng các tài liệu và phương pháp giảng dạy được cập nhật." },
  ];


  const testimonials = [
    { id: 1, name: "John Doe", content: "Tôi đã đạt được mục tiêu IELTS của mình nhờ vào sự hỗ trợ của những giáo viên ở đây." },
    { id: 2, name: "Ami Tanaka", content: "Khóa học tiếng Nhật đã giúp tôi cảm thấy tự tin hơn nhiều trong công việc." },
  ];

  return (
    <HomeContent
      languages={languages}
      courses={courses}
      reasons={reasons}
      testimonials={testimonials}
    />
  );
}

export default Home;