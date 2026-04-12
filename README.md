# language-center-management-system

## Mô tả
Ứng dụng web quản lý trung tâm ngoại ngữ được phát triển theo quy trình Agile có kiểm thử, bao gồm unit test, integration test và kiểm thử API. Hệ thống hỗ trợ quản lý học viên, khóa học, lớp học và phân quyền người dùng sử dụng Django REST framework (viết tắt là DRF). Hệ thống được xây dựng theo mô hình Client–Server, trong đó Backend (Django) cung cấp RESTful API và Frontend (ReactJS) giao tiếp thông qua HTTP requests.

## Thành viên nhóm

| MSSV       | Họ tên                 | Vai trò                               |
|------------|------------------------|----------------------------------------|
| 2351050149 | Hồ Phạm Như Quỳnh      | Project Manager - Developer Backend   |
| 2351050009 | Trần Mỹ Ân             | Developer Backend                     |
| 2354050033 | Hồ Phạm Ngọc Hân       | Developer Frontend                    |
| 2354050145 | Nguyễn Thị Ngọc Trâm   | QA/Tester                             |

## Công nghệ sử dụng
- Backend: Python (Django, RESTful API)
- Frontend: ReactJS
- Database: MySQL
- AI (nếu có): OpenAI API

## Cài đặt và chạy

### Yêu cầu
- Python 3.10+
- pip / virtualenv
- MySQL 8+
- Node.js 18+

### Chạy Backend
```bash
cd backend

# Tạo môi trường ảo (virtual environment)
python -m venv venv

# Kích hoạt môi trường
source venv/bin/activate   # Windows: venv\Scripts\activate

# Cài dependencies
pip install -r requirements.txt

# Tạo và cập nhật database
cd src
python manage.py makemigrations
python manage.py migrate

# Chạy server
python manage.py runserver_plus --cert-file cert.crt
```

### Chạy Frontend
```bash
cd frontend

# Cài dependencies
npm install

# Chạy development server
npm run dev
```

### Truy cập hệ thống
- Frontend: http://localhost:5173/
- Backend API: https://localhost:8000/

## Demo
[Link video demo hoặc screenshots]

## Tài liệu
- [Phân tích yêu cầu](docs/requirements.md)
- [Database Design](docs/database-design.md)
- [Test Plan](docs/test-plan.md)
- [API Documentation](docs/api-docs.md)