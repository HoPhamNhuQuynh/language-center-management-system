import { Card, Typography, Row, Col, Button } from "antd";
import { Link } from "react-router-dom";

const { Title, Paragraph } = Typography;
const styles = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30, padding: 15, borderBottom: "1px solid #4c4c4c", background: "#c1bfbf"},
  logo: { fontSize: 28, fontWeight: "bold", color: "#1677ff"},
  actions: { display: "flex", gap: 10},
  btn: { borderRadius: 8, minWidth: 100},
};

function AboutUsForm() {
  return (
    <div style={{ display: "flex", justifyContent: "center",  alignItems: "center", background: "#ffffff" }}>
      <Card style={{ width: 1200, borderRadius: 20 }} bodyStyle={{ padding: 0 }} >
        <div style={styles.header}>
          <div style={styles.logo}>LOGO</div>
          <div style={styles.actions}>
            <Link to="/login">
              <Button style={styles.btn}>Đăng nhập</Button>
            </Link>
            <Link to="/register">
              <Button type="primary" style={styles.btn}>
                Đăng ký
              </Button>
            </Link>
          </div>
        </div>
        <Title level={1} style={{ textAlign: "center" }}>
          ABOUT US
        </Title>
        <Paragraph style={{ textAlign: "center" }}>
          Trung tâm Ngoại ngữ là đơn vị mới được thành lập, hướng đến môi trường
          học tập hiện đại, thân thiện và hiệu quả. Chúng tôi áp dụng phương pháp
          giảng dạy thực tế, giúp học viên phát triển kỹ năng và tự tin sử dụng
          ngoại ngữ.
        </Paragraph>
        <Row gutter={40} style={{ marginTop: 30 }}>
          <Col span={12}>
            <Title level={4}>Ý nghĩa:</Title>
            <Paragraph>
              
            </Paragraph>    
            <img
              src="https://cdn-icons-png.flaticon.com/512/4712/4712027.png"
              alt="logo"
              style={{ width: 120, marginBottom: 20 }}
            />
          </Col>
          <Col span={12}>
            <img
              src="https://cdn-icons-png.flaticon.com/512/4712/4712027.png"
              alt="logo"
              style={{ width: 120, marginBottom: 20 }}
            />
            <Title level={4}>Tầm nhìn & Sứ mệnh</Title>
            <Paragraph strong italic style={{ textAlign: "left" }}>
              Tầm nhìn
            </Paragraph>
            <Paragraph style={{ textAlign: "left" }}>
              Trở thành trung tâm ngoại ngữ thế hệ mới, ứng dụng công nghệ trong
              giảng dạy.
            </Paragraph>
            <Paragraph strong italic style={{ textAlign: "left" }}>
              Sứ mệnh
            </Paragraph>
            <Paragraph style={{ textAlign: "left" }}>
              Mang đến môi trường học tập chất lượng và thân thiện cho học viên.
            </Paragraph>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default AboutUsForm;
