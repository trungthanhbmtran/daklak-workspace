# Ghi chú sửa lỗi Workflow (React Flow & Deploy)

Tài liệu này lưu trữ nguyên nhân và cách khắc phục riêng cho các lỗi đặc thù liên quan đến module Workflow (React Flow) và tiến trình Deploy của dự án Daklak Workspace.

## Lỗi 1: Giao diện (Frontend) không cập nhật sau khi đã `git push` và `docker pull`
- **Nguyên nhân**: Github Actions cần thời gian (khoảng 3 - 5 phút) để build xong Next.js image và đẩy lên Docker Hub. Nếu bạn chạy lệnh `docker compose pull` ngay lập tức ngay sau khi push code, hệ thống sẽ tải lại đúng bản image cũ vì image mới chưa build xong.
- **Cách fix**: Sau khi gõ `git push`, hãy truy cập vào tab **Actions** trên Github. Phải đợi đến khi tiến trình *Build and Push* đã báo `Success` (tích xanh) thì mới được qua server chạy lệnh `docker compose pull`. Đồng thời, sau khi khởi động container, luôn nhớ xóa cache trình duyệt (`Ctrl + F5`) để tải phiên bản file JS mới.

## Lỗi 2: React Flow bị mất/ẩn đường nối (edges) giữa các node (Visio-like path)
- **Nguyên nhân**: Khi cấu hình đường nối gãy khúc vuông góc (Visio style), nếu bạn truyền cứng tham số `borderRadius: 0` vào hàm `getSmoothStepPath()`, thư viện `@xyflow/react` sẽ sinh ra mã SVG bị lỗi toán học (xảy ra khi khoảng cách các node quá gần hoặc thuật toán bị chia cho 0). Việc sinh path lỗi sẽ làm toàn bộ đường nối bị ẩn (biến mất) khỏi giao diện.
- **Cách fix riêng case này**: 
  - Để fix triệt để mọi lỗi toán học của SVG, giải pháp an toàn tuyệt đối nhất là chuyển thuật toán vẽ sang `getStraightPath` (đường nối thẳng). 
  - Phải ép cứng màu `#3b82f6` (màu hex tĩnh) thay vì phụ thuộc CSS Variables cho thuộc tính `stroke` để tránh việc line bị tàng hình trong các Theme khác nhau.
  - Tắt hiệu ứng `animated: false` để tránh lỗi CSS stroke-dasharray.
