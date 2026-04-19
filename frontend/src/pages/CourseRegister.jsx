import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CourseRegisterForm from "../components/CourseRegisterForm";

function CourseRegister() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedCourse = location.state?.course;

  const [search, setSearch] = useState("");
  const [course, setCourse] = useState(null);
  const [selected_class, setSelectedClass] = useState(null);
  const [payment, setPayment] = useState(false);
  const [method, setMethod] = useState("momo");
  const [percent, setPercent] = useState(100);

  const fakeCourses = [
    {
      id: 1,
      name: "Khóa học tiếng Anh cơ bản",
      level: "A1",
      sessions: 20,
      capacity: 30,
      description: "Khóa học tiếng Anh cho người mới bắt đầu",
      price: 2000000,
      classes: [
        {
          id: "A01",
          name: "Lớp Anh sáng T2-T4",
          capacity: 25,
          time: "08:00 - 10:00",
        },
        {
          id: "A02",
          name: "Lớp Anh tối T3-T5",
          capacity: 30,
          time: "18:00 - 20:00",
        },
      ],
    },
    {
      id: 2,
      name: "Khóa học tiếng Anh nâng cao",
      level: "B1",
      sessions: 25,
      capacity: 25,
      description: "Khóa học nâng cao kỹ năng tiếng Anh",
      price: 3000000,
      classes: [
        {
          id: "A03",
          name: "Lớp Anh nâng cao",
          capacity: 20,
          time: "19:00 - 21:00",
        },
      ],
    },
    {
      id: 3,
      name: "Khóa học tiếng Nhật N5",
      level: "N5",
      sessions: 24,
      capacity: 20,
      description: "Khóa học tiếng Nhật cơ bản",
      price: 2500000,
      classes: [
        {
          id: "J01",
          name: "Lớp Nhật N5",
          capacity: 20,
          time: "18:00 - 20:00",
        },
      ],
    },
  ];

  useEffect(() => {
      const found = selectedCourse
        ? fakeCourses.find((c) => c.id === selectedCourse.id)
        : fakeCourses[0];
      setCourse(found);
    }, [selectedCourse]);


  const handleSearch = async () => {
    const found = fakeCourses.find((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );

    setCourse(found || null);
    setSelectedClass(null);
  };

  const handleSelectClass = (cls) => {
    setSelectedClass(cls);
  };

  const handlePayment = () => {
    if (!selected_class) {
      alert("Vui lòng chọn lớp!");
      return;
    }

    navigate("/payment", {
    state: {
      course,
      selected_class
    }
  });
  };

  const handleSubmit = () => {
    setPayment(false);

    navigate("/bill-view", {
      state: {
        course,
        selected_class,
        method,
        percent
      }
    });
  };
  

  return (
    <div>
      <CourseRegisterForm
        search={search}
        setSearch={setSearch}
        onSearch={handleSearch}
        course={course}
        selected_class={selected_class}
        onSelectClass={handleSelectClass}
        onPayment={handlePayment}
        method={method}
        setMethod={setMethod} 
        payment={payment}
        setPayment={setPayment}
        percent={percent}   
        setPercent={setPercent}
      />
    </div>
  );
}

export default CourseRegister;