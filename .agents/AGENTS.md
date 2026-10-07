# AGENT CHARTER - DAKLAK GOVERNMENT WORKFLOW PLATFORM

File này xác định bộ quy tắc hoạt động cho Antigravity (AGY) AI Agent làm việc trong dự án này. Mục tiêu là phát triển một nền tảng quy trình chính phủ điện tử (government workflow platform) an toàn, có khả năng tái sử dụng. Bảo mật, phân quyền, khả năng truy xuất, làm sạch code và bằng chứng xác thực được ưu tiên cao nhất.

## 1. Nguyên tắc cốt lõi (Core Principles)
- **Thực hiện ĐÚNG yêu cầu**: Không tự ý thêm bớt tính năng nếu không có sự đồng ý của người dùng. Agent phải bám sát mục tiêu của từng tác vụ.
- **Dọn dẹp rác thừa (Cleanup)**: BẤT KỲ khi nào thực hiện sửa chữa, thêm tính năng hoặc refactor, Agent BẮT BUỘC phải dọn dẹp các đoạn code thừa, biến không sử dụng (unused variables), import dư thừa, file tạm, và các dòng log debug (console.log, v.v.) trước khi kết thúc tác vụ.
- **Bằng chứng xác thực**: Không bao giờ đưa ra kết luận giả định. Mọi thay đổi đều phải được kiểm chứng (test) thực tế.

## 2. Quy trình làm việc bắt buộc (Mandatory Workflow)

Mỗi khi nhận một tác vụ, Antigravity Agent phải tuân thủ quy trình 5 bước sau:

### Bước 1: Lên kế hoạch (Planning)
- **Phân tích yêu cầu & Bối cảnh (Deep Context Gathering)**: Đọc kỹ yêu cầu và code hiện tại. BẮT BUỘC phải tìm và đọc các file liên quan (schema, interface, dependencies) để nắm rõ cấu trúc. Tránh đoán mò dựa trên tên file. Nếu yêu cầu mập mờ, **PHẢI hỏi lại người dùng** để chốt phương án, không tự ý giả định.
- **Đồng bộ Roadmap**: BẮT BUỘC phải kiểm tra và bám sát file oadmap.md để đảm bảo tác vụ hiện tại phù hợp với tiến độ và mục tiêu của dự án. Nếu tác vụ được giao KHÔNG có trong oadmap.md, Agent phải tự động thêm nó vào một mục (ví dụ: Unplanned Tasks hoặc Hotfixes) trong roadmap trước khi bắt đầu, để đảm bảo không có công việc nào bị sót dấu vết.
- **Tạo Plan (Kế hoạch)**: BẮT BUỘC phải lên kế hoạch từng bước cụ thể (step-by-step) trước khi bắt tay vào code. Nếu tác vụ lớn, chia nhỏ thành nhiều bước độc lập (ví dụ: tạo schema -> viết service -> viết controller -> verify).
- **Lưu và Giám sát Kế hoạch**: Trình bày rõ plan này và BẮT BUỘC lưu lại vào một file (ví dụ: .agents/current_plan.md). Trong quá trình thực thi, Agent phải liên tục cập nhật trạng thái (check-off) các bước đã hoàn thành trong file này để giám sát tiến độ, tránh việc quên hoặc lặp lại công việc.

### Bước 2: Phản biện & Kiểm chứng Kế hoạch (Critique & Verification)
- **Đánh giá rủi ro (Critique)**: Tự đóng vai trò phản biện để xem xét Plan có vi phạm kiến trúc (architecture), rò rỉ dữ liệu, hay gây lỗi hiệu năng (OOM/N+1) hay không.
- **Đánh giá bảo mật & phân quyền**: Kiểm tra phân quyền (PBAC), phạm vi dữ liệu tổ chức (tenant boundaries), và giới hạn kết nối an toàn.
- Nếu phát hiện rủi ro, mâu thuẫn hoặc lỗ hổng, Agent BẮT BUỘC phải dừng lại, điều chỉnh Kế hoạch và thông báo trước khi code.

### Bước 3: Thực thi (Execution)
- **Viết Code**: Tuân thủ tuyệt đối quy định kiến trúc: Domain first, Service data sovereignty (không query chéo DB).
- **Backend & Frontend**: Backend xử lý toàn bộ logic và phân quyền (PBAC). Client-side (Frontend) chỉ dùng để nâng cao UX, không mang tính uỷ quyền (non-authoritative).
- **UI/UX**: Giữ nguyên tính thẩm mỹ, cấu trúc CSS/Tailwind hiện có nếu không có yêu cầu thay đổi.

### Bước 4: Chạy kiểm chứng & Tự sửa lỗi (Test Execution & Self-Correction)
- Sau khi viết code, BẮT BUỘC dùng lệnh (un_command để build, start app, hoặc chạy test) để verify logic vừa thực hiện.
- **Vòng lặp khắc phục & Chống thử mù quáng (Anti-thrashing)**: Nếu gặp lỗi, Agent phải tự động đọc log và sửa lỗi. Tuy nhiên, nếu một lỗi lặp lại (hoặc không giải quyết được) sau 2-3 lần thử, Agent PHẢI dừng việc "thử sai", lùi lại để đọc kỹ log và phân tích nguyên nhân gốc rễ (root cause), hoặc giải trình rủi ro và xin ý kiến người dùng. Tuyệt đối không sửa mù quáng theo cảm tính.
- **Kiểm tra hồi quy (Regression Check)**: Tuyệt đối không phá hỏng các tính năng đã hoàn thành trong Roadmap. Bắt buộc phải chạy lại toàn bộ test suite (hoặc tự động build/kiểm tra lại các endpoints bị ảnh hưởng) trước khi kết luận thành công.

### Bước 5: Kiểm duyệt & Dọn rác (Quality Gate & Cleanup)
- **Dọn rác (Bắt buộc)**: Quét lại toàn bộ các file vừa sửa. Xóa mọi imports thừa, biến không dùng, logs (console.log, debugger), mã giả tạm thời.
- **Format**: Đảm bảo code được format chuẩn. Thêm JSDoc cho các logic phức tạp (ngôn ngữ JSDoc viết bằng Tiếng Việt có dấu).
- **Verify Lần Cuối**: Chạy linter, type checks (nếu có thể) tương xứng với mức độ rủi ro.
- **Cập nhật Roadmap & Plan (Tracking Strictness)**: 
  - BẮT BUỘC phải cập nhật lại file oadmap.md và .agents/current_plan.md (đánh dấu hoàn thành [x], thêm ghi chú, v.v.) NGAY LẬP TỨC sau khi hoàn thành bất kỳ chức năng nào. 
  - TUYỆT ĐỐI không được bỏ sót các checkbox [ ] của những task đã thực sự được code xong (như Frontend UI, Cleanup, QA). Phải luôn rà soát (cross-check) lại toàn bộ file current_plan.md và oadmap.md một lần cuối cùng trước khi báo cáo cho user để đảm bảo không có Task nào bị "lọt lưới" đánh dấu.
- **Cập nhật Tài liệu (Documentation)**: Khi hoàn thành một tính năng API, model hay service mới, ngoài việc đánh dấu trên Roadmap, Agent bắt buộc phải cập nhật tài liệu kỹ thuật liên quan (ví dụ: file README, Swagger, .http files, hoặc thư mục docs) trước khi kết thúc.

## 3. Ranh giới Kiến trúc không thỏa hiệp
1. **Domain first**: Framework không định nghĩa model nghiệp vụ.
2. **Quyền sở hữu dữ liệu (Service data sovereignty)**: Một Service tuyệt đối không được truy cập trực tiếp vào Database của Service khác.
3. **Smart Backend**: Mọi validation, quyền hạn (PBAC), giới hạn tổ chức đều phải verify trên Server.
4. **Least Data**: Chỉ truy vấn (query) và trả về (return) đúng những trường (fields) cần thiết cho use case, chống rò rỉ dữ liệu nhạy cảm.

## 4. Báo cáo Thực thi (Execution Report)
Kết thúc bất kỳ thay đổi nào, Agent phải xuất ra một báo cáo xác nhận theo định dạng sau:

`markdown
## Báo cáo Thực thi Antigravity
- **Bước 1 - Lên Kế Hoạch (Planning):** [Xác nhận đã lập kế hoạch các bước & đối chiếu roadmap]
- **Bước 2 - Phản biện & Kiểm chứng (Critique):** [Các rủi ro đã xét và giải quyết]
- **Bước 3 & 4 - Thực Thi & Kiểm thử (Execution & Test):** [Lệnh đã chạy để test, lỗi đã tự fix nếu có]
- **Bước 5 - Dọn rác, Roadmap & Tài liệu:** [Xác nhận đã xóa code thừa, cập nhật roadmap.md và các tài liệu kỹ thuật]
`
Mọi thông tin trong báo cáo phải là SỰ THẬT (không ngụy tạo kết quả test hay kiểm chứng).

## 5. Nhật ký & Quản lý tri thức (Execution Log & Knowledge Base)
Để tránh lặp lại các lỗi đã giải quyết và tối ưu hóa thời gian xử lý, Agent phải tuân thủ:
- **Lưu log các trường hợp đã xử lý**: Mọi bugs phức tạp đã được fix, các quyết định quan trọng về kiến trúc, cấu hình hoặc các workaround BẮT BUỘC phải được lưu lại vào một file nhật ký (ví dụ: .agents/execution_log.md hoặc thư mục knowledge/).
- **Tra cứu trước khi thực hiện**: Trước khi bắt tay vào fix một lỗi hoặc xử lý một logic mới, Agent nên chủ động tìm kiếm và kiểm tra lại các file log/knowledge này xem vấn đề tương tự đã từng được giải quyết hay chưa, nhằm tái sử dụng giải pháp và tránh đi vào vết xe đổ.
