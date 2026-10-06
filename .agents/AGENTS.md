# AGENT CHARTER - DAKLAK GOVERNMENT WORKFLOW PLATFORM

File này xác định bộ quy tắc hoạt động cho Antigravity (AGY) AI Agent làm việc trong dự án này. Mục tiêu là phát triển một nền tảng quy trình chính phủ điện tử (government workflow platform) an toàn, có khả năng tái sử dụng. Bảo mật, phân quyền, khả năng truy xuất, làm sạch code và bằng chứng xác thực được ưu tiên cao nhất.

## 1. Nguyên tắc cốt lõi (Core Principles)
- **Thực hiện ĐÚNG yêu cầu**: Không tự ý thêm bớt tính năng nếu không có sự đồng ý của người dùng. Agent phải bám sát mục tiêu của từng tác vụ.
- **Dọn dẹp rác thừa (Cleanup)**: BẤT KỲ khi nào thực hiện sửa chữa, thêm tính năng hoặc refactor, Agent BẮT BUỘC phải dọn dẹp các đoạn code thừa, biến không sử dụng (unused variables), import dư thừa, file tạm, và các dòng log debug (`console.log`, v.v.) trước khi kết thúc tác vụ.
- **Bằng chứng xác thực**: Không bao giờ đưa ra kết luận giả định. Mọi thay đổi đều phải được kiểm chứng (test) thực tế.

## 2. Quy trình làm việc bắt buộc (Mandatory Workflow)

Mỗi khi nhận một tác vụ, Antigravity Agent phải tuân thủ quy trình 5 bước sau:

### Bước 1: Lên kế hoạch (Planning)
- **Phân tích yêu cầu**: Đọc kỹ yêu cầu và code hiện tại. Tránh đoán mò dựa trên tên file.
- **Tạo Plan (Kế hoạch)**: BẮT BUỘC phải lên kế hoạch từng bước cụ thể (step-by-step) trước khi bắt tay vào code. Nếu tác vụ lớn, chia nhỏ thành nhiều bước độc lập (ví dụ: tạo schema -> viết service -> viết controller -> verify).
- **Lưu Kế hoạch**: Trình bày rõ plan này để đảm bảo cả Agent và người dùng đều nắm được lộ trình.

### Bước 2: Phản biện & Kiểm chứng Kế hoạch (Critique & Verification)
- **Đánh giá rủi ro (Critique)**: Tự đóng vai trò phản biện để xem xét Plan có vi phạm kiến trúc (architecture), rò rỉ dữ liệu, hay gây lỗi hiệu năng (OOM/N+1) hay không.
- **Đánh giá bảo mật & phân quyền**: Kiểm tra phân quyền (PBAC), phạm vi dữ liệu tổ chức (tenant boundaries), và giới hạn kết nối an toàn.
- Nếu phát hiện rủi ro, mâu thuẫn hoặc lỗ hổng, Agent BẮT BUỘC phải dừng lại, điều chỉnh Kế hoạch và thông báo trước khi code.

### Bước 3: Thực thi (Execution)
- **Viết Code**: Tuân thủ tuyệt đối quy định kiến trúc: `Domain first`, `Service data sovereignty` (không query chéo DB).
- **Backend & Frontend**: Backend xử lý toàn bộ logic và phân quyền (PBAC). Client-side (Frontend) chỉ dùng để nâng cao UX, không mang tính uỷ quyền (non-authoritative).
- **UI/UX**: Giữ nguyên tính thẩm mỹ, cấu trúc CSS/Tailwind hiện có nếu không có yêu cầu thay đổi.

### Bước 4: Chạy kiểm chứng & Tự sửa lỗi (Test Execution & Self-Correction)
- Sau khi viết code, BẮT BUỘC dùng lệnh (`run_command` để build, start app, hoặc chạy test) để verify logic vừa thực hiện.
- **Vòng lặp khắc phục**: Nếu gặp lỗi, Agent phải tự động đọc log và sửa lỗi cho đến khi thành công. KHÔNG ĐƯỢC chỉ báo lỗi cho người dùng rồi dừng lại mà không tìm cách tự khắc phục.

### Bước 5: Kiểm duyệt & Dọn rác (Quality Gate & Cleanup)
- **Dọn rác (Bắt buộc)**: Quét lại toàn bộ các file vừa sửa. Xóa mọi imports thừa, biến không dùng, logs (`console.log`, `debugger`), mã giả tạm thời.
- **Format**: Đảm bảo code được format chuẩn. Thêm JSDoc cho các logic phức tạp (ngôn ngữ JSDoc viết bằng Tiếng Việt có dấu).
- **Verify Lần Cuối**: Chạy linter, type checks (nếu có thể) tương xứng với mức độ rủi ro.

## 3. Ranh giới Kiến trúc không thỏa hiệp
1. **Domain first**: Framework không định nghĩa model nghiệp vụ.
2. **Quyền sở hữu dữ liệu (Service data sovereignty)**: Một Service tuyệt đối không được truy cập trực tiếp vào Database của Service khác.
3. **Smart Backend**: Mọi validation, quyền hạn (PBAC), giới hạn tổ chức đều phải verify trên Server.
4. **Least Data**: Chỉ truy vấn (query) và trả về (return) đúng những trường (fields) cần thiết cho use case, chống rò rỉ dữ liệu nhạy cảm.

## 4. Báo cáo Thực thi (Execution Report)
Kết thúc bất kỳ thay đổi nào, Agent phải xuất ra một báo cáo xác nhận theo định dạng sau:

```markdown
## Báo cáo Thực thi Antigravity
- **Bước 1 - Lên Kế Hoạch (Planning):** [Xác nhận đã lập kế hoạch các bước]
- **Bước 2 - Phản biện & Kiểm chứng (Critique):** [Các rủi ro đã xét và giải quyết]
- **Bước 3 & 4 - Thực Thi & Kiểm thử (Execution & Test):** [Lệnh đã chạy để test, lỗi đã tự fix nếu có]
- **Bước 5 - Dọn rác & Tối ưu (Cleanup):** [Xác nhận đã xóa log/code thừa/import dư]
```
Mọi thông tin trong báo cáo phải là SỰ THẬT (không ngụy tạo kết quả test hay kiểm chứng).
