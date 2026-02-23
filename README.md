# language-center-management-system

## Mô tả
Ứng dụng web quản lý trung tâm ngoại ngữ được phát triển theo quy trình Agile có kiểm thử, bao gồm unit test, integration test và kiểm thử API. Hệ thống hỗ trợ quản lý học viên, khóa học, lớp học và phân quyền người dùng sử dụng microframework Python Flask. Hệ thống được xây dựng theo mô hình Client–Server, trong đó Backend (Flask) cung cấp RESTful API và Frontend (ReactJS) giao tiếp thông qua HTTP requests.

## Thành viên nhóm

| MSSV       | Họ tên                 | Vai trò                               |
|------------|------------------------|----------------------------------------|
| 2351050149 | Hồ Phạm Như Quỳnh      | Project Manager - Developer Backend   |
| 2351050009 | Trần Mỹ Ân             | Developer Backend                     |
| 2354050033 | Hồ Phạm Ngọc Hân       | Developer Frontend                    |
| 2354050145 | Nguyễn Thị Ngọc Trâm   | QA/Tester                             |

## Công nghệ sử dụng
- Backend: Python (Flask, RESTful API)
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
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Chạy Frontend (nếu dùng React)
```bash
cd frontend
npm install
npm start
```

### Truy cập
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Demo
[Link video demo hoặc screenshots]

## Tài liệu
- [Phân tích yêu cầu](docs/requirements.md)
- [Database Design](docs/database-design.md)
- [Test Plan](docs/test-plan.md)
- [API Documentation](docs/api-docs.md)