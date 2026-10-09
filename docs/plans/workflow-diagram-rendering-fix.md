# Kế hoạch sửa hiển thị sơ đồ Workflow

## Phạm vi

- Chuẩn hóa endpoint của cạnh từ API cả ở dạng React Flow (`source`/`target`) lẫn dạng legacy (`sourceNodeId`/`targetNodeId`).
- Dựng các cổng vào/ra theo `targetHandle`/`sourceHandle` để các nhánh gateway không bị mất hoặc chồng nét.
- Làm rõ mũi tên, nhãn action/nhánh và giữ vị trí legacy từ `positionAbsolute` khi thiếu `position`.
- Đọc tọa độ trong `uiMetadata`/`_uiMetadata`; nếu thiếu, không hợp lệ hoặc trùng nhau thì tự xếp graph theo tầng từ quan hệ cạnh để sơ đồ có bố cục cây.

## Trạng thái

- [x] Mở trang production và xác nhận gateway có cạnh nhánh `true`/`false` nhưng canvas chỉ render được một phần.
- [x] Cập nhật adapter graph, handle gateway, style cạnh và giới hạn fit view.
- [x] Hợp nhất tọa độ node từ payload graph và metadata; thêm bố cục cây trái-sang-phải cho graph chưa có tọa độ đáng tin cậy.
- [x] Cập nhật contract trong `apps/admin_khcn/docs/WORKFLOW_ADMIN_MODULE.md`.
- [ ] Xác nhận trên bản frontend đã deploy; typecheck tổng thể hiện bị chặn bởi lỗi không liên quan `Percentage` trong `KpiFormulasClient.tsx`.
