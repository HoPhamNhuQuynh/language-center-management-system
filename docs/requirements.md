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

## 2.2 System Overview

## 2.3 User Roles

| Role | Description |
|------|------------|
|      |            |
|      |            |

## 2.4 Assumptions & Constraints

### Assumptions
- 
- 

### Constraints
- 
- 

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
- 
- 

## 7.4 Data Constraints
- 
- 

---

# 8. System Models

## 8.1 Use Case Diagram

## 8.2 ERD
