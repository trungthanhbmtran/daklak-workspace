# Code Audit & Security Review Checklist
**Áp dụng bởi:** Coder lane (code1, code2, code3) và Codex reviewer

Đánh giá từng tiêu chí áp dụng bằng evidence; ghi rõ tiêu chí không áp dụng. Checklist hỗ trợ review, không thay thế verdict AGENT_ACCEPTED của coordinator.

## 1. Chống Ảo giác AI & Kiểm soát Ranh giới Source of Truth
- [ ] `NO_AI_HALLUCINATION`: Mọi trường CSDL, DTO, route endpoint, method proto đều dựa trên code thực tế, không có bất kỳ cấu trúc giả định hay bịa đặt nào.
- [ ] `NO_DUPLICATE_ENTITIES`: Không tự ý tạo thêm bảng/model nếu thực thể đã thuộc sở hữu của service chủ quản (VTVL/định biên tại `user-service`, quy trình tại `workflow-service`, API liên thông tại `api-gateway`, báo cáo tại `report-service`).
- [ ] `SERVICE_DATA_SOVEREIGNTY`: Không có service nào trực tiếp import Prisma Client hoặc query CSDL của service khác.
- [ ] `GRPC_METADATA_DELEGATION`: Mọi lời gọi liên service qua gRPC đều đính kèm `metadata` ủy quyền (`GatewayContextToken`).

## 2. Bảo mật & Kiểm soát Đa tổ chức (PBAC & Multi-Tenant)
- [ ] PBAC_ORGANIZATION_SCOPE: Truy vấn entity thuộc tenant phải áp dụng organization/tenant scope từ ngữ cảnh đã xác thực; ghi rõ ngoại lệ cho dữ liệu dùng chung hoặc không thuộc tenant.
- [ ] `NO_AUTH_BYPASS`: Không có decorator hoặc guard nào bị comment out hay bypass trái phép (`@Public()`, bypass `GrpcAuthGuard`).
- [ ] `NO_HARDCODED_SECRETS`: Không chứa token, mật khẩu, JWT key, webhook URL hoặc API key dạng raw string trong mã nguồn.
- [ ] `LEAST_DATA_EXPOSURE`: DTO trả về không phơi bày các trường nhạy cảm (`passwordHash`, `salt`, `internalMetadata`, v.v.).

## 3. Hiệu năng & Code Smells
- [ ] NO_N_PLUS_ONE_QUERIES: Batch/include/select khi phù hợp; Promise.all không tự loại bỏ N+1. Với thao tác từng bản ghi cần thiết, có concurrency/transaction phù hợp và lý do rõ.
- [ ] `NO_DEEP_INCLUDES`: Mức độ `include` lồng nhau của Prisma không vượt quá 2 cấp trên các List APIs.
- [ ] `RESOURCE_CLEANUP`: Các subscription, timer (`setTimeout`, `setInterval`), event listener đều có hàm hủy dọn dẹp tương ứng.

## 4. An toàn CSDL & Schema Migrations
- [ ] `ADDITIVE_MIGRATION_ONLY`: Cột mới thêm vào schema BẮT BUỘC là `nullable` (`?`) hoặc có `@default(...)`. Tuyệt đối không thêm cột NOT NULL không default.
- [ ] FOREIGN_KEY_INDEXED: Index được chọn theo query patterns và query plan; xem xét khóa ngoại/filter/order cùng composite index hiện hữu, tránh index trùng hoặc dư.

## 5. Quy chuẩn Frontend & UI/UX
- [ ] `FLEX_GRID_MIN_W_0`: Mọi container `flex` hoặc `grid` có text/badge co giãn đều có class `min-w-0` và `wrap-break-word` khi cần ngắt dòng; không dùng class `break-words` trong code mới.
- [ ] NO_SCROLL_TRAP: Nội dung cần xem không bị cắt hoặc mất đường cuộn; vùng overflow/fixed-height có parent bounds rõ ràng và được kiểm tra trên route.
- [ ] ZERO_OVERLAPPING_LAYOUT: Bố cục thích ứng với chiều rộng khả dụng và nội dung thực tế; không chồng lấn, cắt chữ hoặc tạo cuộn ngang ngoài ý muốn.
- [ ] `NO_NEW_LINT_WARNINGS`: Không có lint warning mới do các file/dòng sửa đổi gây ra; không suppress warning để lách nghiệm thu.
- [ ] ASYNC_RADIX_CONTROLLED: Dùng controlled state khi cần đồng bộ danh sách mở với dữ liệu async; không làm mất lựa chọn người dùng hoặc ép mở tất cả nhóm ngoài ý đồ thiết kế.
- [ ] MODAL_VS_DRAWER_CONVENTION: Sheet thường phù hợp form dài; Dialog thường phù hợp tác vụ ngắn. Quyết định theo flow, accessibility và pattern hiện có; kiểm tra focus/keyboard.
- [ ] `FRONTEND_STATE_LOCALITY`: State UI nằm ở component sở hữu nhỏ nhất; chỉ lift khi thật sự chia sẻ; không duplicate derived state/globalize state cục bộ; tránh re-render component/page không liên quan.
- [ ] `FRONTEND_DUMB_CLIENT`: Frontend chỉ render/present và gọi API theo contract; không sở hữu business rule, quyền cuối cùng, workflow, KPI hay validation bảo vệ dữ liệu; client validation chỉ hỗ trợ UX.
- [ ] `RUNTIME_VERIFICATION`: Đã kiểm tra behavior của flow/route/API bị sửa trên app/service chạy thật hoặc bằng focused test phù hợp; không chỉ dựa vào typecheck/build.
- [ ] `REGRESSION_TEST_COVERAGE`: Logic nghiệp vụ mới/bug fix có test focused cho behavior vừa sửa; không dùng mock để bỏ qua logic đang cần kiểm chứng.
- [ ] `LAZY_MODAL_SHEET`: Dialog/Sheet dùng controlled `open`/`onOpenChange`, có state riêng và mặc định đóng; nội dung nặng/query chỉ mount hoặc load sau khi mở, không fetch lúc page mount khi đang đóng.
- [ ] `NO_API_DOUBLE_PREFIX`: Tuyệt đối không chèn thêm `/admin` vào string path gọi API trong `admin_khcn` vì axios đã có sẵn baseURL `/api/v1/admin`.

## 6. Vệ sinh Mã nguồn & Định dạng File
- [ ] `ZERO_CONSOLE_LOGS`: Không còn bất kỳ lệnh `console.log`, `debugger`, hay cờ test tạm nào.
- [ ] `UTF8_NO_BOM`: Tất cả file mới và chỉnh sửa được lưu chuẩn UTF-8 không BOM, tiếng Việt hiển thị chính xác 100%.
