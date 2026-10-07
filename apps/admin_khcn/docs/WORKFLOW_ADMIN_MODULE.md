# Workflow admin module

`admin_khcn` quản trị workflow qua API Gateway tại `/admin/workflow`; `features/workflow/api.ts` dùng `apiClient` để đọc/ghi định nghĩa, catalog process type, chức danh, bindings và instances. Giao diện không giữ trạng thái nghiệp vụ trong local storage hay dùng mock data làm dữ liệu vận hành.

## Các màn hình

- `/services/workflow/workflows`: tìm và mở định nghĩa workflow từ API.
- `/services/workflow/workflows/new` và `/:id/edit`: thiết kế graph bằng node/edge, cấu hình người xử lý theo catalog chức danh, lưu draft qua API, phát hành bằng lệnh publish để backend validate.
- `/services/workflow/workflows/bindings`: tạo binding từ process type, trigger hợp lệ do process type công bố, và workflow đã publish; hiển thị/vô hiệu hóa binding qua API.
- `/services/workflow/instances`: theo dõi các instance do workflow service trả về.

## Contract và quyền sở hữu

Graph gửi lên trong `definition`; Workflow Gateway chuyển graph thành payload workflow-service. Workflow-service là nơi lưu version và kiểm tra graph khi publish. Editor chỉ cho phép các node đã có trong validator: `start`, `userTask`, `serviceTask`, `gateway`, `parallelGateway`, `exclusiveGateway`, `end`. Cấu hình giao việc được serialize vào contract `assignments` (`id`, `type`, `value`) của node. Không gửi rule edge dạng tự tạo vì API hiện chưa công bố schema/engine contract cho rule.

Workflow Gateway yêu cầu JWT và kiểm tra quyền `WORKFLOW` theo thao tác. Actor khi tạo binding được lấy từ JWT; Gateway gắn scope theo organization claim hoặc unit claim đã xác thực cho binding create/list/detail/deactivate và truy vấn instance. Client không gửi actor/scope để quyết định quyền.
