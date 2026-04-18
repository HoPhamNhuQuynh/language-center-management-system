import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HomeContent from "../components/HomeContent";
import chinaFlag from "../assets/china-flag.png";
import englandFlag from "../assets/england-flag.png";
import japanFlag from "../assets/japan-flag.png";
import koreaFlag from "../assets/korea-flag.png";
import englishCourse from "../assets/conversational-English.jpg"
import japanCourse from "../assets/Japanese-for-Bussiness.jpg"
import koreaCourse from "../assets/Korean-Culture-and-Language.png"
import "./Home.css";

function Home() {
  const languages = [
    { id: 1, name: "English", description: "Learn global communication skills.", image: englandFlag},
    { id: 2, name: "Japanese", description: "Improve business and daily Japanese.", image: japanFlag },
    { id: 3, name: "Korean", description: "Explore Korean language and culture.", image: koreaFlag },
    { id: 4, name: "Chinese", description: "Build strong speaking ability.", image: chinaFlag },
  ];

  const courses = [
    {
      id: 1,
      title: "Conversational English",
      subtitle: "Speak fluently with confidence",
      level: "Beginner",
      price: "$99",
      tags: ["English", "Beginner"],
      image: englishCourse
    },
    {
      id: 2,
      title: "Japanese for Business",
      subtitle: "Professional communication skills",
      level: "Intermediate",
      price: "$149",
      tags: ["Japanese", "Intermediate"],
      image: japanCourse
    },
    {
      id: 3,
      title: "Korean Culture and Language",
      subtitle: "Language with real-life context",
      level: "Advanced",
      price: "$199",
      tags: ["Korean", "Advanced"],
      image: koreaFlag
    },
  ];

  const reasons = [
    { id: 1, title: "Experienced Teachers", description: "Learn with dedicated teachers." },
    { id: 2, title: "Flexible Learning Path", description: "Choose courses that match your level." },
    { id: 3, title: "Modern Learning Environment", description: "Enjoy updated materials and teaching methods." },
  ];

  const testimonials = [
    { id: 1, name: "John Doe", content: "I achieved my IELTS goal thanks to the supportive teachers here." },
    { id: 2, name: "Ami Tanaka", content: "The Japanese course helped me feel much more confident at work." },
  ];

  return (
    <>
      <Navbar />
      <HomeContent
        languages={languages}
        courses={courses}
        reasons={reasons}
        testimonials={testimonials}
      />
      <Footer />
    </>
  );
}

export default Home;