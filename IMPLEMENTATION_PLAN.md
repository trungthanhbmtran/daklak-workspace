# MỤC TIÊU HIỆN TẠI: Tái cấu trúc Workflow UI theo hướng No-Code
**(Xem chi tiết tại: `docs/plans/workflow-ui-no-code-refactoring.md`)**

## Các Bước Triển Khai Thực Tế

1. **Phase 1: Phân tách Business Mode & Expert Mode**
   - File đích: `PropertiesPanel.tsx`, `UserTaskProperties.tsx`
   - Cần thêm toggle State để ẩn hiện các config kỹ thuật.

2. **Phase 2: Visual Rule Builder cho Edge (Gateway)**
   - File đích: `EdgeProperties.tsx`, `RuleBuilderConfig.tsx`
   - UI kéo thả hoặc form tạo rule theo AST (Field, Operator, Value).

3. **Phase 3: Smart Assignment cho User Task**
   - File đích: `BasicConfig.tsx` (của user-task)
   - Chuyển JSON input sang UI chọn role/department/dynamic.

4. **Phase 4: Deployment & Binding UI**
   - File đích: `Topbar.tsx`
   - Thay thế dropdown "Gắn vào Form" bằng một modal/dialog cấu hình chi tiết (đối tượng áp dụng, điều kiện).

5. **Phase 5: Canvas Validation UX**
   - Highlight lỗi đỏ nếu lưu mà workflow cấu hình thiếu.

> **Ghi chú cho Executor Agent (Gemini):**
> Vui lòng triển khai theo từng bước (Phase) một. Yêu cầu build và test UI đảm bảo mọi thứ hiển thị chuẩn trước khi sang bước tiếp theo. Chú ý chỉ thay đổi ở giao diện, đảm bảo định dạng JSON đầu ra (Definition) không thay đổi quá lớn làm ảnh hưởng Backend Runtime.
