# I. Mục đích của tài liệu

Tài liệu được xây dựng nhằm mô tả tổng quan các hoạt động kiểm thử đã được thực hiện đối với “Hệ thống quản lý trung tâm ngoại ngữ”. Giúp đánh giá mức độ ổn định, tính đúng đắn và khả năng đáp ứng yêu cầu của hệ thống trước khi hoàn thiện sản phẩm. Là cơ sở để đối chiếu giữa yêu cầu ban đầu của đề tài với kết quả triển khai thực tế trong quá trình phát triển và kiểm thử phần mềm.

# II. Tổng quan về ứng dụng

Tài liệu được lập sau khi hoàn thành quá trình kiểm thử “Hệ thống quản lý trung tâm ngoại ngữ” nhằm tổng hợp và đánh giá toàn bộ hoạt động kiểm thử đã thực hiện. Nội dung tài liệu bao gồm phạm vi kiểm thử, các loại kiểm thử được áp dụng, số lượng test case thực hiện, kết quả pass/fail, tình trạng lỗi phát hiện được, môi trường kiểm thử và các vấn đề phát sinh trong quá trình kiểm thử. Ghi nhận các bài học kinh nghiệm, khuyến nghị và cách làm tốt nhất được rút ra trong quá trình thực hiện dự án. Là cơ sở giúp đánh giá mức độ ổn định, tính đúng đắn và khả năng đáp ứng yêu cầu của hệ thống.

# III. Phạm vi kiểm thử

## A. Trong phạm vi

Phạm vi kiểm thử bao gồm các chức năng chính của hệ thống như đăng ký và đăng nhập tài khoản, xác thực và phân quyền người dùng, đăng nhập bằng Google/Facebook OAuth 2.0, quản lý khóa học, lớp học, lịch học, đăng ký lớp học, thanh toán học phí, điểm danh, nhập điểm và báo cáo thống kê. Nhóm đã thực hiện kiểm thử các ràng buộc nghiệp vụ như kiểm tra trùng lịch học, giới hạn số lượng học viên, điều kiện chỉnh sửa điểm và xử lý trạng thái thanh toán. Đối với backend, nhóm thực hiện unit test cho model, API, validation, permission và xử lý nghiệp vụ bằng pytest và pytest-django. Đối với frontend, nhóm kiểm thử giao diện người dùng, form nhập liệu, điều hướng trang và khả năng tương tác với API bằng Vitest. Manual testing và automation testing cũng được áp dụng cho các chức năng quan trọng nhằm đảm bảo tính ổn định của hệ thống.

## B. Ngoài phạm vi

Do giới hạn về thời gian và phạm vi của môn học, nhóm chưa thực hiện các loại kiểm thử chuyên sâu như kiểm thử hiệu năng, kiểm thử chịu tải, stress testing và kiểm thử bảo mật nâng cao. Hệ thống cũng chưa được triển khai và kiểm thử trên môi trường production thực tế hoặc cloud server.

## C. Các mục không cần kiểm thử

Một số nội dung chưa được kiểm thử đầy đủ gồm kiểm thử khả năng hoạt động với số lượng lớn người dùng đồng thời và kiểm thử trên nhiều thiết bị hoặc nền tảng khác nhau. Việc kiểm thử hiện chủ yếu được thực hiện trong môi trường localhost phục vụ phát triển và demo nội bộ.

# IV. Metrics

## a) Số test cases được lên kế hoạch so với số testcases được thực hiện

| Số test cases lên kế hoạch | Số test case được thực hiện | Số test case pass | Số test case fail |
|---|---|---|---|
| 781 | 781 | 774 | 7 |

## b) Số Test cases passed/ failed
![Test Summary](./screenshots/Test%20summary/test-summary.png)

## c) Số Bugs tìm được và Tình trạng & Mức độ nghiêm trọng của chúng

|  | Critical | Major | Medium | Consmetic | Total |
|---|---|---|---|---|---|
| Closed | 0 | 1 | 5 | 0 | 6 |
| Open | 0 | 0 | 0 | 1 | 1 |
| Total | 0 | 1 | 5 | 1 | 7 |

![Test Summary](./screenshots/Test%20summary/Test-summary-bug.png)

## d) Sự phân phối bugs

| Classes | Courses | Enrollment | Users | Total |
|---|---|---|---|---|
| Critical | 0 | 0 | 0 | 0 | 0 |
| Major | 0 | 0 | 1 | 0 | 1 |
| Medium | 1 | 1 | 0 | 3 | 5 |
| Cosmetic | 0 | 0 | 0 | 1 | 1 |
| Total => | 1 | 1 | 1 | 4 | 7 |

![Test Summary](./screenshots/Test%20summary/test-summary-phan-phoi-bug.png)

# V. Các loại kiểm thử được thực hiện

## a) Smoke testing

Thử nghiệm này được thực hiện bất cứ khi nào bản Build được nhận để Kiểm tra để đảm bảo chức năng chính hoạt động tốt, bản Build có thể được chấp nhận và kiểm thử có thể bắt đầu.

Smoke testing được thực hiện mỗi khi có thay đổi mã nguồn mới được merge vào nhánh develop trên GitHub. Mục tiêu là kiểm tra nhanh các chức năng cốt lõi của hệ thống như đăng nhập, đăng ký khóa học và thanh toán học phí còn hoạt động ổn định trước khi tiến hành kiểm thử toàn diện. Nếu smoke test pass, nhóm mới tiến hành các loại kiểm thử sâu hơn; nếu fail, build sẽ được trả lại cho developer xử lý trước.

## b) Kiểm thử tích hợp hệ thống

Đây là kiểm thử được thực hiện trên Ứng dụng đang được thử nghiệm, để xác minh toàn bộ ứng dụng hoạt động theo yêu cầu. Các kịch bản nghiệp vụ quan trọng đã được thử nghiệm để đảm bảo chức năng quan trọng trong ứng dụng hoạt động như dự định mà không có bất kỳ lỗi nào.

Kiểm thử tích hợp được thực hiện nhằm xác minh toàn bộ hệ thống hoạt động đúng khi các thành phần kết hợp với nhau, bao gồm Frontend ReactJS, Backend Django REST Framework, cơ sở dữ liệu MySQL và các dịch vụ bên thứ ba như VNPay Sandbox và Google/Facebook OAuth. Công cụ Postman được sử dụng để kiểm thử các API endpoint trong quá trình tích hợp giữa frontend và backend, đảm bảo request, response đúng định dạng và status code trả về chính xác.

## c) Kiểm thử hồi quy

Kiểm thử hồi quy được thực hiện mỗi khi bản build mới được triển khai để kiểm tra có sửa lỗi và cải tiến mới, nếu có. Kiểm thử hồi quy đang được thực hiện trên toàn bộ ứng dụng chứ không chỉ là các chức năng mới và sửa lỗi. Kiểm thử này đảm bảo rằng chức năng hiện có hoạt động tốt sau khi sửa lỗi và các cải tiến mới được thêm vào ứng dụng hiện có. Các testcases cho chức năng mới được thêm vào các testcases hiện có và được thực thi.

Cụ thể, sau khi developer fix các lỗi như API trả về 500 Internal Server Error ở module điểm danh, lỗi xử lý response frontend gây màn hình trắng hay lỗi luồng thanh toán 50% hoặc 100%, người kiểm thử thực hiện retest toàn bộ các test case liên quan chứ không chỉ kiểm tra phần vừa sửa. Bộ automation test bằng pytest (backend) và Vitest (frontend) được tận dụng để chạy lại nhanh các test case quan trọng sau mỗi lần merge, giúp phát hiện sớm các bug phát sinh.

Trong quá trình kiểm thử, nhóm cũng ghi nhận một số pytest cũ không còn khớp với route hoặc API mới sau khi merge nhánh develop, và đã cập nhật lại bộ test case automation tương ứng để đảm bảo tính chính xác của kết quả kiểm thử hồi quy.

# VI. Kiểm tra môi trường kiểm thử

| Thành phần | Thông tin |
|---|---|
| Application URL | https://localhost:5173 |
| Apps Server | Windows 10/11, Python 3.10+, Django REST Framework |
| Database | MySQL 8.0 |
| HP QC/ALM | pytest, pytest-django, pytest-cov (Backend) / Vitest (Frontend) / Postman (API) |

# VII. Bài học kinh nghiệm

| Vấn đề gặp phải | Giải pháp |
|---|---|
| Cả frontend lẫn backend đều thay đổi code do logic nghiệp vụ thay đổi giữa chừng, khiến test case đã viết bị fail và phải viết lại từ đầu, tốn nhiều thời gian. | Thống nhất giữa các thành viên trong nhóm về phạm vi thay đổi trước khi thực hiện, nếu có thay đổi thì thông báo sớm để người kiểm thử chuẩn bị cập nhật test case, không để đến lúc chạy mới biết bị fail. |
| Khi API thay đổi cấu trúc, test case ở cả Vitest, Postman và Pytest đều phải cập nhật thủ công song song dẫn đến dễ bị bỏ sót một cái nào đó. | Sau mỗi lần API thay đổi, kiểm tra lại toàn bộ test case ở cả ba công cụ trước khi kết luận pass/fail. |
| Vitest mock API ở frontend và Pytest test API thực ở backend đôi khi cho kết quả mâu thuẫn khi nghiệp vụ thay đổi, do hai bên cập nhật không đồng bộ. | Tổ chức cuộc họp online ngắn giữa các thành viên trong nhóm mỗi khi có thay đổi nghiệp vụ, thay vì để mỗi bên tự cập nhật độc lập. |

# VIII. Khuyến nghị

Thiết lập quy trình thông báo chính thức khi có thay đổi yêu cầu nghiệp vụ, mọi thay đổi cần được ghi nhận bằng văn bản và thông báo đến toàn bộ thành viên trong nhóm trước khi thực hiện, tránh tình trạng test case bị lỗi thời mà người kiểm thử không hay biết.

Khi backend thay đổi cấu trúc, các thành viên thông báo cho nhau rồi tự cập nhật lại test case thủ công ở cả Vitest, Postman và Pytest.

# IX. Cách làm tốt nhất

Phân chia công cụ kiểm thử rõ ràng theo từng tầng: Vitest đảm nhận kiểm thử component ở frontend, Postman kiểm thử API qua các request thực, Pytest xử lý logic nghiệp vụ ở backend. Mỗi công cụ có trách nhiệm riêng, không chồng chéo, giúp dễ xác định lỗi thuộc tầng nào khi có vấn đề.

Viết test case theo hành vi người dùng thay vì chi tiết kỹ thuật — thay vì kiểm tra biến nội bộ hay cấu trúc code, tập trung vào những gì người dùng thực sự thấy và làm trên giao diện. Cách này giúp test case vẫn còn giá trị kể cả khi code bên trong được refactor.

Viết Pytest fixture dùng chung cho dữ liệu test — dữ liệu mẫu như học viên, lớp học, lịch học được định nghĩa một lần và tái sử dụng xuyên suốt, tránh tạo dữ liệu trùng lặp và dễ cập nhật khi có thay đổi.

# X. Exit citeria
## a) Tất cả các testcases nên được thực hiện: 
Có - Toàn bộ 781 test cases đã được thực hiện, đạt tỷ lệ thực thi 100%
## b)Tất cả các Bug cực kì nghiêm trọng, nghiêm trọng, trung bình cần được xác minh và đóng: 
Có - 8 bugs thuộc mức nghiêm trọng và trung bình đã được Closed trước khi kết thúc chu kỳ kiểm thử.
## c) Bất kỳ các bug nhỏ, độ ưu tiên thấp đều có kế hoạch thực hiện và được chuẩn bị với ngày đóng cửa dự kiến. 
Còn 1 bug mức Cosmetic đang Open, thuộc module Users. Bug này không ảnh hưởng đến chức năng thực tế của hệ thống và dự kiến được xử lý trong lần cập nhật môi trường kiểm thử tiếp theo.
# XI. Kết luận
 Sau quá trình kiểm thử, nhóm đã hoàn thành việc đánh giá các chức năng chính của “Hệ thống quản lý trung tâm ngoại ngữ” trên cả frontend, backend và API. Các chức năng chính trọng tâm đã được kiểm thử. Kết quả kiểm thử cho thấy hệ thống đạt mức độ ổn định tương đối tốt với tỷ lệ testcase pass khoảng 98.98% và tỷ lệ fail khoảng 1.02%. Điều này cho thấy phần lớn chức năng của hệ thống đã hoạt động đúng theo yêu cầu đề ra.   
            
Nhìn chung, hệ thống đã đáp ứng được phần lớn yêu cầu chức năng trong phạm vi kiểm thử của đề tài. Các luồng nghiệp vụ chính đã được kiểm tra và có thể vận hành ổn định trong môi trường localhost phục vụ demo và đánh giá môn học. Tuy nhiên, hệ thống vẫn cần tiếp tục được rà soát và cải thiện ở một số điểm như đồng bộ testcase khi API thay đổi, kiểm thử kỹ hơn các trường hợp biên, bổ sung kiểm thử trên nhiều môi trường khác nhau và hoàn thiện các lỗi còn tồn tại. 


Từ quá trình thực hiện, nhóm nhận thấy việc kết hợp nhiều hình thức kiểm thử như manual testing, Postman, Pytest và Vitest giúp phát hiện lỗi hiệu quả hơn ở từng tầng của hệ thống. Đồng thời, việc quản lý testcase, evidence và báo cáo kiểm thử có hệ thống giúp nhóm dễ dàng theo dõi tiến độ, đánh giá chất lượng phần mềm và hỗ trợ quá trình sửa lỗi. Kết quả kiểm thử là cơ sở để kết luận rằng hệ thống đã đạt yêu cầu cơ bản về chức năng và có thể tiếp tục được hoàn thiện thêm nếu triển khai trong môi trường thực tế.
