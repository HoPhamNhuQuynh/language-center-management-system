import { Card, Typography, Row, Col, Divider, Statistic, Steps, Badge, Avatar } from "antd";
import {
  CheckCircleOutlined, RocketOutlined, EyeOutlined, GlobalOutlined,
  TeamOutlined, ThunderboltOutlined, BookOutlined, SafetyCertificateOutlined,
  UserOutlined, HomeOutlined, HeartOutlined
} from "@ant-design/icons";
import classImg from "../../assets/class.jpg";
import logoImg from "../../assets/hero.png";
import OUImg from "../../assets/OU.jpg";

const { Title, Paragraph, Text } = Typography;

function AboutUsForm() {
  return (
    <div style={{ width: "100%", background: "#f8f9fa", paddingBottom: 100, paddingTop: 10 }}>
      <div style={{
        background: "linear-gradient(rgba(25, 25, 112, 0.9), rgba(0, 21, 41, 0.95)), url(" + classImg + ")",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: "120px 0",
        textAlign: "center",
        color: "#fff",
        marginBottom: 50
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 20px" }}>
          <img src={logoImg} alt="logo" style={{ width: 110, marginBottom: 20, filter: "brightness(0) invert(1)" }} />
          <Title level={1} style={{ color: "#fff", margin: 0, fontSize: "4.5rem", fontWeight: 800 }}>
            QATH ACADEMY
          </Title>
          <div style={{ width: 100, height: 5, background: "#1890ff", margin: "25px auto" }}></div>
          <Paragraph style={{ color: "rgba(255,255,255,0.9)", fontSize: 24, fontWeight: 300 }}>
            Định hình tương lai - Chinh phục ngôn ngữ - Vươn tầm thế giới
          </Paragraph>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 20px" }}>

        <section style={{ marginBottom: 80 }}>
          <Row gutter={[80, 40]} align="middle">
            <Col xs={24} lg={11}>
              <Badge color="#191970" text={<Text strong style={{ fontSize: 16, letterSpacing: 1 }}>CÂU CHUYỆN THƯƠNG HIỆU</Text>} />
              <Title level={2} style={{ fontSize: 40, marginTop: 15 }}>Về QATH Academy</Title>

              <Paragraph style={{ fontSize: 18, lineHeight: "2.1", color: "#434343", textAlign: 'justify' }}>
                Trung tâm Ngoại ngữ <strong>QATH</strong> tự hào là điểm đến lý tưởng cho những ai đang tìm kiếm một môi trường học tập
                <strong> hiện đại, thân thiện và đột phá</strong>. Với triết lý lấy học viên làm trung tâm, chúng mình không chỉ dạy kiến thức
                mà còn chú trọng vào phương pháp giảng dạy thực tế, giúp mỗi cá nhân khai phóng tối đa tiềm năng và tự tin làm chủ ngôn ngữ
                trong thời đại số.
              </Paragraph>

              <Paragraph style={{ fontSize: 18, lineHeight: "2.1", color: "#434343", textAlign: 'justify' }}>
                Sở hữu đội ngũ giáo viên <strong>nhiệt huyết, giàu kinh nghiệm</strong> cùng hệ thống chương trình học được thiết kế linh hoạt,
                <strong>QATH</strong> cam kết mang đến một hành trình trải nghiệm học tập chất lượng và đầy cảm hứng. Tụi mình tin rằng
                ngoại ngữ không đơn thuần là một môn học, mà chính là chiếc chìa khóa vạn năng mở ra những cơ hội nghề nghiệp toàn cầu
                và kết nối bạn với những nền văn minh mới.
              </Paragraph>
            </Col>
            <Col xs={24} lg={13}>
              <div style={{ position: 'relative' }}>
                <img src={classImg} alt="class" style={{ width: "100%", borderRadius: 40, zIndex: 2, position: 'relative', boxShadow: "0 25px 50px rgba(0,0,0,0.15)" }} />
              </div>
            </Col>
          </Row>
        </section>

        <section style={{ background: "#fff", padding: "80px 60px", borderRadius: 40, marginBottom: 80, boxShadow: "0 10px 30px rgba(0,0,0,0.02)" }}>
          <Row gutter={60} align="middle">
            <Col xs={24} md={8} style={{ textAlign: 'center' }}>
              <HeartOutlined style={{ fontSize: 80, color: '#191970', marginBottom: 20 }} />
              <Title level={3}>Ý Nghĩa Tên Gọi</Title>
            </Col>
            <Col xs={24} md={16} style={{ borderLeft: '5px solid #191970', paddingLeft: 40 }}>
              <Paragraph style={{ fontSize: 18, lineHeight: "1.9", color: "#555", fontStyle: 'italic' }}>
                <strong>QATH</strong> là viết tắt của <strong>Quality - Academic - Trust - Holistic</strong>.
                Cái tên này thể hiện cam kết của chúng mình về một môi trường giáo dục ngoại ngữ toàn diện.
                Trong đó, <strong>Quality</strong> là chất lượng đào tạo hàng đầu, <strong>Academic</strong> là nền tảng học thuật vững chắc,
                <strong>Trust</strong> là sự tin tưởng tuyệt đối từ học viên và <strong>Holistic</strong> chính là phương pháp tiếp cận ngôn ngữ
                một cách tự nhiên, trọn vẹn. Vì vậy, QATH không chỉ là một trung tâm, mà còn là người đồng hành
                giúp bạn khai phá tiềm năng và tự tin bước ra thế giới.
              </Paragraph>
            </Col>
          </Row>
        </section>

        <section style={{ marginBottom: 100 }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <Title level={2}>ĐỘI NGŨ GIẢNG VIÊN TẬN TÂM</Title>
            <Paragraph style={{ fontSize: 18, color: '#888' }}>Những người truyền lửa và đồng hành cùng sự thành công của bạn</Paragraph>
          </div>
          <Row gutter={[40, 40]}>
            {[
              { name: "Mr. James Wilson", role: "Giảng viên IELTS (8.5)", desc: "15 năm kinh nghiệm giảng dạy tiếng Anh học thuật." },
              { name: "Ms. Mandy Slime", role: "Trưởng phòng Đào tạo", desc: "Chuyên gia xây dựng lộ trình học cá nhân hóa cho sinh viên IT." },
              { name: "Mrs. Tanaka", role: "Giảng viên tiếng Nhật", desc: "Chứng chỉ N1, am hiểu sâu sắc văn hóa doanh nghiệp Nhật Bản." }
            ].map((teacher, index) => (
              <Col xs={24} md={8} key={index}>
                <Card hoverable style={{ borderRadius: 24, textAlign: 'center', padding: '20px' }}>
                  <Avatar size={100} icon={<UserOutlined />} style={{ background: '#191970', marginBottom: 20 }} />
                  <Title level={4}>{teacher.name}</Title>
                  <Text strong style={{ color: '#1890ff' }}>{teacher.role}</Text>
                  <Divider style={{ margin: '15px 0' }} />
                  <Paragraph type="secondary">{teacher.desc}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        <section style={{ marginBottom: 100 }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: 50 }}>Giá Trị Của QATH</Title>
          <Row gutter={[30, 30]}>
            <Col xs={24} md={8}>
              <Card
                hoverable
                bordered={false}
                style={{ height: '100%', borderRadius: 25, background: '#191970', color: '#fff', textAlign: 'center', transition: 'all 0.3s' }}
                className="hover-card"
              >
                <EyeOutlined style={{ fontSize: 50, color: '#1890ff', marginBottom: 25 }} />
                <Title level={4} style={{ color: '#fff' }}>Tầm nhìn</Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>Trở thành trung tâm ngoại ngữ thế hệ mới, ứng dụng công nghệ trong giảng dạy, giúp học viên tự tin hội nhập quốc tế.</Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card
                hoverable
                bordered={false}
                style={{ height: '100%', borderRadius: 25, background: '#fff', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', transition: 'all 0.3s' }}
                className="hover-card"
              >
                <RocketOutlined style={{ fontSize: 50, color: '#191970', marginBottom: 25 }} />
                <Title level={4}>Sứ mệnh</Title>
                <Paragraph style={{ color: '#666', fontSize: 16 }}>Mang đến môi trường học tập hiện đại, phương pháp thực tiễn, giúp học viên phát triển toàn diện kỹ năng giao tiếp.</Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card
                hoverable
                bordered={false}
                style={{ height: '100%', borderRadius: 25, background: '#191970', color: '#fff', textAlign: 'center', transition: 'all 0.3s' }}
                className="hover-card"
              >
                <CheckCircleOutlined style={{ fontSize: 50, color: '#1890ff', marginBottom: 25 }} />
                <Title level={4} style={{ color: '#fff' }}>Giá trị cốt lõi</Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>Đề cao sự đổi mới, chất lượng và tính thực tiễn, luôn ứng dụng công nghệ hiện đại nhằm mang lại hiệu quả tốt nhất.</Paragraph>
              </Card>
            </Col>
          </Row>
        </section>

        <section style={{ marginBottom: 100, textAlign: 'center' }}>
          <Title level={1} style={{ fontSize: 45 }}>CHƯƠNG TRÌNH ĐÀO TẠO</Title>
          <div style={{ maxWidth: 1000, margin: '0 auto 50px' }}>
            <Paragraph style={{ fontSize: 20, lineHeight: 1.8 }}>
              Tại <strong>QATH</strong>, tụi mình áp dụng phương pháp giảng dạy thực tế, giúp học viên
              không chỉ học để thi mà còn để sống và làm việc trong môi trường quốc tế.
            </Paragraph>
          </div>
          <img src={classImg} alt="class" style={{ width: "100%", borderRadius: 40, maxHeight: 600, objectFit: 'cover', boxShadow: '0 30px 60px rgba(0,0,0,0.1)' }} />
        </section>

        <div style={{ padding: "80px", background: '#001529', borderRadius: 40, color: '#fff', marginBottom: 100 }}>
          <Row gutter={60} align="middle">
            <Col xs={24} lg={8}>
              <Title level={2} style={{ color: '#fff' }}>Lộ trình bứt phá</Title>
              <Paragraph style={{ color: '#aaa', fontSize: 17 }}>Hành trình từ số 0 đến chuyên gia ngôn ngữ cùng QATH.</Paragraph>
              <Divider style={{ borderColor: '#333' }} />
              <div style={{ marginBottom: 20 }}><SafetyCertificateOutlined style={{ color: '#1890ff' }} /> Cam kết đầu ra bằng văn bản</div>
              <div style={{ marginBottom: 20 }}><TeamOutlined style={{ color: '#1890ff' }} /> Lớp học ít người, tương tác tối đa</div>
            </Col>
            <Col xs={24} lg={16}>
              <Steps
                direction="vertical"
                current={5}
                items={[
                  { title: <Text style={{ color: '#fff', fontSize: 20 }}>Placement Test</Text>, description: <Text style={{ color: '#888' }}>Kiểm tra năng lực 4 kỹ năng</Text> },
                  { title: <Text style={{ color: '#fff', fontSize: 20 }}>Personalized Plan</Text>, description: <Text style={{ color: '#888' }}>Thiết kế lộ trình riêng biệt</Text> },
                  { title: <Text style={{ color: '#fff', fontSize: 20 }}>Real-world Learning</Text>, description: <Text style={{ color: '#888' }}>Thực hành qua các dự án thực tế</Text> },
                  { title: <Text style={{ color: '#fff', fontSize: 20 }}>Final Evaluation</Text>, description: <Text style={{ color: '#888' }}>Đánh giá và trao chứng chỉ</Text> },
                ]}
              />
            </Col>
          </Row>
        </div>



        <section style={{ textAlign: "center", marginBottom: 60 }}>
          <Title level={1} style={{ fontSize: 45 }}>HỆ THỐNG CƠ SỞ QATH</Title>
          <div style={{ width: 60, height: 4, background: '#1890ff', margin: '0 auto 40px' }}></div>

          <Row gutter={[40, 40]}>
            <Col xs={24} md={8}>
              <Card hoverable cover={<img alt="CS1" src={OUImg} style={{ height: 300, objectFit: 'cover' }} />} style={{ borderRadius: 25, overflow: 'hidden' }}>
                <Card.Meta title={<Title level={4}>Cơ sở Quận 3</Title>} description="97 Võ Văn Tần, P. Võ Thị Sáu, Quận 3, TP.HCM" />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card hoverable cover={<img alt="CS2" src={OUImg} style={{ height: 300, objectFit: 'cover' }} />} style={{ borderRadius: 25, overflow: 'hidden' }}>
                <Card.Meta title={<Title level={4}>Cơ sở Quận 1</Title>} description="35-37 Hồ Hảo Hớn, P. Cô Giang, Quận 1, TP.HCM" />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card hoverable cover={<img alt="CS3" src={OUImg} style={{ height: 300, objectFit: 'cover' }} />} style={{ borderRadius: 25, overflow: 'hidden' }}>
                <Card.Meta title={<Title level={4}>Cơ sở Nhà Bè</Title>} description="Khu dân cư Nhơn Đức, TP.HCM" />
              </Card>
            </Col>
          </Row>
        </section>

      </div>
    </div>
  );
}
export default AboutUsForm;