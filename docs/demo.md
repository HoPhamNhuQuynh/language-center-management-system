# TRÌNH BÀY DEMO SẢN PHẨM SAU QUÁ TRÌNH PHÁT TRIỂN PHẦN MỀM CÓ ÁP DỤNG GIAI ĐOẠN KIỂM THỬ

# 1. Tài khoản demo
Trong hệ thống tồn tại 3 phân hệ chính đó là Admin, giáo viên và học viên. Vì vậy, để thuận tiện cho quá trình kiểm thử và demo hệ thống thì nhóm đã chuẩn bị các tài khoản kiểm thử sau đây:
- Admin:
    - Username: Admin
    - Password: 123

- Teacher: 
    - Username: teacher_van_539
    - Password: Abc123@

- Student: 
    - Username: student_anh_171
    - Password: Abc123@

**Lưu ý: để đảm báo tính bảo mật và tránh lộ thông tin nhạy cảm thì các dữ liệu tài khoản trên chỉ phục vụ cho mục đích kiểm thử và không được áp dụng khi chạy trong thực tế (Production).**

# 2. Trình bày demo

## Nhóm màn hình dùng chung cho các phân hệ người dùng
### Màn hình đăng nhập
Sau khi đã có tài khoản thì người dùng (học viên) sẽ sử dụng màn hình này để đăng nhập vào hệ thống của trung tâm. Hệ thống sẽ yêu cầu người dùng nhập đầy đủ username và password đúng mới được xem là đăng nhập thành công. Bên cạnh đó, người dùng cũng có thể lựa chọn đăng nhập bằng các dịch vụ bên thứ ba như Google hay Facebook.

![Màn hình đăng nhập](./screenshots/Demo/login.png)

### Màn hình trang chủ
Màn hình này sẽ được hiển thị cho tất cả người dùng có thể truy cập và cho phép cả người dùng tự do nhằm cung cấp các thông tin tổng quan của trung tâm đến với những khách hàng tiềm năng.

![Màn hình trang chủ](./screenshots/Demo/home.png)

### Màn hình về chúng tôi
Màn hình này hiển thị thông tin chi tiết hơn và cung cấp chi tiết các thông tin về hệ thống nhằm đáp ứng nhu cầu tìm hiểu thêm về trung tâm của người dùng.

![Màn hình về chúng tôi](./screenshots/Demo/about_us.png)

### Màn hình xem lịch học và lịch dạy của học viên và giáo viên
Màn hình này chỉ cho phép user là học viên và giáo viên được phép xem lịch học và lịch dạy của bản thân mà không được phép xem lịch học hay lịch dạy của user khác.

![Màn hình xem lịch học và lịch dạy của học viên và giáo viên](./screenshots/Demo/schedule.png)

## Nhóm các màn hình cho phân hệ học viên
### Màn hình đăng ký tài khoản
Những người dùng tự do sẽ sử dụng màn hình này để đăng ký tài khoản người dùng để sử dụng các dịch vụ hệ thống. Hệ thống sẽ yêu cầu người dùng nhập đầy đủ các thông tin cá nhân như họ và tên, số điện thoại, username và pasword,... với định dạng đúng theo yêu cầu mới được xem là đăng ký thành công. Bên cạnh đó, người dùng cũng có thể lựa chọn đăng ký bằng các dịch vụ bên thứ ba như Google hay Facebook.

![Màn hình đăng ký tài khoản](./screenshots/Demo/register.png)

### Màn hình xem danh sách các khóa học của trung tâm
Màn hình này sẽ được hiển thị cho tất cả người dùng có thể truy cập và cho phép cả người dùng tự do và cung cấp toàn bộ danh sách các khóa học đang còn hoạt động của trung tâm.

![Màn hình xem danh sách các khóa học của trung tâm](./screenshots/Demo/course_list.png)

### Màn hình quản lý thông tin cá nhân học viên
Khi học viên muốn thay đổi thông tin đối với tài khoản cá nhân thì có thể truy cập vào màn hình này và màn hình chỉ được hiển thị với các user là học viên và chỉ user đó thấy được thông tin của chính mình mà không ảnh hưởng tời các học viên khác.

![Màn hình quản lý thông tin cá nhân](./screenshots/Demo/student_info.png)

### Màn hình xem kết quả học tập
Màn hình cho phép học viên xem kết quả học tập theo từng lớp học đã đăng ký để quản lý và điều chỉnh cải thiện cho kết quả tốt hơn.

![Màn hình xem kết quả học tập](./screenshots/Demo/academic_result.png)

### Màn hình đăng ký khóa học
Màn hình cho phép học viên đăng ký các lớp học của trung tâm và chỉ có thể truy cập sau khi đã đăng nhập hệ thống.

![Màn hình đăng ký khóa học](./screenshots/Demo/course_register.png)

### Màn hình xem lịch sử thanh toán học phí
Màn hình này cho phép học viên quản lý và kiểm tra các giao dịch đã thực hiện trong suốt quá trình tham gia học tập tại trung tâm.

![Màn hình xem lịch sử thanh toán học phí](./screenshots/Demo/payment_history.png)

### Màn hình thanh toán học phí
Màn hình này sẽ hiển thị sau khi học viên nhấn đăng ký khóa học.

![Màn hình thanh toán học phí](./screenshots/Demo/payment.png)

### Màn hình xác nhận thanh toán
Màn hình này nhằm đảm bảo rằng học viên đã sẵn sàng và chắc chắn tham gia khóa học và sau khi học viên nhấn "Xác nhận" thì hệ thống tiến hành lưu các thông tin đăng ký và chuyển hướng user tới trang thanh toán.

![Màn hình xác nhận thanh toán](./screenshots/Demo/payment2.png)

### Màn hình xem biên lai
Sau khi thanh toán thành công, màn hình sẽ hiển thị bản xem trước và cho phép học viên in biên lai làm minh chứng đăng ký khóa học.

![Màn hình xem biên lai](./screenshots/Demo/bill.png)

## Nhóm các màn hình cho phân hệ giáo viên
### Màn hình điểm danh
Màn hình này cho phép giáo viên điểm danh cho các buổi học mà giáo viên đó phụ trách giảng dạy. Giáo viên chỉ có thể điểm danh cho lớp học khi mà buổi học đó rơi vào ngày hiện tại nhằm đảm bảo tính minh bạch và công bằng.

![Màn hình điểm danh](./screenshots/Demo/attendance.png)

### Màn hình nhập điểm
Màn hình này cho phép giáo viên nhập điểm các học viên trong lớp mà giáo viên phụ trách chính, việc chỉ cho giáo viên chính nhập điểm nhằm đảo bảo tính khách quan và rõ ràng về điểm sồ đồng thời phân chia giữa các giáo viên cũng hỗ trợ khâu quản lý nhân sự tốt hơn.

![Màn hình nhập điểm](./screenshots/Demo/score_entry.png)

## Nhóm các màn hình cho phân hệ quản trị viên hệ thống
### Màn hình trang báo cáo thống kê
Màn hình này chỉ được hiển thị cho người dùng có quyền admin xem các thống kê hệ thống theo quý và năm, từ đó đưa ra các định hướng phát triển trung tâm trong tương lai.

![Màn hình trang báo cáo thống kê](./screenshots/Demo/dashboard.png)

### Màn hình quản lý lớp học
Màn hình này chỉ được hiển thị cho người dùng có quyền admin để thêm mới, cập nhật, sắp xếp lịch học cho các lớp học trong hệ thống.

![Màn hình quản lý lớp học](./screenshots/Demo/class-config.png)

### Màn hình quản lý khóa học
Màn hình này chỉ được hiển thị cho người dùng có quyền admin để thêm mới, cập nhật khóa học và học phí cho các khóa học trong hệ thống.

![Màn hình quản lý khóa học](./screenshots/Demo/course-config.png)

### Màn hình quản lý các giao dịch trong hệ thống
Màn hình này cho phép admin quản lý các giao dịch và trạng thái cụ thể kết hợp với các biểu đổ trực quan trong trang dashboard có thể biết được tình trạng của trung tâm hiện tại đang gặp vấn đề gì nếu có và có một số hướng cải thiện tốt hơn. Để làm được điều đó thì màn hình hỗ trợ tìm kiếm theo mã giao dịch và lọc theo trạng thái giao dịch.

![Màn hình quản lý các giao dịch trong hệ thống](./screenshots/Demo/payment-config.png)

### Màn hình quản lý tài khoản người dùng
Màn hình này cho phép admin thao tác thêm dữ liệu nhân sự và cập nhật thông tin người dùng, hỗ trợ phần quyền người dùng và trong một số trường hợp còn hỗ trợ khóa và mở khóa tài khoản người dùng.

![Màn hình quản lý tài khoản người dùng](./screenshots/Demo/account-config.png)

### Màn hình trang quản trị admin được hỗ trợ bởi công nghệ Django
Màn hình cho phép admin tương tác với dữ liệu hệ thống một cách nhanh chóng và tiện lợi, thực hiện một số sửa đổi cập nhật mà trang admin nhóm tùy chỉnh chưa thực hiện được, tuy nhiên cần lưu ý sử dụng khi tạo tài khoản người dùng vì lý do bảo mật.

![Màn hình trang đăng nhập django admin](./screenshots/Demo/login_django_ad.png)
![Màn hình trang quản trị admin được hỗ trợ bởi công nghệ Django](./screenshots/Demo/django-admin.png)