---
name: code3
description: >-
  Use this skill whenever the user calls /code3 or asks to execute a coding task via Code 3.
  Executes general coding tasks autonomously end-to-end with strict file scope isolation,
  adhering to the 7 inviolable technical constraints, running actual verification, and logging results.
---

# Code 3 — Autonomous End-to-End Coder Lane 3

Kỹ năng thực thi tác vụ lập trình độc lập (Lane 3) trọn gói từ đầu đến cuối (Full End-to-End).
Không phân chia Backend hay Frontend. Được sử dụng để thực thi độc lập một tác vụ với phạm vi file riêng biệt, chống trùng đè mã nguồn với các lane khác.

- **Nhật ký độc lập:** Chỉ append vào `.agents/execution_logs/code3.md` và ghi decision record tại `.agents/reports/<task-id>/code3.md`; không ghi vào log Code 1/2 hoặc file điều phối như `.agents/current_plan.md`, `roadmap.md`, `.agents/execution_log.md`.

## Quy trình 6 bước thực thi End-to-End (Strict SDLC):

1. **Bước 1: Hiểu Cấu trúc Hệ thống & Kiểm tra Trùng lặp Chức năng (Architecture Pre-flight & Deduplication):**
   - Đọc kỹ yêu cầu trong prompt đi kèm `/code3`.
   - Tra cứu bản đồ kiến trúc hệ thống (`.agents/architecture/service-map.md`, `.agents/rules/source-of-truth.md`) để xác định đúng Service chủ quản sở hữu thực thể.
   - Kiểm tra xem tính năng/entity/DTO này đã tồn tại ở service nào chưa (ví dụ: VTVL, định biên, phân công nằm ở `user-service`; quy trình ở `workflow-service`; API nội bộ/liên thông ở `api-gateway`; báo cáo/dashboard ở `report-service`).
   - **Tuyệt đối KHÔNG code trùng lặp tính năng** hoặc tự ý xây dựng lại khung dữ liệu rời rạc ở service khác.

2. **Bước 2: Khảo sát Mã nguồn Thực tế & Khóa Ranh giới File (Real Code Inspection & Anti-Hallucination):**
   - **Triệt tiêu ảo giác AI:** Dùng công cụ đọc file (`view_file`, tìm kiếm code) mở trực tiếp các file schema (`schema.prisma`), contract gRPC (`shared/protos/`), controllers, routes liên quan trong repo. Tuyệt đối không suy đoán trường dữ liệu hoặc endpoint.
   - Khóa cứng danh sách các file thuộc sở hữu của tác vụ này; tuyệt đối không chạm vào file ngoài phạm vi để chống xung đột mã nguồn.

3. **Bước 3: Hoạch định Giải pháp Kỹ thuật:**
   - Phân tích logic nghiệp vụ, luồng dữ liệu, API contract hoặc schema cần sửa đổi dựa trên dữ liệu thực tế đã khảo sát ở Bước 2.
   - Chuẩn bị giải pháp đối chiếu chặt chẽ với **7 Bộ ràng buộc kỹ thuật** trước khi sửa code.

4. **Bước 4: Thực thi Mã nguồn Chuẩn xác theo 7 Bộ Ràng buộc Kỹ thuật:**
   - **UI/UX & CSS Layout:** Bắt buộc `min-w-0` cho các thẻ con trực tiếp của `flex`/`grid` chứa text động; bắt buộc `break-words` cho chuỗi dài/ID/token; dùng `<Sheet>` cho form dài/cấu hình chi tiết; chỉ dùng `<Dialog>` cho xác nhận ngắn/alert.
   - **Routing Frontend:** Không thêm prefix `/admin` khi gọi API qua `apiClient` hoặc `serverFetch` (BaseURL đã có sẵn `/api/v1/admin`). Unwrap bằng `unwrapData()`.
   - **Next.js 15 App Router:** Bắt buộc `await params` / `await searchParams`. Giữ `page.tsx` là Server Component gọn gàng, chuyển UI tương tác vào `*Client.tsx` ('use client').
   - **gRPC & Proto:** Serialize chuỗi an toàn (`metadataJson`) cho JSON phức tạp lồng nhau; luôn đính kèm metadata token xác thực (`GatewayContextToken`).
   - **CSDL & Prisma:** Additive migration (mọi cột mới PHẢI là nullable hoặc có `@default`). Tuyệt đối không gọi Prisma query trong vòng lặp (chống N+1). Index đầy đủ khóa ngoại.
   - **PBAC & Bảo mật:** Ràng buộc `organizationId` của tenant trong mọi truy vấn; tôn trọng Service Data Sovereignty (không query trực tiếp DB của service khác).
   - **Vệ sinh & Encoding:** Lưu file UTF-8 (không BOM). Quét sạch 100% debug logs (`console.log`, `debugger`), imports và biến thừa.

5. **Bước 5: Kiểm chứng Máy Thực tế & Soi Diff Dòng-theo-dòng (Critique Gate):**
   - Chạy lệnh type check và build kiểm tra thực tế (ví dụ: `rtk tsc --noEmit` hoặc build service tương ứng).
   - Rà soát từng dòng `git diff` phản biện kết quả, kiểm tra edge cases trước khi hoàn tất.

6. **Bước 6: Dọn rác, Ghi Nhật ký & Báo cáo Nghiệm thu:**
   - Dọn sạch 100% debug logs, file tạm.
   - Ghi tóm tắt ngắn gọn các file đã sửa và kết quả kiểm chứng vào [.agents/execution_logs/code3.md](file:///c:/Users/Admin/Desktop/daklak-workspace/.agents/execution_logs/code3.md).
   - Xuất Báo cáo Thực thi đầy đủ theo chuẩn mục 5 của `AGENTS.md`.
