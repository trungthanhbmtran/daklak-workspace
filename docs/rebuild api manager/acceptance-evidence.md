# Ma trận bằng chứng nghiệm thu

Ngày tạo: 06/10/2026. Trạng thái mọi AC: **chưa kiểm chứng implementation**. Các file đã đọc khi lập kế hoạch chỉ là evidence hiện trạng E-01..E-15, không chứng minh target đã đạt.

## Traceability

| AC | FR / user story | Task chính | Bằng chứng cần thu | Trạng thái | Artifact/command thực tế | Reviewer/ngày |
|---|---|---|---|---|---|---|
| AC-01 | FR-01/02/08, US-01/04 | T001/005/007/012/019/020/022 | Route/schema/consumer map + contract/build/E2E không route giả | Chưa kiểm chứng | Chưa có | Chưa có |
| AC-02 | FR-05, US-01/03/04 | T007/012/015/017 | PBAC/2-org/IDOR/direct gRPC/spoof snapshot tests | Chưa kiểm chứng | Chưa có | Chưa có |
| AC-03 | FR-02, US-01 | T006/008/015 | GET /a POST /b denied cross pair, template/traversal tests | Chưa kiểm chứng | Chưa có | Chưa có |
| AC-04 | FR-03, US-02 | T010/021 | Format fixtures, diff/overwrite/skip/atomic/stale/idempotency tests | Chưa kiểm chứng | Chưa có | Chưa có |
| AC-05 | FR-07/09, US-01/02/05 | T008/009/013 | OCC race + DB rollback + crash/replay outbox | Chưa kiểm chứng | Chưa có | Chưa có |
| AC-06 | FR-07/09, US-05 | T009/013/014/018 | Broker 2 replicas, revision collision, stale/invalid snapshot, poll recovery | Chưa kiểm chứng | Chưa có | Chưa có |
| AC-07 | FR-04/06, US-02/03 | T003/010/015 | SSRF/TLS/DNS/redirect/path + test-auth cũ không gọi mạng | Chưa kiểm chứng | Chưa có | Chưa có |
| AC-08 | FR-04, US-03 | T011/016/021 | Capability matrix/auth lifecycle/redaction API/log/cache/outbox | Chưa kiểm chứng | Chưa có | Chưa có |
| AC-09 | FR-06/09, US-03/05 | T014/015/016/017 | Quota/Redis failure/abort/payload/deadline/breaker/write unknown outcome | Chưa kiểm chứng | Chưa có | Chưa có |
| AC-10 | FR-06, US-03 | T017/019/021 | Partner 401/403/empty payload và session recovery E2E | Chưa kiểm chứng | Chưa có | Chưa có |
| AC-11 | FR-01..09, US-01..05 | T020/021/022/025 | Browser desktop/mobile/keyboard/error/retry/backend thật | Chưa kiểm chứng | Chưa có | Chưa có |
| AC-12 | FR-10, US-01/05 | T017/022/026 | Report definition cũ/mới, reference/data scope/disabled source | Chưa kiểm chứng | Chưa có | Chưa có |
| AC-13 | FR-07/10, US-01/05 | T006/026/027/028 | Dry-run counts/checksum/quarantine/restore/rollback giữ deny | Chưa kiểm chứng | Chưa có | Chưa có |
| AC-14 | FR-11, US-06 | T023/024 | One-time key/hash/scope/expiry/rotate/revoke SLA | Chưa chốt G-02 | Chưa có | Chưa có |

T025 tổng hợp mọi AC theo release scope. AC-14 chỉ được ghi không áp dụng khi G-02 quyết định rõ inbound ngoài bản phát hành; không tick hoàn thành chức năng chưa triển khai.

## Decision log

| Gate | Nội dung | Owner cần chốt | Trạng thái | Quyết định/evidence/ngày |
|---|---|---|---|---|
| G-01 | Owner/topology/tách service | Kiến trúc + ops + chủ sản phẩm | Phương án kế hoạch: user-service; chưa có quyết định vận hành mới | Chưa có |
| G-02 | Inbound/đối tác/endpoint và data scope | Chủ sản phẩm + chủ dữ liệu + ATTT | Chưa chốt | Chưa có |
| G-03 | Data/caller/organization/policy mapping/migration | Chủ dữ liệu + DBA + chủ module | Chưa chốt | Chưa có |
| G-04 | Secret backend/auth kinds/trusted destinations/CA | Ops + ATTT + chủ tích hợp | Chưa chốt | Chưa có |
| G-05 | SLO/quota/disable SLA/TTL/retention/compatibility/rollback | Ops + chủ sản phẩm + ATTT | Chưa chốt | Chưa có |

## Findings và disposition

| ID | Severity | Task/AC/target | Trigger + consequence | Evidence file/line hoặc command | Owner | Disposition/retest |
|---|---|---|---|---|---|---|
| Chưa có finding implementation | — | — | Chưa có implementation để review | — | — | — |

Findings của kế hoạch đã có tại mục phản biện trong plan.md; không đổi chúng thành bug đã sửa. Khi phát hiện khác biệt hiện trạng, sửa evidence E-xx và ghi lý do/căn cứ.

Evidence attachments nên đặt ở `evidence/` với tên task/AC + ngày; chỉ tạo khi có kết quả thật. Mỗi artifact phải nêu commit, môi trường, fixture, command, expected/actual, scope, reviewer và limitation. Không lưu raw token/credential/payload cá nhân.
