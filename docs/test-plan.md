# TEST PLAN  
## Language Center Management System 
Version:  
Date:  
Prepared by:  

---

## 1. INTRODUCTION  
### 1.1 Giới thiệu dự án
Dự án Hệ thống quản lý trung tâm ngoại ngữ được xây dựng nhằm hỗ trợ quản lý và tổ chức các hoạt động đào tạo một cách có hiệu quả hệ thống.  
Thông qua hệ thống các vai trò có thể thực hiện các chức năng quản lý, theo dõi khóa học. Việc áp dụng hệ thống giúp tự động hóa quy trình quản lý giảm sai sót khi xử lý dữ liệu và nâng cao hiệu quả hoạt động của trung tâm.

### 1.2 Mục tiêu dự án 
Tài liệu được xây dựng nhằm mô tả kế hoạch kiểm thử cho dự án. Xác định phạm vi kiểm thử, các chức năng cần kiểm thử, chiến lược kiểm thử, tài nguyên kiểm thử và lịch trình thực hiện kiểm thử.  
Quá trình kiểm thử là đảm bảo các chức năng của hệ thống hoạt động theo yêu cầu đã được xác định, phát hiện và xử lý các lỗi trước khi hệ thống được đưa vào sử dụng.


## 2. SCOPE  
### 2.1 Chức năng được kiểm thử
1. Chức năng chung:
* Đăng nhập hệ thống

2. Chức năng cho học viên:
* Đăng ký khóa học
* Thanh toán học phí trực tuyến
* Xem biên lai thu phí
* Xem lịch học và phòng học
* Xem kết quả học tập
  
3. Chức năng cho giáo viên:
* Xem lịch dạy
* Xem danh sách học viên
* Điểm danh học viên
* Nhập điểm và nhận xét đánh giá

4. Chức năng cho Admin:
* Quản lý khóa học
* Quản lý tài khoản người dùng
* Phân quyền người dùng
* Cấu hình học phí
* Xem báo cáo thống kê 
* Xếp lịch học

### 2.2 Chức năng không kiểm thử 
Kiểm thử hiệu năng hệ thống
Kiểm thử bảo mật nâng cao
Kiểm thử trên nhiều thiết bị hoặc nền tảng khác nhau
Tích hợp với các hệ thống bên thứ ba ngoài phạm vi dự án.


## 3. QUALITY OBJECTIVES  
Đảm bảo hệ thống quản lý trung tâm ngoại ngữ đáp ứng đúng các yêu cầu đã được đặc tả và hoạt động ổn định trong quá trình sử dụng.

### 3.1 Primary Objectives  
Mục tiêu chính: Xác minh rằng các chức năng của hệ thống được triển khai đúng theo các yêu cầu chức năng đã xác định:  
* Đảm bảo các chức năng chính hoạt động ổn định.
* Phát hiện và giảm thiểu các lỗi nghiêm trọng có thể ảnh hưởng đến hoạt động của hệ thống.
* Đảm bảo dữ liệu được lưu trữ và xử lý trong quá trình vận hành hệ thống.


### 3.2 Secondary Objectives  
Ngoài mục tiêu chính, kiểm thử cũng hướng đến các mục tiêu phụ nhằm nâng cao chất lượng tổng thể của hệ thống:  
* Đảm bảo giao diện hệ thống rõ ràng và dễ sử dụng.
* Hạn chế các lỗi nhỏ.
* Đảm bảo hệ thống phản hồi trong thời gian hợp lý.
* Kiểm tra tính nhất quán và chính xác của thông tin hiển thị trên hệ thống.

## 4. TEST APPROACH  
(Mô tả cách tiếp cận test: manual/automation, black-box/white-box...)

### 4.1 Test Automation  
(Nêu có dùng automation không, dùng tool gì, phạm vi automation.)

## 5. ROLES AND RESPONSIBILITIES  
(Phân công vai trò: ai viết test case, ai thực thi test, ai fix bug.)

## 6. ENTRY AND EXIT CRITERIA  
(Điều kiện bắt đầu và kết thúc hoạt động test.)

### 6.1 Entry Criteria  
(Code đã hoàn thành, môi trường sẵn sàng, tài liệu requirement có sẵn...)

### 6.2 Exit Criteria  
(100% test case executed, không còn bug critical, pass rate đạt X%...)

## 7. SUSPENSION CRITERIA AND RESUMPTION REQUIREMENTS  
(Khi nào phải tạm dừng test và khi nào được tiếp tục.)

### 7.1 Suspension Criteria  
(VD: hệ thống crash nghiêm trọng, môi trường test lỗi.)

### 7.2 Resumption Criteria  
(Bug nghiêm trọng đã được fix, môi trường ổn định lại.)

## 8. TEST STRATEGY  
(Chiến lược test tổng thể.)

### 8.1 QA Role in Test Process  
(Vai trò QA trong toàn bộ quy trình phát triển.)

### 8.2 Bug Life Cycle  
(Mô tả vòng đời bug: New → Assigned → Fixed → Retest → Closed...)

### 8.3 Testing Types  
(Liệt kê các loại test: Functional, Regression, Integration, v.v.)

### 8.4 Bug Severity and Priority Definition  
(Định nghĩa mức độ nghiêm trọng và độ ưu tiên.)

#### Severity List  
(Định nghĩa Critical, High, Medium, Low.)

#### Priority List  
(Định nghĩa P1, P2, P3...)

## 9. RESOURCE AND ENVIRONMENT NEEDS  
(Những tài nguyên cần để test.)

### 9.1 Testing Tools  
(Tool dùng để test: Postman, Selenium, JMeter...)

### 9.2 Configuration Management  
(Cách quản lý version, source code, branch...)

### 9.3 Test Environment  
(Môi trường test: OS, browser, database, server...)

## 10. TEST SCHEDULE  
| Giai đoạn  | Nội dung                                                    | Thời gian               |
|-------------|-------------------------------------------------------------|-------------------------|
| Chuẩn bị    | Chuẩn bị môi trường kiểm thử, thiết kế các test case       | 17-03-2026 - 23-03-2026 |
| Thực hiện   | Kiểm thử các chức năng hệ thống                             | 24-03-2026 - 30-03-2026 |
| Sửa lỗi     | Sửa các lỗi đã phát hiện và thực hiện kiểm thử lại          | 31-03-2026 - 06-04-2026 |
| Báo cáo     | Tổng hợp kết quả kiểm thử và báo cáo                        | 07-04-2026 - 13-04-2026 |

## 11. APPROVALS  
Hồ Phạm Như Quỳnh
Trần Mỹ Ân
Hồ Phạm Ngọc Hân

## 12. TERMS / ACRONYMS  
(Giải thích các thuật ngữ viết tắt sử dụng trong tài liệu.)
