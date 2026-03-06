# Đề Xuất Đề Tài Bài Tập Lớn

## 1. Thông Tin Nhóm

- Nhóm: 4 
- Thành viên:
  - 2351050149 – Hồ Phạm Như Quỳnh
  - 2351050009 – Trần Mỹ Ân
  - 2354050033 – Hồ Phạm Ngọc Hân
  - 2354050145 – Nguyễn Thị Ngọc Trâm
- GVHD: ThS. Võ Việt Khoa 

---

## 2. Thông Tin Đề Tài

- Tên đề tài: Language Center Management System
- Github: [Language Center Management System](https://github.com/HoPhamNhuQuynh/language-center-management-system)

- Mô tả ngắn:  
Ứng dụng web quản lý trung tâm ngoại ngữ được phát triển theo quy trình Agile có kiểm thử, bao gồm unit test, integration test và kiểm thử API. Hệ thống hỗ trợ quản lý học viên, khóa học, lớp học và phân quyền người dùng sử dụng Django REST framework. Hệ thống được xây dựng theo mô hình Client–Server, trong đó Backend (Django) cung cấp RESTful API và Frontend (ReactJS) giao tiếp thông qua HTTP requests.

- Đối tượng sử dụng:
  - Quản trị viên (Admin)
  - Giáo viên
  - Học viên

---

## 3. Tính Năng Chính (MVP)

### Phân hệ Học viên (Student)
- [x] Đăng ký khóa học và thanh toán học phí
- [x] Xem lịch học và phòng học
- [x] Xem điểm và kết quả

### Phân hệ Giáo viên/Trợ giảng (Teacher)
- [x] Quản lý lớp học và lịch dạy 
- [x] Điểm danh học viên
- [x] Nhập điểm và nhận xét

### Phân hệ Quản trị viên (Admin)
- [x] Quản lý chương trình/khóa học (CRUD) 
- [x] Quản lý giáo viên và học viên
- [x] Cấu hình học phí và chính sách

---

## 4. Công Nghệ Sử Dụng (Dự kiến)

- Backend: Python (Django, RESTful API)
- Frontend: ReactJS
- Database: MySQL
- AI (nếu có): OpenAI API

---

## 5. Phân Công Công Việc

| Thành viên | Công việc | Timeline |
|------------|-----------|----------|
| Hồ Phạm Như Quỳnh | Lập kế hoạch, quản lý team, setup project.<br>Thiết kế database, phát triển RESTful API. | Week 1-6 |
| Trần Mỹ Ân | Security, phát triển RESTful API, business logic. | Week 3-6 |
| Hồ Phạm Ngọc Hân | Thiết kế UI/UX, tích hợp API, responsive design. | Week 6-9 |
| Nguyễn Thị Ngọc Trâm | Viết test docs, bug tracking, testing sản phẩm. | Week 5-9 |

---

## 6. Timeline

- Week 1-2: Phân tích yêu cầu & Thiết kế database
- Week 3-7: Backend Development
- Week 6-8: Frontend Development
- Week 6-9: Testing & Deployment
- Week 10: Documentation & Presentation
