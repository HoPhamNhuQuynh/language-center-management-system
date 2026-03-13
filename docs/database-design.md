# TÀI LIỆU THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE DESIGN)
**Dự án:** Hệ thống quản lý trung tâm ngoại ngữ (Language Center) <br>
**Phiên bản:** 1.0

---

## 1. Tổng quan (Purpose & Overview)

### 1.1. Mục đích tài liệu (Document Objectives)
Tài liệu này được lập ra nhằm đặc tả chi tiết cấu trúc dữ liệu và phương án lưu trữ cho dự án Hệ thống quản lý trung tâm ngoại ngữ (Language Center).

Tài liệu cung cấp một cái nhìn toàn diện về luồng dữ liệu của hệ thống, đi từ mô hình mức logic (sơ đồ ERD) đến thiết kế mức vật lý (chi tiết bảng, khóa, kiểu dữ liệu).

**Mục tiêu chính của tài liệu bao gồm:**
* Đối với nhóm phát triển: Làm tài liệu chuẩn để các thành viên trong nhóm (Backend, Frontend) thống nhất cấu trúc dữ liệu, từ đó triển khai viết code, tạo database và xây dựng API một cách chính xác, tránh xung đột.
* Đối với việc đánh giá: Trình bày rõ ràng tư duy phân tích, cách chuẩn hóa dữ liệu và phương án giải quyết bài toán lưu trữ để Giảng viên có cơ sở theo dõi và đánh giá chất lượng hệ thống.

### 1.2 Phạm vi dữ liệu (Scope)
Hệ thống quản lý trung tâm ngoại ngữ tập trung vào việc số hóa các nhóm dữ liệu cốt lõi phục vụ hoạt động đào tạo và vận hành. Phạm vi dữ liệu bao gồm:

* **Dữ liệu người dùng:** Thông tin định danh, hồ sơ cá nhân và phân quyền truy cập của quản trị viên, giáo viên và học viên.
* **Dữ liệu đào tạo:** Danh mục khóa học, phân cấp trình độ, cấu trúc thẻ phân loại và các chương trình giảng dạy.
* **Dữ liệu tổ chức:** Thông tin lớp học, cấu trúc phòng học, lịch giảng dạy và lịch sử phân công giáo viên.
* **Dữ liệu giao dịch:** Thông tin đăng ký khóa học, lịch sử thanh toán học phí và trạng thái các giao dịch tài chính.
* **Dữ liệu kết quả:** Ghi nhận điểm danh lớp học, bảng điểm chi tiết (theo đầu điểm) và kết quả học tập cuối khóa của học viên.

**Ngoài phạm vi (Out of Scope):** Để tập trung vào chất lượng hệ thống, các dữ liệu sau nằm ngoài phạm vi quản lý của phiên bản hiện tại:
* Dữ liệu lương thưởng hoặc hợp đồng lao động của nhân viên.
* Dữ liệu quản lý tài sản cố định khác (bàn ghế, máy chiếu...) của trung tâm.
* Dữ liệu tích hợp với các hệ thống thư viện hoặc tài liệu nội bộ ngoài phạm vi đào tạo.

### 1.3. Thuật ngữ và Viết tắt (Acronyms and Abbreviations)

Dưới đây là bảng giải thích các thuật ngữ và từ viết tắt chuyên ngành được sử dụng xuyên suốt trong tài liệu này:

| Từ viết tắt | Tên đầy đủ tiếng Anh        | Giải thích / Ý nghĩa                                                                                                                                                   |
|:------------|:----------------------------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **DB**      | Database                    | Cơ sở dữ liệu, nơi lưu trữ dữ liệu của hệ thống.                                                                                                                       |
| **DBMS**    | Database Management System  | Hệ quản trị cơ sở dữ liệu.                                                                                                                                             |
| **ERD**     | Entity-Relationship Diagram | Sơ đồ Thực thể - Liên kết, dùng để mô hình hóa cấu trúc dữ liệu ở mức logic.                                                                                           |
| **PK**      | Primary Key                 | Khóa chính. Dùng để định danh duy nhất một bản ghi (record) trong một bảng.                                                                                            |
| **FK**      | Foreign Key                 | Khóa ngoại. Dùng để tạo mối liên kết dữ liệu giữa hai bảng khác nhau.                                                                                                  |
| **UK / UQ** | Unique Key                  | Ràng buộc độc nhất. Đảm bảo dữ liệu trong cột không bị trùng lặp.                                                                                                      |
| **AI**      | Auto Increment              | Tự động tăng. Giá trị của cột sẽ tự động tăng lên 1 khi có bản ghi mới được thêm vào (thường dùng cho PK).                                                             |
| **DDL**     | Data Definition Language    | Ngôn ngữ định nghĩa dữ liệu. Gồm các lệnh như CREATE, ALTER, DROP để tạo hoặc sửa cấu trúc bảng.                                                                       |
| **SQL**     | Structured Query Language   | Ngôn ngữ truy vấn có cấu trúc. Được sử dụng để giao tiếp, thao tác (thêm, sửa, xóa, truy xuất) và định nghĩa cấu trúc dữ liệu trong hệ quản trị cơ sở dữ liệu quan hệ. |
| **CSDL**    |                             | Cơ sở dữ liệu.                                                                                                                                                         |

---

## 2. Môi trường & Ràng buộc (Environment & Constraints)

### 2.1. Nền tảng Hệ quản trị CSDL (DBMS Platform)
Dự án sử dụng **MySQL phiên bản 8.0** làm hệ quản trị cơ sở dữ liệu quan hệ (RDBMS) chính để lưu trữ, quản lý và truy xuất dữ liệu.

**Lý do lựa chọn MySQL 8.0:**
* **Phổ biến và dễ sử dụng:** Là hệ quản trị CSDL mã nguồn mở miễn phí, có cộng đồng hỗ trợ lớn và nhiều tài liệu tham khảo, rất phù hợp cho việc học tập và phát triển đồ án.
* **Hiệu năng ổn định:** Đáp ứng tốt các yêu cầu cơ bản về lưu trữ, tốc độ truy vấn và đảm bảo tính toàn vẹn dữ liệu cho phạm vi của hệ thống. 
* **Cải tiến bảo mật (Hash type):** Phiên bản 8.0 sử dụng thuật toán băm (hash) mật khẩu mặc định mới là `caching_sha2_password` (thay thế cho `mysql_native_password` ở các bản cũ). Điều này giúp tăng cường tính bảo mật cho các tài khoản truy cập vào database.
* **Tính năng của phiên bản 8.0:** Phiên bản này hỗ trợ bảo mật tốt hơn các bản cũ và cung cấp thêm một số tính năng tiện lợi cho việc viết câu lệnh SQL (như hỗ trợ kiểu dữ liệu JSON, CTE) nếu dự án cần sử dụng đến.

**Công cụ quản trị thao tác (Database Client):**
* Nhóm sử dụng công cụ **MySQL Workbench** để thiết kế cơ sở dữ liệu và thực thi các câu lệnh SQL và quản trị dữ liệu trực quan trong suốt quá trình phát triển.


### 2.2. Giả định và Ràng buộc (Assumptions & Constraints)
**1. Giả định thiết kế (Assumptions):**
* **Quy mô dữ liệu (Data Volume):** Giả định hệ thống phục vụ cho một trung tâm ngoại ngữ quy mô vừa, lượng dữ liệu sinh ra hàng năm ở mức trung bình. Do đó, thiết kế hiện tại sử dụng kiến trúc CSDL tập trung (Centralized Database).
* **Định dạng ký tự (Character Encoding):** Dữ liệu đầu vào (tên học viên, tên khóa học, nhận xét của giáo viên) sử dụng nhiều tiếng Việt có dấu. Giả định toàn bộ CSDL, các bảng và cột dữ liệu văn bản đều được cấu hình chuẩn `utf8mb4` (collation: `utf8mb4_unicode_ci`) để đảm bảo không bị lỗi font chữ.

**2. Ràng buộc lưu trữ (Constraints):**
* **Xử lý tập tin đa phương tiện (Media Storage):** CSDL **tuyệt đối không** lưu trữ trực tiếp các tệp nhị phân kích thước lớn (BLOB) như: ảnh đại diện của học viên. CSDL chỉ lưu trữ đường dẫn (URL/File Path) trỏ tới vị trí lưu file thực tế trên Server hoặc Cloud Storage để tránh chiếm dụng không gian lưu trữ và làm chậm tốc độ truy vấn.
* **Bảo toàn dữ liệu lịch sử (Soft Delete):** Đối với các thực thể mang tính lịch sử và tài chính (như `Enrollment`, `Course`, `Class`, `Payment`), hệ thống hạn chế việc xóa vật lý (Hard Delete) nhằm phục vụ công tác đối soát sau này. Tùy thuộc vào từng luồng nghiệp vụ cụ thể, nhóm phát triển có thể cân nhắc sử dụng các cột trạng thái (ví dụ: `active` = `False`) hoặc áp dụng cơ chế "Xóa mềm" (Soft Delete) nếu thấy thực sự cần thiết.
* **Bảo mật thông tin (Data Security):** Ràng buộc không lưu trữ mật khẩu người dùng (User/Admin) dưới dạng văn bản thuần (plain-text). Mật khẩu bắt buộc phải được băm (hash) bằng các thuật toán một chiều an toàn trước khi lưu xuống bảng tài khoản người dùng.

---

## 3. Thiết kế CSDL mức Logic (Logical Database Design)

### 3.1. Sơ đồ Thực thể - Liên kết (ERD)
**Mô tả sơ đồ:** Sơ đồ logic dưới đây thực hiện chuẩn hóa dữ liệu ở mức 3 (3NF) nhằm loại bỏ dư thừa dữ liệu. Các mối quan hệ Nhiều-Nhiều (N:N) được giải quyết thông qua các bảng kết hợp để đảm bảo tính toàn vẹn tham chiếu.

![Sơ đồ ERD tổng thể hệ thống](./images/erd_diagram.png)


### 3.2. Đặc tả các thực thể chính (Entity Descriptions)
Hệ thống Quản lý Trung tâm Ngoại ngữ được xây dựng dựa trên các thực thể cốt lõi sau. 

| Tên thực thể      | Tên bảng tương ứng | Vai trò kĩ thuật                                                   |
|:------------------|:-------------------|:-------------------------------------------------------------------|
| Người dùng        | user               | Quản lý thông tin xác thực, phân quyền và trạng thái tài khoản.    |
| Khóa học          | course             | Lưu trữ chương trình đào tạo, học phí và các thông số chuyên môn.  |
| Lớp học           | class              | Đơn vị tổ chức học tập cụ thể, quản lý sĩ số và thời gian đào tạo. |
| Ghi danh/ Đăng ký | enrollment         | Quản lý quá trình học tập của học viên trong một lớp học cụ thể.   |
| Lịch học          | schedule           | Định nghĩa lịch trình lặp lại (thứ, giờ) cho các lớp học.          |
| Phòng học         | room               | Quản lý phòng học cho các buổi học.                                |
| Buổi học          | session            | Lưu trữ thông tin từng buổi học thực tế phục vụ điểm danh.         |
| Điểm số           | score              | Lưu trữ điểm số chi tiết của học viên theo từng cột điểm.          |
| Thanh toán        | payment            | Lưu trữ lịch sử giao dịch tài chính. Đảm bảo độ chính xác cao.     |
| Kết quả toàn khóa | academic_result    | Ghi nhận kết quả học tập của học viên sau khóa học.                |


---

## 4. Thiết kế CSDL mức Vật lý (Physical Database Design)

### 4.1. Quy ước đặt tên (Naming Conventions)
Để đảm bảo tính thống nhất, dễ bảo trì và tương thích tốt giữa hệ quản trị cơ sở dữ liệu MySQL và Framework Django, hệ thống tuân thủ các quy tắc đặt tên sau:

#### 4.1.1. Quy tắc chung
* **Ngôn ngữ:** Sử dụng tiếng Anh chuyên ngành (English) cho tất cả các định danh để đảm bảo tính ổn định và tránh lỗi font chữ/mã hóa.
* **Định dạng chữ:** Sử dụng kiểu snake_case (tất cả viết thường, phân cách bằng dấu gạch chân) cho cả tên bảng và tên cột.

#### 4.1.2. Quy ước cho bảng
* **Loại từ:** Sử dụng danh từ số ít để đại diện cho một thực thể, một bản ghi đơn lẻ trong bảng. Từ đó, các câu lệnh truy vấn SQL trở nên ngắn gọn và tường minh cao.
* **Bảng trung gian:** Sử dụng tên của hai bảng chính kết hợp với nhau theo số ít.

#### 4.1.3. Quy ước cho cột
* **Khóa chính (Primary key):** Luôn đặt tên là `id` với kiểu số nguyên tự động tăng (Auto Increment).
* **Khóa ngoại (Foreign key):** Sử dụng công thức `[tên_bảng]_id`.
* **Cột chứa ngày giờ:** 
    - Nếu chỉ lấy ngày: dùng hậu tố `_date`.
    - Nếu chỉ lấy giờ: dùng hậu tố `_time`
    - Nếu lấy cả ngày và giờ: dùng hậu tố `_at`.
* **Cột trạng thái:** Sử dụng các tiền tố như `is_`, `has_`, hoặc các tính từ như `active`.

#### 4.1.4. Quy ước về Khóa và Chỉ mục
* **Khóa chính (Primary Key):** `pk_[tên_bảng]`
* **Khóa ngoại (Foreign Key):** `fk_[bảng_con]_[bảng_cha]`
* **Ràng buộc duy nhất (Unique Key):** `uk_[tên_bảng]_[tên_cột]`
* **Chỉ mục (Index):** `idx_[tên_bảng]_[tên_cột]`

#### 4.1.5. Quy ước kiểu dữ liệu (Data Type Conventions)

| Kiểu dữ liệu | Mục đích sử dụng                                                                       |
|--------------|----------------------------------------------------------------------------------------|
| INT          | Sử dụng cho các trường định danh, khóa chính (Primary Key) và khóa ngoại (Foreign Key) |
| VARCHAR      | Lưu trữ chuỗi ký tự ngắn                                                               |
| TEXT         | Lưu trữ nội dung văn bản dài hoặc mô tả                                                |
| DATETIME     | Lưu thời điểm bao gồm ngày và giờ                                                      |
| DECIMAL      | Lưu trữ các giá trị số chính xác                                                       |
| BIT          | Lưu trạng thái nhị phân (0: không, 1: có)                                              |


### 4.2. Chi tiết cấu trúc các bảng (Table Schema Details)

Dưới đây là chi tiết cấu trúc vật lý của các bảng trong cơ sở dữ liệu:
#### 4.2.1. Nhóm Quản lý người dùng và Phân quyền

**1. Bảng: `user`**

| Tên cột         | Kiểu dữ liệu | Khóa | Mặc định                                      | Ràng buộc       | Mô tả                                         |
|:----------------|:-------------|:----:|:----------------------------------------------|:----------------|:----------------------------------------------|
| `id`            | INT          |  PK  |                                               | AI              | Mã người dùng                                 |
| `email`         | VARCHAR(255) |      |                                               | UNIQUE, NOTNULL | Địa chỉ email                                 |
| `username`      | VARCHAR(100) |      |                                               | UNIQUE, NOTNULL | Tên đăng nhập                                 |
| `password`      | VARCHAR(255) |      |                                               |                 | Mật khẩu xác thực                             |
| `auth_provider` | ENUM         |      | LOCAL                                         |                 | Kiểu login của tài khoản                      |
| `provider_id`   | VARCHAR(255) |      |                                               |                 | Mã xác thực từ Google                         |
| `role_id`       | INT          |  FK  |                                               | NOTNULL         | Khóa ngoại tham chiếu tới bảng `role`         |
| `active`        | BIT          |      | TRUE                                          |                 | Trạng thái hoạt động                          |
| `created_at`    | DATETIME     |      | CURRENT_TIMESTAMP                             |                 | Thời gian tạo tài khoản                       |
| `updated_at`    | DATETIME     |      | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |                 | Thời gian cập nhật tài khoản cho lần gần nhất |

**2. Bảng: `profile`**

| Tên cột    | Kiểu dữ liệu  |  Khóa  | Mặc định                   | Ràng buộc       | Mô tả                                                |
|:-----------|:--------------|:------:|:---------------------------|:----------------|:-----------------------------------------------------|
| user_id    | INT           | PK, FK |                            | NOTNULL, UNIQUE | Mã người dùng, khóa ngoại tham chiếu tới bảng `user` |
| first_name | NVARCHAR(100) |        |                            | NOTNULL         | Tên của người dùng                                   |
| last_name  | NVARCHAR(100) |        |                            | NOTNULL         | Họ của người dùng                                    |
| avatar     | VARCHAR(255)  |        | /images/default-avatar.png |                 | Ảnh đại diện                                         |
| phone_num  | NVARCHAR(10)  |        |                            | UNIQUE          | Số điện thoại                                        |

**3. Bảng: `role`**
* Mô tả: Phân quyền hệ thống.
* Khóa chính: `role_id`

| Tên cột    | Kiểu dữ liệu | Khóa |                   Mặc định                    | Ràng buộc       | Mô tả                       |
|:-----------|:-------------|:----:|:---------------------------------------------:|:----------------|:----------------------------|
| id         | INT          |  PK  |                                               | AI              | Mã vai trò                  |
| name       | NVARCHAR(50) |      |                                               | NOTNULL, UNIQUE | Vai trò                     |
| active     | BIT          |      |                     TRUE                      |                 | Trạng thái hoạt động        |
| created_at | DATETIME     |      |               CURRENT_TIMESTAMP               |                 | Thời gian tạo               |
| updated_at | DATETIME     |      | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |                 | Thời gian cập nhật gần nhất |

---

#### 4.2.2. Nhóm Quản lý khóa học

**4. Bảng: `course`**

| Tên cột        | Kiểu dữ liệu  | Khóa | Mặc định                                      | Ràng buộc       | Mô tả                                  |
|:---------------|:--------------|:----:|:----------------------------------------------|:----------------|:---------------------------------------|
| id             | INT           |  PK  |                                               | AI              | Mã khóa học                            |
| name           | NVARCHAR(255) |      |                                               | NOTNULL, UNIQUE | Tên khóa học                           |
| price          | DECIMAL(8,2)  |      | 2000000                                       | NOTNULL         | Giá của khóa học                       |
| description    | TEXT          |      |                                               |                 | Mô tả về khóa học                      |
| image          | VARCHAR(255)  |      | /images/default-avatar.png                    |                 | Hình ảnh về khóa học                   |
| total_sessions | INT           |      | 0                                             | NOTNULL         | Tổng số buổi học                       |
| level_id       | INT           |  FK  |                                               | NOTNULL         | Khóa ngoại tham chiếu tới bảng `level` |
| active         | BIT           |      | TRUE                                          |                 | Trạng thái hoạt động                   |
| created_at     | DATETIME      |      | CURRENT_TIMESTAMP                             |                 | Thời gian tạo                          |
| updated_at     | DATETIME      |      | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |                 | Thời gian cập nhật gần nhất            |

**5. Bảng: `tag`**

| Tên cột    | Kiểu dữ liệu  | Khóa | Mặc định                                      | Ràng buộc       | Mô tả                       |
|:-----------|:--------------|:----:|:----------------------------------------------|:----------------|:----------------------------|
| id         | INT           |  PK  |                                               | AI              | Mã thẻ                      |
| name       | NVARCHAR(100) |      |                                               | NOTNULL, UNIQUE | Tên thẻ                     |
| active     | BIT           |      | TRUE                                          |                 | Trạng thái hoạt động        |
| created_at | DATETIME      |      | CURRENT_TIMESTAMP                             |                 | Thời gian tạo               |
| updated_at | DATETIME      |      | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |                 | Thời gian cập nhật gần nhất |


**6. Bảng: `course_tag`** 

| Tên cột   | Kiểu dữ liệu | Khóa | Mặc định | Ràng buộc | Mô tả                                   |
|:----------|:-------------|:----:|:---------|:----------|:----------------------------------------|
| course_id | INT          |  FK  |          | NOTNULL   | Khóa ngoại tham chiếu tới bảng `course` |
| tag_id    | INT          |  FK  |          | NOTNULL   | Khóa ngoại tham chiếu tới bảng `tag`    |

**7. Bảng: `level`**

| Tên cột     | Kiểu dữ liệu  | Khóa | Mặc định                                      | Ràng buộc       | Mô tả                |
|:------------|:--------------|:----:|:----------------------------------------------|:----------------|:---------------------|
| id          | INT           |  PK  |                                               | AI              | Mã cấp độ            |
| name        | NVARCHAR(100) |      |                                               | NOTNULL, UNIQUE | Tên cấp độ           |
| description | TEXT          |      |                                               |                 | Mô tả về cấp độ      |
| active      | BIT           |      | TRUE                                          |                 | Trạng thái hoạt động |
| created_at  | DATETIME      |      | CURRENT_TIMESTAMP                             |                 | Thời gian tạo        |
| updated_at  | DATETIME      |      | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |                 | Thời gian cập nhật   |

---

#### 4.2.3. Nhóm Quản lý lớp học và Lịch học

**8. Bảng: `class`**

| Tên cột    | Kiểu dữ liệu  | Khóa | Mặc định                                      | Ràng buộc       | Mô tả                                   |
|:-----------|:--------------|:----:|:----------------------------------------------|:----------------|:----------------------------------------|
| id         | INT           |  PK  |                                               | AI              | Mã lớp                                  |
| name       | NVARCHAR(100) |      |                                               | NOTNULL, UNIQUE | Tên lớp                                 |
| start_date | DATE          |      |                                               | NOTNULL         | Ngày bắt đầu                            |
| end_date   | DATE          |      |                                               | NOTNULL         | Ngày kết thúc                           |
| capacity   | INT           |      | 30                                            | NOTNULL         | Sĩ số tối đa                            |
| course_id  | INT           |  FK  |                                               | NOTNULL         | Khóa ngoại tham chiếu tới bảng `course` |
| active     | BIT           |      | TRUE                                          |                 | Trạng thái hoạt động                    |
| created_at | DATETIME      |      | CURRENT_TIMESTAMP                             |                 | Thời gian tạo                           |
| updated_at | DATETIME      |      | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |                 | Thời gian cập nhật                      |

**9. Bảng: `room`**

| Tên cột    | Kiểu dữ liệu | Khóa | Mặc định                                      | Ràng buộc       | Mô tả                       |
|:-----------|:-------------|:----:|:----------------------------------------------|:----------------|:----------------------------|
| id         | INT          |  PK  |                                               | AI              | Mã phòng học                |
| name       | VARCHAR(50)  |      |                                               | NOTNULL, UNIQUE | Tên phòng học               |
| capacity   | INT          |      | 30                                            | NOTNULL         | Sức chứa của phòng          |
| active     | BIT          |      | TRUE                                          |                 | Trạng thái hoạt động        |
| created_at | DATETIME     |      | CURRENT_TIMESTAMP                             |                 | Thời gian tạo               |
| updated_at | DATETIME     |      | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |                 | Thời gian cập nhật gần nhất |

**10. Bảng: `schedule`**

| Tên cột     | Kiểu dữ liệu | Khóa | Mặc định                                      | Ràng buộc | Mô tả                                  |
|:------------|:-------------|:----:|:----------------------------------------------|:----------|:---------------------------------------|
| id          | INT          |  PK  |                                               | AI        | Mã lịch học                            |
| class_id    | INT          |  FK  |                                               |           | Khóa ngoại tham chiếu tới bảng `class` |
| start_time  | TIME         |      |                                               | NOTNULL   | Giờ bắt đầu                            |
| end_time    | TIME         |      |                                               | NOTNULL   | Giờ kết thúc                           |
| room_id     | INT          |  FK  |                                               | NOTNULL   | Khóa ngoại tham chiếu tới bảng `room`  |
| day_of_week | INT          |      |                                               | NOTNULL   | Thứ trong tuần                         |
| active      | BIT          |      | TRUE                                          |           | Trạng thái hoạt động                   |
| created_at  | DATETIME     |      | CURRENT_TIMESTAMP                             |           | Thời gian tạo                          |
| updated_at  | DATETIME     |      | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |           | Thời gian cập nhật gần nhất            |

**11. Bảng: `session`**

| Tên cột     | Kiểu dữ liệu | Khóa | Mặc định                                      | Ràng buộc | Mô tả                                     |
|:------------|:-------------|:----:|:----------------------------------------------|:----------|:------------------------------------------|
| id          | INT          |  PK  |                                               | AI        | Mã buổi học                               |
| schedule_id | INT          |      |                                               |           | Khóa ngoại tham chiếu tới bảng `schedule` |
| user_id     | INT          |  FK  |                                               |           | Khóa ngoại tham chiếu tới bảng `user`     |
| start_time  | TIME         |      |                                               | NOTNULL   | Giờ bắt đầu                               |
| end_time    | TIME         |      |                                               | NOTNULL   | Giờ kết thúc                              |
| room_id     | INT          |  FK  |                                               |           | Khóa ngoại tham chiếu tới bảng `room`     |
| date        | DATE         |      |                                               | NOTNULL   | Ngày học cụ thể                           |
| active      | BIT          |      | TRUE                                          |           | Trạng thái hoạt động                      |
| created_at  | DATETIME     |      | CURRENT_TIMESTAMP                             |           | Thời gian tạo                             |
| updated_at  | DATETIME     |      | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |           | Thời gian cập nhật gần nhất               |

**12. Bảng: `teaching_assignment`** 

| Tên cột  | Kiểu dữ liệu | Khóa | Mặc định | Ràng buộc | Mô tả                                  |
|:---------|:-------------|:----:|:---------|:----------|:---------------------------------------|
| user_id  | INT          |  FK  |          | NOTNULL   | Khóa ngoại tham chiếu tới bảng `user`  |
| class_id | INT          |  FK  |          | NOTNULL   | Khóa ngoại tham chiếu tới bảng `class` |
| is_main  | BIT          |      | FALSE    |           | Là giáo viên chính                     |

---

#### 4.2.4. Nhóm Đăng ký và Thanh toán

**13. Bảng: `enrollment`**

| Tên cột           | Kiểu dữ liệu | Khóa | Mặc định                                      | Ràng buộc | Mô tả                                  |
|:------------------|:-------------|:----:|:----------------------------------------------|:----------|:---------------------------------------|
| id                | INT          |  PK  |                                               | AI        | Mã đăng ký/ghi danh                    |
| user_id           | INT          |  FK  |                                               | NOTNULL   | Khóa ngoại tham chiếu tới bảng `user`  |
| class_id          | INT          |  FK  |                                               | NOTNULL   | Khóa ngoại tham chiếu tới bảng `class` |
| enrollment_status | ENUM         |      | PENDING_PAYMENT                               |           | Trạng thái đăng ký                     |
| active            | BIT          |      | TRUE                                          |           | Trạng thái hoạt động                   |
| created_at        | DATETIME     |      | CURRENT_TIMESTAMP                             |           | Thời gian tạo                          |
| updated_at        | DATETIME     |      | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |           | Thời gian cập nhật gần nhất            |

**14. Bảng: `payment`**

| Tên cột        | Kiểu dữ liệu   | Khóa | Mặc định                                      | Ràng buộc | Mô tả                                       |
|:---------------|:---------------|:----:|:----------------------------------------------|:----------|:--------------------------------------------|
| id             | INT            |  PK  |                                               |           | Mã bản ghi thanh toán                       |
| enrollment_id  | INT            |  FK  |                                               |           | Khóa ngoại tham chiếu tới bảng `enrollment` |
| amount         | DECIMAL(10, 2) |      |                                               | NOTNULL   | Số tiền thanh toán                          |
| payment_method | ENUM           |      | BANKING                                       |           | Phương thức thanh toán                      |
| payment_status | ENUM           |      | PENDING                                       |           | Trạng thái thanh toán                       |
| transaction_id | VARCHAR(255)   |      |                                               | UNIQUE    | Mã giao dịch từ cổng thanh toán             |
| paid_at        | DATETIME       |      |                                               |           | Thời gian thanh toán thành công             |
| created_at     | DATETIME       |      | CURRENT_TIMESTAMP                             |           | Thời gian tạo                               |
| updated_at     | DATETIME       |      | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |           | Thời gian cập nhật gần nhất                 |

---

#### 4.2.5. Nhóm Kết quả học tập

**15. Bảng: `attendance`**

| Tên cột           | Kiểu dữ liệu | Khóa | Mặc định                                      | Ràng buộc | Mô tả                                       |
|:------------------|:-------------|:----:|:----------------------------------------------|:----------|:--------------------------------------------|
| enrollment_id     | INT          |  FK  |                                               | NOTNULL   | Khóa ngoại tham chiếu tới bảng `enrollment` |
| session_id        | INT          |  FK  |                                               | NOTNULL   | Khóa ngoại tham chiếu tới bảng `session`    |
| attendance_status | ENUM         |      | ABSENT                                        |           | Trạng thái điểm danh                        |
| note              | TEXT         |      |                                               |           | Ghi chú                                     |
| created_at        | DATETIME     |      | CURRENT_TIMESTAMP                             |           | Thời gian tạo                               |
| updated_at        | DATETIME     |      | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |           | Thời gian cập nhật gần nhất                 |

**16. Bảng: `academic_result`**

| Tên cột       | Kiểu dữ liệu | Khóa | Mặc định                                      | Ràng buộc       | Mô tả                                       |
|:--------------|:-------------|:----:|:----------------------------------------------|:----------------|:--------------------------------------------|
| id            | INT          |  PK  |                                               | AI              | Mã kết quả học tập                          |
| enrollment_id | INT          |  FK  |                                               | NOTNULL, UNIQUE | Khóa ngoại tham chiếu tới bảng `enrollment` |
| average_score | FLOAT        |      | 0.0                                           |                 | Điểm trung bình                             |
| comment       | TEXT         |      |                                               |                 | Nhận xét                                    |
| active        | BIT          |      | TRUE                                          |                 | Trạng thái hoạt động                        |
| created_at    | DATETIME     |      | CURRENT_TIMESTAMP                             |                 | Thời gian tạo                               |
| updated_at    | DATETIME     |      | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |                 | Thời gian cập nhật gần nhất                 |

**17. Bảng: `score`**

| Tên cột       | Kiểu dữ liệu | Khóa | Mặc định                                      | Ràng buộc | Mô tả                                       |
|:--------------|:-------------|:----:|:----------------------------------------------|:----------|:--------------------------------------------|
| id            | INT          |  PK  |                                               | AI        | Mã điểm                                     |
| enrollment_id | INT          |  FK  |                                               | NOTNULL   | Khóa ngoại tham chiếu tới bảng `enrollment` |
| score_value   | FLOAT        |      |                                               |           | Số điểm                                     |
| score_type_id | INT          |  FK  |                                               | NOTNULL   | Khóa ngoại tham chiếu tới bảng `score_type` |
| active        | BIT          |      | TRUE                                          |           | Trạng thái hoạt động                        |
| created_at    | DATETIME     |      | CURRENT_TIMESTAMP                             |           | Thời gian tạo                               |
| updated_at    | DATETIME     |      | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |           | Thời gian cập nhật gần nhất                 |

**18. Bảng: `score_type`**

| Tên cột    | Kiểu dữ liệu  | Khóa | Mặc định                                      | Ràng buộc       | Mô tả                                   |
|:-----------|:--------------|:----:|:----------------------------------------------|:----------------|:----------------------------------------|
| id         | INT           |  PK  |                                               | AI              | Mã cột điểm                             |
| name       | NVARCHAR(255) |      |                                               | NOTNULL, UNIQUE | Tên cột điểm                            |
| weight     | FLOAT         |      |                                               | NOTNULL         | Hệ số                                   |
| course_id  | INT           |  FK  |                                               | NOTNULL         | Khóa ngoại tham chiếu tới bảng `course` |
| active     | BIT           |      | TRUE                                          |                 | Trạng thái hoạt động                    |
| created_at | DATETIME      |      | CURRENT_TIMESTAMP                             |                 | Thời gian tạo                           |
| updated_at | DATETIME      |      | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |                 | Thời gian cập nhật gần nhất             |

### 4.3. Chỉ mục và Ràng buộc (Indexes & Constraints)
#### 4.3.1. Chỉ mục (Indexes)

| Bảng                | Chỉ mục                                                      | Lý do                                                               |
|:--------------------|:-------------------------------------------------------------|:--------------------------------------------------------------------|
| enrollment          | idx_enrollment_user (user_id)                                | Tăng tốc truy vấn và JOIN khi tìm các lớp của một user              |
| enrollment          | idx_enrollment_class (class_id)                              | Tăng tốc truy vấn danh sách học viên trong một lớp                  |
| enrollment          | uk_enrollment_user_class (user_id, class_id)                 | Ngăn chặn user đăng ký cùng một lớp nhiều lần                       |
| payment             | idx_payment_enrollment (enrollment_id)                       | Tăng tốc truy vấn lịch sử thanh toán theo enrollment                |
| attendance          | idx_attendance_enrollment (enrollment_id)                    | Tăng tốc truy vấn điểm danh của một học viên                        |
| attendance          | idx_attendance_session (session_id)                          | Tăng tốc truy vấn danh sách điểm danh theo buổi học                 |
| attendance          | uk_attendance_enrollment_session (enrollment_id, session_id) | Ngăn chặn điểm danh trùng cho cùng một học viên trong cùng một buổi |
| score               | idx_score_enrollment (enrollment_id)                         | Tăng tốc truy vấn bảng điểm của học viên                            |
| score               | idx_score_type (score_type_id)                               | Tăng tốc JOIN với bảng loại điểm                                    |
| session             | idx_session_schedule (schedule_id)                           | Tăng tốc truy vấn các buổi học theo lịch                            |
| session             | idx_session_room (room_id)                                   | Tăng tốc truy vấn lịch sử dụng phòng học                            |
| session             | idx_session_teacher (user_id)                                | Tăng tốc truy vấn các buổi dạy của giáo viên                        |
| schedule            | idx_schedule_class (class_id)                                | Tăng tốc truy vấn lịch học của một lớp                              |
| schedule            | idx_schedule_room (room_id)                                  | Tăng tốc kiểm tra lịch phòng học                                    |
| teaching_assignment | uk_teacher_class (user_id, class_id)                         | Đảm bảo một giáo viên không được gán trùng cho cùng một lớp         |
| course_tag          | uk_course_tag (course_id, tag_id)                            | Ngăn chặn một tag bị gán nhiều lần cho cùng một khóa học            |


#### 4.3.2. Ràng buộc dữ liệu (Constraints)
* **Ràng buộc toàn vẹn tham chiếu (Referential Integrity)**
  - Tất cả các trường Foreign key phải tham chiếu tới bản ghi hợp lệ ở bản cha.
  - Không được phép xóa bản ghi ở bảng cha nếu vẫn còn bản ghi con tham chiếu tới nó.

* **Ràng buộc miền giá trị (Domain Constraints)**
  - Ràng buộc thời gian

      | Bảng     | Ràng buộc              |
      |:---------|:-----------------------|
      | class    | end_date >= start_date |
      | schedule | end_time > start_time  |
    
  - Ràng buộc giá trị số

      | Bảng            | Trường         | Ràng buộc                |
      |:----------------|:---------------|:-------------------------|
      | course          | price          | price >= 0               |
      | course          | total_sessions | total_sessions > 0       |
      | class           | capacity       | capacity > 0             |
      | room            | capacity       | capacity > 0             |
      | payment         | amount         | amount >= 0              |
      | academic_result | average_score  | 0 <= average_score <= 10 |
      | score           | score_value    | 0 <= score_value <= 10   |
      | score_type      | weight         | 0 < weight <= 3          |
      | schedule        | day_of_week    | 1 <= day_of_week <= 7    |

* **Ràng buộc Enum (Enumerated Values)**   

  | Bảng       | Trường            | Ràng buộc                                    |
  |:-----------|:------------------|:---------------------------------------------|
  | user       | auth_provider     | LOCAL, GOOGLE, FACEBOOK                      |
  | enrollment | enrollment_status | SUCCESS, PENDING_PAYMENT, EXPIRED, CANCELLED |
  | payment    | payment_method    | MoMo, Banking, Stripe                        |
  | payment    | payment_status    | SUCCESS, FAILED, PENDING, CANCELLED          |
  | attendance | attendance_status | ABSENT, LATE, PRESENT                        |

* **Ràng buộc logic nghiệp vụ** 
  - Một học viên chỉ được đăng ký một lần cho mỗi lớp.
  - Một học viên chỉ có một bản ghi điểm danh cho mỗi buổi học.
  - Một khóa học không thể có tag trùng lập.
  - Một giáo viên không thể được gán trùng cho cùng 1 lớp.

---

## 5. Vận hành & Bảo mật cơ bản (Security & Backup)

### 5.1. Phân quyền truy cập (Security)
- Hệ thống áp dụng cơ chế phân quyền truy cập cơ bản nhằm đảm bảo dữ liệu được bảo vệ và chỉ các thành phần được phép mới có thể truy cập vào CSDL.
- Ứng dụng backend sử dụng tài khoản quản trị của CSDL để thực hiện các thao tác truy vấn và cập nhật dữ liệu.
- Thông tin kết nối CSDL được lưu trữ trong biến môi trường nhằm đảm bảo an toàn và tránh lộ thông tin nhạy cảm trong mã nguồn.

### 5.2. Kế hoạch Sao lưu (Backup & Restore)
Để đảm bảo an toàn dữ liệu, hệ thống hỗ trợ sao lưu và khôi phục CSDL bằng các công cụ có sẵn của hệ quản trị cơ sở dữ liệu (**MySQL**). 

Trong trường hợp cần sao lưu dữ liệu, có thể sử dụng công cụ backup của hệ quản trị cơ sở dữ liệu để tạo bản sao lưu toàn bộ CSDL dưới dạng file SQL.

Trong trường hợp cần khôi phục dữ liệu, file backup có thể được sử dụng để restore lại CSDL. Cơ chế này cho phép quản trị viên dễ dàng sao lưu và phục hồi dữ liệu khi cần thiết.

---

## 6. Phụ lục (Appendix)

### 6.1. Script khởi tạo Database (DDL SQL Scripts)
Hệ thống sử dụng ORM để quản lý cấu trúc CSDL. Các bảng và ràng buộc được định nghĩa thông qua các model trong backend application. ORM sẽ tự động sinh ra các câu lệnh DDL (CREATE TABLE, ALTER TABLE, …) thông qua cơ chế migration.