# Command: Code 2 — Autonomous End-to-End Coder Lane 2

**Execution log:** `.agents/execution_logs/code2.md`  
**Decision record:** `.agents/reports/<task-id>/code2.md`

## Gate

Được kích hoạt trực tiếp khi người dùng gọi `/code2 <prompt>` hoặc chỉ định chạy tác vụ ở Lane 2.
Với tác vụ một lane, người dùng có thể chỉ định Code 2. Khi kế hoạch đã duyệt tách Backend/Frontend, coordinator giao ownership và lane; năng lực full-stack của lane không thay đổi phạm vi đó.

## Nguyên tắc & Kỹ năng

- **Bình đẳng kỹ năng:** Tuân thủ đầy đủ 100% các kỹ năng trong `.agents/skills/` (Prisma, NestJS, gRPC, powershell-utf8, critical-review...) và 7 Bộ ràng buộc kỹ thuật.
- **Không phân chia Backend / Frontend:** Nắm trọn vẹn năng lực Full-stack từ đầu đến cuối.
- **Cách ly phạm vi:** Chỉ sửa các file được giao trong prompt, tuyệt đối không đè lên file của lane khác.

## Quy trình thực thi 6 bước (Strict SDLC):

1. **Hiểu cấu trúc hệ thống & Chống trùng lặp:** Tra cứu kiến trúc (`.agents/architecture/service-map.md`, `.agents/rules/source-of-truth.md`), xác định đúng Service chủ quản (VTVL/định biên tại `user-service`, quy trình tại `workflow-service`, kết nối tại `api-gateway`, báo cáo tại `report-service`). Tuyệt đối không code trùng lặp chức năng.
2. **Khảo sát mã nguồn thực tế & Khóa ranh giới (Chống ảo giác AI):** Đọc trực tiếp các file schema, proto, API trong repo để lấy dữ liệu thực tế (Zero Assumptions). Khóa danh sách file độc lập.
   - Với tác vụ frontend, đọc `.agents/rules/frontend.md` và contract/API thực tế; xác định backend/service sở hữu nghiệp vụ.
   - Với behavior/API/logic change, đọc `.agents/rules/testing.md`, kiểm tra scripts/config test và ghi regression case/lệnh trước khi triển khai.
3. **Nắm kế hoạch đã duyệt:** Xác nhận PLAN_APPROVED, contract và ownership. Nếu cần đổi scope hoặc contract, báo coordinator để cập nhật và phản biện kế hoạch trước khi sửa.
4. **Thực thi mã nguồn:** Triển khai code chuẩn xác (min-w-0, `wrap-break-word` theo Tailwind v4, Sheet/Dialog, Next.js App Router theo package version, BaseURL không lặp tiền tố /admin, additive migration, PBAC scope, UTF-8 không BOM). Không dùng `break-words`; lint warning mới trong file sửa là lỗi cần xử lý.
   - **Frontend state & modal/sheet:** State nằm ở component sở hữu nhỏ nhất; chỉ lift khi được chia sẻ thật sự, không lưu state suy ra hoặc đưa UI state cục bộ vào global store. Cô lập state để tránh re-render page/subtree không liên quan; không memoize đại trà. Mỗi Dialog/Sheet có controlled `open`/`onOpenChange`, mặc định đóng và state riêng. Chỉ mount nội dung nặng hoặc fetch/transform sau khi mở (query dùng `enabled: open`/guard); không tải từ lúc page mount khi còn đóng.
   - **Dumb client boundary:** Frontend chỉ render/present dữ liệu, giữ interaction state cục bộ và gọi API theo contract/hook. Không tự quyết định quyền cuối cùng, workflow, business rules, KPI/số liệu cốt lõi hoặc validation bảo vệ dữ liệu; Backend là source of truth. Client validation chỉ hỗ trợ UX. Thiếu API/contract thì ghi rõ gap cho backend owner/lane, không mock hoặc dựng rule trong UI.
5. **Kiểm chứng tĩnh & soi diff:** Theo scripts trong package bị ảnh hưởng, chạy typecheck, lint và build phù hợp; xử lý warning mới, rồi soi từng dòng git diff đối chiếu 7 Bộ ràng buộc kỹ thuật.
   - **Runtime verification:** Theo `.agents/rules/testing.md`, logic nghiệp vụ mới/bug fix cần focused regression test bằng framework đã cấu hình. Với behavior/API/UI, smoke test app/service thật trên flow bị sửa và kiểm tra happy path/edge cases; UI xem interaction/console/network; API chạy contract/integration; schema validate/generate/migration trên DB test cô lập. Nếu thiếu test framework/môi trường, ghi `UNVERIFIED`, exact command, blocker, flow chưa kiểm tra và gap coverage; không tuyên bố pass.
6. **Dọn rác & Báo cáo:** Xóa 100% debug logs, ghi nhật ký vào `.agents/execution_logs/code2.md`, xuất báo cáo nghiệm thu chuẩn mục 5 của `AGENTS.md`.
