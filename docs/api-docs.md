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
- Endpoint: POST auth/login/
- Mô tả: dùng khi user đăng nhập vào hệ thống
- Request response
```
{
  "username": "nva",
  "password": "Abc123@"
}
```

- Success response
  * HTTP Status Code: 200 OK
```
{
    "access_token": "5pKTtaSgbbhPIdPB7X8EAex8CyfAH1",
    "expires_in": 36000,
    "token_type": "Bearer",
    "scope": "read write",
    "refresh_token": "Px3H8h93vJkpicYi38cYzfDQIbQKE1"
}
```

### 2.1.2. Đăng ký tài khoản LOCAL
- Endpoint: POST auth/register/
- Mô tả: dùng khi user đăng ký tài khoản để sử dụng hệ thống.
- Request response
```
{
    "first_name": "Hv1",
    "last_name": "Test",
    "username": "Hv1",
    "password": "Testhv@123",
    "email": "test1@gmail.com",
    "phone_num": "0123445789"

}
```

- Success response
  * HTTP Status Code: 201 OK
```
{
    "access_token": "vX9OyRm7Xr7M9RBZQkn72xkZOSVkVj",
    "expires_in": 36000,
    "token_type": "Bearer",
    "scope": "read write",
    "refresh_token": "4JY1VPkVVneJTDxr9eCpLNb9pSBdKf"
}
```

### 2.1.3. Xác thực tài khoản người dùng bằng Google
- Endpoint: POST auth/social-login/
- Mô tả: dùng khi user đăng nhập vào hệ thống bằng tài khoản Google
- Request response
```
{
  "provider": "GOOGLE",
  "access_token": "..."
}
```

- Success response
  * HTTP Status Code: 200 OK
```
{
  "access_token": "...",
  "refresh_token": "...",
  "user": {
    "id": ...,
    "username": "...",
    "email": "...",
    "provider_auth": "google"
  }
}
```

### 2.1.4. Xác thực người dùng bằng tài khoản Facebook
- Endpoint: POST POST auth/social-login/
- Mô tả: dùng khi user đăng nhập vào hệ thống bằng tài khoản Facebook
- Request response
```
{
  "provider": "FACEBOOK",
  "access_token": "..."
}
```

- Success response
  * HTTP Status Code: 200 OK
```
{
    "access_token": "...",
    "refresh_token": "...",
    "user": {
      "id": ...,
      "username": "...",
      "email": "...",
      "provider_auth": "facebook"
    }
  }
```

### 2.1.5. Refresh Token
- Endpoint: POST auth/refresh/
- Mô tả: dùng khi user cần gia hạn access_token
- Request response
```
{
  "refresh_token": "4JY1VPkVVneJTDxr9eCpLNb9pSBdKf"
}
```

- Success response
  * HTTP Status Code: 200 OK
```
{
    "access_token": "vX9OyRm7Xr7M9RBZQkn72xkZOSVkVj",
    "expires_in": 36000,
    "token_type": "Bearer",
    "scope": "read write",
    "refresh_token": "4JY1VPkVVneJTDxr9eCpLNb9pSBdKf"
}
```

### 2.1.6. Đăng xuất tài khoản
- Endpoint: POST auth/logout/
- Mô tả: dùng khi user đăng xuất khỏi hệ thống
- Authorization: Bearer <access_token>
- Request response
```
{
  "token": "4JY1VPkVVneJTDxr9eCpLNb9pSBdKf"
}
```

- Success response
  * HTTP Status Code: 200 OK

### 2.1.7. Đổi mật khẩu 
- Endpoint: POST users/me/reset-password/
- Mô tả: dùng khi user đổi mật khẩu mới
- Authorization: Bearer <access_token>
- Request response
```
{
  "old_password": "Old@123",
  "password": "New@123"
}
```

- Success response
  * HTTP Status Code: 200 OK
```
{
    "id": 4,
    "first_name": "Minh",
    "last_name": "Trần",
    "email": "minhtran@gmail.com",
    "username": "student_minh"
}
```

## 2.2. Quản lý Tài nguyên người dùng (User Resource Management)
### 2.2.1. Lấy thông tin chi tiết người dùng
- Endpoint: GET users/me/
- Mô tả: dùng để phục vụ hiển thị hồ sơ người dùng
- Authorization: Bearer <access_token>
- Success Response
  * HTTP Status Code: 200 OK
```
{
    "id": 1,
    "first_name": "Hv1",
    "last_name": "Test",
    "email": "test1@gmail.com",
    "username": "Hv1",
    "date_joined": "2026-04-29T01:32:44.331870+07:00",
    "last_login": null,
    "profile": {
        "phone_num": "0123445789",
        "avatar": "https://res.cloudinary.com/desvczltb/image/upload/v1/language_center_testing/defaults/student_4297861_lyjelp"
    }
}
```               
           
### 2.2.2. Cập nhật thông tin cơ bản của người dùng
- Endpoint: PATCH /users/me
- Mô tả: cho phép cập nhật thông tin cá nhân của người dùng như email, số điện thoại,..
- Authorization: Bearer <access_token>
- Request Body
```
{
  "email": "ab@gmail.com",
  "phone_num": "0123456489",
  "first_name": "Minh",
  "last_name": "Trong"
}
```

- Success Response
  * HTTP Status Code: 200 OK
```
{
    "id": 29,
    "first_name": "Minh",
    "last_name": "Trana",
    "email": "ab@gmail.com",
    "username": "Hv18",
    "phone_num": "0123456989"
}
```


### 2.2.3. Cập nhật ảnh đại diện người dùng
- Endpoint: PATCH /users/me/avatar/
- Mô tả: dùng khi người dùng muốn cập nhật ảnh đại diện
- Authorization: Bearer <access_token>
- Content-Type: multipart/form-data
- Request Body (form-data)
```
 {
  "avatar": <file image>
 }
```

- Success Response
  * HTTP Status Code: 200 OK
```
{
  {
    "avatar": "https://res.cloudinary.com/desvczltb/image/upload/v1777403527/language_center_testing/users/hzblstjnslexfnrfkqnk.png"
}
}
```

### 2.2.4. Lấy danh sách các lớp học đã đăng ký của 1 người dùng
- Endpoint: GET users/me/enrollments/
- Mô tả: dùng khi người dùng muốn xem các lớp học đã đăng ký
- Authorization: Bearer <access_token>
- Success Response
  * HTTP Status Code: 200 OK
```
[
  {
    "id": 1,
    "student": {
        "id": 4,
        "first_name": "Minh",
        "last_name": "Trần",
        "email": "minhtran@gmail.com",
        "username": "student_minh",
        "full_name": "Trần Minh"
    },
    "classroom": {
        "id": 1,
        "name": "Lớp Giao Tiếp Căn Bản - K23 (Ca Tối)",
        "course": "Khóa Học Giao Tiếp Toàn Diện 360",
        "start_date": "2024-05-01",
        "end_date": "2024-07-31",
        "active": false,
        "main_teacher": {
            "id": 2,
            "first_name": "John",
            "last_name": "Doe",
            "email": "johndoe@ttngoaingu.edu.vn",
            "username": "teacher_john",
            "full_name": "Doe John"
        }
    },
    "enrollment_status": "SUCCESS",
    "payment_deadline": "2024-04-21T06:59:59+07:00"
  },
]
```

### 2.2.5. Lấy thông tin chi tiết của lớp học đã đăng ký
- Endpoint: GET enrollments/{enroll_id}/
- Mô tả: dùng khi người dùng muốn xem chi tiết lớp học đã đăng ký
- Authorization: Bearer <access_token>
- Path Params

| Tham số   | Kiểu dữ liệu | Bắt buộc | Mô tả                                    |
|-----------|--------------|----------|------------------------------------------|
| enroll_id | int          | có       | ID duy nhất của bản ghi đăng ký lớp học. |

- Success Response
  * HTTP Status Code: 200 OK
```
{
    "id": 1,
    "student": {
        "id": 4,
        "first_name": "Minh",
        "last_name": "Trần",
        "email": "minhtran@gmail.com",
        "username": "student_minh",
        "full_name": "Trần Minh"
    },
    "classroom": {
        "id": 1,
        "name": "Lớp Giao Tiếp Căn Bản - K23 (Ca Tối)",
        "course": "Khóa Học Giao Tiếp Toàn Diện 360",
        "start_date": "2024-05-01",
        "end_date": "2024-07-31",
        "active": false,
        "main_teacher": {
            "id": 2,
            "first_name": "John",
            "last_name": "Doe",
            "email": "johndoe@ttngoaingu.edu.vn",
            "username": "teacher_john",
            "full_name": "Doe John"
        }
    },
    "enrollment_status": "SUCCESS",
    "payment_deadline": "2024-04-21T06:59:59+07:00",
    "created_at": "2026-04-19T22:09:21+07:00",
    "updated_at": "2026-04-19T22:09:21+07:00",
    "active": true
}
```

### 2.2.6. Lấy dữ liệu thời khóa biểu - PHỨC TẠP CHECK LẠI SAU
- Endpoint: GET users/me/timetable/
- Mô tả: dùng khi người dùng muốn xem thời khóa biểu 
- Authorization: Bearer <access_token>
- Query Params

| Tham số    | Kiểu dữ liệu | Bắt buộc | Mô tả                      |
|------------|--------------|----------|----------------------------|
| start_date | date         | có       | Ngày bắt đầu (YYYY-MM-DD). |
| end_date   | date         | có       | Ngày bắt đầu (YYYY-MM-DD). |

- Success Response
  * HTTP Status Code: 200 OK
```
{
  
}
```

### 2.2.7. Lấy lịch sử thanh toán của người dùng
- Endpoint: GET users/me/payments/
- Mô tả: dùng khi người dùng muốn xem lịch sử thanh toán
- Authorization: Bearer <access_token>
- Success Response
  * HTTP Status Code: 200 OK
```
[
  {
      "id": 1,
      "enrollment": 1,
      "amount": "3500000.00",
      "payment_method": "VNPAY",
      "paid_at": "2026-04-19T22:09:21+07:00",
      "classroom": "Lớp Giao Tiếp Căn Bản - K23 (Ca Tối)"
  },
]
```

## 2.3. Quản lý Tài nguyên đào tạo (Training Resources)

### 2.3.1. Lấy danh sách khóa học
- Endpoint: GET courses/
- Mô tả: trả về danh sách các khóa học để hiển thị cho người dùng
- Query Params

| Trường   | Kiểu dữ liệu | Bắt buộc | Mô tả                    |
|----------|--------------|----------|--------------------------|
| page     | int          | không    | số trang                 |
| tag_id   | int          | không    | lọc dữ liệu theo thẻ     |
| level_id | int          | không    | lọc khóa học theo llevel |
- Success Response
  * HTTP Status Code: 200 OK

```
[
    {
        "id": 1
        "name": "Khóa Học Giao Tiếp Toàn Diện 360",
        "image": "https://res.cloudinary.com/desvczltb/image/upload/v1/language_center_testing/courses/giaotiep360",
        "total_sessions": 36,
        "level": 1,
        "level_name": "Cơ bản (Beginner)",
        "tags": [
            {
                "id": 1,
                "name": "Giao Tiếp Thực Chiến"
            }
        ]
    },
    {
        "id": 2,
        "name": "IELTS Master 6.5+ (Đảm Bảo Đầu Ra)",
        "image": "https://res.cloudinary.com/desvczltb/image/upload/v1/language_center_testing/courses/ielts_master",
        "total_sessions": 48,
        "level": 3,
        "level_name": "Nâng cao (Advanced/IELTS)",
        "tags": [
            {
                "id": 2,
                "name": "Luyện Thi IELTS"
            }
        ]
    },
]
```


### 2.3.2. Lấy thông tin chi tiết khóa học
- Endpoint: GET courses/{course_id}/
- Mô tả: trả về thông tin chi tiết của khóa học để hiển thị nội dung và thông tin liên quan
- Path params

| Tham số   | Kiểu dữ liệu | Bắt buộc | Mô tả                         |
|-----------|--------------|----------|-------------------------------|
| course_id | int          | có       | ID định danh khóa học cụ thể. |

- Success Response
  * HTTP Status Code: 200 OK

```
{
  "id": 2,
  "name": "IELTS Master 6.5+ (Đảm Bảo Đầu Ra)",
  "image": "https://res.cloudinary.com/desvczltb/image/upload/v1/language_center_testing/courses/ielts_master",
  "total_sessions": 48,
  "level": 3,
  "level_name": "Nâng cao (Advanced/IELTS)",
  "tags": [
      {
          "id": 2,
          "name": "Luyện Thi IELTS"
      }
  ],
  "price": "8000000.00",
  "description": "Chiến lược làm bài thực chiến 4 kỹ năng nghe, nói, đọc, viết theo chuẩn IELTS.",
  "active": true,
  "created_at": "2026-04-19T22:09:21+07:00"
}
```

### 2.3.3. Lấy danh sách thẻ
- Endpoint: GET tags/
- Mô tả: trả về danh sách các thẻ để phục vụ phân loại hoặc lọc khóa học.
- Success Response
  * HTTP Status Code: 200 OK

```
[
    {
        "id": 1,
        "name": "Giao Tiếp Thực Chiến"
    },
    {
        "id": 2,
        "name": "Luyện Thi IELTS"
    },
    {
        "id": 3,
        "name": "Luyện Thi TOEIC"
    },
    {
        "id": 4,
        "name": "Tiếng Anh Doanh Nghiệp"
    }
]
```


### 2.3.4. Lấy danh sách lớp học thuộc khóa học
- Endpoint: GET /courses/{course_id}/classes
- Mô tả: trả về danh sách lớp học thuộc khóa học để phục vụ hiển thị cho người dùng
- Path params

| Tham số   | Kiểu dữ liệu | Bắt buộc | Mô tả                         |
|-----------|--------------|----------|-------------------------------|
| course_id | int          | có       | ID định danh khóa học cụ thể. |

- Success Response
  * HTTP Status Code: 200 OK

```
[
    {
        "id": 1,
        "name": "Lớp Giao Tiếp Căn Bản - K23 (Ca Tối)",
        "course": "Khóa Học Giao Tiếp Toàn Diện 360",
        "start_date": "2024-05-01",
        "end_date": "2024-07-31",
        "active": false,
        "main_teacher": {
            "id": 2,
            "first_name": "John",
            "last_name": "Doe",
            "email": "johndoe@ttngoaingu.edu.vn",
            "username": "teacher_john",
            "full_name": "Doe John"
        }
    }
]
```

### 2.3.5. Lấy danh sách cấp độ 
- Endpoint: GET levels/
- Mô tả: trả về danh sách các cấp độ để phục vụ phân loại hoặc lọc khóa học.
- Success Response
  * HTTP Status Code: 200 OK

```
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

### 2.3.6. Lấy danh sách cột điểm ---- Cần fix 
- Endpoint: GET courses/{course_id}/score-types/
- Mô tả: trả về danh sách các cột điểm để hiển thị điểm.
- Path params

| Tham số   | Kiểu dữ liệu | Bắt buộc | Mô tả                         |
|-----------|--------------|----------|-------------------------------|
| course_id | int          | có       | ID định danh khóa học cụ thể. |

- Success Response
  * HTTP Status Code: 200 OK

```

```

### 2.3.7. Lấy danh sách buổi học của lớp
- Endpoint: GET /classes/{class_id}/sessions
- Mô tả: trả về danh sách các buổi học phục vụ điểm danh lớp học.
- Success Response
  * HTTP Status Code: 200 OK
```
[
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
    }
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
    }
  }
]
```


## 2.4. Quản lý Tiến trình học tập và Giao dịch Học viên (Student Lifecycle and Billing Management)

### 2.4.1. Đăng ký khóa học
- Endpoint: POST /enrollments
- Mô tả: dùng khi người dùng muốn đăng ký lớp học 
- Authorization: Bearer <access_token>
- Success Response
  * HTTP Status Code: 200 OK
```

```

### 2.4.4. Thanh toán học phí
- Endpoint: POST /payments
- Mô tả: dùng khi người dùng thực hiện thanh toán
- Authorization: Bearer <access_token>
- Request Body
```
{
    "enrollment": 1,
    "amount": 4000000
}
```
- Success Response
  * HTTP Status Code: 200 OK
```
{
    "payment_url": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=500000000&vnp_Command=pay&vnp_CreateDate=20260429030319&vnp_CurrCode=VND&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+3&vnp_OrderType=billpayment&vnp_ReturnUrl=https%3A%2F%2Fpseudopsychological-vasoconstrictive-ellison.ngrok-free.dev%2Fapi%2Fpayments%2Fvnpay-callback%2F&vnp_TmnCode=YCXQRNYD&vnp_TxnRef=3&vnp_Version=2.1.0&vnp_SecureHash=e25c42373f0b72cd3667094c32c9551baf5217d856568cb6c6638dc32dc831e458163aae6e051989b627837b843d6f64548ef1d047dda99b4332e78bf323fead"
}
```

### 2.4.5. Nhập điểm theo lớp
- Endpoint: POST /classes/{class_id}/bulk-sync-scores
- Mô tả: dùng khi người dùng muốn nhập và cập nhật điểm cho các học viên trong 1 lớp học
- Authorization: Bearer <access_token>
- Request Body
```
{
  "scores": [
    {
      "enrollment_id": 1,
      "score_type_id": 1,
      "score_value": 8.0
    },
    {
      "enrollment_id": 1,
      "score_type_id": 2,
      "score_value": 7.0
    },
    {
      "enrollment_id": 2,
      "score_type_id": 1,
      "score_value": 6.5
    },
    {
      "enrollment_id": 2,
      "score_type_id": 3,
      "score_value": 9.0
    }
  ]
}
```
- Success Response
  * HTTP Status Code: 200 OK
```
{
    "message": "OK",
    "data": {
        "updated": 1,
        "created": 0
    }
}
```

### 2.4.6. Lấy danh sách điểm của lớp
- Endpoint: GET /classes/{class_id}/scores
- Mô tả: dùng khi người dùng muốn xem điểm của các học viên trong 1 lớp học
- Authorization: Bearer <access_token>
- Success Response
  * HTTP Status Code: 200 OK
```
[
    {
        "id": 1,
        "score_value": 8.5,
        "score_type": "Điểm Chuyên Cần (Attendance)",
        "student": {
            "id": 4,
            "first_name": "Minh",
            "last_name": "Trần",
            "email": "minhtran@gmail.com",
            "username": "student_minh"
        }
    },
    {
        "id": 2,
        "score_value": 7.0,
        "score_type": "Bài Thi Giữa Kỳ (Midterm)",
        "student": {
            "id": 4,
            "first_name": "Minh",
            "last_name": "Trần",
            "email": "minhtran@gmail.com",
            "username": "student_minh"
        }
    }
]
```

### 2.4.7. Điểm danh cho buổi học cụ thể 
- Endpoint: POST /classes/{class_id}/bulk-sync-attendances
- Mô tả: dùng khi người dùng muốn điểm danh cho một buổi học
- Authorization: Bearer <access_token>
- Request Body
```
{
  "session_id": 1,
  "attendances": [
    {
      "enrollment_id": 1,
      "attendance_status": "PRESENT",
      "note": ""
    },
    {
      "enrollment_id": 2,
      "attendance_status": "ABSENT",
      "note": "Nghỉ ốm"
    }
  ]
}
```
- Success Response
  * HTTP Status Code: 200 OK
```
{
    "message": "Lưu danh sách điểm danh thành công!",
    "data": {
        "created": 1,
        "updated": 1
    }
}
```

### 2.4.8. Lấy kết quả điểm danh của buổi học 
- Endpoint: GET /attendances/?session_id=1
- Mô tả: dùng khi người dùng muốn xem kết quả điểm danh của lớp
- Authorization: Bearer <access_token>
- Success Response
  * HTTP Status Code: 200 OK
```
[
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
```

### 2.4.9. Lấy danh sách học viên của lớp
- Endpoint: GET /classes/{class_id}/users
- Mô tả: dùng khi người dùng muốn xem danh sách học viên của lớp
- Authorization: Bearer <access_token>
- Success Response
  * HTTP Status Code: 200 OK
```
[
    {
        "id": 1,
        "student": {
            "id": 4,
            "first_name": "Minh",
            "last_name": "Trần",
            "email": "minhtran@gmail.com",
            "username": "student_minh"
        },
        "classroom": {
            "id": 1,
            "name": "Lớp Giao Tiếp Căn Bản - K23 (Ca Tối)",
            "course": "Khóa Học Giao Tiếp Toàn Diện 360",
            "start_date": "2024-05-01",
            "end_date": "2024-07-31",
            "active": false,
            "main_teacher": {
                "id": 2,
                "first_name": "John",
                "last_name": "Doe",
                "email": "johndoe@ttngoaingu.edu.vn",
                "username": "teacher_john"
            }
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
            "username": "student_hoa"
        },
        "classroom": {
            "id": 1,
            "name": "Lớp Giao Tiếp Căn Bản - K23 (Ca Tối)",
            "course": "Khóa Học Giao Tiếp Toàn Diện 360",
            "start_date": "2024-05-01",
            "end_date": "2024-07-31",
            "active": false,
            "main_teacher": {
                "id": 2,
                "first_name": "John",
                "last_name": "Doe",
                "email": "johndoe@ttngoaingu.edu.vn",
                "username": "teacher_john"
            }
        },
        "enrollment_status": "SUCCESS",
        "payment_deadline": "2024-06-11T06:59:59+07:00"
    }
]
```

### 2.4.10. Hủy đăng ký khóa học 
- Endpoint: DELETE /enrollments/{enroll_id}
- Mô tả: dùng khi người dùng muốn hủy đăng ký khóa học. Bản ghi sẽ bị xóa hoàn toàn khỏi hệ thống.
- Authorization: Bearer <access_token>
- Success Response
  * HTTP Status Code: 204 No Content

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

