# AGENT CHARTER - DAKLAK GOVERNMENT WORKFLOW PLATFORM

File này là Hiến chương điều phối tối cao cho Antigravity (Lead Orchestrator). Mọi tác vụ lập trình và kỹ thuật BẮT BUỘC phải tuân thủ nghiêm ngặt quy trình Multi-Agent Dual-Loop và các nguyên tắc bất biến dưới đây.

---

## 1. Nguyên tắc cốt lõi (Core Principles)
- **Thực hiện ĐÚNG yêu cầu**: Không tự ý thêm bớt tính năng ngoài phạm vi được giao.
- **Bằng chứng xác thực**: Không bao giờ kết luận giả định. Mọi kết quả phải dựa trên bằng chứng chạy lệnh kiểm thử thực tế.
- **Dọn dẹp rác thừa (Cleanup Gate)**: Quét sạch import dư thừa, biến không dùng, file tạm, và toàn bộ debug logs (`console.log`, debugger) trước khi kết thúc tác vụ.
- **Định dạng file chuẩn**: Mọi file tạo mới hoặc sửa đổi bằng script/PowerShell BẮT BUỘC phải mã hóa **UTF-8 (không BOM)**. Tuyệt đối không để lưu nhầm UTF-16LE làm crash Turbopack/Next.js.

---

## 2. Quy trình điều phối Phân tầng Thông minh (Dynamic Dual-Tier Routing)
Để tối ưu hóa tốc độ phản hồi (15-30s cho tác vụ thường ngày) mà vẫn bảo đảm 100% chất lượng và an toàn hệ thống, Lead Orchestrator tự động phân loại yêu cầu vào 2 làn xử lý:

```
                      [Yêu cầu từ Người dùng]
                                │
                 ┌──────────────┴──────────────┐
                 ▼                             ▼
    [LÀN 1: FAST-TRACK (15 - 30s)]    [LÀN 2: FULL ENTERPRISE (2 - 3m)]
    (UI/CSS, Bugfix cục bộ 1-2 file,  (Chạm DB Prisma/Migration, .proto,
     Format, Refactor, Typo, Config)   PBAC scope, Cross-service >= 2)
                 │                             │
    Lead Orchestrator thực thi thẳng:          ▼
    1. Đọc code & Sửa trực tiếp       [VÒNG LẶP 1: KẾ HOẠCH & DUYỆT]
    2. Kiểm tra CSS min-w-0, UTF-8    1. planner_agent ➔ plan_critic_agent
    3. Chạy rtk tsc / test máy                 │ └──> APPROVED
    4. Dọn console.log & Nghiệm thu            ▼
                 │                    [VÒNG LẶP 2: THỰC THI & QUALITY GATES]
                 │                    2. backend_coder & frontend_coder
                 │                    3. db_guardian ➔ test_gen ➔ code_auditor
                 │                    4. result_critic_agent (rtk test/build)
                 │                             │
                 └──────────────┬──────────────┘
                                ▼
                       [BÁO CÁO THỰC THI]
```

### Tiêu chí phân loại rủi ro (Hard Boundary Rules):
1. **BẮT BUỘC ĐI LÀN 2 (Full Enterprise Subagents):**
   - Thay đổi `prisma/schema.prisma` hoặc file migrations CSDL -> Bắt buộc `db_guardian_agent`.
   - Thay đổi `.proto` hoặc gRPC contracts -> Bắt buộc `plan_critic_agent` + `code_auditor_agent`.
   - Đụng chạm phân quyền PBAC, Auth Guards, hoặc Tenant Context (`organizationId`) -> Bắt buộc `code_auditor_agent`.
   - Tính năng mới liên kết từ 2 microservices trở lên -> Bắt buộc đầy đủ 2 Vòng lặp Dual-Loop.
2. **ĐƯỢC PHÉP ĐI LÀN 1 (Fast-Track - Siêu tốc 15-30s):**
   - Toàn bộ các chỉnh sửa UI/UX, CSS Tailwind, SVG, Icons, Tabs, Modal/Drawer.
   - Sửa lỗi logic cục bộ trong 1-2 file service/controller/hook đã có contract rõ ràng.
   - Bổ sung trường hiển thị, format dữ liệu, sửa typing TypeScript.
   - **Cam kết chất lượng Làn 1:** Lead Orchestrator vẫn bắt buộc tự chạy `rtk tsc`/test máy để kiểm chứng, giữ nguyên chuẩn `min-w-0`, UTF-8 không BOM và dọn sạch `console.log`.

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
