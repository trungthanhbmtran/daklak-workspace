# Nghiên cứu và quyết định: Trình thiết kế báo cáo động

## Quyết định 1 — Không chạy lại nguồn khi render snapshot

- **Decision:** Lưu definition version và run output snapshot tách biệt; widget gắn `runId`/snapshot.
- **Rationale:** Đáp ứng yêu cầu xem lại kết quả ổn định và tránh UI chart gọi lặp API; cho phép audit thời điểm dữ liệu.
- **Alternatives:** Live join mỗi lần mở (fresh hơn nhưng latency/phụ thuộc source, kết quả thay đổi); chỉ lưu cấu hình (không tái hiện được output); lưu cache ngắn hạn (không đảm bảo lịch sử).
- **Trade-off:** Snapshot tăng storage và yêu cầu retention, ACL và cleanup.

## Quyết định 2 — Query plan typed, không SQL do người dùng viết

- **Decision:** UI tạo AST có version gồm nguồn, JOIN/filters/group/aggregate; server compile plan được giới hạn.
- **Rationale:** Nguồn là API allowlist chứ không phải database chung; SQL không thể đại diện an toàn cho quyền/ownership và làm tăng injection/SSRF risk.
- **Alternatives:** SQL editor (không chọn); chỉ cho một source (không đáp ứng requirement); query language tự do (không chọn do complexity/resource risks).
- **Trade-off:** Cần định nghĩa semantics và chỉ hỗ trợ phép toán có chủ đích.

## Quyết định 3 — Bounded preview + async execution

- **Decision:** Preview sync có cap; execution vượt ngưỡng thành job bất đồng bộ, snapshot chunks, status rõ ràng.
- **Rationale:** API nguồn có giới hạn và latency không ổn định; request đồng bộ lớn gây timeout, giữ tài nguyên và UI chờ.
- **Alternatives:** Tăng timeout và tải tất cả một lần (không ổn định); stream live join (khó retry/audit/reopen).
- **Trade-off:** Cần queue/worker/metrics/cleanup; progress là ước tính nếu nguồn không báo tiến độ.

## Đã xác minh trong repo

- `table-engine.ts` giới hạn một input array 5.000 rows và có filter/group/aggregate; `ReportSourceService` giới hạn mỗi API response 2 MiB.
- Table widget lưu source + config trong `ReportWidget.config`; không lưu result snapshot.
- `table-engine.ts` còn được `statistics.service.ts` sử dụng, do đó không thể xóa nguyên file khi thay dynamic report.
- Integration source allowlist/path/access/secret retrieval hiện ở API Gateway; executor placement tương lai cần quyết định trước implementation.

## Cần quyết định ở Phase 0

- Integration executor contract và pagination semantics từng API.
- Data classification, PII policy, retention/erase, snapshot ACL.
- Pilot, numerical SLOs, caps, concurrency/quota, partial results.
- JOIN type ngoài INNER/LEFT, timezone/decimal/date semantics, export formats.
- Lưu chunk kết quả trong MySQL JSON hay storage khác sau benchmark volume.

