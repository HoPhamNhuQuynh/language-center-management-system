# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
## Language Center Management System

---

# 1. Introduction

## 1.1 Purpose
Việc xây dựng hệ thống được triển khai nhằm hướng đến các mục tiêu trọng tâm trong công tác quản lý và vận hành trung tâm. Giúp tin học hóa toàn bộ các hoạt động quản lý, thay thế phương pháp thủ công truyền thống bằng quy trình xử lý tự động, chính xác và tiết kiệm thời gian. 

Đối với nhóm người dùng là học viên, hệ thống hỗ trợ đăng ký khóa học, xem thời khóa biểu và theo dõi kết quả học tập trực tuyến. Đối với giáo viên, hệ thống tạo điều kiện thuận lợi trong việc quản lý lớp học, điểm danh và nhập điểm nhanh chóng, giảm thiểu sai sót. Bên cạnh đó, hệ thống còn hỗ trợ Admin trong việc quản lý chương trình đào tạo, học phí và lập các báo cáo thống kê. Giúp nâng cao hiệu quả hoạt động và chất lượng quản lý của trung tâm.

## 1.2 Scope
Hệ thống bao gồm các chức năng phục vụ cho ba nhóm người dùng chính: giáo viên, học viên và Admin. Hệ thống cho phép giáo viên thực hiện các thao tác liên quan đến lớp học như xem thông tin lớp, điểm danh và nhập điểm cho học viên. Học viên có thể đăng ký khóa học, xem thời khóa biểu và tra cứu kết quả học tập. Admin quản lý chương trình đào tạo, theo dõi và quản lý học phí, thực hiện lập các báo cáo thống kê.
## 1.3 Definitions, Acronyms, Abbreviations

|   Term   |          Meaning           |
|----------|----------------------------|
|   Admin  |  Quản trị viên             |
| Username |  Tên người dùng hệ thống   |
| Fullname |  Tên đầy đủ của người dùng |
---

# 2. Overall Description

## 2.1 Product Perspective
Hệ thống là một ứng dụng web độc lập được phát triển bằng framework Django. Người dùng truy cập và sử dụng thông qua trình duyệt web.

Ứng dụng được xây dựng theo kiến trúc Client–Server. Phía server chịu trách nhiệm xử lý logic nghiệp vụ và giao tiếp với cơ sở dữ liệu, trong khi phía client hiển thị giao diện và gửi yêu cầu đến server thông qua giao thức HTTP.

Hệ thống sử dụng hệ quản trị cơ sở dữ liệu MySQL để lưu trữ và quản lý dữ liệu.

Ứng dụng có tích hợp với các dịch vụ bên thứ ba nhằm mở rộng chức năng và đảm bảo tính bảo mật, bao gồm:

* Dịch vụ xác thực của Google để hỗ trợ đăng nhập bằng tài khoản Google.

* Cổng thanh toán Stripe để xử lý giao dịch thanh toán khóa học.

Các dịch vụ này được sử dụng thông qua API chính thức do nhà cung cấp phát hành.

Để vận hành, hệ thống yêu cầu môi trường server có cài đặt Python và Django. Người dùng cần có kết nối Internet để truy cập.

## 2.2 System Overview
Hệ thống được xây dựng nhằm hỗ trợ quản lý lớp học, học viên, học phí và lịch giảng dạy một cách hiệu quả, thay thế cho phương pháp quản lý thủ công trước đây. Ngoài ra, hệ thống còn cung cấp các chức năng hỗ trợ như báo cáo thống kê, nhập và lưu điểm học viên, cũng như điểm danh lớp học.

Hệ thống phục vụ các đối tượng người dùng bao gồm quản trị viên trung tâm, giáo viên và học viên. Mỗi nhóm người dùng được cung cấp các chức năng phù hợp với vai trò của mình.

Các chức năng chính của hệ thống bao gồm:

* Học viên có thể đăng ký khóa học trực tuyến và xem kết quả học tập.

* Giáo viên có thể nhập điểm và thực hiện điểm danh lớp học.

* Quản trị viên có thể quản lý học viên, giáo viên, lớp học và xem hoặc xuất báo cáo thống kê khi cần.

Hệ thống sử dụng cơ chế xác thực và phân quyền người dùng nhằm đảm bảo tính bảo mật và kiểm soát quyền truy cập theo từng vai trò.


## 2.3 User Roles

| Role | Description |
|------|------------|
| Admin | Quản lý toàn bộ hoạt động của hệ thống bao gồm quản lý học viên, giáo viên, lớp học, học phí và xem báo cáo thống kê. Có quyền truy cập cao nhất trong hệ thống. |
| Giáo viên | Quản lý lớp học được phân công, thực hiện nhập điểm, điểm danh và theo dõi kết quả học tập của học viên. |
| Học viên | Đăng ký khóa học trực tuyến, xem lịch học, thanh toán online, theo dõi kết quả học tập và thông tin cá nhân của mình. |


## 2.4 Assumptions & Constraints

### Assumptions
- Người dùng phải có kết nối Internet ổn định để truy cập hệ thống
- Server được cấu hình đúng và hoạt động liên tục trong quá trình sử dụng
- Người dùng cần có kiến thức cơ bản về sử dụng trình duyệt web
- Dữ liệu được nhập vào hệ thống là chính xác và hợp lệ.

### Constraints
- Hệ thống phải được phát triển bằng ngôn ngữ Python và framework Django theo định hướng công nghệ của dự án.
- Hệ thống bắt buộc sử dụng hệ quản trị cơ sở dữ liệu MySQL để đảm bảo tính nhất quán trong triển khai và kiểm thử.
- Phạm vi dự án chỉ bao gồm ứng dụng web, không phát triển phiên bản mobile hoặc desktop.
- Thời gian phát triển tối đa 8 tuần.
- Hệ thống hiện chưa tích hợp chức năng thanh toán trực tuyến thông qua các cổng thanh toán bên thứ ba.

---

# 3. System Features (Functional Requirements)

FR-01:  
FR-02:  
FR-03:  
FR-04:  
FR-05:  

---

# 4. External Interface Requirements

## 4.1 User Interface
- Phương thúc tương tác: người dùng thao tác bằng chuột, bàn phím khi sử dụng trên máy tính, laptop; thao tác bằng cảm ứng khi sử dụng trên thiết bị di động. Sử dụng menu, nút bấm, biểu mẫu để tương tác với hệ thống.
- Loại giao diện: Giao diện Web
- Giao diện:
  + Quản trị: 
    + Admin: Đăng nhập quản trị; Quản lý khóa học (học phí, chính sách, số lượng sinh viên, khóa học, điểm); Quản lý giáo viên, học viên; Báo cáo, thống kê.
    + Giáo viên: Đăng nhập quản trị; Quản lý lớp học, lịch giảng dạy; Điểm danh; Nhập điểm, nhận xét học viên.
  + Người dùng:
    + Học viên: Trang chủ; Đăng ký; Đăng nhập; Đăng ký khóa học, thanh toán; Xem lịch học, phòng học, profile; Xem điểm, kết quả học tập.
## 4.2 Hardware Interface
- Yêu cầu: thiết bị có khả năng kết nối Internet
- Thiết bị: Máy tính, Laptop, Điện thoại thông minh 
## 4.3 Software Interface
- Môi trường server: có cài đặt Python và Django
- Hệ quản trị cơ sở dữ liệu: MySQL
- Trình duyệt hỗ trợ: Google Chrome, Microsoft Edge,...
- Dịch vụ tích hợp: 
  + Dịch vụ xác thực đăng nhập (Google OAuth 2.0)
  + Dịch vụ xử lý thanh toán trực tuyến (Stripe API)

---

# 5. Non-functional Requirements

NFR-01: Yêu cầu giao diện
- Giao diện người dùng dễ sử dụng và phải đảm bảo tính đồng bộ về màu sắc, bố cục và font chữ trên tất cả các trang của hệ thống.
- Các thành phần giao diện (menu, nút chức năng, biểu mẫu nhập liệu) phải được thiết kế nhất quán giữa các chức năng.
- Hệ thống phải hiển thị thông báo lỗi rõ ràng và dễ hiểu khi nhập sai dữ liệu.

NFR-02: Bảo mật
- Hệ thống phải yêu cầu xác thực người dùng trước khi truy cập các chức năng quản lý (admin, giáo viên).
- Mật khẩu người dùng phải có ít nhất 6 kí tự. Mật khẩu phải được băm trước khi lưu trữ trong cơ sở dữ liệu

NFR-03: Hiệu năng
- Hệ thống phải hỗ trợ tối thiếu 200 người dùng truy cập đồng thời trong môi trường kiểm thử mà không xảy ra lỗi nghiêm trọng (server crash hoặc HTTP 500)
- Thời gian phản hồi trung bình cho mỗi yêu cầu không vượt quá 3 giây trong điều kiện tải bình thường. 

NFR-04: Độ tin cậy & khả năng bảo trì
- Hệ thống phải đảm bảo không mất dữ liệu khi xảy ra sự cố đột ngột.
- Hệ thống phải có cơ chế sao lưu cơ sở dữ liệu định kỳ (tối thiểu 1 lần/ngày).
- Việc cập nhật hệ thống không được làm ảnh hưởng đến các chức năng đã triển khai trước đó

---

# 6. Business Rules

BR-01:  
BR-02:  
BR-03:  

---

# 7. Data Requirements

## 7.1 Data Entities
- 
- 

## 7.2 Entity Attributes

### Entity Name
- 
- 

## 7.3 Relationships
| A          | B              | Relationship | Description                                                                                      |
|------------|----------------|--------------|--------------------------------------------------------------------------------------------------|
| User       | Profile        | 1:1          | Một người dùng có một hồ sơ thông tin riêng biệt                                                 |
| Role       | User           | 1:N          | Một vai trò được gắn cho nhiều người dùng                                                        |
| Level      | Course         | 1:N          | Một mức độ có nhiều khóa học                                                                     |
| Course     | Tag            | N:N          | Một khóa học có nhiều thẻ và một thẻ được gắn cho nhiều khóa học                                 |
| Course     | Class          | 1:N          | Một khóa học có nhiều lớp học                                                                    |
| Course     | ScoreType      | 1:N          | Một khóa học có nhiều cột điểm                                                                   |
| Class      | User           | N:N          | Một lớp học có nhiều giáo viên và một giáo viên dạy nhiều lớp học                                |
| Class      | Schedule       | 1:N          | Một lớp học có trong nhiều khung lịch học                                                        |
| Room       | Schedule       | 1:N          | Một phòng học có trong nhiều khung lịch học                                                      |
| Schedule   | Session        | 1:N          | Một khung lịch học có nhiều buổi học                                                             |
| Room       | Session        | 1:N          | Một phòng học được sử dụng cho nhiều buổi học                                                    |
| User       | Session        | 1:N          | Một giáo viên tham gia nhiều buổi học                                                            |
| User       | Enrollment     | 1:N          | Một học viên có thể đăng ký nhiều lớp học                                                        |
| Class      | Enrollment     | 1:N          | Một lớp học có nhiều lượt đăng ký                                                                |
| Enrollment | Payment        | 1:N          | Một lượt đăng ký một hoặc hai giao dịch thanh toán                                               |
| Enrollment | ScoreType      | N:N          | Một lượt đăng ký của học viên có nhiều loại điểm và một loại điểm áp dụng cho nhiều lượt đăng ký |
| Enrollment | Session        | N:N          | Một lượt học viên đăng ký có nhiều buổi học và một buổi học có nhiều học viên đăng ký điểm danh  |
| Enrollment | AcademicResult | 1:1          | Một lượt đăng ký chỉ có một bảng kết quả học tập                                                 |

## 7.4 Data Constraints
- Ràng buộc Primary Key:
  + Tất cả các bảng đều phải có một ID duy nhất làm khóa chính
  + Bảng Profile: Sử dụng id của bảng User làm khóa chính
- Ràng buộc Foreign Key:
  + Tất cả các trường khóa ngoại bắt buộc phải tham chiếu đến một bảng cha tương ứng
- Ràng buộc xóa:
  + Không được phép xóa một dữ liệu khi dữ liệu con của nó đang hoạt động
- Ràng buộc Unique:
  + Bảng User: username và email là duy nhất
  + Bảng Profile: phone_num là duy nhất
  + Bảng Payment: transaction_id là duy nhất (mã giao dịch)
  + Bảng Enrollment: cặp khóa user_id và class_id phải là duy nhất
- Ràng buộc Not null:
  + Tất cả các trường name, username, email, password đều không được trống
  + Bảng phụ CourseTag: cặp khóa course_id và tag_id không được trống
  + Bảng phụ TeachingAssignment: cặp khóa user_id và class_id không được trống
  + Bảng phụ Attendance: cặp khóa enrollment_id và session_id không được trống
- Ràng buộc Default:
  + Tất cả các trường active, is_main mặc định là True hoặc là 1
  + Tất cả các trường created_at và updated_at tự động được hệ thống gán thời gian khi tạo hoặc sửa dữ liệu
  + Tất cả các trường capacity đều được định nghĩa sẵn
  + Tất cả các trường kiểu enum chỉ được nhận các giá trị đã được định nghĩa sẵn
- Ràng buộc miền giá trị:
  + Thời gian:
    + Bảng Class: end_date phải lớn hơn hoặc bằng start_date
    + Bảng Schedule: end_time phải lớn hơn start_time
  + Giá trị:
    + Bảng Course: price phải lớn hơn hoặc bằng 0 và total_sessions cũng phải lớn hơn 0
    + Bảng Class: capacity phải lớn hơn 0 và nhỏ hơn hoặc bằng 30
    + Bảng Room: capacity phải lớn hơn 0 và nhỏ hơn hoặc bằng 30
    + Bảng Payment: amount phải lớn hơn hoặc bằng 0
    + Bảng AcademicResult: score_value và average_score phải lớn hơn hoặc bằng 0 và phải nhỏ hơn hoặc bằng 10
    + Bảng ScoreType: weight phải lớn hơn 0 và nhỏ hơn hoặc bằng 3
- Ràng buộc Enum:
  + Tất cả các trường kiểu enum chỉ được nhận các giá trị đã được định nghĩa sẵn:
    + Bảng Enrollment: trường enrollment_status
    + Bảng Payment: trường payment_status
    + Bảng Attendance: trường attendance_status
---

# 8. System Models

## 8.1 Use Case Diagram

## 8.2 ERD
