
function HomeContent({ languages, courses, reasons, testimonials }) {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="container hero__content">
          <h1>Master Foreign Languages with Confidence</h1>
          <p>
            Unlock new opportunities by learning English, Japanese, Korean,
            and Chinese with experienced teachers and practical courses.
          </p>
          <button className="btn btn--primary">Let&apos;s go</button>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Explore Our Languages</h2>
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
          <h2 className="section-title">Featured Courses</h2>
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
                    Level: {course.level} | Price: {course.price}
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
          <h2 className="section-title">Why choose us?</h2>
          <p className="section-description">
            We provide quality language education with practical lessons,
            experienced teachers, and a learner-friendly environment.
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
            <h2>What Our Students Say</h2>
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
          <h2 className="section-title">Get a Free Consultation</h2>

          <div className="consultation-form">
            <div className="form-group">
              <label>Name</label>
              <input type="text" placeholder="Enter your name" />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input type="text" placeholder="Enter your phone number" />
            </div>

            <div className="form-group">
              <label>Target Language</label>
              <div className="language-buttons">
                <button type="button">English</button>
                <button type="button">Japanese</button>
                <button type="button">Korean</button>
                <button type="button">Chinese</button>
              </div>
            </div>
          </div>

          <div className="consultation-action">
            <button className="btn btn--primary">Request Consultation</button>
          </div>
        </div>
      </section>
    </div>
  ); 
}

export default HomeContent;