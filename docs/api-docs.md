# API DOCUMENTATION  
## Language Center Management System

---

## 1. Overview  

### 1.1 Purpose  
Mô tả mục đích tài liệu này (ghi lại các API của hệ thống).

### 1.2 Base URL  
Ghi URL gốc của API.  
Ví dụ: `http://localhost:5000/api`

### 1.3 Authentication  
Mô tả cơ chế xác thực (JWT, Bearer Token, Session, v.v.).  
Ghi rõ cách gửi token (Header, Cookie, ...).

---

## 2. API Endpoints  

(Lặp lại block dưới cho mỗi endpoint)

---

## 2.x <Endpoint Name>  

### Endpoint  
`METHOD /api/route`

Ví dụ:  
`GET /api/students`

### Description  
Mô tả API này dùng để làm gì.

### Request  

#### Headers  
| Key | Value | Required | Description |
|-----|-------|----------|------------|
|     |       |          |            |

#### Query Parameters (Nếu có)  
| Parameter | Type | Required | Description |
|-----------|------|----------|------------|
|           |      |          |            |

#### Path Parameters (Nếu có)  
| Parameter | Type | Required | Description |
|-----------|------|----------|------------|
|           |      |          |            |

#### Request Body (Nếu có)  
```json
{
  
}
```

Giải thích các field trong body:

| Field | Type | Required | Description |
|-------|------|----------|------------|
|       |      |          |            |

---

### Response  

#### Success Response  

Status Code: `200 OK` (hoặc 201, 204...)

```json
{
  
}
```

#### Error Response  

Status Code: `400 Bad Request` (hoặc 401, 404, 500...)

```json
{
  "message": "Error message"
}
```

Giải thích các mã lỗi có thể xảy ra.

---

## 3. Common Response Format (Nếu có chuẩn chung)

Ví dụ:

```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

Mô tả cấu trúc trả về chung của toàn bộ API.

---

## 4. Error Codes  

| Status Code | Meaning | Description |
|------------|---------|------------|
| 400 | Bad Request | |
| 401 | Unauthorized | |
| 403 | Forbidden | |
| 404 | Not Found | |
| 500 | Internal Server Error | |

---

## 5. Notes  

Ghi chú thêm nếu cần.