import HomeContent from "../../pages/Home/HomeContent";
import chinaFlag from "../../assets/china-flag.png";
import englandFlag from "../../assets/england-flag.png";
import japanFlag from "../../assets/japan-flag.png";
import koreaFlag from "../../assets/korea-flag.png";
import englishCourse from "../../assets/conversational-English.jpg"
import japanCourse from "../../assets/Japanese-for-Bussiness.jpg"
// import koreaCourse from "../../assets/Korean-Culture-and-Language.png"
import "../../styles/Home.css";

function Home() {
  const languages = [
    { id: 1, name: "English", description: "Học kỹ năng giao tiếp toàn cầu.", image: englandFlag},
    { id: 2, name: "Japanese", description: "Cải thiện tiếng Nhật trong công việc và đời sống hàng ngày.", image: japanFlag },
    { id: 3, name: "Korean", description: "Khám phá ngôn ngữ và văn hóa Hàn Quốc.", image: koreaFlag },
    { id: 4, name: "Chinese", description: "Xây dựng khả năng giao tiếp mạnh mẽ.", image: chinaFlag },
  ];

  const courses = [
    {
      id: 1,
      title: "Conversational English",
      subtitle: "Nói lưu loát và tự tin",
      level: "Beginner",
      price: "$99",
      tags: ["English", "Beginner"],
      image: englishCourse
    },
    {
      id: 2,
      title: "Japanese for Business",
      subtitle: "Kỹ năng giao tiếp chuyên nghiệp",
      level: "Intermediate",
      price: "$149",
      tags: ["Japanese", "Intermediate"],
      image: japanCourse
    },
    {
      id: 3,
      title: "Korean Culture and Language",
      subtitle: "Ngôn ngữ với bối cảnh thực tế",
      level: "Advanced",
      price: "$199",
      tags: ["Korean", "Advanced"],
      image: koreaFlag
    },
  ];

  const reasons = [
    { id: 1, title: "Giáo viên có kinh nghiệm", description: "Học cùng với những giáo viên tận tâm." },
    { id: 2, title: "Lộ trình học linh hoạt", description: "Chọn các khóa học phù hợp với trình độ của bạn." },
    { id: 3, title: "Môi trường học tập hiện đại", description: "Sử dụng các tài liệu và phương pháp giảng dạy được cập nhật." },
  ];

  const testimonials = [
    { id: 1, name: "John Doe", content: "Tôi đã đạt được mục tiêu IELTS của mình nhờ vào sự hỗ trợ của những giáo viên ở đây." },
    { id: 2, name: "Ami Tanaka", content: "Khóa học tiếng Nhật đã giúp tôi cảm thấy tự tin hơn nhiều trong công việc." },
  ];

  return (
    <>
      <HomeContent
        languages={languages}
        courses={courses}
        reasons={reasons}
        testimonials={testimonials}
      />
    </>
  );
}

export default Home;