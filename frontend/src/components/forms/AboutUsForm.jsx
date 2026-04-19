import { Card, Typography, Row, Col, Button } from "antd";
import { Link } from "react-router-dom";
import classImg from "../../assets/class.jpg";
import logoImg from "../../assets/hero.png";
import OUImg from "../../assets/OU.jpg";

const { Title, Paragraph } = Typography;

function AboutUsForm() {
  return (
    <div style={{ width: "100%", background: "#fff" }}>
      <Card style={{ borderRadius: 20 }} bodyStyle={{ padding: 0 }}>
        <Title level={1} style={{ textAlign: "center" }}>
          ABOUT US
        </Title>
        <Paragraph style={{ textAlign: "center" }}>
          Trung tâm Ngoại ngữ NexaLingua là đơn vị mới được thành lập, hướng đến môi trường học tập
          hiện đại, thân thiện và hiệu quả. Chúng tôi áp dụng phương pháp giảng dạy thực tế, giúp học
          viên phát triển kỹ năng và tự tin sử dụng ngoại ngữ.
        </Paragraph>
        <Paragraph style={{ textAlign: "center" }}>
          Với đội ngũ giáo viên nhiệt huyết và chương trình học linh hoạt, NexaLingua cam kết mang đến
          trải nghiệm học tập chất lượng và đồng hành cùng học viên trên hành trình chinh phục ngôn
          ngữ.
        </Paragraph>
        <Row gutter={40} style={{ marginTop: 0, padding: 20 }}>
          <Col span={12}>
            <Title level={4}>Ý nghĩa:</Title>
            <Paragraph>
              NexaLingua là tên ghép giữa “Nexa” - đại diện cho tương lai,
              sự đổi mới, “Lingua” - trong tiếng Latin có nghĩa là ngôn ngữ.
              Sự kết hợp này thể hiện định hướng phát triển hiện đại trong
              việc giảng dạy ngoại ngữ. Vì vậy, NexaLingua mang ý nghĩa
              “ngôn ngữ của tương lai", hướng đến một trung tâm tiên tiến,
              chuyên nghiệp và hội nhập quốc tế.
            </Paragraph>
            <img src={classImg} alt="class" style={{ width: "100%", borderRadius: 12 }} />
          </Col>
          <Col span={12}>
            <img src={logoImg} alt="logo" style={{ width: 120, marginBottom: 20 }} />
            <Title level={4}>Tầm nhìn & Sứ mệnh</Title>
            <Paragraph strong italic style={{ textAlign: "left", marginBottom: 0 }}>Tầm nhìn</Paragraph>
            <Paragraph style={{ textAlign: "left" }}>Trở thành trung tâm ngoại ngữ thế hệ mới, ứng dụng
                        công nghệ trong giảng dạy, giúp học viên tự tin sử dụng
                        tiếng Anh trong học tập và hội nhập quốc tế.</Paragraph>
            <Paragraph strong italic style={{ textAlign: "left", marginBottom: 0 }}>Sứ mệnh</Paragraph>
            <Paragraph style={{ textAlign: "left" }}>Mang đến môi trường học tập hiện đại, phương pháp
                        thực tiễn và hiệu quả, giúp học viên phát triển toàn
                        diện kỹ năng ngôn ngữ, đặc biệt là giao tiếp, đồng thời
                        xây dựng sự tự tin và tư duy hội nhập.</Paragraph>
                        <Paragraph strong italic style={{ textAlign: "left", marginBottom: 0 }}>Giá trị cốt lõi</Paragraph>
            <Paragraph style={{ textAlign: "left" }}>NexaLingua đề cao các giá trị cốt lõi gồm đổi mới, chất
                        lượng và tính thực tiễn trong giảng dạy, luôn ứng dụng
                        công nghệ và phương pháp học hiện đại nhằm mang lại
                        hiệu quả tốt nhất. Bên cạnh đó, trung tâm chú trọng sự
                        tận tâm với học viên và định hướng hội nhập quốc tế,
                        giúp người học phát triển toàn diện và tự tin trong
                        tương lai.</Paragraph>
          </Col>
        </Row>
        <div style={{ textAlign: "center", marginTop: 40, padding: "0 20px" }}>
          <Title level={1} style={{ marginBottom: 10 }}>
            CHƯƠNG TRÌNH ĐÀO TẠO
          </Title>
          <Paragraph>
            Trung tâm Ngoại ngữ NexaLingua là đơn vị mới được thành lập, hướng đến môi trường học tập
            hiện đại, thân thiện và hiệu quả. Chúng tôi áp dụng phương pháp giảng dạy thực tế, giúp học
            viên phát triển kỹ năng và tự tin sử dụng ngoại ngữ.
          </Paragraph>
          <img
            style={{width: "100%", borderRadius: 12, marginTop: 20}}
            src={classImg}
            alt="class"
          />
        </div>
        <div style={{ textAlign: "center", marginTop: 0, padding: 0 }}>
          <Title level={1} style={{ marginBottom: 10 }}>
            CƠ SỞ ĐÀO TẠO
          </Title>
          <Paragraph>
            Địa điểm 1: 97 Võ Văn Tần, P. Võ Thị Sáu, Q. 3, TP. Hồ Chí Minh.
          </Paragraph>
          <Paragraph>
            Địa điểm 2: 35-37 Hồ Hảo Hớn, P. Cô Giang, Q. 1, TP. Hồ Chí Minh.
          </Paragraph>
          <Row gutter={20} style={{ marginTop: 20 }}>
          <Col span={12}>
            <img
              style={{ width: "100%", borderRadius: 12, height: 250, objectFit: "cover" }}
              src={OUImg}
              alt="cơ sở 1"
            />
          </Col>
          <Col span={12}>
            <img
              style={{ width: "100%", borderRadius: 12, height: 250, objectFit: "cover" }}
              src={OUImg}
              alt="cơ sở 2"
            />
          </Col>
        </Row>
        </div>
      </Card>
    </div>
  );
}

export default AboutUsForm;