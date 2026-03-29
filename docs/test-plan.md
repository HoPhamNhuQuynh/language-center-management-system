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
Kiểm thử hiệu năng hệ thống.  
Kiểm thử bảo mật nâng cao.  
Kiểm thử trên nhiều thiết bị hoặc nền tảng khác nhau.  
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

Dưới đây là bảng phân công vai trò và trách nhiệm cụ thể của các thành viên trong dự án:

| Vai trò | Thành viên | Trách nhiệm chính |
| :--- | :--- | :--- |
| **Tester (Chuyên trách)** | Nguyễn Thị Ngọc Trâm | - Thiết kế các kịch bản kiểm thử (Test Case) chi tiết.<br>- Thực hiện kiểm thử thủ công (Manual Test).<br>- Log lỗi và theo dõi trạng thái sửa lỗi. |
| **Developer FE & Tester** | Hồ Phạm Ngọc Hân | - Phát triển giao diện người dùng (Front-end).<br>- Thực hiện Unit Test cho các module Front-end.<br>- Hỗ trợ thực hiện kiểm thử hệ thống. |
| **Developer BE & Tester** | Trần Mỹ Ân, Hồ Phạm Như Quỳnh | - Phát triển logic và cơ sở dữ liệu .<br>- Thực hiện Unit Test cho các API.<br>- Hỗ trợ kiểm thử tích hợp . |
| **Developer (Fix Bug)** | Hồ Phạm Ngọc Hân, Trần Mỹ Ân, Hồ Phạm Như Quỳnh | - Tiếp nhận báo cáo lỗi từ Tester.<br>- Thực hiện sửa lỗi (Fix Bug) trong phần code mình phụ trách. |
  
## 6. ENTRY AND EXIT CRITERIA

### 6.1 Entry Criteria
Hoạt động kiểm thử chỉ được bắt đầu khi đáp ứng các điều kiện sau:
- Tài liệu đặc tả yêu cầu và kịch bản kiểm thử (Test Cases) đã hoàn tất.
- Môi trường kiểm thử đã được thiết lập ổn định (Database, Server, UI).
- Các tính năng cần test đã được Developer bàn giao (Build xong).
- Đã có dữ liệu giả lập đầy đủ cho các luồng nghiệp vụ chính.

### 6.2 Exit Criteria
Hoạt động kiểm thử kết thúc khi đạt các tiêu chí sau:
- 100% các kịch bản kiểm thử đã được thực hiện.
- Tỷ lệ các kịch bản kiểm thử thành công (Pass) đạt từ 95% trở lên.
- Không còn lỗi ở mức độ "Critical" (Nghiêm trọng) và "Major" (Lớn) tồn tại trong hệ thống.
- Các lỗi còn lại (Minor/Trivial) đã được ghi nhận và có kế hoạch xử lý sau.
- Báo cáo tổng kết kiểm thử đã được hoàn thiện và gửi cho nhóm.

## 7. SUSPENSION CRITERIA AND RESUMPTION REQUIREMENTS

### 7.1 Suspension Criteria
Hoạt động kiểm thử sẽ bị tạm dừng nếu xảy ra một trong các trường hợp sau:
- Hệ thống gặp lỗi nghiêm trọng (Crash) ngay khi khởi động hoặc trong các luồng nghiệp vụ chính.
- Số lượng lỗi nghiêm trọng (Critical bugs) quá nhiều, gây cản trở việc thực hiện các kịch bản kiểm thử tiếp theo.
- Môi trường kiểm thử (Database, Server) không ổn định hoặc bị mất dữ liệu.
- Bản build được bàn giao bị lỗi, không thể cài đặt hoặc truy cập.

### 7.2 Resumption Requirements
Hoạt động kiểm thử sẽ được tiếp tục sau khi:
- Các lỗi gây sập hệ thống hoặc gây chặn (Blockers) đã được Developer khắc phục và xác nhận.
- Môi trường kiểm thử được khôi phục về trạng thái ổn định.
- Developer bàn giao bản build mới đã qua kiểm tra sơ bộ, đảm bảo các tính năng chính có thể truy cập được.

## 8. TEST STRATEGY 
Chiến lược kiểm thử này mô tả cách tiếp cận toàn diện để đảm bảo chất lượng cho hệ thống quản lý trung tâm ngoại ngữ. Bao gồm việc xác định các loại kiểm thử, vòng đời lỗi, cũng như cách phân loại mức độ nghiêm trọng và độ ưu tiên của lỗi, giúp đội ngũ tối ưu hóa thời gian và nguồn lực.

### 8.1 QA Role in Test Process (Vai trò của QA trong quy trình test)

Đội ngũ QA giữ vai trò then chốt trong suốt vòng đời phát triển dự án, không chỉ là tìm lỗi mà còn đảm bảo quy trình làm việc được thực hiện đúng chuẩn:
* **Tham gia phân tích yêu cầu:** QA đọc và phân tích tài liệu yêu cầu ngay từ giai đoạn đầu để phát hiện các lỗ hổng logic hoặc yêu cầu không rõ ràng.
* **Thiết kế Test Case/Test Plan:** Xây dựng các kịch bản kiểm thử chi tiết và lập kế hoạch kiểm thử tổng thể.
* **Thực hiện kiểm thử:** Tiến hành các loại kiểm thử (chức năng, tích hợp, hồi quy) theo test case đã thiết kế.
* **Báo cáo và quản lý lỗi:** Ghi lại lỗi chính xác, theo dõi tiến độ sửa lỗi của Dev và thực hiện kiểm tra lại.
* **Đảm bảo chất lượng sản phẩm:** Đánh giá độ ổn định của hệ thống trước khi quyết định cho phép bàn giao (Deploy).

### 8.2 Bug Life Cycle (Vòng đời của lỗi)

Để quản lý lỗi hiệu quả và đảm bảo không có lỗi nào bị bỏ sót, dự án sẽ áp dụng vòng đời lỗi chuẩn như sau:

| Trạng thái | Mô tả | Người thực hiện chính |
| :--- | :--- | :--- |
| **New** | Tester phát hiện lỗi và tạo báo cáo lỗi (Bug Report). | Tester |
| **Open** | Lỗi đã được tạo, đang chờ Dev xem xét. | PM |
| **Assigned** | Lỗi được chỉ định cho một Developer cụ thể để sửa. | Developer |
| **Fixed** | Developer đã sửa xong lỗi ở môi trường Dev và chuyển trạng thái để chờ kiểm tra. | Developer |
| **Retest** | Tester tiến hành kiểm tra lại trên môi trường Staging/Test xem lỗi đã thực sự được sửa chưa. | Tester |
| **Closed** | Lỗi đã được sửa và không còn ảnh hưởng đến hệ thống, chính thức đóng lỗi. | Tester |



### 8.3 Testing Types 
(Liệt kê các loại test: Functional, Regression, Integration, v.v.)

### 8.4 Bug Severity and Priority Definition 

Việc phân loại mức độ nghiêm trọng và độ ưu tiên giúp nhóm tập trung nguồn lực vào những lỗi quan trọng nhất, đảm bảo tính ổn định của hệ thống.

* **Mức độ nghiêm trọng (Severity):** Tác động kỹ thuật của lỗi đến hệ thống.
* **Độ ưu tiên (Priority):** Mức độ khẩn cấp cần sửa lỗi.

#### Severity List

| Mức độ | Tên | Định nghĩa và ví dụ |
| :---: | :--- | :--- |
| **1** | **Critical (Chí mạng)** | **Định nghĩa:** Lỗi làm hệ thống sập, không thể hoạt động được, gây mất dữ liệu nghiêm trọng. Không có phương án thay thế.<br>**Ví dụ:** Không thể đăng nhập vào hệ thống với tài khoản admin, trang chủ bị lỗi 500, không thể thực hiện giao dịch thanh toán. |
| **2** | **High (Nghiêm trọng)** | **Định nghĩa:** Lỗi làm các chức năng chính không hoạt động nhưng không sập hệ thống. Có phương án thay thế nhưng phức tạp.<br>**Ví dụ:** Lỗi chức năng đăng ký khóa học mới, không thể xuất báo cáo tài chính hàng tháng, tính sai học phí. |
| **3** | **Medium (Trung bình)** | **Định nghĩa:** Lỗi làm các chức năng nhỏ hoặc phụ hoạt động sai yêu cầu, không ảnh hưởng đến luồng chính.<br>**Ví dụ:** Hiển thị sai định dạng ngày tháng trong báo cáo, các trường nhập liệu không giới hạn ký tự. |
| **4** | **Low (Thấp)** | **Định nghĩa:** Lỗi giao diện, lỗi chính tả, lỗi UX nhẹ, không ảnh hưởng đến chức năng kỹ thuật.<br>**Ví dụ:** Sai lỗi chính tả trên, giao diện bị lệch nhẹ trên trình duyệt cũ, màu sắc nút bấm không đúng thiết kế. |

#### Priority List 

| Mức độ | Tên | Định nghĩa và ví dụ |
| :---: | :--- | :--- |
| **P1** | **Urgent (Khẩn cấp)** | **Định nghĩa:** Cần sửa lỗi ngay lập tức để Tester có thể tiếp tục làm việc, hoặc lỗi ảnh hưởng đến tiến độ bàn giao sản phẩm.<br>**Ví dụ:** Lỗi Critical ở mục trên, lỗi khiến Tester không thể kiểm tra các chức năng khác. |
| **P2** | **High (Sớm)** | **Định nghĩa:** Cần sửa lỗi trong thời gian sớm nhất, trước khi bàn giao phiên bản hiện tại.<br>**Ví dụ:** Lỗi High ở mục trên, lỗi gây khó chịu lớn cho người dùng. |
| **P3** | **Medium (Trung bình)** | **Định nghĩa:** Có thể sửa lỗi sau khi các lỗi P1, P2 đã hoàn tất, không ảnh hưởng đến tiến độ bàn giao.<br>**Ví dụ:** Lỗi Medium ở mục trên, lỗi ít ảnh hưởng đến trải nghiệm người dùng. |
| **P4** | **Low (Sau)** | **Định nghĩa:** Có thể sửa lỗi trong các phiên bản sau, hoặc khi có thời gian rảnh.<br>**Ví dụ:** Lỗi Low ở mục trên, các lỗi chính tả, giao diện nhỏ.


## 9. RESOURCE AND ENVIRONMENT NEEDS

Mô tả các yêu cầu về phần cứng, phần mềm, công cụ và môi trường cần thiết để nhóm QA và Developer thực hiện kiểm thử hệ thống một cách hiệu quả, bám sát với kiến trúc công nghệ của dự án.

### 9.1 Testing Tools
Để đảm bảo tính chính xác và tối ưu hóa hiệu suất trong quá trình kiểm soát chất lượng phần mềm, nhóm triển khai phối hợp các bộ công cụ chuyên dụng cho từng loại hình kiểm thử cụ thể:

- **Hệ thống quản lý kiểm thử và báo cáo lỗi:**
    * **Microsoft Excel / Google Sheets:** Được sử dụng làm nền tảng chính để xây dựng và lưu trữ hệ thống kịch bản kiểm thử (Test Cases). Giúp theo dõi trạng thái thực thi và quản lý dữ liệu đầu vào một cách trực quan.
    * **GitHub Issues:** Là hệ thống quản lý lỗi tập trung (Defect Management System). Mọi sai sót phát hiện được trong quá trình kiểm thử sẽ được ghi nhận tại đây dưới dạng các "Issues" với đầy đủ thông tin về mức độ nghiêm trọng, hình ảnh minh chứng và quy trình tái hiện lỗi.

- **Công cụ kiểm thử kỹ thuật và tự động hóa:**
    * **Postman:** Sử dụng Postman để kiểm tra tính đúng đắn của các phương thức (GET, POST, PUT, DELETE) từ Django Backend, đảm bảo dữ liệu phản hồi khớp với tài liệu đặc tả trước khi tích hợp vào Frontend.
    * **Kiểm thử tự động (Automation Testing):** Tích hợp ngôn ngữ lập trình Python kết hợp với framework pytest trong môi trường Visual Studio Code, cho phép xây dựng các kịch bản kiểm thử tự động cho các luồng nghiệp vụ quan trọng
- **Công cụ hỗ trợ khác:** Các phần mềm chụp ảnh và quay video màn hình (Snipping Tool,...) được sử dụng để trích xuất minh chứng, phục vụ cho việc đính kèm vào báo cáo lỗi nhằm hỗ trợ đội ngũ Developer trong quá trình định danh và khắc phục sai sót.

### 9.2 Configuration Management (Quản lý cấu hình)

Quản lý cấu hình nhằm đảm bảo tính toàn vẹn của mã nguồn, kiểm soát các phiên bản tài liệu và duy trì sự đồng bộ giữa các thành viên trong suốt vòng đời kiểm thử.

- **Hệ thống quản lý phiên bản:** Dự án sử dụng Git làm hệ thống quản lý phiên bản chính để theo dõi mọi thay đổi trong mã nguồn (Source code) và tài liệu kiểm thử. Toàn bộ dữ liệu được lưu trữ tập trung trên nền tảng GitHub tại repository chính thức của nhóm.

- **Chiến lược phân nhánh và tích hợp:** Để đảm bảo quy trình kiểm thử diễn ra ổn định, nhóm áp dụng chiến lược phân nhánh như sau:
    * **Nhánh Main:** Chứa mã nguồn đã qua kiểm duyệt, đạt tiêu chuẩn xuất bản và bàn giao. Đây là phiên bản cuối cùng sau khi đã vượt qua các tiêu chí kết thúc kiểm thử.
    * **Nhánh Develop:** Đóng vai trò là môi trường tích hợp mã nguồn từ các thành viên Frontend và Backend. Đây là phân vùng trọng tâm để đội ngũ QA tiến hành các hoạt động thực thi kiểm thử.
    * **Nhánh Feature:** Các tính năng mới hoặc hoạt động sửa lỗi phải được thực hiện trên các nhánh độc lập (Ví dụ: `docs/test-plan`,...) trước khi được yêu cầu gộp (Pull Request) vào nhánh Develop để kiểm thử tích hợp.

- **Quản lý tài liệu kiểm thử:** Mọi tài liệu liên quan bao gồm Test Plan, Test Cases và các báo cáo kết quả đều được quản lý tập trung, đánh số phiên bản rõ ràng nhằm đảm bảo tất cả thành viên đều tiếp cận với dữ liệu mới nhất, tránh sai lệch trong quá trình đối soát lỗi.

### 9.3 Test Environment (Môi trường kiểm thử)

Môi trường kiểm thử được thiết lập nhằm giả lập tối đa các điều kiện vận hành thực tế của hệ thống, đồng thời đảm bảo sự tương thích hoàn toàn với kiến trúc công nghệ ReactJS, Django và MySQL.

- **Cấu hình hạ tầng kỹ thuật:**
    * **Hệ điều hành:** Sử dụng các nền tảng Windows 10/11 và macOS, hỗ trợ việc kiểm soát tính đa nền tảng của ứng dụng.
    * **Yêu cầu phần cứng:** Thiết bị phần cứng được quy định tối thiểu 8GB RAM và CPU thế hệ mới (Core i5/Ryzen 5 trở lên) nhằm đảm bảo khả năng vận hành đồng thời các dịch vụ Frontend, Backend và hệ quản trị cơ sở dữ liệu mà không gây hiện tượng nghẽn tài nguyên, ảnh hưởng đến kết quả đo lường hiệu năng.

- **Thiết lập môi trường phần mềm và trình duyệt:**
    * **Kiểm thử đa trình duyệt:** Trình duyệt Google Chrome được xác định là môi trường kiểm thử trọng tâm để tối ưu hóa hiệu suất của ReactJS. Ngoài ra, Microsoft Edge và Safari được sử dụng làm môi trường đối soát để đảm bảo tính đồng nhất về giao diện (UI) và trải nghiệm người dùng (UX) trên các trình duyệt khác nhau.
    * **Dịch vụ Backend:** Hệ thống Backend dựa trên framework Django được thiết lập tập trung vào việc kiểm thử các điểm cuối của RESTful API. Quá trình kiểm thử chú trọng vào tính chính xác của dữ liệu phản hồi và khả năng xử lý các yêu cầu đồng thời từ phía người dùng.

- **Quản lý dữ liệu và Server:**
    * **Phân vùng lưu trữ:** Toàn bộ dữ liệu kiểm thử được quản lý tập trung trên hệ quản trị CSDL MySQL. Nhóm thực hiện truy vấn trực tiếp thông qua công cụ quản trị để xác minh tính toàn vẹn và chính xác của dữ liệu sau mỗi thao tác nghiệp vụ.
    * **Triển khai nội bộ:** Trong giai đoạn này, hoạt động kiểm thử được thực hiện chủ yếu trên môi trường Localhost để đảm bảo tốc độ phản hồi nhanh và tính bảo mật cao trong quá trình phát triển sơ bộ.
## 10. TEST SCHEDULE  
| Giai đoạn  | Nội dung                                                    | Thời gian               |
|-------------|-------------------------------------------------------------|-------------------------|
| Chuẩn bị    | Chuẩn bị môi trường kiểm thử, thiết kế các test case       | 17-03-2026 - 22-03-2026 |
| Thực hiện   | Kiểm thử các chức năng hệ thống                             | 19-03-2026 - 29-03-2026 |
| Sửa lỗi     | Sửa các lỗi đã phát hiện và thực hiện kiểm thử lại          | 25-03-2026 - 05-04-2026 |
| Báo cáo     | Tổng hợp kết quả kiểm thử và báo cáo                        | 02-04-2026 - 12-04-2026 |

## 11. APPROVALS  
Hồ Phạm Như Quỳnh  
Trần Mỹ Ân  
Hồ Phạm Ngọc Hân  

## 12. TERMS / ACRONYMS  
| Viết tắt | Tên đầy đủ                     | Ý nghĩa                                                                 |
|----------|--------------------------------|-------------------------------------------------------------------------|
| QA       | Quality Assurance              | Đảm bảo chất lượng phần mềm, chịu trách nhiệm kiểm thử và quy trình     |
| FE       | Front-end                      | Phần giao diện người dùng của hệ thống                                 |
| BE       | Back-end                       | Phần xử lý logic và cơ sở dữ liệu phía server                          |
| UI       | User Interface                 | Giao diện người dùng                                                    |
| API      | Application Programming Interface | Giao diện lập trình ứng dụng, cho phép các hệ thống giao tiếp với nhau |
| PM       | Project Manager                | Người quản lý dự án                                                     |
| Dev      | Developer                      | Lập trình viên                                                         |
| DB       | Database                       | Cơ sở dữ liệu                                                          |
| GET      | HTTP GET Method                | Phương thức lấy dữ liệu từ server                                      |
| POST     | HTTP POST Method               | Phương thức gửi dữ liệu lên server                                     |
| PUT      | HTTP PUT Method                | Phương thức cập nhật dữ liệu                                           |
| DELETE   | HTTP DELETE Method             | Phương thức xóa dữ liệu                                                |
| UX       | User Experience                | Trải nghiệm người dùng                                                 |
| RAM      | Random Access Memory           | Bộ nhớ truy cập ngẫu nhiên của máy tính                                |
| CPU      | Central Processing Unit        | Bộ xử lý trung tâm                                                     |
| REST     | Representational State Transfer | Kiến trúc thiết kế API                                                |
| CRUD     | Create Read Update Delete      | Các thao tác cơ bản với dữ liệu                                        |

