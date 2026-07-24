# Ghi chú sửa lỗi Workflow (React Flow & Deploy)

Tài liệu này lưu trữ nguyên nhân và cách khắc phục riêng cho các lỗi đặc thù liên quan đến module Workflow (React Flow) và tiến trình Deploy của dự án Daklak Workspace.

## Lỗi 1: Giao diện (Frontend) không cập nhật sau khi đã `git push` và `docker pull`
- **Nguyên nhân**: Github Actions cần thời gian (khoảng 3 - 5 phút) để build xong Next.js image và đẩy lên Docker Hub. Nếu bạn chạy lệnh `docker compose pull` ngay lập tức ngay sau khi push code, hệ thống sẽ tải lại đúng bản image cũ vì image mới chưa build xong.
- **Cách fix**: Sau khi gõ `git push`, hãy truy cập vào tab **Actions** trên Github. Phải đợi đến khi tiến trình *Build and Push* đã báo `Success` (tích xanh) thì mới được qua server chạy lệnh `docker compose pull`. Đồng thời, sau khi khởi động container, luôn nhớ xóa cache trình duyệt (`Ctrl + F5`) để tải phiên bản file JS mới.

## Lỗi 2: React Flow bị mất/ẩn đường nối (edges) khi TẢI LẠI (Reload) từ Database
- **Nguyên nhân gốc rễ (Root Cause)**: Khi tạo các Node cơ bản (Start, UserTask), các điểm nối (Handle) thường không được gán `id`. Khi bạn kéo thả tạo đường nối (Edge), React Flow gán `sourceHandle: null` và `targetHandle: null`. Khi lưu xuống Backend bằng **gRPC / Protobuf**, các giá trị `null` của trường kiểu `string` sẽ tự động bị Protobuf ép kiểu thành chuỗi rỗng `""`. 
Khi load lại trang, Frontend nhận về `sourceHandle: ""` và `targetHandle: ""`. React Flow v12 cực kỳ khắt khe: nó tìm kiếm Handle có `id=""` trên Node, nhưng không tìm thấy (vì Handle thực tế không có ID), dẫn đến việc từ chối render toàn bộ các đường nối này!
- **Cách fix triệt để**:
  - Tại file `useWorkflowData.ts`, khi parse data từ server trả về, bắt buộc phải chuẩn hóa lại: `sourceHandle: edge.sourceHandle === "" ? undefined : edge.sourceHandle`. Điều này giúp React Flow nhận diện đúng và fallback về Handle mặc định.
  - Về mặt giao diện nét vẽ, đã khôi phục lại cấu hình `getSmoothStepPath` (bo mặc định 5px) kết hợp `connectionLineType="smoothstep"` để đường nét vừa hiển thị chính xác 100% vừa có hiệu ứng gãy khúc chuẩn như Visio (Visio-like path).
