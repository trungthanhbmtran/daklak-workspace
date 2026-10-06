# Đặc tả: Trình thiết kế báo cáo động

## Mục đích

Cho phép người dùng được phân quyền ghép các nguồn API đã đăng ký thành dataset có thể lưu, xem dạng bảng, tạo biểu đồ và xuất báo cáo ổn định.

## User Stories

### US1 — Khám phá nguồn và ghép dữ liệu (P1)

Là người tạo báo cáo, tôi muốn chọn API đã được cấp quyền, kéo các trường và khai báo JOIN để tạo một bảng kết quả mà không cần viết SQL.

**Acceptance scenarios**

- Given nguồn API hợp lệ và quyền được cấp, when chọn nguồn, then xem được trường/schema và trạng thái khả dụng mà không lộ secret.
- Given hai nguồn có khóa tương thích, when cấu hình INNER/LEFT JOIN, then preview thể hiện đúng các dòng theo semantics đã công bố.
- Given khóa trùng/kiểu không tương thích/cardinality vượt ngưỡng, then UI báo lỗi/cảnh báo cụ thể và không cho chạy vượt giới hạn.
- Given người dùng không có quyền đọc source/field/org, when preview/run, then server từ chối và không lưu dữ liệu bị cấm.

### US2 — Lưu cấu hình và snapshot kết quả (P1)

Là người tạo báo cáo, tôi muốn lưu cấu hình theo phiên bản và chạy để lưu một kết quả có thể mở lại sau này.

**Acceptance scenarios**

- Given cấu hình hợp lệ, when lưu, then tạo version definition riêng, chưa giả định dữ liệu đã chạy.
- Given chạy thành công, then snapshot chứa schema/metadata/run time/row count/source watermark và có thể phân trang sau reload.
- Given source lỗi hoặc giới hạn bị vượt, then run hiện trạng thái lỗi/cancelled; không được đánh dấu snapshot hoàn tất.
- Given rerun, then snapshot cũ vẫn truy cập được theo quyền và run mới có id riêng.

### US3 — Bảng, biểu đồ và export theo snapshot (P2)

Là người xem báo cáo, tôi muốn dùng cùng một snapshot cho bảng, biểu đồ và file xuất để kết quả nhất quán.

**Acceptance scenarios**

- Bảng/biểu đồ/export tham chiếu cùng run ID và không gọi lại source khi mở lại.
- Trang dữ liệu lớn được phân trang/stream; quyền được kiểm tra lúc đọc/export.
- Giao diện hiển thị rõ độ mới, trạng thái run và nguồn dữ liệu.

### US4 — Chuyển đổi và dọn mã cũ an toàn (P2)

Là quản trị hệ thống, tôi muốn báo cáo cũ tiếp tục đọc được trong migration và mã dư được gỡ có bằng chứng.

**Acceptance scenarios**

- Báo cáo cũ được giữ, migrate hoặc đưa vào danh sách cần xử lý; không âm thầm mất.
- Mã chỉ bị xóa sau caller scan, telemetry/zero-use window, migration check và rollback plan.
- Mock fallback không còn được dùng trong đường production trước khi file mock được xóa.

## Functional Requirements

- FR1: Chỉ liệt kê source/endpoint/field mà caller được phép dùng.
- FR2: Cho phép compose nhiều source bằng typed join graph; MVP hỗ trợ INNER/LEFT và AND trên cặp khóa.
- FR3: Hỗ trợ select/rename, filters, group/aggregate/sort và preview bounded.
- FR4: Validate schema, field, type compatibility, cycle, duplicate IDs, limits/cardinality trước execute.
- FR5: Lưu cấu hình versioned tách biệt với report run và output snapshot.
- FR6: Hỗ trợ async execution cho workload lớn; status/progress/error/retry/cancel không giả trạng thái hoàn tất.
- FR7: Snapshot pin definition version/source watermark; bảng, chart, export đọc cùng snapshot.
- FR8: Recheck PBAC/org/field permissions khi preview, run, read, export; redact secret/PII theo policy.
- FR9: Audit create/update/run/export/delete/archive và lưu lịch sử theo retention được duyệt.
- FR10: API outbound chỉ qua registered integration executor; không SQL/raw URL/secret tùy ý.
- FR11: Migrate template/widget legacy có báo cáo đối soát và compatibility window.
- FR12: UI responsive/a11y, tiếng Việt có dấu, có loading/empty/error/permission/stale states.
- FR13: Gỡ mã cũ chỉ với evidence caller/data/rollback trong checklist.

## Edge Cases

- API phân trang hoặc thay schema giữa các trang; duplicate/null keys; source rỗng; mismatch key types; ngày/decimal/timezone; fanout; source timeout/rate limit; quyền đổi giữa run/read; worker chết giữa chunks; retry job; snapshot hết retention; chart đổi config trên snapshot cũ; export bị ngắt; báo cáo cũ không map được; storage quota đầy.

## Key Entities

- **Nguồn dữ liệu**: integration/API và các trường có thể dùng theo quyền.
- **Định nghĩa báo cáo**: tên, chủ sở hữu/phạm vi, các nguồn, JOIN/biến đổi, cột và phiên bản.
- **Lần chạy**: phiên bản được chạy, actor, thời điểm, trạng thái, nguồn/watermark, số dòng và lỗi.
- **Snapshot dataset**: schema và các trang dòng kết quả bất biến của một lần chạy.
- **Widget**: cách trình bày bảng/biểu đồ/export gắn với một snapshot/run được phép.

## Success Criteria

- Người dùng hoàn thành báo cáo 2 nguồn thử nghiệm từ chọn API tới snapshot/chart mà không viết SQL; thời gian task usability/SLO được chốt trước pilot.
- Mở lại report chart/table trả đúng run snapshot và không gọi lại API nguồn.
- 100% truy cập trái quyền trong kịch bản test bị từ chối trước khi dữ liệu lưu/đọc/export.
- Không có run vượt hard limits được đánh dấu thành công; failed/partial state minh bạch.
- Tất cả mã bị xóa có record trong cleanup ledger nêu caller proof, data migration proof và rollback.

## Assumptions and Gates

- Ban đầu chỉ source đã đăng ký/allowlisted, API GET và INNER/LEFT join.
- Chưa xác nhận retention, classification, target SLO, export formats, partial-run policy, join caps hay source execution interface; phải chốt tại Phase 0 của plan.
- Snapshot persistence không được chứa secret; sensitive fields được loại/redact trước lưu.
