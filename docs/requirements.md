# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
## Language Center Management System

---

# 1. Introduction

## 1.1 Purpose

## 1.2 Scope

## 1.3 Definitions, Acronyms, Abbreviations

| Term | Meaning |
|------|---------|
|      |         |
|      |         |

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
- 
- 
- 

## 4.2 Hardware Interface

## 4.3 Software Interface
- 
- 

---

# 5. Non-functional Requirements

NFR-01:  
NFR-02:  
NFR-03:  
NFR-04:  

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
- 
- 

## 7.4 Data Constraints
- 
- 

---

# 8. System Models

## 8.1 Use Case Diagram

## 8.2 ERD