import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function HomeContent({ languages, courses, reasons, testimonials }) {
  const navigate = useNavigate();
  const [consultName, setConsultName] = useState("");
  const [consultPhone, setConsultPhone] = useState("");
  const [consultLang, setConsultLang] = useState("");
  const [consultSuccess, setConsultSuccess] = useState(false);

  const handleConsult = () => {
    if (!consultName || !consultPhone || !consultLang) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    setConsultSuccess(true);
    setConsultName("");
    setConsultPhone("");
    setConsultLang("");
    setTimeout(() => setConsultSuccess(false), 4000);
  };

  const featuredCourses = Array.isArray(courses) ? courses.slice(0, 3) : [];

  const handleLanguegeClick = (language) => {
    navigate("course-list/", { state: { selectedLanguage: language.name } });
  };

  const handleLetGo = () => {
    navigate("course-list/");
  };

  const handleSelectCourse = (course) => {
    navigate("/course-register", { state: { course } });
  };

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container hero__content">
          <h1>Thành thạo Ngoại ngữ với sự Tự tin</h1>
          <p>
            Mở khóa những cơ hội mới bằng cách học tiếng Anh,
            tiếng Nhật, tiếng Hàn và tiếng Trung với các giáo viên giàu kinh nghiệm và các khóa học thực tiễn.
          </p>
          <button className="btn btn--primary" onClick={handleLetGo}>
            Let&apos;s go
          </button>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Khám phá các ngôn ngữ của chúng tôi</h2>
          <div className="language-grid">
            {languages.map((language) => (
              <div
                className="language-card"
                key={language.id}
                onClick={() => handleLanguegeClick(language)}
              >
                <div className="language-card__image">
                  <img src={language.image} alt={language.name} />
                </div>
                <div className="language-card__body">
                  <h3>{language.name}</h3>
                  <p>{language.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Khóa học nổi bật</h2>
          <div className="course-grid">
            {featuredCourses.map((course) => (
              <div
                className="language-card" 
                key={course.id}
                onClick={() => handleSelectCourse(course)}
                style={{ cursor: "pointer" }}
              >
                <div className="language-card__image">
                  <img src={course.image} alt={course.name} />
                </div>
                <div className="language-card__body">
                  <h3>{course.name}</h3>
                  <p className="course-card__subtitle">
                    {(course.description || "Đang cập nhật mô tả")
                      .substring(0, 80) + (course.description && course.description.length > 80 ? "..." : "")}
                  </p>
                  <p>Cấp độ: {course.level_name || course.level} | Học phí: {course.price ? `${Number(course.price).toLocaleString()} VNĐ` : "Đang cập nhật"}</p>
                  <div className="tag-list">
                    {course.tags?.map((tag) => (
                      <span className="tag" key={tag.id || tag}>
                        {tag.name || tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div
            className="section-link"
            onClick={handleLetGo}
            style={{ cursor: 'pointer', textAlign: 'center', marginTop: '20px', fontWeight: 'bold', color: '#191970' }}
          >
          </div>
        </div>
      </section>

      <section className="section section--muted">
        <div className="container">
          <h2 className="section-title">Tại sao nên chọn chúng tôi?</h2>
          <p className="section-description">
            Chúng tôi cung cấp giáo dục ngôn ngữ chất lượng với các bài
            học thực tiễn, giáo viên giàu kinh nghiệm và môi trường thân thiện với người học.
          </p>

          <div className="reason-grid">
            {reasons.map((reason) => (
              <div className="reason-card" key={reason.id}>
                <div className="reason-card__icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {reason.icon}
                </div>
                <h3>{reason.title}</h3>
                <p>{reason.description}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <span
              className="reason-card__link"
              onClick={() => navigate("/about-us")}
              style={{ cursor: "pointer", fontWeight: "bold" }}
            >
              Learn more
            </span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container testimonial-section">
          <div className="testimonial-section__left">
            <h2>Học viên của chúng tôi nói gì?</h2>
          </div>

          <div className="testimonial-section__right">
            {testimonials.map((item) => (
              <div className="testimonial-card" key={item.id}>
                <div className="testimonial-card__header">
                  <div className="avatar" style={{
                    background: "#191970",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "16px",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    flexShrink: 0,
                  }}>
                    {item.name.charAt(0)}
                  </div>
                  <strong>{item.name}</strong>
                </div>
                <p>{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section consultation">
        <div className="container">
          <h2 className="section-title">Nhận Tư Vấn Miễn Phí</h2>

          <div className="consultation-form">
            <div className="form-group">
              <label>Tên</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={consultName}
                onChange={(e) => setConsultName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                type="text"
                placeholder="Enter your phone number"
                value={consultPhone}
                onChange={(e) => setConsultPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Mục tiêu</label>
              <div className="language-buttons">
                {["English", "Japanese", "Korean", "Chinese"].map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setConsultLang(lang)}
                    style={{
                      fontWeight: consultLang === lang ? "bold" : "normal",
                      border: consultLang === lang ? "2px solid #191970" : "",
                    }}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {consultSuccess && (
            <p style={{ textAlign: "center", color: "green", marginTop: "12px" }}>
              Yêu cầu tư vấn đã được gửi thành công! Chúng tôi sẽ liên hệ sớm.
            </p>
          )}

          <div className="consultation-action">
            <button className="btn btn--primary" onClick={handleConsult}>
              Yêu cầu tư vấn
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomeContent;
