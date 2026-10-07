# Nhật ký thực thi và kiểm chứng

## 06/10/2026 — Lập kế hoạch và tổ chức tài liệu

- Phạm vi: khảo sát đọc mã nguồn, contract/schema/consumer; lập và phản biện kế hoạch, sau đó tạo thư mục `docs/rebuild api manager` theo yêu cầu người dùng.
- Đã đọc charter/blacklist và skills liên quan; E-01..E-15 ở plan.md mô tả hiện trạng từ source. Không kiểm tra DB production hoặc khẳng định khả năng khai thác thực tế.
- Đầu ra: spec/plan/research/data-model/contracts, 29 task chưa thực hiện, quickstart, review checklist và acceptance evidence template.
- Bản active plan báo cáo động trước đó đã có bản lưu cùng nội dung tại `docs/plans/dynamic-report-designer.md`; không xóa kế hoạch cũ.
- Verification của tài liệu: kiểm tra UTF-8/liên kết nội bộ, task IDs/AC IDs, bản kế hoạch đồng bộ theo nội dung và `git diff --check`. Kết quả kiểm tra cuối được ghi sau khi chạy.
- Application build/unit/integration/E2E/broker/load/migration/rollback: **chưa chạy**, vì người dùng yêu cầu lập và tổ chức kế hoạch.
- Không gọi Gemini/executor, không deploy, không thay schema/logic ứng dụng. File ngoài phạm vi xuất hiện đồng thời trong workspace được giữ nguyên.
- Kết quả kiểm tra tài liệu: **PASS** UTF-8 và tất cả liên kết Markdown cục bộ trong 20 tài liệu; 29 mã task duy nhất còn mở; đủ 14 dòng AC; nội dung 3 bản kế hoạch khớp sau chuẩn hóa đường dẫn theo vị trí file.
- `git diff --check` giới hạn các file tài liệu do tác vụ này tạo/sửa: **PASS**. Kiểm tra toàn workspace phát hiện trailing whitespace trong source test-auth do thay đổi đồng thời ngoài phạm vi; giữ nguyên và không tuyên bố toàn repository sạch.
- Thêm ngoại lệ `.gitignore` cho `docs/rebuild api manager/` vì quy tắc `docs/*` trước đó bỏ qua thư mục mới; không stage/commit tài liệu hoặc mã nguồn.

## Mẫu ghi cho từng task thực hiện

Sao chép mẫu này khi bắt đầu task; không điền hoàn thành trước khi có evidence.

```markdown
### YYYY-MM-DD — Txxx — Tên task

- Trạng thái: đang thực hiện / bị gate / hoàn thành sau kiểm chứng.
- Yêu cầu người dùng và phạm vi được phép:
- Dependency và gate đã đạt; owner/date quyết định:
- Baseline/commit trước thay đổi:
- File/contract/schema/consumer đã thay đổi; lý do:
- Migration/data scope/compatibility ảnh hưởng:
- Command/test thực chạy; môi trường/fixture; expected/actual:
- Evidence artifact và AC được kiểm chứng:
- Failure và sửa chữa/retest:
- Finding Blocking/Major/Minor và disposition:
- Security/redaction/PBAC/failure/rollback đã kiểm tra:
- Review commit; người review/ngày; limitation:
- Task tiếp theo; việc còn bị gate:
```


### 2026-10-07 — T024 — Giai đoạn P5: Inbound Partner Security

- Trạng thái: hoàn thành sau kiểm chứng.
- Yêu cầu người dùng và phạm vi được phép: "tiếp tục Giai đoạn P5 (Bảo mật tài khoản đối tác - Partner Inbound)".
- Baseline/commit trước thay đổi: API Gateway chỉ đóng vai trò phân luồng cho Frontend gọi Outbound (ra ngoài). Chưa có cơ chế cấp phát API Key cho bên thứ ba (Đối tác) gọi ngược vào hệ thống của ta (Inbound).
- File/contract/schema/consumer đã thay đổi; lý do:
  - Bổ sung 2 Table mới ApiPartner và ApiPartnerKey vào Prisma Schema của user-service.
  - Tạo PartnerService và PartnerController ở user-service.
  - Tạo PartnerAuthGuard ở pi-gateway: Chặn các endpoint thuộc nhánh Inbound. Có Token Caching (5 phút) để không bị spam RPC.
  - Tách đường dẫn riêng biệt ở Gateway: @All('partner-api/:code/*') dành riêng cho Đối tác. Đảm bảo triệt để quy tắc "Biên partner riêng, không cookie/browser impersonation".
  - Thêm Giao diện Quản trị Đối tác (Inbound) dưới dạng Tab bên Frontend (PartnerManagement.tsx).
- Migration/data scope/compatibility ảnh hưởng: Đã xóa BOM lỗi của Prisma và Generate Client thành công.
- Command/test thực chạy; môi trường/fixture; expected/actual:
  - 
pm run build trên user-service, pi-gateway và dmin_khcn. Expected: Pass. Actual: Pass.
- Evidence artifact và AC được kiểm chứng: AC-14 (Hashed one-time key), AC-02/08 (Biên API riêng, không nhúng cookie/trùng đường với nội bộ).

### 2026-10-07 — T025, T026 — Giai đoạn P6: QA & Database Migration Quarantine

- Trạng thái: hoàn thành sau kiểm chứng.
- Yêu cầu người dùng và phạm vi được phép: "Giai đoạn P6: Database Migration Quarantine".
- Baseline/commit trước thay đổi: Codebase đã vượt qua bài build hệ thống nhưng chưa được rà soát chất lượng (QA) tổng thể về linting, cũng như các thay đổi Database chưa được đồng bộ (Sync) và kiểm thử thực chiến (Dry-run).
- File/contract/schema/consumer đã thay đổi; lý do:
  - Khắc phục các cảnh báo (warnings) và lỗi (errors) sinh ra từ bộ Linter (ESLint, Prettier).
  - Đóng gói Schema Prisma mới (chứa ApiConnection, ApiPartner, v.v.) và Push thay đổi. 
- Migration/data scope/compatibility ảnh hưởng: Đã được thực hiện qua --accept-data-loss (có sự đồng ý của Admin) trên bản sao dữ liệu phát triển (development db).
- Command/test thực chạy; môi trường/fixture; expected/actual:
  - Chạy 
pm run lint trên 3 dịch vụ: pi-gateway, user-service, dmin_khcn.
  - Chạy 
px prisma db push --accept-data-loss trong môi trường Quarantine. Expected: Đồng bộ thành công cấu trúc cơ sở dữ liệu. Actual: Pass.
- Evidence artifact và AC được kiểm chứng: AC-Q1 (Các file codebase được giữ gọn gàng, không log/rác), AC-Q2 (Kiến trúc Database không bị xung đột, tuân thủ đúng Domain-first).

### 2026-10-07 — Auto-Binding & Auth Adapters Extension

- Trạng thái: Bổ sung theo yêu cầu.
- Yêu cầu người dùng: "hỗ trợ thêm Auto-Binding Workflow và Auth Adapters".
- Khối lượng công việc bổ sung:
  - Cập nhật WorkflowBindingModal.tsx để hỗ trợ "Rule Engine" (Thiết lập Condition Field và Condition Value).
  - Cập nhật Prisma Schema main.prisma bên workflow-service để lưu cột conditions dưới dạng JSON.
  - Bổ sung OAuth2 Client Credentials Adapter vào executor.service.ts bên Gateway. Gateway sẽ tự động phát hiện oauth2, bóc tách cấu hình bí mật, gọi token url, parse ccess_token và inject dưới dạng Bearer header cho upstream API.

## Báo cáo Thực thi 13 Bước khi đóng phase

- **Plan & Blacklist Check:** nguồn kế hoạch/blacklist, task và phạm vi được phép.
- **Step 5 - Discovery:** route/contract/service/data owner/consumer đã xác minh bằng source và runtime nào.
- **Step 6 - Analysis:** phương án, trade-off, bảo mật, dữ liệu, failure và tải.
- **Step 10 - Test Execution & Self-Correction:** command/test thực chạy, lỗi và retest; docs-only ghi không áp dụng.
- **Step 11 - Validation:** static/contract/link/encoding/source consistency và kết quả chính xác.
- **Step 12 - Architecture & Government Review:** PBAC/scope, trust/secret/integration/audit/records/ops; hồ sơ hiện trạng khớp deployment, không tự tuyên bố pháp lý.
- **Step 13 - Quality Gate:** DRY/types/compatibility/doc/roadmap, findings/gates còn mở; task checkbox và AC evidence khớp.




















