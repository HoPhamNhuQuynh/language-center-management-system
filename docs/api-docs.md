# TÀI LIỆU API (API DOCUMENTATION) 

## Language Center Management System

---

# 1. Tổng quan (General)

## 1.1 Mục tiêu (Purpose)

Tài liệu API nhằm mô tả cách thức tương tác với hệ thống, bao gồm cách gọi API, dữ liệu đầu vào và đầu ra. Nhờ đó, các bên liên quan có thể hiểu rõ cách sử dụng, kiểm thử và tích hợp hệ thống một cách chính xác và hiệu quả.

---

## 1.2 Base URL

```
http://localhost:5000
```

---

## 1.3 Xác thực (Authentication)

### Cơ chế (Mechanism)

Hệ thống sử dụng kết hợp OAuth 2.0 cho xác thực bên thứ ba và xác thực bằng username/password cho tài khoản nội bộ. Sau khi xác thực thành công, hệ thống cấp JWT (Bearer Token) để sử dụng cho các request tiếp theo, đảm bảo tính nhất quán và khả năng mở rộng.

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
  "status": "success",
  "data": {},
  "message": "string"
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
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Short error message",
    "details": "Optional detailed info"
  }
}
```

# 2. API ENDPOINTS

## 2.1. Quản lý Định danh và Truy cập (IAM - Identity and Access Management)

### 2.1.1. Đăng nhập hệ thống bằng tài khoản LOCAL
- Endpoint: POST /auth/login
- Mô tả: dùng khi user đăng nhập vào hệ thống
- Request response
```
{
  "username": "abc",
  "password": "123456"
}
```

- Success response
  * HTTP Status Code: 200 OK
```
{
  "status": "success",
  "data": {
    "access_token": "...",
    "refresh_token": "...",
    "user": {
      "id": 1,
      "username": "nhuquynh",
      "email": "quynh@gmail.com",
      "provider_auth": "local"
    }
  }
}
```

### 2.1.2. Đăng ký tài khoản LOCAL
- Endpoint: POST /auth/register
- Mô tả: dùng khi user đăng ký tài khoản để sử dụng hệ thống.
- Request response
```
{
  "username": "nhuquynh",
  "email": "quynh@gmail.com",
  "password": "123456",
  "phone_num": "0123456789",
  "first_name": "quynh",
  "last_name": "nhu"
}
```

- Success response
  * HTTP Status Code: 200 OK
```
{
  "status": "success",
  "data": {
    "access_token": "...",
    "refresh_token": "...",
    "user": {
      "id": 1,
      "username": "nhuquynh",
      "email": "quynh@gmail.com"
    }
  }
}
```

### 2.1.3. Xác thực tài khoản người dùng bằng Google
- Endpoint: POST /auth/social/google
- Mô tả: dùng khi user đăng nhập vào hệ thống bằng tài khoản Google
- Request response
```
{
  "code": "google_auth_code"
}
```

- Success response
  * HTTP Status Code: 200 OK
```
{
  "status": "success",
  "data": {
    "access_token": "...",
    "refresh_token": "...",
    "user": {
      "id": 1,
      "username": "nhuquynh",
      "email": "quynh@gmail.com",
      "provider_auth": "google"
    }
  }
}
```

### 2.1.4. Xác thực người dùng bằng tài khoản Facebook
- Endpoint: POST /auth/social/facebook
- Mô tả: dùng khi user đăng nhập vào hệ thống bằng tài khoản Facebook
- Request response
```
{
  "access_token": "facebook_token"
}
```

- Success response
  * HTTP Status Code: 200 OK
```
{
  "status": "success",
  "data": {
    "access_token": "...",
    "refresh_token": "...",
    "user": {
      "id": 1,
      "username": "nhuquynh",
      "email": "quynh@gmail.com",
      "provider": "facebook"
    }
  }
}
```

### 2.1.5. Refresh Token
- Endpoint: POST /auth/refresh
- Mô tả: dùng khi user đăng nhập vào hệ thống
- Request response
```
{
  "refresh_token": "..."
}
```

- Success response
  * HTTP Status Code: 200 OK
```
{
  "status": "success",
  "data": {
    "access_token": "new_access_token"
  }
}
```

### 2.1.6. Đăng xuất tài khoản
- Endpoint: POST /auth/logout
- Mô tả: dùng khi user đăng nhập vào hệ thống
- Authorization: Bearer <access_token>
- Request response
```
{
  "refresh_token": "..."
}
```

- Success response
  * HTTP Status Code: 200 OK
```
{
  "status": "success",
  "message": "Logged out successfully"
}
```

## 2.2. Quản lý Tài nguyên người dùng (User Resource Management)
### 2.2.1. Lấy thông tin chi tiết người dùng
- Endpoint: GET /users/me 
- Mô tả: dùng để phục vụ hiển thị hồ sơ người dùng
- Authorization: Bearer <access_token>
- Success Response
  * HTTP Status Code: 200 OK
```
{
  "status": "success",
  "data":
    {
      "id": "1",
      "email": "a@gmail.com",
      "username": "abc",
      "auth_provider": "LOCAL",
      "role_id": 1,
      "created_at": "2026-03-18T08:30:00Z",
      "first_name": "a",
      "last_name": "bc",
      "phone_num": "0123456789",
      "avatar": "/images/default-avatar.png"
    },
  "message": ""
}
```

- Possible errors:
  - 400: tham số request không hợp lệ
  - 401: chứng thực không thành công
  - 403: user không có quyền truy cập tài nguyên
  - 404: không tìm thấy user
                
           
### 2.2.2. Cập nhật thông tin cơ bản của người dùng
- Endpoint: PATCH /users/me
- Mô tả: cho phép cập nhật thông tin cá nhân của người dùng như email, số điện thoại,..
- Authorization: Bearer <access_token>
- Request Body
```
{
  "email": "quynh@gmail.com",
  "phone_num": "0987654321",
  "first_name": "quynh",
  "last_name": "nhuuuu",
}
```

- Success Response
  * HTTP Status Code: 200 OK
```
{
  "status": "success",
  "data": {
    "id": 1,
    "email": "quynh@gmail.com",
    "first_name": "quynh",
    "last_name": "nhuuu",
    "phone_num": "0987654321",
    "avatar": "/images/avatar.png"
  },
  "message": "User updated successfully"
}
```

- Error Response

| HTTP Status               | Mô tả                                        |
|---------------------------|----------------------------------------------|
| 400 Bad Request           | Dữ liệu gửi lên không hợp lệ                 |
| 401 Unauthorized          | Token thiếu, hết hạn hoặc sai                |
| 403 Forbidden             | Cố gắng cập nhật user khác mà không có quyền |
| 500 Internal Server Error | Lỗi server                                   |

### 2.2.3. Cập nhật ảnh đại diện người dùng
- Endpoint: PATCH /users/me/avatar
- Mô tả: dùng khi người dùng muốn cập nhật ảnh đại diện
- Authorization: Bearer <access_token>
- Content-Type: multipart/form-data
- Request Body (form-data)
```
  avatar: <file ảnh>
```

- Success Response
  * HTTP Status Code: 200 OK
```
{
  "status": "success",
  "data": {
      "avatar_url": "https://res.cloudinary.com/demo/image/upload/v123456/avatar.jpg"
  },
  "message": "User updated successfully"
}
```

### 2.2.4. Lấy danh sách các lớp học đã đăng ký của 1 người dùng
- Endpoint: GET /users/me/enrollments
- Mô tả: dùng khi người dùng muốn xem các lớp học đã đăng ký
- Authorization: Bearer <access_token>
- Success Response
  * HTTP Status Code: 200 OK
```
{
  "status": "success",
  "data": {
    "enrollments": [
      {
        "id": 101,
        "class_id": 20,
        "class_name": "EN_I5F1",
        "course_name": "IELTS 5.0 Foundation"
      },
      {
        "id": 102,
        "class_id": 25,
        "class_name": "EN_I6F2",
        "course_name": "IELTS 6.0 Foundation"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2
    }
  },
  "message": "Enrollments retrieved successfully"
}
```

### 2.2.5. Lấy thông tin chi tiết của lớp học đã đăng ký
- Endpoint: GET /users/me/enrollments/{enroll_id}
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
  "status": "success",
  "data": {
    "enrollment_id": 101,
    "class": {
      "id": 20,
      "name": "IELTS Intensive",
      "start_date": "2026-03-01",
      "end_date": "2026-05-30",

      "course": {
        "id": 5,
        "name": "IELTS 6.5+ Target",
        "level": "Intermediate",
        "tags": ["English"]
      },

      "main_teacher": {
        "user_id": 3,
        "name": "Nguyễn Văn A"
      }
    },

    "grade_report": {
      "items": [
        {
          "score_type_id": 1,
          "name": "Listening",
          "score": 7.5,
          "weight": 0.25
        },
        {
          "score_type_id": 2,
          "name": "Reading",
          "score": 8.0,
          "weight": 0.25
        },
        {
          "score_type_id": 3,
          "name": "Writing",
          "score": 6.5,
          "weight": 0.25
        },
        {
          "score_type_id": 4,
          "name": "Speaking",
          "score": 7.0,
          "weight": 0.25
        }
      ],
      "average_score": 7.5
    },

    "evaluation": {
      "comment": "Kỹ năng đọc rất tốt, cần luyện tập thêm phần Writing Task 2 để cải thiện tốc độ."
    }
  },
  "message": "Enrollment details retrieved successfully"
}
```

### 2.2.6. Lấy dữ liệu thời khóa biểu - PHỨC TẠP CHECK LẠI SAU
- Endpoint: GET /users/me/timetable
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
  "status": "success",
  "data": {
    "week": {
      "start_date": "2026-03-01",
      "end_date": "2026-03-07"
    },
    "timetable": {
      "monday": [
        {
          "session_id": 1000,
          "class_name": "Grammar Foundation",
          "time_range": "18:00 - 20:00",
          "room": "Room A1",
          "teacher": "Trần Thị B"
        }
      ],
      "tuesday": [],
      "wednesday": [
        {
          "session_id": 1001,
          "class_name": "TANC1",
          "time_range": "08:00 - 11:00",
          "room": "Lab 01",
          "teacher": "Nguyễn Văn A"
        }
      ],
      "thursday": [],
      "friday": [],
      "saturday": [
        {
          "session_id": 1002,
          "class_name": "Speaking Booster",
          "time_range": "14:00 - 16:00",
          "room": "Room B2",
          "teacher": "Lê Văn C"
        }
      ],
      "sunday": []
    }
  },
  "message": "Timetable retrieved successfully"
}
```

### 2.2.7. Lấy lịch sử thanh toán của người dùng
- Endpoint: GET /users/me/payments
- Mô tả: dùng khi người dùng muốn xem lịch sử thanh toán
- Authorization: Bearer <access_token>
- Success Response
  * HTTP Status Code: 200 OK
```
{
  "status": "success",
  "data": {
    "summary": {
      "total_paid": 10000000
    },
    "payments": [
      {
        "course_name": "English Communication A",
        "class_code": "ENG-COM-A1",
        "enrollment_date": "2026-03-01",
        "payment_date": "2026-03-02",
        "amount": 5000000
      },
      {
        "course_name": "English Communication A",
        "class_code": "ENG-COM-A1",
        "enrollment_date": "2026-03-01",
        "payment_date": "2026-04-02",
        "amount": 5000000
      }
    ]
  }
}
```

## 2.3. Quản lý Tài nguyên đào tạo (Training Resources)

### 2.3.1. Lấy danh sách khóa học
- Endpoint: GET /courses
- Mô tả: trả về danh sách các khóa học để hiển thị cho người dùng
- Query Params

| Trường   | Kiểu dữ liệu | Bắt buộc | Mô tả                    |
|----------|--------------|----------|--------------------------|
| page     | int          | không    | số trang                 |
| limit    | int          | không    | số bản ghi trên 1 trang  |
| tag_id   | int          | không    | lọc dữ liệu theo thẻ     |
| level_id | int          | không    | lọc khóa học theo llevel |
- Success Response
  * HTTP Status Code: 200 OK

```
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "English Communication A1",
      "image": "/images/courses/english-communication-a1.png",
      "total_sessions": 24,
      "level_id": 1,
      "created_at": "2026-03-18T08:30:00Z"
    },
    {
      "id": 2,
      "name": "English Communication A2",
      "image": "/images/courses/english-communication-a2.png",
      "total_sessions": 24,
      "level_id": 2,
      "created_at": "2026-03-18T09:00:00Z"
    },
    {
      "id": 3,
      "name": "IELTS Foundation",
      "image": "/images/courses/ielts-foundation.png",
      "total_sessions": 30,
      "level_id": 3,
      "created_at": "2026-03-17T14:20:00Z"
    },
    {
      "id": 4,
      "name": "IELTS Intensive 6.5+",
      "image": "/images/courses/ielts-intensive.png",
      "total_sessions": 36,
      "level_id": 4,
      "created_at": "2026-03-16T10:15:00Z"
    },
    {
      "id": 5,
      "name": "TOEIC Preparation",
      "image": "/images/courses/toeic-prep.png",
      "total_sessions": 28,
      "level_id": 3,
      "created_at": "2026-03-15T11:45:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 124,
    "total_pages": 7
  },
  "message": "Courses retrieved successfully"
}
```


### 2.3.2. Lấy thông tin chi tiết khóa học
- Endpoint: GET courses/{course_id}
- Mô tả: trả về thông tin chi tiết của khóa học để hiển thị nội dung và thông tin liên quan
- Path params

| Tham số   | Kiểu dữ liệu | Bắt buộc | Mô tả                         |
|-----------|--------------|----------|-------------------------------|
| course_id | int          | có       | ID định danh khóa học cụ thể. |

- Success Response
  * HTTP Status Code: 200 OK

```
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "English Communication A1",
    "image": "/images/courses/english-communication-a1.png",
    "total_sessions": 24,
    "level_id": 1,
    "created_at": "2026-03-18T08:30:00Z",
    "price": 2000000,
    "description": "This course is designed for beginners to build a strong foundation in English communication, including listening, speaking, and basic grammar.",
    "tags": [
      {
        "id": 1,
        "name": "Beginner"
      },
      {
        "id": 2,
        "name": "Communication"
      },
      {
        "id": 3,
        "name": "Basic Grammar"
      }
    ]
  },
  "message": "Course retrieved successfully"
}
```

### 2.3.3. Lấy danh sách thẻ
- Endpoint: GET /tags
- Mô tả: trả về danh sách các thẻ để phục vụ phân loại hoặc lọc khóa học.
- Success Response
  * HTTP Status Code: 200 OK

```
{
  "status": "success",
  "data": [
    {
      "id": 1, 
      "name": "English"
    },
    {
      "id": 2, 
      "name": "Chinese"
    }
  ],
  "message": ""
}
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
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "class_name": "Morning Class - Batch 01",
      "start_date": "2026-06-02",
      "end_date": "2026-09-15",
      "capacity": 30,
      "current_enrollments": 18,
      "course_name": "English Communication A1",
      "schedules": [
        {
          "id": 1,
          "class_id": 1,
          "start_time": "08:00:00",
          "end_time": "10:00:00",
          "day_of_week": 2
        },
        {
          "id": 2,
          "class_id": 1,
          "start_time": "08:00:00",
          "end_time": "10:00:00",
          "day_of_week": 4
        }
      ]
    },
    {
      "id": 2,
      "class_name": "Evening Class - Batch 02",
      "start_date": "2026-07-01",
      "end_date": "2026-10-01",
      "capacity": 25,
      "current_enrollments": 25,
      "course_name": "English Communication A1",
      "schedules": [
        {
          "id": 3,
          "class_id": 2,
          "start_time": "18:00:00",
          "end_time": "20:00:00",
          "day_of_week": 3
        },
        {
          "id": 4,
          "class_id": 2,
          "start_time": "18:00:00",
          "end_time": "20:00:00",
          "day_of_week": 5
        }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 55,
    "total_pages": 3
  },
  "message": "Classes retrieved successfully"
}
```

### 2.3.5. Lấy danh sách cấp độ 
- Endpoint: GET /levels
- Mô tả: trả về danh sách các cấp độ để phục vụ phân loại hoặc lọc khóa học.
- Success Response
  * HTTP Status Code: 200 OK

```
{
  "status": "success",
  "data": [
    {
      "id": 1, 
      "name": "Intermediate"
    },
    {
      "id": 2, 
      "name": "Advanced"
    }
  ],
  "message": ""
}
```

### 2.3.6. Lấy danh sách cột điểm 
- Endpoint: GET /score-types
- Mô tả: trả về danh sách các cột điểm để hiển thị điểm.
- Success Response
  * HTTP Status Code: 200 OK

```
{
  "status": "success",
  "data": [
    { "id": 1, "name": "Chuyên cần" },
    { "id": 2, "name": "Giữa kỳ" },
    { "id": 3, "name": "Cuối kỳ" }
  ],
  "message": "Score types retrieved successfully"
}
```

### 2.3.7. Lấy danh sách buổi học của lớp
- Endpoint: GET /classes/{class_id}/sessions
- Mô tả: trả về danh sách các buổi học phục vụ điểm danh lớp học.
- Success Response
  * HTTP Status Code: 200 OK
```
{
  "status": "success",
  "data": [
    { "session_id": 401, "date": "2026-03-20" },
    { "session_id": 402, "date": "2026-03-22" }
  ],
  "message": "Sessions retrieved successfully"
}
```


## 2.4. Quản lý Tiến trình học tập và Giao dịch Học viên (Student Lifecycle and Billing Management)

### 2.4.1. Đăng ký khóa học
- Endpoint: POST /enrollments
- Mô tả: dùng khi người dùng muốn đăng ký lớp học 
- Authorization: Bearer <access_token>
- Success Response
  * HTTP Status Code: 200 OK
```
{
  "status": "success",
  "data": {
    "id": 301,
    "user_id": 101,
    "class_id": 201,
    "enrollment_status": "PENDING_PAYMENT",
    "payment_deadline": "2026-03-27T17:00:00",
    "created_at": "2026-03-20T10:15:00"
  },
  "message": "Enrollment created successfully"
}
```

### 2.4.2. Cập nhật trạng thái đăng ký - hệ thống tự động
- Endpoint: PATCH /enrollments/{enroll_id}
- Mô tả: khi người dùng thanh toán thành công
- Authorization: Bearer <access_token>
- Success Response
  * HTTP Status Code: 200 OK
```
{
  "status": "success",
  "data": {
    "id": 301,
    "user_id": 101,
    "class_id": 201,
    "enrollment_status": "SUCCESS",
    "payment_deadline": "2026-03-27T17:00:00",
    "created_at": "2026-03-20T10:15:00"
  },
  "message": "Enrollment updated successfully"
}
```

### 2.4.3. Lấy thông tin chi tiết của 1 lần đăng ký
- Endpoint: GET /enrollments/{enroll_id}
- Mô tả: dùng khi cần hiển thị thông tin đăng ký cho người dùng xác nhận
- Authorization: Bearer <access_token>
- Success Response
  * HTTP Status Code: 200 OK
```
{
  "status": "success",
  "data": {
    "user_id": 101,
    "first_name": "Nguyen",
    "last_name": "An",
    "phone_num": "0912345678",
    "email": "nguyen.an@example.com",
    "class_id": 201,
    "class_name": "English Communication A1"
  },
  "message": "Enrollment details retrieved successfully"
}
```

### 2.4.4. Thanh toán học phí
- Endpoint: POST /payments
- Mô tả: dùng khi người dùng thực hiện thanh toán
- Authorization: Bearer <access_token>
- Success Response
  * HTTP Status Code: 200 OK
```
{
  "status": "success",
  "data": {
    "id": 501,
    "enrollment_id": 301,
    "amount": 2000000,
    "payment_method": "BANKING",
    "payment_status": "SUCCESS",
    "transaction_id": "TXN202603201015",
    "paid_at": "2026-03-20T10:45:00",
    "created_at": "2026-03-20T10:45:00"
  },
  "message": "Payment completed successfully"
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
      "enrollment_id": 301,
      "score_type_id": 1,
      "score_value": 8.5
    },
    {
      "enrollment_id": 302,
      "score_type_id": 2,
      "score_value": 7.0
    },
    {
      "enrollment_id": 303,
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
  "status": "success",
  "data": [
    {
      "id": 701,
      "enrollment_id": 301,
      "score_type_id": 1,
      "score_value": 8.5,
      "created_at": "2026-03-20T11:00:00"
    },
    {
      "id": 702,
      "enrollment_id": 302,
      "score_type_id": 1,
      "score_value": 7.0,
      "created_at": "2026-03-20T11:00:00"
    },
    {
      "id": 703,
      "enrollment_id": 303,
      "score_type_id": 1,
      "score_value": 9.0,
      "created_at": "2026-03-20T11:00:00"
    }
  ],
  "message": "Scores synced successfully"
}
```

### 2.4.6. Lấy danh sách điểm của lớp
- Endpoint: GET /classes/{class_id}/scores
- Mô tả: dùng khi người dùng muốn xem điểm của các học viên trong 1 lớp học
- Authorization: Bearer <access_token>
- Success Response
  * HTTP Status Code: 200 OK
```
{
  "status": "success",
  "data": [
    {
      "user_id": 101,
      "first_name": "Nguyen",
      "last_name": "An",
      "scores": [
        { "score_type": "Bài tập", "score_value": 8.0 },
        { "score_type": "Kiểm tra giữa kỳ", "score_value": 8.5 },
        { "score_type": "Thi cuối khóa", "score_value": 8.1 }
      ],
      "average_score": 8.2,
      "comment": "Hoàn thành tốt các bài tập"
    },
    {
      "user_id": 102,
      "first_name": "Tran",
      "last_name": "Binh",
      "scores": [
        { "score_type": "Bài tập", "score_value": 7.0 },
        { "score_type": "Kiểm tra giữa kỳ", "score_value": 7.5 },
        { "score_type": "Thi cuối khóa", "score_value": 6.8 }
      ],
      "average_score": 7.1,
      "comment": "Cần cải thiện kỹ năng nghe"
    }
  ],
  "message": "Class scores retrieved successfully"
}
```

### 2.4.7. Điểm danh
- Endpoint: POST /classes/{class_id}/bulk-sync-attendances
- Mô tả: dùng khi người dùng muốn điểm danh cho một buổi học
- Authorization: Bearer <access_token>
- Request Body
```
{
  "attendances": [
    {
      "enrollment_id": 301,
      "attendance_status": "PRESENT",
      "note": "Có mặt đầy đủ"
    },
    {
      "enrollment_id": 302,
      "attendance_status": "ABSENT",
      "note": null
    },
    {
      "enrollment_id": 303,
      "attendance_status": "LATE",
      "note": "Đến muộn 10 phút"
    }
  ]
}
```
- Success Response
  * HTTP Status Code: 200 OK
```
{
  "status": "success",
  "data": [
    {
      "enrollment_id": 301,
      "attendance_status": "PRESENT",
      "note": "Có mặt đầy đủ",
      "updated_at": "2026-03-20T09:00:00"
    },
    {
      "enrollment_id": 302,
      "attendance_status": "ABSENT",
      "note": null,
      "updated_at": "2026-03-20T09:00:00"
    },
    {
      "enrollment_id": 303,
      "attendance_status": "LATE",
      "note": "Đến muộn 10 phút",
      "updated_at": "2026-03-20T09:00:00"
    }
  ],
  "message": "Attendances synced successfully"
}
```

### 2.4.8. Lấy kết quả điểm danh của lớp
- Endpoint: GET /classes/{class_id}/attendances?date=2026-03-20
- Mô tả: dùng khi người dùng muốn xem kết quả điểm danh của lớp
- Authorization: Bearer <access_token>
- Success Response
  * HTTP Status Code: 200 OK
```
{
  "status": "success",
  "data": [
    {
      "user_id": 101,
      "first_name": "Nguyen",
      "last_name": "An",
      "attendance_status": "PRESENT",
      "note": "Có mặt đầy đủ"
    },
    {
      "user_id": 102,
      "first_name": "Tran",
      "last_name": "Binh",
      "attendance_status": "ABSENT",
      "note": null
    },
    {
      "user_id": 103,
      "first_name": "Le",
      "last_name": "Chi",
      "attendance_status": "LATE",
      "note": "Đến muộn 10 phút"
    },
    {
      "user_id": 104,
      "first_name": "Pham",
      "last_name": "Dung",
      "attendance_status": "ABSENT",
      "note": null
    }
  ],
  "message": "Attendances retrieved successfully for 2026-03-20"
}
```

### 2.4.9. Lấy danh sách học viên của lớp
- Endpoint: GET /classes/{class_id}/users
- Mô tả: dùng khi người dùng muốn xem danh sách học viên của lớp
- Authorization: Bearer <access_token>
- Success Response
  * HTTP Status Code: 200 OK
```
{
  "status": "success",
  "data": [
    {
      "user_id": 101,
      "first_name": "Nguyen",
      "last_name": "An"
    },
    {
      "user_id": 102,
      "first_name": "Tran",
      "last_name": "Binh"
    },
    {
      "user_id": 103,
      "first_name": "Le",
      "last_name": "Chi"
    },
    {
      "user_id": 104,
      "first_name": "Pham",
      "last_name": "Dung"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 55,
    "total_pages": 3
  },
  "message": "Class users retrieved successfully"
}
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

