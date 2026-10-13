# Pre-Implementation Checklist
**Áp dụng bởi:** Coder lane được giao (code1, code2, code3) trước khi chỉnh sửa mã nguồn

- [ ] **Kế hoạch đã duyệt:** Có PLAN_APPROVED; contract, tiêu chí, verification và danh sách file ownership chính xác đã được ghi trước khi sửa mã nguồn?
- [ ] **Hiểu Cấu trúc Hệ thống & Source of Truth:**
  - [ ] Đã tra cứu `.agents/architecture/service-map.md` và `.agents/rules/source-of-truth.md`?
  - [ ] Đã xác định đúng Service chủ quản sở hữu thực thể (VTVL/định biên tại `user-service`, quy trình tại `workflow-service`, kết nối tại `api-gateway`, báo cáo tại `report-service`)?
- [ ] **Chống Trùng lặp Chức năng (Zero Duplication):**
  - [ ] Đã kiểm tra toàn bộ hệ thống xem chức năng, model, hoặc DTO này đã có chưa?
  - [ ] Tuyệt đối KHÔNG tự ý tạo mới bảng CSDL hoặc module nếu thực thể thuộc về service khác?
- [ ] **Triệt tiêu Ảo giác AI (Anti-AI Hallucination & Zero Assumptions):**
  - [ ] Đã mở và đọc trực tiếp các file thực tế trong repo (`schema.prisma`, `.proto`, controllers, types)?
  - [ ] Xác nhận KHÔNG giả định tên trường, tên bảng, endpoint hay method nào chưa được kiểm chứng trong code?
- [ ] **Khóa Ranh giới File (Scope Isolation):**
  - [ ] Đã xác định và khóa cứng danh sách các file thuộc sở hữu của tác vụ này?
  - [ ] Không sửa lan sang các file ngoài phạm vi để chống xung đột với lane khác?
- [ ] **Hoạch định theo 7 Bộ Ràng buộc Kỹ thuật:**
  - [ ] Đã đối chiếu các tiêu chí: min-w-0, `wrap-break-word` theo Tailwind v4 (không dùng `break-words`), Sheet vs Dialog, BaseURL không lặp `/admin`, Next.js App Router theo phiên bản khai báo trong package manifest, Additive migration, PBAC tenant scope, UTF-8 không BOM?
  - [ ] Đã xác định component sở hữu từng state UI; state nào cần chia sẻ/lift, và modal/sheet nào phải trì hoãn mount/fetch đến khi mở?
  - [ ] Đã chọn acceptance flow, edge cases và lệnh kiểm chứng hành vi/runtime cho phần bị ảnh hưởng?
  - [ ] Logic mới/bug fix có regression case; đã kiểm tra test framework/scripts của package và chọn lệnh kiểm chứng phù hợp?
