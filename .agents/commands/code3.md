# Command: Code 3 — Autonomous End-to-End Coder Lane 3

**Execution log:** `.agents/execution_logs/code3.md`  
**Decision record:** `.agents/reports/<task-id>/code3.md`

## Gate

Được kích hoạt trực tiếp khi người dùng gọi `/code3 <prompt>` hoặc chỉ định chạy tác vụ ở Lane 3.
Người dùng toàn quyền chọn Code 1, Code 2 hoặc Code 3 theo nhu cầu tách tác vụ và phạm vi file.

## Nguyên tắc & Kỹ năng

- **Bình đẳng kỹ năng:** Tuân thủ đầy đủ các kỹ năng trong `.agents/skills/` và 7 Bộ ràng buộc kỹ thuật như Code 1/2.
- **Lane full-stack:** Thực hiện trọn gói Backend, Frontend, Fullstack hoặc Scripts theo prompt; không phân chia chuyên môn theo số lane.
- **Cách ly phạm vi:** Chỉ sửa các file được giao, không chồng lấn phạm vi với lane khác.
- **Nhật ký độc lập:** Chỉ append vào `.agents/execution_logs/code3.md` và ghi decision record vào `.agents/reports/<task-id>/code3.md`. Không sửa log Code 1/2, `.agents/execution_log.md`, `.agents/current_plan.md`, `roadmap.md` hoặc file điều phối.

## Quy trình thực thi 6 bước (Strict SDLC)

1. **Hiểu cấu trúc hệ thống & chống trùng lặp:** Tra cứu `.agents/architecture/service-map.md`, `.agents/rules/source-of-truth.md`, xác định đúng Service chủ quản và kiểm tra chức năng đã tồn tại.
2. **Khảo sát mã nguồn & khóa ranh giới:** Đọc trực tiếp schema, proto, API và mã nguồn liên quan; không giả định cấu trúc. Liệt kê chính xác file Code 3 được phép sửa và xác nhận không xung đột lane khác.
   - Với tác vụ frontend, đọc `.agents/rules/frontend.md` và contract/API thực tế; xác định backend/service sở hữu nghiệp vụ.
3. **Hoạch định giải pháp:** Ghi hợp đồng, tiêu chí nghiệm thu, ownership, rủi ro và lệnh kiểm chứng; phản biện kế hoạch theo charter/blacklist/history trước khi triển khai, chờ `PLAN_APPROVED` theo quy trình repository.
4. **Thực thi:** Làm đúng prompt, tuân thủ đủ 7 Bộ ràng buộc; không sửa ngoài file ownership đã duyệt.
   - **Frontend state & modal/sheet:** State nằm ở component sở hữu nhỏ nhất; chỉ lift khi được chia sẻ thật sự, không lưu state suy ra hoặc đưa UI state cục bộ vào global store. Cô lập state để tránh re-render page/subtree không liên quan; không memoize đại trà. Mỗi Dialog/Sheet có controlled `open`/`onOpenChange`, mặc định đóng và state riêng. Chỉ mount nội dung nặng hoặc fetch/transform sau khi mở (query dùng `enabled: open`/guard); không tải từ lúc page mount khi còn đóng.
   - **Dumb client boundary:** Frontend chỉ render/present dữ liệu, giữ interaction state cục bộ và gọi API theo contract/hook. Không tự quyết định quyền cuối cùng, workflow, business rules, KPI/số liệu cốt lõi hoặc validation bảo vệ dữ liệu; Backend là source of truth. Client validation chỉ hỗ trợ UX. Thiếu API/contract thì ghi rõ gap cho backend owner/lane, không mock hoặc dựng rule trong UI.
5. **Kiểm chứng & soi diff:** Chạy lệnh kiểm chứng thực tế phù hợp (`rtk tsc --noEmit`, lint, test hoặc build); rà từng dòng diff, xử lý edge cases và không tuyên bố pass nếu chưa chạy. Mọi lint warning mới trong file sửa là lỗi cần xử lý, kể cả khi lệnh trả exit code 0. Với Tailwind v4, dùng `wrap-break-word`, không dùng `break-words`.
6. **Dọn dẹp & báo cáo:** Loại bỏ debug/file tạm, append kết quả vào đúng log Code 3, ghi decision record riêng và nêu rõ file, lệnh, kết quả, rủi ro còn lại.
