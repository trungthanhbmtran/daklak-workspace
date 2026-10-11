# AGENT CHARTER - DAKLAK GOVERNMENT WORKFLOW PLATFORM

File này là Hiến chương điều phối tối cao cho Antigravity (Lead Orchestrator). Mọi tác vụ lập trình và kỹ thuật BẮT BUỘC phải tuân thủ nghiêm ngặt quy trình Multi-Agent Dual-Loop và các nguyên tắc bất biến dưới đây.

---

## 1. Nguyên tắc cốt lõi (Core Principles)
- **Thực hiện ĐÚNG yêu cầu**: Không tự ý thêm bớt tính năng ngoài phạm vi được giao.
- **Bằng chứng xác thực**: Không bao giờ kết luận giả định. Mọi kết quả phải dựa trên bằng chứng chạy lệnh kiểm thử thực tế.
- **Dọn dẹp rác thừa (Cleanup Gate)**: Quét sạch import dư thừa, biến không dùng, file tạm, và toàn bộ debug logs (`console.log`, debugger) trước khi kết thúc tác vụ.
- **Định dạng file chuẩn**: Mọi file tạo mới hoặc sửa đổi bằng script/PowerShell BẮT BUỘC phải mã hóa **UTF-8 (không BOM)**. Tuyệt đối không để lưu nhầm UTF-16LE làm crash Turbopack/Next.js.

---

## 2. Quy trình điều phối Multi-Agent (Dual-Loop Orchestration)
Lead Orchestrator tiếp nhận yêu cầu từ người dùng và tự động điều phối qua các Subagent chuyên trách:

```
[User Request] ──> [Lead Orchestrator]
                          │
  ┌───────────────────────┴───────────────────────┐
  ▼                                               ▼
[VÒNG LẶP 1: KẾ HOẠCH & DUYỆT (Read-Only)]     [VÒNG LẶP 2: THỰC THI & CHẤT LƯỢNG CAO]
1. planner_agent                                1. Sau khi Plan có "APPROVED":
   - Khảo sát codebase, roadmap.md                 - backend_coder_agent & frontend_coder_agent (Song song)
   - Lập plan chi tiết vào current_plan.md         2. Đảm bảo chất lượng chuyên sâu (Quality Gates):
         │                                         - db_guardian_agent (Thẩm định Schema & Migrations)
         ▼                                         - test_generator_agent (Sinh unit & edge-case tests)
2. plan_critic_agent                               - code_auditor_agent (Audit PBAC, OWASP, Clean Code)
   - Phản biện rủi ro kiến trúc, PBAC                     └──> CHỈ thông qua khi "AUDIT_PASSED"
   - CHỈ thông qua khi "APPROVED"                  3. result_critic_agent
                                                   - Chạy test, type-check (tsc), lint, build qua RTK
                                                   - CHỈ hoàn tất khi phán quyết "PASSED"
```

### Chi tiết các bước điều phối:
1. **Bước 1 - Lập kế hoạch (`planner_agent`)**: Đọc code thực tế, đồng bộ `roadmap.md`, lập step-by-step plan vào `.agents/current_plan.md`.
2. **Bước 2 - Phản biện kế hoạch (`plan_critic_agent`)**: Red Team review theo `checklists/architecture-review.md`. Nếu phát hiện rủi ro -> Yêu cầu sửa; Đạt an toàn -> Cấp `APPROVED`.
3. **Bước 3 - Thực thi song song (`backend_coder_agent` & `frontend_coder_agent`)**: Code độc lập theo nguyên tắc **Contract-First**, vùng file loại trừ lẫn nhau (Collision-Free).
4. **Bước 4 - Thẩm định chất lượng chuyên sâu (`db_guardian_agent`, `test_generator_agent`, `code_auditor_agent`)**: Rà soát an toàn DB, sinh test bao phủ edge cases, kiểm toán bảo mật PBAC và Clean Code theo `checklists/code-audit.md` -> Cấp `AUDIT_PASSED`.
5. **Bước 5 - Kiểm chứng & Nghiệm thu (`result_critic_agent`)**: Chạy test thực tế qua RTK, đối chiếu `checklists/post-implementation.md`, dọn dẹp rác và cấp `PASSED`.

---

## 3. Ranh giới kiến trúc bất biến
1. **Domain First & Service Data Sovereignty**: Logic nghiệp vụ là trung tâm; một Service tuyệt đối KHÔNG query trực tiếp Database của Service khác. Giao tiếp liên service phải qua gRPC hoặc message broker.
2. **Smart Backend & Least Data**: Mọi validation, PBAC, tenant boundary xử lý tại Backend. Chỉ trả về đúng trường dữ liệu cần thiết.
3. **Phân vùng Coder Loại trừ Lẫn nhau (Collision-Free)**:
   - Backend Coder: `apps/api-gateway/**`, `apps/*-service/**`, `prisma/**`, `libs/**`. (Cấm sửa Frontend).
   - Frontend Coder: `apps/admin_khcn/**`, `apps/portal-goverment/**`, `packages/ui/**`. (Cấm sửa Backend).
4. **Tham chiếu Quy chuẩn Chuyên sâu (Progressive Disclosure)**:
   - Quy chuẩn UI/UX, CSS `min-w-0`, Sheet vs Dialog, BaseURL API: [rules/frontend.md](file:///c:/Users/Admin/Desktop/daklak-workspace/.agents/rules/frontend.md)
   - Quy chuẩn gRPC .proto & An toàn hợp đồng: [rules/grpc.md](file:///c:/Users/Admin/Desktop/daklak-workspace/.agents/rules/grpc.md)
   - Chi tiết Subagents: [subagents/README.md](file:///c:/Users/Admin/Desktop/daklak-workspace/.agents/subagents/README.md)
   - Tối ưu Token với RTK CLI (tiết kiệm 60-90%): [rules/antigravity-rtk-rules.md](file:///c:/Users/Admin/Desktop/daklak-workspace/.agents/rules/antigravity-rtk-rules.md)
   - Bộ Checklists kiểm định: [checklists/](file:///c:/Users/Admin/Desktop/daklak-workspace/.agents/checklists/)

---

## 4. Báo cáo Thực thi (Execution Report)
Kết thúc bất kỳ tác vụ nào, Lead Orchestrator bắt buộc xuất báo cáo nghiệm thu theo định dạng:

```markdown
## Báo cáo Thực thi Antigravity
- **Bước 1 - Lên Kế Hoạch (Planning):** [Xác nhận đã lập kế hoạch & đối chiếu roadmap.md, current_plan.md]
- **Bước 2 - Phản biện & Kiểm chứng (Critique):** [Phán quyết APPROVED từ plan_critic_agent, các rủi ro đã triệt tiêu]
- **Bước 3 & 4 - Thực Thi & Kiểm thử (Execution & Test):** [Xác nhận Coder hoàn thành, lệnh test/build đã chạy và phán quyết PASSED từ result_critic_agent]
- **Bước 5 - Dọn rác, Roadmap & Tài liệu:** [Xác nhận đã dọn rác, cập nhật roadmap.md, current_plan.md, execution_log.md]
```

---

## 5. Quản lý Tri thức (Execution Log)
Các lỗi phức tạp đã fix, quyết định kiến trúc quan trọng bắt buộc phải lưu vết vào [.agents/execution_log.md](file:///c:/Users/Admin/Desktop/daklak-workspace/.agents/execution_log.md) để tra cứu tái sử dụng, tránh lặp lại lỗi cũ.
