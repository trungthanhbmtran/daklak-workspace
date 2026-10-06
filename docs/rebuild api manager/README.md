# Rebuild API Manager — bộ tài liệu triển khai và rà soát

Ngày: 06/10/2026. Trạng thái bộ tài liệu: **đã lập và phản biện kế hoạch; các task chưa được xác nhận thực thi/kiểm chứng trong bộ này**.

Đây là bộ tài liệu chính cho yêu cầu tái cấu trúc toàn bộ module quản lý API, cho phép xây lại phần chưa đạt chuẩn. Agent thực thi và agent rà soát cùng dùng bộ tài liệu này. Việc tạo tài liệu không tự khởi động executor hoặc cấp quyền triển khai production.

## Đọc theo thứ tự

1. Đọc charter `.agents/AGENTS.md`, blacklist `.agents/BLACKLIST.md` và yêu cầu người dùng đang có hiệu lực.
2. [spec.md](spec.md): mục tiêu, user story và phạm vi.
3. [plan.md](plan.md): hiện trạng E-01..E-15, kiến trúc, giai đoạn P0..P7, decision gate, migration/rollback và phản biện.
4. [research.md](research.md): căn cứ quyết định, phương án thay thế và unknown chưa có bằng chứng vận hành.
5. [data-model.md](data-model.md) và [contracts.md](contracts.md): invariant, data owner, HTTP/gRPC/events và semantics tương thích.
6. [tasks.md](tasks.md): 29 tác vụ T001..T029 theo dependency; tất cả chưa hoàn thành.
7. [quickstart.md](quickstart.md): điều kiện chạy, command nền và tình huống nghiệm thu.
8. [review-checklist.md](review-checklist.md), [acceptance-evidence.md](acceptance-evidence.md), [execution-log.md](execution-log.md): tiêu chí rà soát và nơi ghi kết quả thực tế.

## Quy tắc thực thi

- Chỉ bắt đầu implementation khi yêu cầu người dùng hiện hành cho phép thực hiện. Trong lượt tạo bộ tài liệu này, phạm vi là lập kế hoạch.
- Thực hiện task theo dependency. Mỗi task phải có diff/file, test/command thực chạy và limitation. Không tick checkbox chỉ vì đã đọc hoặc viết kế hoạch.
- G-01..G-05 được chốt bởi owner ghi trong kế hoạch. Khi một gate chưa chốt, tiếp tục việc độc lập và dừng bước phụ thuộc; không đoán scope/credential/production SLO hoặc mở rộng quyền.
- Giữ một chủ dữ liệu cấu hình tại user-service trong đợt đầu, trừ khi G-01 đổi bằng ADR. Không cho Gateway đọc/ghi trực tiếp DB user-service.
- Không dual-write hai authority, không migration reset/drop trước inventory, không đưa secret/token vào docs/log/fixtures và không rollback mở lại TLS bypass hoặc quyền đã thu hồi.
- Áp dụng skills liên quan theo charter; bản chỉ dẫn không buộc cài model/plugin hoặc spawn agent. Không tuyên bố Gemini thực thi khi chưa có kết quả thực tế.
- Nếu nguồn mới mâu thuẫn với E-01..E-15 hoặc kế hoạch không thể thực hiện, ghi finding với severity/evidence và cập nhật kế hoạch sau phản biện trước bước bị ảnh hưởng.

## Quy tắc rà soát

Reviewer so sánh diff/contract/schema/runtime và consumer với spec; dùng checklist và AC, không chỉ nhìn checkbox task. Mỗi finding cần target file/line hoặc artifact, trigger, consequence, severity và disposition. Chỉ chấp nhận khi evidence chạy thật đủ theo scope; test skipped/no tests found không là pass.

Các gate trọng yếu: direct gRPC authorization, tổ chức/PBAC, cặp method/path, credential/TLS/SSRF, import atomic/idempotent, revision nhiều replica, report compatibility, migration và rollback giữ deny/revocation. Agent có thể ghi kết quả kiểm thử; quyền chấp nhận production/ngoại lệ thuộc reviewer/chủ hệ thống được chỉ định.

## Nguồn chính và các bản tương thích

- Các file tại thư mục này là nguồn chính để sửa kế hoạch/task/checklist/evidence.
- [Bản kế hoạch lưu trong docs/plans](../plans/api-management-rebuild.md) và [bản handoff](../../IMPLEMENTATION_PLAN.md) phải cập nhật đồng thời khi thay plan; nội dung thiết kế như nhau, đường dẫn liên kết được điều chỉnh theo vị trí.
- `specs/002-api-management-rebuild/` chỉ trỏ tới các file tương ứng ở đây để workflow cũ tìm được tài liệu; không tick hoặc chỉnh task ở bản khác.
- Kế hoạch báo cáo động trước đó vẫn được giữ tại `docs/plans/dynamic-report-designer.md`; không bị xóa khi đổi active handoff.

## Tình trạng kiểm chứng tài liệu

Đã khảo sát mã nguồn/contract/schema/consumer và ghi rủi ro có căn cứ. Việc kiểm tra liên kết, UTF-8, mã task/AC và đồng bộ bản kế hoạch được ghi trong execution log. Build, unit/integration/E2E, broker nhiều replica, load, DB production, migration và rollback thực tế chưa được chạy trong công việc chỉ lập tài liệu này.

Workspace có thay đổi source từ công việc khác trong lúc tổ chức tài liệu. E-01..E-15 là snapshot lúc khảo sát; T001/T002 phải đối chiếu commit/hiện trạng mới trước triển khai. Không ghi đè thay đổi đó hoặc tick task chỉ vì thấy file đã thay đổi.
