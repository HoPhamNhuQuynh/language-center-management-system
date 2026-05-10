# TÀI LIỆU API (API DOCUMENTATION) 

## Language Center Management System

---

# 1. Tổng quan (General)

## 1.1 Mục tiêu (Purpose)

Tài liệu API nhằm mô tả cách thức tương tác với hệ thống, bao gồm cách gọi API, dữ liệu đầu vào và đầu ra. Nhờ đó, các bên liên quan có thể hiểu rõ cách sử dụng, kiểm thử và tích hợp hệ thống một cách chính xác và hiệu quả.

---

## 1.2 Base URL

```
https://localhost:8000/api/
```

---

## 1.3 Xác thực (Authentication)

### Cơ chế (Mechanism)

Hệ thống sử dụng kết hợp OAuth 2.0 cho xác thực bên thứ ba và xác thực bằng username/password cho tài khoản nội bộ. Sau khi xác thực thành công, hệ thống cấp Access Token (Bearer Token) dạng opaque để sử dụng cho các request tiếp theo, đảm bảo tính nhất quán và khả năng mở rộng.

### Header

Các request yêu cầu chứng thực cần gửi kèm access token trong header Authorization theo định dạng:
```
Authorization: Bearer <access_token>
```

---

## 1.4 Quy ước (Conventions)

### Định dạng request (Request Format)
```
[HTTP METHOD] endpoint-URL
Host: {base_url}
Authorization: Bearer <access_token> (nếu có)
Content-Type: application/json

{
    request body (nếu có)
}
```

#### 1. Cấu trúc URL (endpoint)
* `/{resource}/{resource_id}/{sub-resource}`
* Nguyên tắc đặt tên endpoint
    - Dùng danh từ số nhiều, không dùng động từ
    - Sử dụng HTTP methods để thể hiện hành động đối với tài nguyên
    - Dùng kebab-case
    - Phân cấp tài nguyên rõ ràng
    - Sử dụng path param và query param đúng mục đích

#### 2. HTTP method
* GET - lấy dữ liệu
    - Dùng để truy vấn/ đọc dữ liệu
    - Không làm thay đổi dữ liệu
    - Có thể gọi nhiều lần 
    - Gửi dữ liệu qua query param (URL), không có body

* POST - tạo mới
    - Dùng để tạo tài nguyên mới
    - Server sẽ tự sinh `id` 
    - Gọi lại có thể tạo thêm dữ liệu (không idempotent) 
    - Gửi dữ liệu qua request body

* PUT - cập nhật toàn bộ
    - Gửi toàn bộ dữ liệu của resource
    - Thiếu field có thể bị ghi đè thành null
    - Gửi toàn bộ dữ liệu qua body

* PATCH - cập nhật một phần
    - Chỉ gửi field cần thay đổi
    - Không ảnh hưởng tới các field khác
    - Gửi một phần dữ liệu cần cập nhật qua body

* DELETE - xóa
    - Dùng để xóa tài nguyên
    - Có thể là xóa mềm (soft delete) hoặc xóa thật dữ
    - Thường không có body, xác định resource qua path  

#### 3. Headers
Các Header tiêu chuẩn
* `Content-Type: application/json` - xác định dạng dữ liệu gửi lên server
* `Authorization: Bearer <access_token>` - sử dụng token cho các API yêu cầu xác thực
* `Encoding: UTF-8` - đảm bảo xử lý đúng tiếng Việt và ký tự đặc biệt 

#### 4. Định dạng dữ liệu (Request Body)
* Kiểu dữ liệu: 
    - Hệ thống sử dụng `JSON (application/json)` cho các request thông thường
    - Đối với các request có upload file thì sử dụng `multipart/form-data`.

* Cấu trúc dữ liệu gửi lên dưới dạng **key-value**

#### 5. Tham số truy vấn (Query parameters)
* Quy định cách truyền tham số trên URL
    - Quert param được truyền sau dấu `?` trong URL
    - Mỗi tham số là cặp `key=value`
    - Nhiều tham số nối với nhau bằng dấu `&`

* Trường hợp sử dụng
    - Phân trang (pagination) - `/users?page=1&limit=10`
    - Lọc dữ liệu (filter) - `/users?status=active&role=student`
    - Tìm kiếm (search) - `/users?keyword=nguyen`

* Quy ước
    - Tên param dùng snake_case
    - Giá trị là kiểu string trên URL
    - Không truyền dữ liệu nhạy cảm qua query param (vd: `token`, `password`)
    - Không dùng query cho dữ liệu phức tạp

### Định dạng response (Response Format)

#### 1. Định dạng dữ liệu trả về
Sử dụng `application/json`

#### 2. Cấu trúc success response
```
{
  "data": {}
}
```

---

## 1.5 HTTP Status Codes

| Code | Meaning               | Description                                             |
|------|-----------------------|---------------------------------------------------------|
| 200  | OK                    | Request thành công, trả về dữ liệu                      |
| 201  | Created               | Tạo tài nguyên mới thành công                           |
| 204  | No Content            | Thành công nhưng không có dữ liệu trả về                |
| 400  | Bad Request           | Request không hợp lệ (thiếu/sai dữ liệu)                |
| 401  | Unauthorized          | Chưa xác thực hoặc token không hợp lệ                   |
| 403  | Forbidden             | Không có quyền truy cập                                 |
| 404  | Not Found             | Không tìm thấy tài nguyên                               |
| 405  | Method Not Allowed    | Method không được hỗ trợ cho endpoint này               |
| 500  | Internal Server Error | Lỗi phía server                                         |
| 502  | Bad Gateway           | Server nhận response lỗi từ server khác (gateway/proxy) |

---

## 1.6 Định dạng response khi trả về lỗi (Error Format)

```
{
  "error": {
    "details": "Optional detailed info"
  }
}
```

# 2. API ENDPOINTS

## 2.1. Quản lý Định danh và Truy cập (IAM - Identity and Access Management)

### 2.1.1. Đăng nhập hệ thống bằng tài khoản LOCAL
- Endpoint: POST /auth/login/
- Mô tả: dùng khi user đăng nhập vào hệ thống.
- Request Body
```json
{
  "username": "nva",
  "password": "Abc123@"
}
```
- Success Response
  * HTTP Status Code: 200 OK
```json
{
    "access_token": "5pKTtaSgbbhPIdPB7X8EAex8CyfAH1",
    "expires_in": 36000,
    "token_type": "Bearer",
    "scope": "read write",
    "refresh_token": "Px3H8h93vJkpicYi38cYzfDQIbQKE1",
    "user": {
        "id": 1,
        "first_name": "Văn A",
        "last_name": "Nguyễn",
        "email": "nva@gmail.com",
        "username": "nva",
        "phone_num": "0123456789",
        "role": "Student"
    }
}
```

---

### 2.1.2. Đăng ký tài khoản LOCAL
- Endpoint: POST /auth/register/
- Mô tả: dùng khi user đăng ký tài khoản. Password yêu cầu tối thiểu 6 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt.
- Request Body
```json
{
    "first_name": "Hv1",
    "last_name": "Test",
    "username": "Hv1",
    "password": "Testhv@123",
    "email": "test1@gmail.com",
    "phone_num": "0123445789"
}
```
- Success Response
  * HTTP Status Code: 201 Created
```json
{
    "access_token": "vX9OyRm7Xr7M9RBZQkn72xkZOSVkVj",
    "expires_in": 36000,
    "token_type": "Bearer",
    "scope": "read write",
    "refresh_token": "4JY1VPkVVneJTDxr9eCpLNb9pSBdKf",
    "user": {
        "id": 10,
        "first_name": "Hv1",
        "last_name": "Test",
        "email": "test1@gmail.com",
        "username": "Hv1",
        "phone_num": "0123445789",
        "role": "Student"
    }
}
```

---

### 2.1.3. Xác thực tài khoản người dùng bằng Google
- Endpoint: POST /auth/social-login/
- Mô tả: dùng khi user đăng nhập bằng tài khoản Google. 
- Request Body
```json
{
  "provider": "GOOGLE",
  "access_token": "<google_access_token>"
}
```
- Success Response
  * HTTP Status Code: 200 OK
```json
{
    "access_token": "abc123...",
    "refresh_token": "xyz456...",
    "expires_in": 36000,
    "token_type": "Bearer",
    "user": {
        "id": 5,
        "first_name": "Văn A",
        "last_name": "Nguyễn",
        "email": "nva@gmail.com",
        "username": "nva",
        "phone_num": null,
        "role": "Student"
    }
}
```

---

### 2.1.4. Xác thực người dùng bằng tài khoản Facebook
- Endpoint: POST /auth/social-login/
- Mô tả: dùng khi user đăng nhập bằng tài khoản Facebook. 
- Request Body
```json
{
  "provider": "FACEBOOK",
  "access_token": "<facebook_access_token>"
}
```
- Success Response
  * HTTP Status Code: 200 OK
```json
{
    "access_token": "abc123...",
    "refresh_token": "xyz456...",
    "expires_in": 36000,
    "token_type": "Bearer",
    "user": {
        "id": 6,
        "first_name": "Văn B",
        "last_name": "Trần",
        "email": "tvb@gmail.com",
        "username": "tvb",
        "phone_num": null,
        "role": "Student"
    }
}
```

---

### 2.1.5. Refresh Token
- Endpoint: POST /auth/refresh/
- Mô tả: dùng khi cần làm mới access_token. `client_id`, `client_secret`, `grant_type` được backend tự inject, client chỉ cần truyền `refresh_token`.
- Request Body
```json
{
  "refresh_token": "4JY1VPkVVneJTDxr9eCpLNb9pSBdKf"
}
```
- Success Response
  * HTTP Status Code: 200 OK
```json
{
    "access_token": "vX9OyRm7Xr7M9RBZQkn72xkZOSVkVj",
    "expires_in": 36000,
    "token_type": "Bearer",
    "scope": "read write",
    "refresh_token": "4JY1VPkVVneJTDxr9eCpLNb9pSBdKf"
}
```

---

### 2.1.6. Đăng xuất tài khoản
- Endpoint: POST /auth/logout/
- Mô tả: thu hồi token, vô hiệu hóa phiên đăng nhập. `client_id`, `client_secret` được backend tự inject.
- Authorization: Bearer \<access_token\>
- Request Body
```json
{
  "token": "4JY1VPkVVneJTDxr9eCpLNb9pSBdKf"
}
```
- Success Response
  * HTTP Status Code: 200 OK (body rỗng)

---

### 2.1.7. Đổi mật khẩu
- Endpoint: PATCH /users/me/reset-password/
- Mô tả: dùng khi user muốn đổi mật khẩu. Password mới yêu cầu tối thiểu 6 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt.
- Authorization: Bearer \<access_token\>
- Request Body
```json
{
  "old_password": "Old@123",
  "password": "New@123"
}
```
- Success Response
  * HTTP Status Code: 200 OK
```json
{
    "id": 4,
    "first_name": "Minh",
    "last_name": "Trần",
    "email": "minhtran@gmail.com",
    "username": "student_minh",
    "phone_num": "0912345678",
    "role": "Student"
}
```

---

## 2.2. Quản lý Tài nguyên người dùng (User Resource Management)

### 2.2.1. Lấy thông tin chi tiết người dùng
- Endpoint: GET /users/me/
- Mô tả: trả về thông tin chi tiết của người dùng đang đăng nhập
- Authorization: Bearer \<access_token\>
- Success Response
  * HTTP Status Code: 200 OK
```json
{
    "id": 2,
    "first_name": "Minh",
    "last_name": "Trần",
    "email": "minhtran@gmail.com",
    "username": "student_minh",
    "role": "Student",
    "date_joined": "2026-04-19T22:09:21+07:00",
    "last_login": null,
    "auth_provider": "LOCAL",
    "avatar": "https://res.cloudinary.com/desvczltb/image/upload/v1/language_center_testing/defaults/student_avatar",
    "is_active": true,
    "phone_num": "0912345678"
}
```

---

### 2.2.2. Cập nhật thông tin cơ bản của người dùng
- Endpoint: PATCH /users/me/
- Mô tả: cập nhật thông tin cá nhân. Không cho phép cập nhật `password`, `avatar`, `date_joined`, `last_login`, `auth_provider`.
- Authorization: Bearer \<access_token\>
- Request Body (các trường đều optional)
```json
{
  "email": "ab@gmail.com",
  "phone_num": "0123456489",
  "first_name": "Minh",
  "last_name": "Trong"
}
```
- Success Response
  * HTTP Status Code: 200 OK
```json
{
    "id": 29,
    "first_name": "Minh",
    "last_name": "Trong",
    "email": "ab@gmail.com",
    "username": "Hv18",
    "phone_num": "0123456489",
    "role": "Student"
}
```

---

### 2.2.3. Cập nhật ảnh đại diện người dùng
- Endpoint: PATCH /users/me/avatar/
- Mô tả: cập nhật ảnh đại diện. File phải là ảnh, tối đa 2MB.
- Authorization: Bearer \<access_token\>
- Content-Type: multipart/form-data
- Request Body (form-data)
```
avatar: <file image>
```
- Success Response
  * HTTP Status Code: 200 OK
```json
{
    "avatar": "https://res.cloudinary.com/desvczltb/image/upload/v1777403527/language_center_testing/users/hzblstjnslexfnrfkqnk.png"
}
```

---

### 2.2.4. Lấy danh sách các lớp học đã đăng ký của người dùng
- Endpoint: GET /users/me/enrollments/
- Mô tả: trả về danh sách lớp học đã đăng ký của người dùng hiện tại
- Authorization: Bearer \<access_token\>
- Success Response
  * HTTP Status Code: 200 OK
```json
[
    {
        "id": 1,
        "student": {
            "id": 4,
            "first_name": "Minh",
            "last_name": "Trần",
            "email": "minhtran@gmail.com",
            "username": "student_minh",
            "phone_num": "0912345678",
            "role": "Student"
        },
        "classroom": {
            "id": 1,
            "name": "Lớp Giao Tiếp Căn Bản - K23 (Ca Tối)",
            "course_id": 1,
            "course_name": "Khóa Học Giao Tiếp Toàn Diện 360",
            "course_level": "Cơ bản (Beginner)",
            "course_price": "3500000.00",
            "start_date": "2024-05-01",
            "end_date": "2024-07-31",
            "active": false,
            "capacity": 30,
            "remaining_slots": 5,
            "main_teacher": {
                "id": 2,
                "first_name": "John",
                "last_name": "Doe",
                "email": "johndoe@ttngoaingu.edu.vn",
                "username": "teacher_john",
                "role": "Teacher"
            },
            "schedules": [
                {
                    "id": 1,
                    "day_of_week": 1,
                    "start_time": "18:00:00",
                    "end_time": "20:00:00",
                    "room": 1
                }
            ]
        },
        "enrollment_status": "SUCCESS",
        "payment_deadline": "2024-04-21T06:59:59+07:00",
        "created_at": "2026-04-19T22:09:21+07:00"
    }
]
```

---

### 2.2.5. Lấy thông tin chi tiết của lớp học đã đăng ký
- Endpoint: GET /enrollments/{enroll_id}/
- Mô tả: trả về chi tiết một bản ghi đăng ký
- Authorization: Bearer \<access_token\>
- Path Params

| Tham số   | Kiểu dữ liệu | Bắt buộc | Mô tả                                    |
|-----------|--------------|----------|------------------------------------------|
| enroll_id | int          | có       | ID duy nhất của bản ghi đăng ký lớp học. |

- Success Response
  * HTTP Status Code: 200 OK
```json
{
    "id": 1,
    "student": {
        "id": 4,
        "first_name": "Minh",
        "last_name": "Trần",
        "email": "minhtran@gmail.com",
        "username": "student_minh",
        "phone_num": "0912345678",
        "role": "Student"
    },
    "classroom": {
        "id": 1,
        "name": "Lớp Giao Tiếp Căn Bản - K23 (Ca Tối)",
        "course_id": 1,
        "course_name": "Khóa Học Giao Tiếp Toàn Diện 360",
        "course_level": "Cơ bản (Beginner)",
        "course_price": "3500000.00",
        "start_date": "2024-05-01",
        "end_date": "2024-07-31",
        "active": false,
        "capacity": 30,
        "remaining_slots": 5,
        "main_teacher": {
            "id": 2,
            "first_name": "John",
            "last_name": "Doe",
            "email": "johndoe@ttngoaingu.edu.vn",
            "username": "teacher_john",
            "role": "Teacher"
        },
        "schedules": [
            {
                "id": 1,
                "day_of_week": 1,
                "start_time": "18:00:00",
                "end_time": "20:00:00",
                "room": 1
            }
        ]
    },
    "enrollment_status": "SUCCESS",
    "payment_deadline": "2024-04-21T06:59:59+07:00",
    "created_at": "2026-04-19T22:09:21+07:00",
    "updated_at": "2026-04-19T22:09:21+07:00",
    "active": true
}
```

---

### 2.2.6. Lấy dữ liệu thời khóa biểu
- Endpoint: GET /sessions/
- Mô tả: trả về danh sách buổi học của người dùng hiện tại (học viên xem lớp đã đăng ký, giáo viên xem lớp được phân công)
- Authorization: Bearer \<access_token\>
- Query Params

| Tham số    | Kiểu dữ liệu | Bắt buộc | Mô tả                      |
|------------|--------------|----------|----------------------------|
| start_date | date         | không    | Lọc từ ngày (YYYY-MM-DD).  |
| end_date   | date         | không    | Lọc đến ngày (YYYY-MM-DD). |

- Success Response
  * HTTP Status Code: 200 OK
```json
[
    {
        "id": 1,
        "date": "2025-01-21",
        "start_time": "17:00:00",
        "end_time": "19:00:00",
        "user": 2,
        "teacher_fullname": "Wilson David",
        "room": {
            "id": 29,
            "name": "Phòng D.203",
            "capacity": 40
        },
        "classroom_name": "IELTS Foundation 4.5+-A",
        "day_of_week": 1,
        "classroom_start_date": "2025-01-15",
        "classroom_end_date": "2025-04-15"
    }
]
```

---

### 2.2.7. Lấy lịch sử thanh toán của người dùng
- Endpoint: GET /users/me/payments/
- Mô tả: trả về lịch sử giao dịch của người dùng hiện tại
- Authorization: Bearer \<access_token\>
- Success Response
  * HTTP Status Code: 200 OK
```json
[
    {
        "id": 649,
        "enrollment": 371,
        "amount": "1500000.00",
        "payment_method": "VNPAY",
        "paid_at": "2025-07-08T16:00:00+07:00",
        "classroom": "JLPT N4 Intermediate-C",
        "payment_status": "SUCCESS",
        "total_sessions": 30,
        "transaction_id": "T1_649",
        "created_at": "2025-07-08T16:00:00+07:00",
        "student_name": "Minh Trần",
        "student_email": "minhtran@gmail.com"
    },
]
```

---

### 2.2.8. Lấy kết quả học tập của người dùng
- Endpoint: GET /users/me/results/
- Mô tả: trả về kết quả học tập (điểm số + điểm danh) của người dùng hiện tại
- Authorization: Bearer \<access_token\>
- Success Response
  * HTTP Status Code: 200 OK
```json
[
    {
        "id": 104,
        "enrollment_id": 104,
        "scores": [
            {
                "id": 207,
                "score_value": 7.2,
                "score_type": "Mock Test",
                "score_type_id": 15,
                "enrollment_id": 104,
                "student": {
                    "id": 2,
                    "first_name": "Minh",
                    "last_name": "Trần",
                    "email": "minhtran@gmail.com",
                    "username": "student_minh",
                    "role": "Student",
                    "phone_num": "0912345678"
                }
            },
            {
                "id": 208,
                "score_value": 8.8,
                "score_type": "Final Test",
                "score_type_id": 16,
                "enrollment_id": 104,
                "student": {
                    "id": 2,
                    "first_name": "Minh",
                    "last_name": "Trần",
                    "email": "minhtran@gmail.com",
                    "username": "student_minh",
                    "role": "Student",
                    "phone_num": "0912345678"
                }
            }
        ],
        "attendance_count": 5,
        "average_score": 8.2,
        "comment": "Tiến bộ vượt bậc"
    }
]
```

---

### 2.2.9. Xóa mềm tài khoản của người dùng
- Endpoint: DELETE /users/me/
- Mô tả: set `is_active = false` và thu hồi toàn bộ access token của người dùng
- Authorization: Bearer \<access_token\>
- Success Response
  * HTTP Status Code: 204 No Content

---

## 2.3. Quản lý Tài nguyên đào tạo (Training Resources)

### 2.3.1. Lấy danh sách khóa học
- Endpoint: GET /courses/
- Mô tả: trả về danh sách khóa học (chỉ lấy `active=true` với người dùng thường; admin thấy tất cả). Có phân trang.
- Query Params

| Trường | Kiểu dữ liệu | Bắt buộc | Mô tả                                                      |
|--------|--------------|----------|------------------------------------------------------------|
| tag    | string       | không    | Lọc theo tên thẻ (không phân biệt hoa thường)              |
| search | string       | không    | Tìm kiếm theo tên khóa học                                 |
| page   | int          | không    | Số trang                                                   |

- Success Response
  * HTTP Status Code: 200 OK
```json
{
    "count": 15,
    "next": "https://127.0.0.1:8000/api/courses/?page=2",
    "previous": null,
    "results": [
        {
            "id": 1,
            "name": "Khóa Học Giao Tiếp Toàn Diện 360",
            "image": "https://res.cloudinary.com/.../giaotiep360",
            "total_sessions": 36,
            "level": 1,
            "level_name": "Cơ bản (Beginner)",
            "tags": [
                {"id": 1, "name": "Giao Tiếp Thực Chiến"}
            ],
            "price": "3500000.00"
        },
        {
            "id": 2,
            "name": "IELTS Master 6.5+ (Đảm Bảo Đầu Ra)",
            "image": "https://res.cloudinary.com/.../ielts_master",
            "total_sessions": 48,
            "level": 3,
            "level_name": "Nâng cao (Advanced/IELTS)",
            "tags": [
                {"id": 2, "name": "Luyện Thi IELTS"}
            ],
            "price": "8000000.00"
        }
    ]
}
```

---

### 2.3.2. Lấy thông tin chi tiết khóa học
- Endpoint: GET /courses/{course_id}/
- Mô tả: trả về thông tin chi tiết khóa học. Admin thấy thêm `actual_total_sessions`.
- Path Params

| Tham số   | Kiểu dữ liệu | Bắt buộc | Mô tả                         |
|-----------|--------------|----------|-------------------------------|
| course_id | int          | có       | ID định danh khóa học cụ thể. |

- Success Response
  * HTTP Status Code: 200 OK
```json
{
    "id": 2,
    "name": "IELTS Master 6.5+ (Đảm Bảo Đầu Ra)",
    "image": "https://res.cloudinary.com/.../ielts_master",
    "total_sessions": 48,
    "level": 3,
    "level_name": "Nâng cao (Advanced/IELTS)",
    "tags": [
        {"id": 2, "name": "Luyện Thi IELTS"}
    ],
    "price": "8000000.00",
    "description": "Chiến lược làm bài thực chiến 4 kỹ năng nghe, nói, đọc, viết theo chuẩn IELTS.",
    "active": true,
    "created_at": "2026-04-19T22:09:21+07:00",
    "actual_total_sessions": 48
}
```

---

### 2.3.3. Lấy danh sách thẻ
- Endpoint: GET /tags/
- Mô tả: trả về danh sách các thẻ đang hoạt động (`active=true`)
- Success Response
  * HTTP Status Code: 200 OK
```json
[
    {"id": 1, "name": "Giao Tiếp Thực Chiến"},
    {"id": 2, "name": "Luyện Thi IELTS"},
    {"id": 3, "name": "Luyện Thi TOEIC"},
    {"id": 4, "name": "Tiếng Anh Doanh Nghiệp"}
]
```

---

### 2.3.4. Lấy danh sách lớp học thuộc khóa học
- Endpoint: GET /courses/{course_id}/classes/
- Mô tả: trả về danh sách lớp học thuộc khóa học, không yêu cầu xác thực
- Path Params

| Tham số   | Kiểu dữ liệu | Bắt buộc | Mô tả                         |
|-----------|--------------|----------|-------------------------------|
| course_id | int          | có       | ID định danh khóa học cụ thể. |

- Success Response
  * HTTP Status Code: 200 OK
```json
[
    {
        "id": 1,
        "name": "Lớp Giao Tiếp Căn Bản - K23 (Ca Tối)",
        "course_id": 1,
        "course_name": "Khóa Học Giao Tiếp Toàn Diện 360",
        "course_level": "Cơ bản (Beginner)",
        "course_price": "3500000.00",
        "start_date": "2024-05-01",
        "end_date": "2024-07-31",
        "active": false,
        "capacity": 30,
        "remaining_slots": 0,
        "main_teacher": {
            "id": 2,
            "first_name": "John",
            "last_name": "Doe",
            "email": "johndoe@ttngoaingu.edu.vn",
            "username": "teacher_john",
            "role": "Teacher"
        },
        "schedules": [
            {
                "id": 1,
                "day_of_week": 1,
                "start_time": "18:00:00",
                "end_time": "20:00:00",
                "room": 1
            }
        ]
    }
]
```

---

### 2.3.5. Lấy danh sách cấp độ
- Endpoint: GET /levels/
- Mô tả: trả về danh sách các cấp độ khóa học
- Success Response
  * HTTP Status Code: 200 OK
```json
[
    {
        "id": 1,
        "name": "Cơ bản (Beginner)",
        "description": "Dành cho học viên mất gốc, bắt đầu làm quen tiếng Anh."
    },
    {
        "id": 2,
        "name": "Trung cấp (Intermediate)",
        "description": "Có nền tảng, tập trung phát triển tư duy tiếng Anh và phản xạ."
    },
    {
        "id": 3,
        "name": "Nâng cao (Advanced/IELTS)",
        "description": "Sử dụng tiếng Anh chuyên sâu, luyện thi chứng chỉ quốc tế."
    }
]
```

---

### 2.3.6. Lấy danh sách cột điểm theo lớp
- Endpoint: GET /classes/{class_id}/score-types/
- Mô tả: trả về danh sách các cột điểm của khóa học tương ứng với lớp
- Authorization: Bearer \<access_token\>
- Path Params

| Tham số  | Kiểu dữ liệu | Bắt buộc | Mô tả                        |
|----------|--------------|----------|------------------------------|
| class_id | int          | có       | ID định danh lớp học cụ thể. |

- Success Response
  * HTTP Status Code: 200 OK
```json
[
    {
        "id": 1,
        "name": "Điểm Chuyên Cần (Attendance)",
        "weight": 1,
        "course": 1,
        "course_name": "Khóa Học Giao Tiếp Toàn Diện 360"
    },
    {
        "id": 2,
        "name": "Bài Thi Giữa Kỳ (Midterm)",
        "weight": 2,
        "course": 1,
        "course_name": "Khóa Học Giao Tiếp Toàn Diện 360"
    }
]
```

---

### 2.3.7. Lấy danh sách buổi học của lớp
- Endpoint: GET /classes/{class_id}/sessions/
- Mô tả: giáo viên chỉ thấy buổi học được phân công; admin thấy tất cả. Admin thấy thêm `created_at` và `active`.
- Authorization: Bearer \<access_token\>
- Path Params

| Tham số  | Kiểu dữ liệu | Bắt buộc | Mô tả                        |
|----------|--------------|----------|------------------------------|
| class_id | int          | có       | ID định danh lớp học cụ thể. |

- Success Response
  * HTTP Status Code: 200 OK
```json
{
    "classroom_name": "Lớp Giao Tiếp Căn Bản - K23 (Ca Tối)",
    "sessions": [
        {
            "id": 1,
            "date": "2024-05-06",
            "start_time": "18:00:00",
            "end_time": "20:00:00",
            "user": 2,
            "teacher_fullname": "Doe John",
            "room": {
                "id": 1,
                "name": "Phòng Lab 01 (Cơ Sở 1)",
                "capacity": 30
            },
            "classroom_name": "Lớp Giao Tiếp Căn Bản - K23 (Ca Tối)",
            "day_of_week": 1,
            "classroom_start_date": "2024-05-01",
            "classroom_end_date": "2024-07-31"
        },
        {
            "id": 2,
            "date": "2024-05-08",
            "start_time": "18:00:00",
            "end_time": "20:00:00",
            "user": 2,
            "teacher_fullname": "Doe John",
            "room": {
                "id": 1,
                "name": "Phòng Lab 01 (Cơ Sở 1)",
                "capacity": 30
            },
            "classroom_name": "Lớp Giao Tiếp Căn Bản - K23 (Ca Tối)",
            "day_of_week": 3,
            "classroom_start_date": "2024-05-01",
            "classroom_end_date": "2024-07-31"
        }
    ]
}
```

---

## 2.4. Quản lý Tiến trình học tập và Giao dịch Học viên (Student Lifecycle and Billing Management)

### 2.4.1. Đăng ký khóa học
- Endpoint: POST /enrollments/
- Mô tả: học viên đăng ký lớp học. Báo lỗi nếu lớp đã đủ sĩ số, đã đăng ký trùng, hoặc bị trùng lịch học. Trạng thái mặc định là `PENDING_PAYMENT`.
- Authorization: Bearer \<access_token\> (Student only)
- Request Body
```json
{
    "classroom": 1
}
```
- Success Response
  * HTTP Status Code: 200 OK
```json
{
    "id": 10,
    "student": {
        "id": 4,
        "first_name": "Minh",
        "last_name": "Trần",
        "email": "minhtran@gmail.com",
        "username": "student_minh",
        "phone_num": "0912345678",
        "role": "Student"
    },
    "classroom": {
        "id": 1,
        "name": "Lớp Giao Tiếp Căn Bản - K23 (Ca Tối)",
        "course_id": 1,
        "course_name": "Khóa Học Giao Tiếp Toàn Diện 360",
        "course_level": "Cơ bản (Beginner)",
        "course_price": "3500000.00",
        "start_date": "2024-05-01",
        "end_date": "2024-07-31",
        "active": true,
        "capacity": 30,
        "remaining_slots": 14,
        "main_teacher": {
            "id": 2,
            "first_name": "John",
            "last_name": "Doe",
            "email": "johndoe@ttngoaingu.edu.vn",
            "username": "teacher_john",
            "role": "Teacher"
        },
        "schedules": [
            {
                "id": 1,
                "day_of_week": 1,
                "start_time": "18:00:00",
                "end_time": "20:00:00",
                "room": 1
            }
        ]
    },
    "enrollment_status": "PENDING_PAYMENT",
    "payment_deadline": "2024-04-21T06:59:59+07:00",
    "created_at": "2026-04-29T10:00:00+07:00"
}
```

---

### 2.4.2. Lấy danh sách đăng ký
- Endpoint: GET /enrollments/
- Mô tả: học viên thấy đăng ký của mình; giáo viên thấy đăng ký của lớp mình phụ trách; admin thấy tất cả (kèm thêm `updated_at`, `active`).
- Authorization: Bearer \<access_token\>
- Success Response
  * HTTP Status Code: 200 OK
```json
[
    {
        "id": 1,
        "student": {
            "id": 4,
            "first_name": "Minh",
            "last_name": "Trần",
            "email": "minhtran@gmail.com",
            "username": "student_minh",
            "phone_num": "0912345678",
            "role": "Student"
        },
        "classroom": {
            "id": 1,
            "name": "Lớp Giao Tiếp Căn Bản - K23 (Ca Tối)",
            "course_id": 1,
            "course_name": "Khóa Học Giao Tiếp Toàn Diện 360",
            "course_level": "Cơ bản (Beginner)",
            "course_price": "3500000.00",
            "start_date": "2024-05-01",
            "end_date": "2024-07-31",
            "active": false,
            "capacity": 30,
            "remaining_slots": 5,
            "main_teacher": {
                "id": 2,
                "first_name": "John",
                "last_name": "Doe",
                "email": "johndoe@ttngoaingu.edu.vn",
                "username": "teacher_john",
                "role": "Teacher"
            },
            "schedules": [
                {
                    "id": 1,
                    "day_of_week": 1,
                    "start_time": "18:00:00",
                    "end_time": "20:00:00",
                    "room": 1
                }
            ]
        },
        "enrollment_status": "SUCCESS",
        "payment_deadline": "2024-04-21T06:59:59+07:00",
        "created_at": "2026-04-19T22:09:21+07:00"
    }
]
```

---

### 2.4.3. Hủy đăng ký khóa học
- Endpoint: DELETE /enrollments/{enroll_id}/
- Mô tả: chỉ được hủy khi `enrollment_status = PENDING_PAYMENT` (chưa phát sinh giao dịch). Xóa hoàn toàn khỏi hệ thống.
- Authorization: Bearer \<access_token\>
- Path Params

| Tham số   | Kiểu dữ liệu | Bắt buộc | Mô tả                                    |
|-----------|--------------|----------|------------------------------------------|
| enroll_id | int          | có       | ID duy nhất của bản ghi đăng ký lớp học. |

- Success Response
  * HTTP Status Code: 204 No Content

---

### 2.4.4. Lấy thông tin chi tiết giao dịch
- Endpoint: GET /payments/{id}/
- Mô tả: học viên xem giao dịch của mình; admin xem được tất cả
- Authorization: Bearer \<access_token\>
- Path Params

| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả                   |
|---------|--------------|----------|-------------------------|
| id      | int          | có       | ID định danh giao dịch. |

- Success Response
  * HTTP Status Code: 200 OK
```json
{
    "id": 1,
    "enrollment": 1,
    "amount": "3500000.00",
    "payment_method": "VNPAY",
    "payment_status": "SUCCESS",
    "paid_at": "2026-04-19T22:09:21+07:00",
    "classroom": "Lớp Giao Tiếp Căn Bản - K23 (Ca Tối)",
    "total_sessions": 36,
    "transaction_id": "14058204",
    "created_at": "2026-04-19T22:00:00+07:00",
    "student_name": "Trần Minh",
    "student_email": "minhtran@gmail.com"
}
```

---

### 2.4.5. Thanh toán học phí
- Endpoint: POST /payments/
- Mô tả: tạo giao dịch thanh toán qua VNPay. Khóa học dưới 5 triệu phải thanh toán toàn bộ; từ 5 triệu trở lên được đóng tối thiểu 50%.
- Authorization: Bearer \<access_token\>
- Request Body
```json
{
    "enrollment": 1,
    "amount": 4000000,
    "payment_method": "VNPAY"
}
```
- Success Response
  * HTTP Status Code: 200 OK
```json
{
    "payment_url": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=400000000&vnp_Command=pay&..."
}
```

---

### 2.4.6. Nhập điểm theo lớp
- Endpoint: POST /classes/{class_id}/bulk-sync-scores/
- Mô tả: chỉ giáo viên chính (`is_main=true`) của lớp mới được nhập điểm. Báo lỗi nếu quá hạn nộp điểm hoặc bảng điểm đã nộp (`grade_status=SUBMITTED`). Điểm phải từ 0 đến 10.
- Authorization: Bearer \<access_token\> (Teacher only)
- Path Params

| Tham số  | Kiểu dữ liệu | Bắt buộc | Mô tả                        |
|----------|--------------|----------|------------------------------|
| class_id | int          | có       | ID định danh lớp học cụ thể. |

- Request Body
```json
{
    "scores": [
        {"enrollment_id": 1, "score_type_id": 1, "score_value": 8.0},
        {"enrollment_id": 1, "score_type_id": 2, "score_value": 7.0},
        {"enrollment_id": 2, "score_type_id": 1, "score_value": 6.5},
        {"enrollment_id": 2, "score_type_id": 2, "score_value": 9.0}
    ]
}
```
- Success Response
  * HTTP Status Code: 200 OK
```json
{
    "message": "OK",
    "data": {
        "updated": 2,
        "created": 2
    }
}
```

---

### 2.4.7. Nộp bảng điểm
- Endpoint: POST /classes/{class_id}/submit-scores/
- Mô tả: giáo viên chính xác nhận và khóa bảng điểm. Yêu cầu tất cả học viên đã có đủ điểm. Sau khi nộp, `grade_status` chuyển thành `SUBMITTED` và không thể chỉnh sửa trừ khi admin mở lại.
- Authorization: Bearer \<access_token\> (Teacher only)
- Path Params

| Tham số  | Kiểu dữ liệu | Bắt buộc | Mô tả                        |
|----------|--------------|----------|------------------------------|
| class_id | int          | có       | ID định danh lớp học cụ thể. |

- Request Body (optional)
```json
{
    "remarks": [
        {"enrollment_id": 1, "comment": "Tiến bộ vượt bậc"},
        {"enrollment_id": 2, "comment": "Cần cố gắng hơn"}
    ]
}
```
- Success Response
  * HTTP Status Code: 200 OK
```json
{
    "message": "Bảng điểm đã được nộp và khóa thành công."
}
```

---

### 2.4.8. Lấy danh sách điểm của lớp
- Endpoint: GET /classes/{class_id}/scores/
- Mô tả: admin và giáo viên xem điểm của các học viên trong lớp. Học viên chưa có điểm sẽ trả về `score_type_id: null`, `score_value: null`.
- Authorization: Bearer \<access_token\> (Admin hoặc Teacher)
- Path Params

| Tham số  | Kiểu dữ liệu | Bắt buộc | Mô tả                        |
|----------|--------------|----------|------------------------------|
| class_id | int          | có       | ID định danh lớp học cụ thể. |

- Success Response
  * HTTP Status Code: 200 OK
```json
[
    {
        "enrollment_id": 1,
        "score_type_id": 1,
        "score_value": 8.0,
        "student": {
            "id": 4,
            "first_name": "Minh",
            "last_name": "Trần"
        }
    },
    {
        "enrollment_id": 1,
        "score_type_id": 2,
        "score_value": 7.0,
        "student": {
            "id": 4,
            "first_name": "Minh",
            "last_name": "Trần"
        }
    },
    {
        "enrollment_id": 2,
        "score_type_id": null,
        "score_value": null,
        "student": {
            "id": 5,
            "first_name": "Hoa",
            "last_name": "Lê"
        }
    }
]
```

---

### 2.4.9. Điểm danh cho buổi học cụ thể
- Endpoint: POST /classes/{class_id}/bulk-sync-attendances/
- Mô tả: chỉ giáo viên chính mới được điểm danh. Chỉ điểm danh được đúng ngày diễn ra buổi học (`session.date == today`).
- Authorization: Bearer \<access_token\> (Teacher only)
- Path Params

| Tham số  | Kiểu dữ liệu | Bắt buộc | Mô tả                        |
|----------|--------------|----------|------------------------------|
| class_id | int          | có       | ID định danh lớp học cụ thể. |

- Request Body
```json
{
    "session_id": 1,
    "attendances": [
        {"enrollment_id": 1, "attendance_status": "PRESENT", "note": ""},
        {"enrollment_id": 2, "attendance_status": "ABSENT", "note": "Nghỉ ốm"}
    ]
}
```
- Success Response
  * HTTP Status Code: 200 OK
```json
{
    "message": "Lưu danh sách điểm danh thành công!",
    "data": {
        "created": 1,
        "updated": 1
    }
}
```

---

### 2.4.10. Lấy kết quả điểm danh của buổi học
- Endpoint: GET /attendances/?session_id={session_id}
- Mô tả: giáo viên xem điểm danh của buổi học mình phụ trách. `can_attendance = true` nếu buổi học diễn ra hôm nay.
- Authorization: Bearer \<access_token\> (Teacher only)
- Query Params

| Tham số    | Kiểu dữ liệu | Bắt buộc | Mô tả                  |
|------------|--------------|----------|------------------------|
| session_id | int          | có       | ID định danh buổi học. |

- Success Response
  * HTTP Status Code: 200 OK
```json
{
    "can_attendance": true,
    "session_date": "2024-05-06",
    "attendances": [
        {
            "enrollment_id": 1,
            "student_name": "Minh Trần",
            "student_code": "student_minh",
            "attendance_status": "PRESENT",
            "note": ""
        },
        {
            "enrollment_id": 2,
            "student_name": "Hoa Lê",
            "student_code": "student_hoa",
            "attendance_status": "ABSENT",
            "note": "Nghỉ ốm"
        }
    ]
}
```

---

### 2.4.11. Lấy danh sách học viên của lớp
- Endpoint: GET /classes/{class_id}/users/
- Mô tả: xem danh sách học viên đang đăng ký trong lớp
- Authorization: Bearer \<access_token\>
- Path Params

| Tham số  | Kiểu dữ liệu | Bắt buộc | Mô tả                        |
|----------|--------------|----------|------------------------------|
| class_id | int          | có       | ID định danh lớp học cụ thể. |

- Success Response
  * HTTP Status Code: 200 OK
```json
[
    {
        "id": 1,
        "student": {
            "id": 4,
            "first_name": "Minh",
            "last_name": "Trần",
            "email": "minhtran@gmail.com",
            "username": "student_minh",
            "phone_num": "0912345678",
            "role": "Student"
        },
        "classroom": {
            "id": 1,
            "name": "Lớp Giao Tiếp Căn Bản - K23 (Ca Tối)",
            "course_id": 1,
            "course_name": "Khóa Học Giao Tiếp Toàn Diện 360",
            "course_level": "Cơ bản (Beginner)",
            "course_price": "3500000.00",
            "start_date": "2024-05-01",
            "end_date": "2024-07-31",
            "active": false,
            "capacity": 30,
            "remaining_slots": 5,
            "main_teacher": {
                "id": 2,
                "first_name": "John",
                "last_name": "Doe",
                "email": "johndoe@ttngoaingu.edu.vn",
                "username": "teacher_john",
                "role": "Teacher"
            },
            "schedules": []
        },
        "enrollment_status": "SUCCESS",
        "payment_deadline": "2024-04-21T06:59:59+07:00"
    },
    {
        "id": 2,
        "student": {
            "id": 5,
            "first_name": "Hoa",
            "last_name": "Lê",
            "email": "hoale@gmail.com",
            "username": "student_hoa",
            "phone_num": "0987654321",
            "role": "Student"
        },
        "classroom": {
            "id": 1,
            "name": "Lớp Giao Tiếp Căn Bản - K23 (Ca Tối)",
            "course_id": 1,
            "course_name": "Khóa Học Giao Tiếp Toàn Diện 360",
            "course_level": "Cơ bản (Beginner)",
            "course_price": "3500000.00",
            "start_date": "2024-05-01",
            "end_date": "2024-07-31",
            "active": false,
            "capacity": 30,
            "remaining_slots": 5,
            "main_teacher": {
                "id": 2,
                "first_name": "John",
                "last_name": "Doe",
                "email": "johndoe@ttngoaingu.edu.vn",
                "username": "teacher_john",
                "role": "Teacher"
            },
            "schedules": []
        },
        "enrollment_status": "SUCCESS",
        "payment_deadline": "2024-06-11T06:59:59+07:00"
    }
]
```

---

### 2.4.12. Lấy thông tin chi tiết lớp học
- Endpoint: GET /classes/{id}/
- Mô tả: xem thông tin chi tiết một lớp học. Admin và giáo viên thấy thêm `created_at`, `grade_deadline`, `grade_status`, `total_sessions`.
- Authorization: Bearer \<access_token\>
- Path Params

| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả                 |
|---------|--------------|----------|-----------------------|
| id      | int          | có       | ID định danh lớp học. |

- Success Response
  * HTTP Status Code: 200 OK
```json
{
    "id": 1,
    "name": "Lớp Giao Tiếp Căn Bản - K23 (Ca Tối)",
    "course_id": 1,
    "course_name": "Khóa Học Giao Tiếp Toàn Diện 360",
    "course_level": "Cơ bản (Beginner)",
    "course_price": "3500000.00",
    "start_date": "2024-05-01",
    "end_date": "2024-07-31",
    "active": false,
    "capacity": 30,
    "remaining_slots": 5,
    "main_teacher": {
        "id": 2,
        "first_name": "John",
        "last_name": "Doe",
        "email": "johndoe@ttngoaingu.edu.vn",
        "username": "teacher_john",
        "role": "Teacher"
    },
    "schedules": [
        {
            "id": 1,
            "day_of_week": 1,
            "start_time": "18:00:00",
            "end_time": "20:00:00",
            "room": 1
        }
    ],
    "created_at": "2026-04-19T22:09:21+07:00",
    "grade_deadline": "2024-08-15T23:59:59+07:00",
    "grade_status": "DRAFT",
    "total_sessions": 36
}
```

---

## 2.5. Quản lý Hệ thống (Admin Management)

### 2.5.1. Tạo tài khoản người dùng (giáo viên)
- Endpoint: POST /users/
- Mô tả: admin tạo tài khoản giáo viên. `first_name`, `last_name` có thể bỏ trống. `phone_num` không bắt buộc.
- Authorization: Bearer \<access_token\> (Admin only)
- Request Body
```json
{
    "username": "teacher_new",
    "password": "Pass@123",
    "email": "teacher_new@ttngoaingu.edu.vn",
    "first_name": "John",
    "last_name": "Smith"
}
```
- Success Response
  * HTTP Status Code: 201 Created
```json
{
    "id": 20,
    "first_name": "John",
    "last_name": "Smith",
    "email": "teacher_new@ttngoaingu.edu.vn",
    "username": "teacher_new",
    "phone_num": null,
    "role": "Teacher",
    "date_joined": "2026-05-01T10:00:00+07:00",
    "last_login": null,
    "auth_provider": "LOCAL",
    "avatar": null,
    "is_active": true
}
```

---

### 2.5.2. Lấy danh sách toàn bộ người dùng hệ thống
- Endpoint: GET /users/
- Mô tả: chỉ admin có quyền truy cập. Có phân trang, không trả về password.
- Authorization: Bearer \<access_token\> (Admin only)
- Success Response
  * HTTP Status Code: 200 OK
```json
{
    "count": 50,
    "next": "http://api/.../users/?page=2",
    "previous": null,
    "results": [
        {
            "id": 1,
            "first_name": "Minh",
            "last_name": "Trần",
            "email": "minhtran@gmail.com",
            "username": "student_minh",
            "phone_num": "0912345678",
            "role": "Student",
            "date_joined": "2026-04-19T22:09:21+07:00",
            "last_login": "2026-04-29T08:00:00+07:00",
            "auth_provider": "LOCAL",
            "avatar": "https://res.cloudinary.com/.../avatar.png",
            "is_active": true
        }
    ]
}
```

---

### 2.5.3. Cập nhật thông tin người dùng (admin)
- Endpoint: PATCH /users/{id}/
- Mô tả: admin cập nhật thông tin bất kỳ người dùng nào. Không cho phép cập nhật `password`, `avatar`, `date_joined`, `last_login`, `auth_provider`.
- Authorization: Bearer \<access_token\> (Admin only)
- Path Params

| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả                    |
|---------|--------------|----------|--------------------------|
| id      | int          | có       | ID định danh người dùng. |

- Request Body (các trường đều optional)
```json
{
    "first_name": "Minh",
    "last_name": "Trần",
    "email": "new@gmail.com",
    "phone_num": "0987654321"
}
```
- Success Response
  * HTTP Status Code: 200 OK
```json
{
    "id": 5,
    "first_name": "Minh",
    "last_name": "Trần",
    "email": "new@gmail.com",
    "username": "student_minh",
    "phone_num": "0987654321",
    "role": "Student",
    "date_joined": "2026-04-19T22:09:21+07:00",
    "last_login": "2026-04-29T08:00:00+07:00",
    "auth_provider": "LOCAL",
    "avatar": "https://res.cloudinary.com/.../avatar.png",
    "is_active": true
}
```

---

### 2.5.4. Khóa và mở khóa tài khoản người dùng
- Endpoint: PATCH /users/{user_id}/toggle-lock/
- Mô tả: toggle `is_active`. Khi khóa, toàn bộ access token của user bị thu hồi.
- Authorization: Bearer \<access_token\> (Admin only)
- Path Params

| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả                    |
|---------|--------------|----------|--------------------------|
| user_id | int          | có       | ID định danh người dùng. |

- Success Response
  * HTTP Status Code: 200 OK
```json
{
    "id": 5,
    "first_name": "Hoa",
    "last_name": "Lê",
    "email": "hoale@gmail.com",
    "username": "student_hoa",
    "phone_num": "0912345678",
    "role": "Student"
}
```

---

### 2.5.5. Gán role cho người dùng
- Endpoint: PATCH /users/{id}/role/
- Mô tả: admin gán role cho người dùng. Giá trị hợp lệ: `Student`, `Teacher`, `Admin`.
- Authorization: Bearer \<access_token\> (Admin only)
- Path Params

| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả                    |
|---------|--------------|----------|--------------------------|
| id      | int          | có       | ID định danh người dùng. |

- Request Body
```json
{
    "role": "Teacher"
}
```
- Success Response
  * HTTP Status Code: 200 OK
```json
{
    "id": 5,
    "first_name": "Hoa",
    "last_name": "Lê",
    "email": "hoale@gmail.com",
    "username": "student_hoa",
    "phone_num": "0912345678",
    "role": "Teacher"
}
```

---

### 2.5.6. Tạo khóa học mới
- Endpoint: POST /courses/
- Mô tả: admin tạo khóa học mới. `total_sessions` phải từ 10 đến 30. `price` tối thiểu 2.000.000 VND. Tên khóa học không được trùng.
- Authorization: Bearer \<access_token\> (Admin only)
- Content-Type: multipart/form-data
- Request Body (form-data)
```
name: Khóa Học Mới
level: 1
description: Mô tả khóa học
image: <file image>
total_sessions: 24
price: 3500000
```
- Success Response
  * HTTP Status Code: 201 Created
```json
{
    "id": 10,
    "name": "Khóa Học Mới",
    "image": "https://res.cloudinary.com/.../new_course.png",
    "total_sessions": 24,
    "level": 1,
    "level_name": "Cơ bản (Beginner)",
    "tags": [],
    "price": "3500000.00",
    "description": "Mô tả khóa học",
    "active": true,
    "created_at": "2026-05-01T10:00:00+07:00",
    "actual_total_sessions": 0
}
```

---

### 2.5.7. Cập nhật thông tin khóa học
- Endpoint: PATCH /courses/{id}/
- Mô tả: admin cập nhật thông tin khóa học. Cho phép update: `name`, `total_sessions`, `level`, `price`, `description`, `image`, `active`.
- Authorization: Bearer \<access_token\> (Admin only)
- Content-Type: multipart/form-data
- Path Params

| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả                  |
|---------|--------------|----------|------------------------|
| id      | int          | có       | ID định danh khóa học. |

- Request Body (các trường đều optional)
```
name: Khóa Học Cập Nhật
price: 4000000
description: Mô tả mới
```
- Success Response
  * HTTP Status Code: 200 OK
```json
{
    "id": 10,
    "name": "Khóa Học Cập Nhật",
    "image": "https://res.cloudinary.com/.../new_course.png",
    "total_sessions": 24,
    "level": 1,
    "level_name": "Cơ bản (Beginner)",
    "tags": [],
    "price": "4000000.00",
    "description": "Mô tả mới",
    "active": true,
    "created_at": "2026-05-01T10:00:00+07:00",
    "actual_total_sessions": 0
}
```

---

### 2.5.8. Xóa khóa học
- Endpoint: DELETE /courses/{id}/
- Mô tả: admin xóa khóa học nếu không có ràng buộc dữ liệu
- Authorization: Bearer \<access_token\> (Admin only)
- Path Params

| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả                  |
|---------|--------------|----------|------------------------|
| id      | int          | có       | ID định danh khóa học. |

- Success Response
  * HTTP Status Code: 204 No Content

---

### 2.5.9. Tạo lớp học mới
- Endpoint: POST /classes/
- Mô tả: admin tạo lớp học mới. `capacity` phải từ 10 đến 50. Khi có `schedules_input`, hệ thống tự sinh buổi học. Số buổi sinh ra không được lệch quá 2 so với `total_sessions` của khóa học.
- Authorization: Bearer \<access_token\> (Admin only)
- Request Body
```json
{
    "name": "IELTS Foundation 4.5+ - K25A",
    "course": 2,
    "start_date": "2025-01-15",
    "end_date": "2025-04-15",
    "capacity": 25,
    "main_teacher_id": 3,
    "schedules_input": [
        {
            "day_of_week": 1,
            "start_time": "18:00:00",
            "end_time": "20:00:00",
            "room": 1
        },
        {
            "day_of_week": 3,
            "start_time": "18:00:00",
            "end_time": "20:00:00",
            "room": 1
        }
    ]
}
```
- Success Response
  * HTTP Status Code: 201 Created
```json
{
    "id": 10,
    "name": "IELTS Foundation 4.5+ - K25A",
    "course_id": 2,
    "course_name": "IELTS Master 6.5+ (Đảm Bảo Đầu Ra)",
    "course_level": "Nâng cao (Advanced/IELTS)",
    "course_price": "8000000.00",
    "start_date": "2025-01-15",
    "end_date": "2025-04-15",
    "active": true,
    "capacity": 25,
    "remaining_slots": 25,
    "main_teacher": {
        "id": 3,
        "first_name": "Jane",
        "last_name": "Smith",
        "email": "janesmith@ttngoaingu.edu.vn",
        "username": "teacher_jane",
        "role": "Teacher"
    },
    "schedules": [
        {
            "id": 5,
            "day_of_week": 1,
            "start_time": "18:00:00",
            "end_time": "20:00:00",
            "room": 1
        },
        {
            "id": 6,
            "day_of_week": 3,
            "start_time": "18:00:00",
            "end_time": "20:00:00",
            "room": 1
        }
    ]
}
```

---

### 2.5.10. Lấy danh sách toàn bộ lớp học trong hệ thống
- Endpoint: GET /classes/
- Mô tả: admin thấy tất cả lớp; giáo viên thấy lớp mình dạy (thêm `?main_only=true` để chỉ lấy lớp chính). Hỗ trợ search theo tên lớp. Có phân trang.
- Authorization: Bearer \<access_token\> (Admin hoặc Teacher)
- Query Params

| Tham số   | Kiểu dữ liệu | Bắt buộc | Mô tả                                              |
|-----------|--------------|----------|----------------------------------------------------|
| search    | string       | không    | Tìm kiếm theo tên lớp                              |
| main_only | boolean      | không    | `true` = chỉ lấy lớp giáo viên là giáo viên chính |

- Success Response
  * HTTP Status Code: 200 OK
```json
{
    "count": 10,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "name": "Lớp Giao Tiếp Căn Bản - K23 (Ca Tối)",
            "course_id": 1,
            "course_name": "Khóa Học Giao Tiếp Toàn Diện 360",
            "course_level": "Cơ bản (Beginner)",
            "course_price": "3500000.00",
            "start_date": "2024-05-01",
            "end_date": "2024-07-31",
            "active": false,
            "capacity": 30,
            "remaining_slots": 5,
            "main_teacher": {
                "id": 2,
                "first_name": "John",
                "last_name": "Doe",
                "email": "johndoe@ttngoaingu.edu.vn",
                "username": "teacher_john",
                "role": "Teacher"
            },
            "schedules": [
                {
                    "id": 1,
                    "day_of_week": 1,
                    "start_time": "18:00:00",
                    "end_time": "20:00:00",
                    "room": 1
                }
            ],
            "created_at": "2026-04-19T22:09:21+07:00",
            "grade_deadline": "2024-08-15T23:59:59+07:00",
            "grade_status": "DRAFT",
            "total_sessions": 36
        }
    ]
}
```

---

### 2.5.11. Cập nhật thông tin lớp học
- Endpoint: PATCH /classes/{id}/
- Mô tả: admin cập nhật thông tin lớp học. Nếu truyền `schedules_input` khi đã có dữ liệu điểm danh thì sẽ báo lỗi.
- Authorization: Bearer \<access_token\> (Admin only)
- Path Params

| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả                 |
|---------|--------------|----------|-----------------------|
| id      | int          | có       | ID định danh lớp học. |

- Request Body (các trường đều optional)
```json
{
    "name": "IELTS Foundation 4.5+ - K25A (Updated)",
    "start_date": "2025-01-20",
    "end_date": "2025-04-20",
    "main_teacher_id": 4
}
```
- Success Response
  * HTTP Status Code: 200 OK
```json
{
    "id": 10,
    "name": "IELTS Foundation 4.5+ - K25A (Updated)",
    "course_id": 2,
    "course_name": "IELTS Master 6.5+ (Đảm Bảo Đầu Ra)",
    "course_level": "Nâng cao (Advanced/IELTS)",
    "course_price": "8000000.00",
    "start_date": "2025-01-20",
    "end_date": "2025-04-20",
    "active": true,
    "capacity": 25,
    "remaining_slots": 25,
    "main_teacher": {
        "id": 4,
        "first_name": "Jane",
        "last_name": "Smith",
        "email": "janesmith@ttngoaingu.edu.vn",
        "username": "teacher_jane",
        "role": "Teacher"
    },
    "schedules": [
        {
            "id": 5,
            "day_of_week": 1,
            "start_time": "18:00:00",
            "end_time": "20:00:00",
            "room": 1
        }
    ],
    "created_at": "2026-04-19T22:09:21+07:00",
    "grade_deadline": null,
    "grade_status": "DRAFT",
    "total_sessions": 48
}
```

---

### 2.5.12. Xóa lớp học
- Endpoint: DELETE /classes/{id}/
- Mô tả: admin xóa lớp học nếu không có ràng buộc dữ liệu
- Authorization: Bearer \<access_token\> (Admin only)
- Path Params

| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả                 |
|---------|--------------|----------|-----------------------|
| id      | int          | có       | ID định danh lớp học. |

- Success Response
  * HTTP Status Code: 204 No Content

---

### 2.5.13. Tạo buổi học mới cho lớp học
- Endpoint: POST /sessions/
- Mô tả: admin tạo thêm buổi học thủ công. Số buổi không được vượt quá `total_sessions` của khóa học. Kiểm tra trùng phòng và trùng lịch giáo viên.
- Authorization: Bearer \<access_token\>
- Request Body
```json
{
    "classroom_id": 1,
    "date": "2024-05-10",
    "start_time": "18:00:00",
    "end_time": "20:00:00",
    "user": 2,
    "room": 1
}
```
- Success Response
  * HTTP Status Code: 201 Created
```json
{
    "id": 50,
    "date": "2024-05-10",
    "start_time": "18:00:00",
    "end_time": "20:00:00",
    "user": 2,
    "teacher_fullname": "Doe John",
    "room": {
        "id": 1,
        "name": "Phòng Lab 01 (Cơ Sở 1)",
        "capacity": 30
    },
    "classroom_name": "Lớp Giao Tiếp Căn Bản - K23 (Ca Tối)",
    "day_of_week": 4,
    "classroom_start_date": "2024-05-01",
    "classroom_end_date": "2024-07-31"
}
```

---

### 2.5.14. Cập nhật buổi học
- Endpoint: PATCH /sessions/{id}/
- Mô tả: admin cập nhật thông tin buổi học. Kiểm tra trùng phòng và trùng lịch giáo viên.
- Authorization: Bearer \<access_token\>
- Path Params

| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả                  |
|---------|--------------|----------|------------------------|
| id      | int          | có       | ID định danh buổi học. |

- Request Body (các trường đều optional)
```json
{
    "date": "2024-05-12",
    "start_time": "18:00:00",
    "end_time": "20:00:00",
    "user": 3,
    "room": 2
}
```
- Success Response
  * HTTP Status Code: 200 OK
```json
{
    "id": 50,
    "date": "2024-05-12",
    "start_time": "18:00:00",
    "end_time": "20:00:00",
    "user": 3,
    "teacher_fullname": "Smith Jane",
    "room": {
        "id": 2,
        "name": "Phòng D.203",
        "capacity": 40
    },
    "classroom_name": "Lớp Giao Tiếp Căn Bản - K23 (Ca Tối)",
    "day_of_week": 0,
    "classroom_start_date": "2024-05-01",
    "classroom_end_date": "2024-07-31"
}
```

---

### 2.5.15. Xóa buổi học
- Endpoint: DELETE /sessions/{id}/
- Mô tả: admin xóa buổi học nếu không có ràng buộc dữ liệu (chưa có điểm danh)
- Authorization: Bearer \<access_token\>
- Path Params

| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả                  |
|---------|--------------|----------|------------------------|
| id      | int          | có       | ID định danh buổi học. |

- Success Response
  * HTTP Status Code: 204 No Content

---

### 2.5.16. Sinh lại buổi học cho lớp
- Endpoint: POST /classes/{class_id}/generate-sessions/
- Mô tả: xóa các buổi học chưa có điểm danh rồi sinh lại từ lịch học (`schedules`) hiện tại. Dùng khi admin chỉnh sửa lịch sau khi lớp đã tạo.
- Authorization: Bearer \<access_token\> (Admin only)
- Path Params

| Tham số  | Kiểu dữ liệu | Bắt buộc | Mô tả                        |
|----------|--------------|----------|------------------------------|
| class_id | int          | có       | ID định danh lớp học cụ thể. |

- Success Response
  * HTTP Status Code: 200 OK
```json
{
    "message": "Đã xóa 10 sessions cũ, tạo mới 24 sessions.",
    "deleted": 10,
    "created": 24
}
```

---

### 2.5.17. Lấy danh sách tất cả giao dịch
- Endpoint: GET /payments/
- Mô tả: admin xem tất cả giao dịch; người dùng thường chỉ thấy giao dịch của mình. Hỗ trợ lọc theo `payment_status` và search theo `transaction_id`. Có phân trang.
- Authorization: Bearer \<access_token\>
- Query Params

| Tham số        | Kiểu dữ liệu | Bắt buộc | Mô tả                                         |
|----------------|--------------|----------|-----------------------------------------------|
| payment_status | string       | không    | Lọc theo trạng thái: `SUCCESS`, `FAILED`, ... |
| search         | string       | không    | Tìm theo `transaction_id`                     |

- Success Response
  * HTTP Status Code: 200 OK
```json
{
    "count": 100,
    "next": "http://api/.../payments/?page=2",
    "previous": null,
    "results": [
        {
            "id": 1,
            "enrollment": 1,
            "amount": "3500000.00",
            "payment_method": "VNPAY",
            "payment_status": "SUCCESS",
            "paid_at": "2026-04-19T22:09:21+07:00",
            "classroom": "Lớp Giao Tiếp Căn Bản - K23 (Ca Tối)",
            "total_sessions": 36,
            "transaction_id": "14058204",
            "created_at": "2026-04-19T22:00:00+07:00",
            "student_name": "Trần Minh",
            "student_email": "minhtran@gmail.com"
        }
    ]
}
```

---

### 2.5.18. Lấy danh sách giáo viên
- Endpoint: GET /teachers/
- Mô tả: admin lấy danh sách tất cả user thuộc nhóm `Teacher`
- Authorization: Bearer \<access_token\> (Admin only)
- Success Response
  * HTTP Status Code: 200 OK
```json
[
    {
        "id": 2,
        "first_name": "John",
        "last_name": "Doe",
        "email": "johndoe@ttngoaingu.edu.vn",
        "username": "teacher_john",
        "phone_num": "0901234567",
        "role": "Teacher"
    },
    {
        "id": 3,
        "first_name": "Jane",
        "last_name": "Smith",
        "email": "janesmith@ttngoaingu.edu.vn",
        "username": "teacher_jane",
        "phone_num": "0901234568",
        "role": "Teacher"
    }
]
```

---

### 2.5.19. Lấy danh sách phòng học
- Endpoint: GET /rooms/
- Mô tả: admin lấy danh sách phòng học đang hoạt động (`active=true`)
- Authorization: Bearer \<access_token\> (Admin only)
- Success Response
  * HTTP Status Code: 200 OK
```json
[
    {
        "id": 1,
        "name": "Phòng Lab 01 (Cơ Sở 1)",
        "capacity": 30
    },
    {
        "id": 2,
        "name": "Phòng D.203",
        "capacity": 40
    }
]
```

---

### 2.5.20. Lấy dữ liệu thống kê (Dashboard)
- Endpoint: GET /analytics/dashboard/
- Mô tả: admin lấy dữ liệu thống kê tổng quan hệ thống
- Authorization: Bearer \<access_token\> (Admin only)
- Success Response
  * HTTP Status Code: 200 OK

## 2.5. Chú thích (Notes)
- Hệ thống sử dụng cơ chế Bulk Sync để đồng bộ điểm và điểm danh. Nếu enrollment_id đã tồn tại cho kỳ thi hoặc ngày học tương ứng, hệ thống sẽ cập nhật bản ghi; nếu chưa tồn tại, hệ thống sẽ tạo mới. Toàn bộ quá trình Bulk Sync được thực hiện trong một transaction, đảm bảo tính toàn vẹn dữ liệu: nếu một bản ghi gặp lỗi, toàn bộ tác vụ sẽ bị rollback. Chỉ giáo viên được phân công dạy lớp mới có quyền gọi API Bulk Sync cho lớp đó.

- Mỗi lần gửi dữ liệu qua API giới hạn tối đa 100 bản ghi để đảm bảo hiệu năng. Điểm số chỉ chấp nhận giá trị thực trong khoảng từ 0 đến 10, với tối đa một chữ số thập phân. Đồng thời, chỉ những Enrollment có trạng thái PAID hoặc PARTIAL_PAID mới được coi là hợp lệ để có tên trong danh sách điểm danh.

- Điểm trung bình (Average Score) được hệ thống tự động tính toán dựa trên trọng số (weight) của từng loại điểm và làm tròn đến 1 chữ số thập phân.

- Học viên chỉ có thể xem thời khóa biểu (Timetable) và tham gia điểm danh nếu hóa đơn học phí tương ứng đã được thanh toán ít nhất 50% (PARTIAL_PAID).

- Hệ thống chỉ cho phép Xóa vật lý (Hard Delete) nếu bản ghi đăng ký đang ở trạng thái PENDING_PAYMENT (Chưa thanh toán)
---

# 3. APPENDIX

## 3.1 Example Request
```
GET /classes/{class_id}/enrollments?page=1&limit=10
Host: api.example.com
Authorization: Bearer <access_token>
Content-Type: application/json
```

## 3.2 Additional Notes
- Không trả về dữ liệu nhạy cảm như: password người dùng, token,...
- Validate input trước khi xử lý: kiểu dữ liệu, range, format, required,..
- Trả lỗi chuẩn HTTP: 400, 401, 403, 404, 500,...
- Phân trang khi trả về danh sách lớn
- Auth bắt buộc cho mọi request quan trọng
- Không gửi dữ liệu thừa 
- Tránh lộ thông tin admin/ private trong response
- Log chỉ thông tin cần debug, không log password/token.

