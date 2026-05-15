# TEST REPORT 

**1\. Thông tin chung**

| Mục                 | Nội dung                          |
|:--------------------|:----------------------------------|
| Tên dự án           | Language Center Management System |
| Loại báo cáo        | Test Report                       |
| Thời gian kiểm thử  | 20/04/2026-08/05/2026             |
| Số tester tham gia  | 4                                 |
| Môi trường kiểm thử | Local environment                 |
| Frontend            | ReactJS \+ Vite                   |
| Backend             | Django REST Framework             |
| Database            | MySQL                             |
| Công cụ API testing | Postman                           |
| Công cụ automation  | Pytest, Vitest                    |

**2\. Mục đích báo cáo**

Tài liệu này tổng hợp kết quả kiểm thử của hệ thống Language Center Management System sau quá trình thực hiện manual testing, API testing và automation testing.

Báo cáo nhằm ghi nhận số lượng testcase đã thiết kế và thực thi, kết quả pass/fail, các lỗi phát hiện, bằng chứng kiểm thử, kết quả automation test và đánh giá chất lượng hệ thống.

**3\. Tổng quan kết quả kiểm thử** 

**3.1 Tiến độ tổng quan của chu kỳ kiểm thử** 

| Chỉ số                                | Giá trị                  |
|:--------------------------------------|:-------------------------|
| Tiến độ tổng quan của chu kỳ kiểm thử | Đúng tiến độ             |
| Tổng số testcase                      | 781                      |
| Số lượng tester                       | 4                        |
| Thời gian kiểm thử                    | 20/04/2026 \- 08/05/2026 |

**3.2 Trạng thái thực thi testcase**

| Chỉ số                             | Số lượng   |
|:-----------------------------------|:-----------|
| Tổng số testcase dự kiến thực hiện | 781        |
| Tổng số testcase đã thực hiện      | 781        |
| Tổng số testcase PASS              | 773        |
| Tổng số testcase FAIL              | 8          |
| Tỉ lệ thực hiện                    | 100%       |
| Tỉ lệ testcase PASS                | 98.98%     |
| Tỉ lệ testcase FAIL                | 1.02%      |
| Mật độ lỗi                         | 1 lỗi/ngày |

**3.3 Coverage**

BE unit coverage: 89.72%

FE unit coverage: Statements 96.5%, Branches 87.96%, Functions 92.66%, Lines 97.43%. 

**4\. Các lỗi đáng chú ý trong quá trình test** 

Trong quá trình kiểm thử, nhóm ghi nhận một số lỗi đáng chú ý:

| Nhóm lỗi             | Mô tả                                                                                                       | Ảnh hưởng                                                |
|:---------------------|:------------------------------------------------------------------------------------------------------------|:---------------------------------------------------------|
| API error            | Một số API trả lỗi 500 Internal Server Error                                                                | Ảnh hưởng đến chức năng điểm danh, khóa học hoặc điểm số |
| FE response handling | Một số màn hình bị trắng do frontend xử lý sai format response API, ví dụ lỗi classes.map is not a function | Ảnh hưởng đến màn hình điểm danh/nhập điểm               |
| Payment flow         | Một số testcase thanh toán 50%/100% bị fail                                                                 | Ảnh hưởng đến luồng thanh toán học phí                   |
| Validation           | Một số testcase bắt buộc nhập dữ liệu không xử lý đúng như mong đợi                                         | Ảnh hưởng đến độ tin cậy của form                        |
| Automation mismatch  | Một số pytest cũ không còn khớp route/API mới sau khi merge develop                                         | Cần cập nhật testcase automation                         |

**5\. Kết luận** 

Sau quá trình kiểm thử, hệ thống **Language Center Management System** đã được kiểm tra trên các chức năng chính như đăng ký/đăng nhập, quản lý khóa học, đăng ký khóa học, thanh toán học phí, xem lịch học/lịch dạy, điểm danh, nhập điểm và phân quyền người dùng.

Kết quả kiểm thử cho thấy:

* Tổng số testcase planned là 781\.  
* Tổng số testcase đã execute là 781\.  
* Có 773 test case PASS và 8 test case FAIL.  
* Execution rate đạt: 100%.  
* Pass rate đạt 98.98%.  
* Evidence được lưu theo role/module để phục vụ việc đối chiếu kết quả kiểm thử.

Nhìn chung, hệ thống đạt mức ổn định tốt ở phần lớn chức năng đã kiểm thử.

