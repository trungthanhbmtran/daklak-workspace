# Command: fix — xử lý finding sau review

## Phạm vi

Coder lane được chỉ định xử lý finding trong các file thuộc ownership đã duyệt. Coordinator giữ quyền cập nhật kế hoạch, acceptance criteria và verdict.

## Quy trình

1. Đọc finding của reviewer, diff hiện tại và lệnh/evidence đã thất bại; xác định nguyên nhân gốc.
2. Sửa đúng phạm vi lane. Không mở rộng contract hoặc đổi tiêu chí nghiệm thu đơn phương. Nếu finding yêu cầu thay đổi phạm vi/contract, dừng phần phụ thuộc và yêu cầu coordinator cập nhật kế hoạch rồi phản biện lại.
3. Chạy lại kiểm tra bị ảnh hưởng và các regression checks đã duyệt; ghi cả kết quả đạt và còn lỗi vào execution log cùng decision record riêng.
4. Trả lại đúng lane để Codex review lại; không tự ghi AGENT_ACCEPTED, PASSED hoặc sửa report của coordinator.

## Khi lỗi còn lặp

Không lặp lại cùng một cách sửa mù quáng. Sau các lần thử không tạo bằng chứng tiến triển, quay lại phân tích nguyên nhân, xác minh giả định/code hiện tại và báo coordinator blocker cụ thể trước khi tiếp tục.
