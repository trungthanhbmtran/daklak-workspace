---
name: code2
description: >-
  Use this skill whenever the user calls /code2 or asks to execute a coding task via Code 2.
  Executes general coding tasks autonomously end-to-end with strict file scope isolation,
  adhering to the 7 inviolable technical constraints, running actual verification, and logging results.
---

# Code 2 — Autonomous End-to-End Coder Lane 2

## Execution Gate

Trước khi sửa file, đọc .agents/current_plan.md và xác nhận có PLAN_APPROVED cùng danh sách ownership khớp lane/task. Nếu chưa có plan được duyệt, chỉ chuẩn bị evidence/điểm cần quyết định cho Codex coordinator; không tự phê duyệt kế hoạch hoặc bắt đầu code. Khi cần đổi scope/contract, báo coordinator để cập nhật và phản biện lại trước khi tiếp tục.
Kỹ năng thực thi tác vụ lập trình độc lập (Lane 2) trọn gói từ đầu đến cuối (Full End-to-End).
Không phân chia Backend hay Frontend. Được sử dụng để thực thi độc lập một tác vụ với phạm vi file riêng biệt, chống trùng đè mã nguồn với các lane khác.

## Quy trình 6 bước thực thi End-to-End (Strict SDLC):

1. **Bước 1: Hiểu Cấu trúc Hệ thống & Kiểm tra Trùng lặp Chức năng (Architecture Pre-flight & Deduplication):**
   - Đọc kỹ yêu cầu trong prompt đi kèm `/code2`.
   - Tra cứu bản đồ kiến trúc hệ thống (`.agents/architecture/service-map.md`, `.agents/rules/source-of-truth.md`) để xác định đúng Service chủ quản sở hữu thực thể.
   - Kiểm tra xem tính năng/entity/DTO này đã tồn tại ở service nào chưa (ví dụ: VTVL, định biên, phân công nằm ở `user-service`; quy trình ở `workflow-service`; API nội bộ/liên thông ở `api-gateway`; báo cáo/dashboard ở `report-service`).
   - **Tuyệt đối KHÔNG code trùng lặp tính năng** hoặc tự ý xây dựng lại khung dữ liệu rời rạc ở service khác.

2. **Bước 2: Khảo sát Mã nguồn Thực tế & Khóa Ranh giới File (Real Code Inspection & Anti-Hallucination):**
   - **Triệt tiêu ảo giác AI:** Dùng công cụ đọc file (`view_file`, tìm kiếm code) mở trực tiếp các file schema (`schema.prisma`), contract gRPC (`shared/protos/`), controllers, routes liên quan trong repo. Tuyệt đối không suy đoán trường dữ liệu hoặc endpoint.
   - Khóa cứng danh sách các file thuộc sở hữu của tác vụ này; tuyệt đối không chạm vào file ngoài phạm vi để chống xung đột mã nguồn.
   - Với tác vụ frontend, bắt buộc đọc `.agents/rules/frontend.md` và API contract thực tế; xác định business rule/source of truth thuộc backend/service nào.
   - Với behavior/API/logic change, đọc `.agents/rules/testing.md`, xem scripts/config test của package và ghi regression case/lệnh kiểm chứng trong acceptance criteria.

3. **Bước 3: Hoạch định Giải pháp Kỹ thuật:**
   - Phân tích logic nghiệp vụ, luồng dữ liệu, API contract hoặc schema cần sửa đổi dựa trên dữ liệu thực tế đã khảo sát ở Bước 2.
   - Chuẩn bị giải pháp đối chiếu chặt chẽ với **7 Bộ ràng buộc kỹ thuật** trước khi sửa code.

4. **Bước 4: Thực thi Mã nguồn Chuẩn xác theo 7 Bộ Ràng buộc Kỹ thuật:**
   - **UI/UX & CSS Layout:** Bắt buộc `min-w-0` cho các thẻ con trực tiếp của `flex`/`grid` chứa text động; dùng `wrap-break-word` (Tailwind v4) cho văn bản dài, `break-all` khi cần ngắt ID/token dài; không dùng `break-words`. Lint warning mới trong file sửa phải được xử lý trước khi hoàn tất. Dùng `<Sheet>` cho form dài/cấu hình chi tiết; chỉ dùng `<Dialog>` cho xác nhận ngắn/alert.
   - **Frontend state & rendering:** đặt state ở component nhỏ nhất sở hữu hành vi; chỉ nâng state lên cha khi nhiều component thực sự dùng chung hoặc state thuộc URL. Không đưa state UI cục bộ vào global store, không lưu state suy ra lần nữa. Cô lập cập nhật để tránh re-render cả page/subtree không liên quan; dùng memoization khi có chi phí cụ thể, không rải đại trà. Với mỗi Dialog/Sheet, dùng controlled `open`/`onOpenChange` với state mặc định đóng và state riêng cho từng surface. Chỉ mount nội dung nặng, fetch hoặc transform dữ liệu sau khi người dùng mở; gate query bằng `enabled: open` hoặc guard tương đương, không tải khi page mount lúc modal/sheet còn đóng.
   - **Dumb client boundary:** Frontend chỉ trình bày dữ liệu, state tương tác cục bộ, định dạng hiển thị và gọi API contract/hook. Không sở hữu hoặc nhân đôi business rules, quyết định quyền cuối cùng, workflow transitions, KPI/số liệu cốt lõi hay validation bảo vệ dữ liệu. Backend là source of truth; client validation chỉ hỗ trợ UX. Nếu thiếu API/contract, ghi rõ gap và chuyển đúng backend owner/lane, không mock hay tự dựng luật trong UI.
   - **Routing Frontend:** Không thêm prefix `/admin` khi gọi API qua `apiClient` hoặc `serverFetch` (BaseURL đã có sẵn `/api/v1/admin`). Unwrap bằng `unwrapData()`.
   - **Next.js App Router theo version trong package:** Kiểm tra package và route types; nếu `params`/`searchParams` là Promise thì await trước khi đọc. Giữ `page.tsx` là Server Component gọn gàng, chuyển UI tương tác vào `*Client.tsx` ('use client').
   - **gRPC & Proto:** Serialize chuỗi an toàn (`metadataJson`) cho JSON phức tạp lồng nhau; luôn đính kèm metadata token xác thực (`GatewayContextToken`).
   - **CSDL & Prisma:** Additive migration (mọi cột mới PHẢI là nullable hoặc có `@default`). Tuyệt đối không gọi Prisma query trong vòng lặp (chống N+1). Index đầy đủ khóa ngoại.
   - **PBAC & Bảo mật:** Áp dụng organization/tenant scope cho truy vấn entity thuộc tenant theo ngữ cảnh đã xác thực; tôn trọng Service Data Sovereignty (không query trực tiếp DB của service khác).
   - **Vệ sinh & Encoding:** Lưu file UTF-8 (không BOM). Quét sạch 100% debug logs (`console.log`, `debugger`), imports và biến thừa.

5. **Bước 5: Kiểm chứng Máy Thực tế & Soi Diff Dòng-theo-dòng (Critique Gate):**
   - Từ package manifest của phần bị ảnh hưởng, chạy typecheck, lint và build phù hợp; không coi một lệnh thay thế tất cả. Ghi chính xác lệnh và kết quả.
   - **Behavior/runtime gate:** Theo `.agents/rules/testing.md`, mọi logic nghiệp vụ mới/bug fix phải có focused regression test bằng framework đã cấu hình trong package. Với flow behavior/API/UI, smoke test app/service thật ở route/endpoint bị sửa; kiểm tra happy path và edge cases liên quan. UI kiểm tra interaction và console/network; API dùng contract/integration verification; DB/schema validate/generate và migration trên DB test cô lập. Typecheck/build không thay cho runtime check. Nếu thiếu test framework hoặc môi trường chạy, ghi `UNVERIFIED`, lệnh đã thử, blocker, luồng chưa kiểm tra và thiếu hụt coverage; không tuyên bố pass.
   - Rà soát từng dòng `git diff` phản biện kết quả, kiểm tra edge cases trước khi hoàn tất.

6. **Bước 6: Dọn rác, Ghi Nhật ký & Báo cáo Nghiệm thu:**
   - Dọn sạch 100% debug logs, file tạm.
   - Ghi tóm tắt ngắn gọn các file đã sửa và kết quả kiểm chứng vào `.agents/execution_logs/code2.md`.
   - Xuất Báo cáo Thực thi đầy đủ theo chuẩn mục 5 của `AGENTS.md`.
