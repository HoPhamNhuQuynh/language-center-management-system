
function HomeContent({ languages, courses, reasons, testimonials }) {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="container hero__content">
          <h1>Thành thạo Ngoại ngữ với sự Tự tin</h1>
          <p>
            Mở khóa những cơ hội mới bằng cách học tiếng Anh, 
            tiếng Nhật, tiếng Hàn và tiếng Trung với các giáo viên giàu kinh nghiệm và các khóa học thực tiễn.
          </p>
          <button className="btn btn--primary">Let&apos;s go</button>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Khám phá các ngôn ngữ của chúng tôi</h2>
          <div className="language-grid">
            {languages.map((language) => (
              <div className="language-card" key={language.id}>
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
          <div className="section-link">Learn more</div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Khóa học nổi bật</h2>
          <div className="course-grid">
            {courses.map((course) => (
              <div className="course-card" key={course.id}>
                <div className="course-card__image">
  <img src={course.image} alt={course.title} />
</div>
                <div className="course-card__body">
                  <h3>{course.title}</h3>
                  <p className="course-card__subtitle">{course.subtitle}</p>
                  <p>
                    Cấp độ: {course.level} | Học phí: {course.price}
                  </p>
                  <div className="tag-list">
                    {course.tags.map((tag) => (
                      <span className="tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="section-link">Learn more</div>
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
                <div className="reason-card__icon"></div>
                <h3>{reason.title}</h3>
                <p>{reason.description}</p>
                <span className="reason-card__link">Learn more</span>
              </div>
            ))}
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
                  <div className="avatar"></div>
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
              <input type="text" placeholder="Enter your name" />
            </div>

            <div className="form-group">
              <label>Số điện thoại</label>
              <input type="text" placeholder="Enter your phone number" />
            </div>

            <div className="form-group">
              <label>Mục tiêu</label>
              <div className="language-buttons">
                <button type="button">English</button>
                <button type="button">Japanese</button>
                <button type="button">Korean</button>
                <button type="button">Chinese</button>
              </div>
            </div>
          </div>

          <div className="consultation-action">
            <button className="btn btn--primary">Yêu cầu tư vấn</button>
          </div>
        </div>
      </section>
    </div>
  ); 
}

export default HomeContent;