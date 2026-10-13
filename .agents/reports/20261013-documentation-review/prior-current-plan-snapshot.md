# Current Plan: Add Code 3 as an independent full-stack command

## Contract and acceptance criteria
- Add `/code3 <prompt>` as a third independent, autonomous full-stack command modeled on the current Code 1/Code 2 charter and six-step SDLC.
- Code 3 must use only `.agents/execution_logs/code3.md` for its append-only lane journal and `.agents/reports/<task-id>/code3.md` for its task decision record; it must not write Code 1/2 logs or coordinator-owned plans, roadmap, or shared archive.
- Register the command in the skill system, `analyze.md`, `plan.md`, dispatcher, charter, execution-log guide, and Git ignore exceptions so Code 3 is available throughout routing.
- Add a roadmap entry only after configuration assertions and diff checks pass.
- No product source, database, runner account, or existing Code 1/2 log content is in scope.

## Verified context and evidence
- Read root `AGENTS.md`, `.agents/AGENTS.md`, current Code 1/2 command and skill files, `implement.md`, execution-log guide, decision-record template, `.gitignore`, and the existing roadmap entry.
- Current Code 1 and Code 2 commands and skills define equivalent general full-stack lanes, not backend/frontend specialties; the current charter also requires user-selected lane routing and six-step end-to-end SDLC.
- Checked `.agents/rules/blacklist.md`, `.agents/rules/source-of-truth.md`, `.agents/architecture/service-map.md`, and architecture map references. No blacklist rule targets adding a command or lane log; service ownership maps do not affect an agent-configuration-only task.
- Searched `.agents/execution_log.md`, lane logs, reports, and Git history for affected paths. Historical records mention context fragmentation, overlapping ownership, and obsolete Backend/Frontend role claims; current commands/skills and charter confirm that the active contract is three peer full-stack lanes, with separate logs and coordinator-owned shared planning.
- Initial status was clean at plan time; unrelated tracked product changes and one untracked product file appeared later and were preserved.

## File ownership
- Coordinator-owned files: `.agents/current_plan.md`; `.agents/commands/code3.md`; `.agents/skills/code3/SKILL.md`; `.agents/execution_logs/code3.md`; `.agents/execution_logs/README.md`; `.agents/commands/implement.md`; `.agents/commands/analyze.md`; `.agents/commands/plan.md`; `.agents/AGENTS.md`; `.gitignore`; `.agents/reports/20261013-code3-lane/codex-orchestrator.md`; `.agents/execution_log.md`; `roadmap.md`.
- Preserve existing Code 1/2 logs and all unrelated files. Do not create a separate external agent profile: this repository's current execution model registers lanes through command and skill files.

## Implementation and verification
1. Add the Code 3 command and matching skill with identical full-stack scope and SDLC, while naming only Code 3's unique log/report paths.
2. Update analyze/plan routing, dispatcher, charter, execution-log documentation, and ignore exceptions to include Code 3 consistently; preserve Code 1/2 responsibilities.
3. Self-critique the plan against the charter, blacklist, history, source-of-truth maps, and exact ownership above.
4. After `PLAN_APPROVED`, verify analyze/plan/dispatcher references, six steps, full-stack scope, unique log/report paths, ignore behavior, and UTF-8 without BOM with PowerShell assertions; run `git diff --check` and review the scoped diff.
5. Append the roadmap completion record only after those checks pass. Product build/typecheck is not applicable because no runtime code changes.

## Plan critique — PLAN_APPROVED
- The repository's current command/skill mechanism is the established way to expose `/code1` and `/code2`; a third peer lane follows the active architecture without adding an unsupported agent profile or external runner assumption.
- Code 3 has exclusive command, skill, execution-log, and task-report paths. Coordinator-owned planning, roadmap, and shared history remain outside lane write ownership; no Code 1/2 file is assigned to Code 3.
- The blacklist and architecture maps reveal no conflict for this configuration-only change. Historical Backend/Frontend wording is stale relative to the live charter and commands, so new references will describe three full-stack lanes consistently without rewriting past execution records.
- Verification will exercise command/skill registration, analyze/plan/dispatcher routing, and isolation directly; no application build is warranted because no runtime code changes.

## Execution status
- PLAN_APPROVED; Code 3 configuration assertions and `git diff --check` passed, then roadmap was updated. Full review found unrelated product changes in `AiQuotaPlanModal.tsx`, `ReportViewer.tsx`, `m05-baocao-quyetdinh.xml`, plus untracked `mau05DecisionHelper.ts`; all were left untouched.

---

# Kế hoạch hiện tại: Tách lệnh Code 1 / Code 2 và nhật ký riêng cho từng coder

## Yêu cầu và hợp đồng
- Code 1 là Backend Coder, được gọi qua .agents/commands/code1.md. Code 2 là Frontend Coder, được gọi qua .agents/commands/code2.md.
- Mỗi coder chỉ sửa file plan giao, chạy checks đã duyệt, append vào đúng execution log riêng, và tạo decision record riêng trong .agents/reports/<task-id>/. Không ghi vào shared .agents/execution_log.md, plan, roadmap hoặc log của lane còn lại.
- implement.md điều phối một lane khi phù hợp, hoặc cả hai khi file ownership độc lập và không overlap. Giữ nguyên PLAN_APPROVED gate và charter kỹ thuật.
- Sau kiểm tra cấu hình đạt, ghi mục hoàn tất vào roadmap.md.

## Context digest đã xác minh
- Hiện trạng ban đầu: chỉ có command implement cho cả hai; cả hai profile cấm sửa .agents/execution_log.md và lưu report theo task nhưng chưa có persistent execution log riêng.
- Đã đọc root AGENTS.md, .agents/AGENTS.md, .agents/roles/{codex-orchestrator,agent-operations}.md, .agents/commands/{analyze,plan,implement,review}.md, profile Backend/Frontend, blacklist và architecture/source-of-truth maps.
- Blacklist không có quy tắc cụ thể về command/log. Lịch sử trong .agents/execution_log.md: tách context làm mất các kỹ thuật bắt buộc; cấu hình cũ có command/code ownership chồng lấn; coder trước đây tự sửa current_plan. Bảo toàn charter/context digest, chặn file điều phối khỏi coder và dùng log sở hữu riêng.
- Architecture maps phục vụ service boundaries; task chỉ thay đổi agent config nên không đụng service/product code.
- Working tree có thay đổi HRM/Prisma/proto và report trước đó; phải giữ nguyên.
- MCP pipeline báo ready, accountMode=shared và quota dùng chung. Lệnh prepare_agent_worktrees đã từ chối do source checkout có thay đổi chưa commit. Không có coder được dispatch; prompts độc lập đã lưu tại .agents/reports/20261013-independent-code-lanes/.

## File ownership
| Lane | Files |
|---|---|
| Code 1 (Backend) | .agents/commands/code1.md; .agents/agents/backend-coder.md; .agents/agents/backend-coder/agent.md; .agents/execution_logs/code1-backend.md |
| Code 2 (Frontend) | .agents/commands/code2.md; .agents/agents/frontend-coder.md; .agents/agents/frontend-coder/agent.md; .agents/execution_logs/code2-frontend.md |
| Codex coordinator | .agents/commands/implement.md; .agents/commands/analyze.md; .agents/commands/plan.md; .agents/AGENTS.md; .agents/roles/agent-operations.md; .agents/subagents/README.md; .agents/execution_logs/README.md; .agents/README.md (local ignored artifact restored to original); .gitignore; AGENTS.md; roadmap.md; .agents/reports/20261013-independent-code-lanes/*; .agents/current_plan.md; .agents/execution_log.md |

## Acceptance & verification
1. Code 1/2 map to distinct role profiles, exact ownership, isolated worktrees, approved-plan gate, unique execution logs and unique task reports.
2. Both lanes explicitly forbid editing each other's logs and coordinator-owned plan/roadmap/shared history.
3. Shared docs and dispatcher route one or both lanes consistently; gitignore tracks new command and log files.
4. Verify references/ownership/gate/log separation and UTF-8 no BOM; inspect scoped diff and ensure unrelated dirty files remain unchanged.
5. Append roadmap only after checks pass. No app build/typecheck needed because no product/runtime code changes.

## Plan critique — PLAN_APPROVED
- File owners do not overlap: Code 1 owns only backend command/profile/log; Code 2 owns only frontend command/profile/log; coordinator owns dispatcher, shared charter and roadmap.
- Preserve shared historical execution_log for coordinator only, satisfying existing charter while isolating coder logs.
- Require same approved context digest to prevent the documented context fragmentation incident.
- Worktree setup is blocked by unrelated dirty user files; avoid dispatch and preserve ready handoff prompts. Coordinator may finish only the reviewed agent-configuration/docs integration in this checkout.

## Execution status
- PLAN_APPROVED.
- Worktree preparation refused by orchestrator because of unrelated uncommitted HRM/proto changes. Both lane prompts saved but not dispatched.
- Codex integrated the agent-config change locally; no product code or database behavior changed.
- Final configuration assertions and scoped diff review passed; roadmap.md updated.

---

# Kế Hoạch Triển Khai: Cấu Hình Chỉ Tiêu Định Biên Theo Vị Trí Việc Làm Từng Bộ Phận (manual-selector)

## 1. Yêu Cầu & Bối Cảnh Nghiệp Vụ
- **URL**: `http://113.184.220.82/admin/services/hrm/work-plans/manual-selector`
- **Mục tiêu**:
  1. Chiếu theo Vị trí việc làm (VTVL) đã có theo từng bộ phận trong tổ chức: Cho phép chọn/lọc Bộ phận (đơn vị/phòng ban) trong cơ cấu tổ chức, nạp danh sách VTVL của bộ phận đó (lấy từ dữ liệu định biên biên chế `OrganizationStaffing` của bộ phận, hiển thị rõ số lượng biên chế). Vẫn giữ khả năng lọc theo danh mục chuẩn (Công chức, Viên chức, Khối Đảng).
  2. Gán số lượng phải thực hiện theo Tháng, Quý, Năm: Cho phép thiết lập và lưu trữ chỉ tiêu công việc định biên tương ứng cho 3 kỳ: Tháng (Monthly), Quý (Quarterly), Năm (Yearly), cùng trọng số và đơn vị tính.

## 2. Ranh Giới Tệp & Phân Quyền Sở Hữu File
| File | Vai trò | Thay đổi chính |
|------|---------|----------------|
| `shared/protos/hrm/rank_quota.proto` | Proto contract | Bổ sung `departmentId`, `unitCode`, `monthlyTarget`, `quarterlyTarget`, `yearlyTarget` vào message `RankQuota`, `RankQuotaPayload`, `SaveRankQuotasRequest`, `GetRankQuotasByRankRequest` |
| `apps/hrm-service/prisma/schema/task_template.prisma` | DB Schema | Bổ sung các cột additive `departmentId`, `unitCode`, `monthlyTarget`, `quarterlyTarget`, `yearlyTarget` vào model `RankQuota` |
| `apps/hrm-service/src/modules/task-catalog/task-catalog.service.ts` | Backend HRM | Cập nhật `saveRankQuotas` và `getRankQuotasByRank` để lưu/truy vấn theo `departmentId`, `monthlyTarget`, `quarterlyTarget`, `yearlyTarget` |
| `apps/api-gateway/src/modules/hrm/rank-quotas.controller.ts` | API Gateway | Chuyển tiếp `departmentId`, `unitCode` từ request body/query sang gRPC microservice |
| `apps/admin_khcn/features/hrm/api/rank-quotas.api.ts` | Frontend API | Mở rộng `RankQuotaPayload` và tham số `departmentId`, `unitCode` cho `save` và `getByRank` |
| `apps/admin_khcn/features/hrm/components/work-plans/master-plans/ManualPlanSelectorByRankClient.tsx` | Frontend UI | Tích hợp bộ chọn Bộ phận tổ chức (`OrganizationUnitSelector`), hiển thị VTVL theo bộ phận, input và bảng gán số lượng thực hiện theo Tháng, Quý, Năm |

## 3. Rà Soát 7 Bộ Ràng Buộc Kỹ Thuật (Charter Constraints)
1. **UI/UX**:
   - Mọi flex child có chứa text động phải có `min-w-0`.
   - Chuỗi dài có `break-words`.
   - Title có `truncate` hoặc `line-clamp-x`.
   - Không bóp nghẹt container bằng `max-w-5xl`.
2. **Routing & BaseURL**:
   - `apiClient` trong `admin_khcn` đã có prefix `/api/v1/admin`, KHÔNG thêm `/admin` vào đường dẫn API (giữ `/hrm/rank-quotas`).
   - Xử lý response unwrapping đúng chuẩn.
3. **Next.js 15 App Router**:
   - Page giữ Server Component, logic tương tác nằm trọn trong Client Component (`ManualPlanSelectorByRankClient.tsx` với `'use client'`).
4. **gRPC & .proto**:
   - Protobuf 3: Các trường mới đánh số thứ tự tiếp theo, kiểu tương thích.
5. **Additive Database Migration**:
   - Mọi cột mới đều `nullable` hoặc có `@default(...)`.
   - Không drop/rename cột.
   - Thêm `@@index([departmentId])`.
6. **PBAC & Service Sovereignty**:
   - Token gateway context delegation đầy đủ.
   - Giữ nguyên `organizationId` scope.
7. **Clean Code & Encoding**:
   - 100% UTF-8 không BOM.
   - Không console.log hay debug sót lại.

## 4. Tiêu Chí Nghiệm Thu (Acceptance Criteria)
1. Vào `http://113.184.220.82/admin/services/hrm/work-plans/manual-selector`, người dùng có thể:
   - Chọn một bộ phận trong tổ chức (VD: Ban Tổ chức Tỉnh ủy, Văn phòng, Phòng Tổ chức cán bộ, Phòng Bảo vệ chính trị nội bộ...) hoặc chọn "Dùng chung toàn tỉnh".
   - Khi chọn bộ phận, danh sách VTVL hiển thị đúng các chức danh/vị trí được định biên của bộ phận đó kèm badge số lượng định biên.
   - Chọn một VTVL, chọn nhiệm vụ mẫu, nhập chỉ tiêu Tháng, Quý, Năm và Trọng số, bấm "Thêm".
   - Bảng danh sách hiển thị đầy đủ các cột: Tên nhiệm vụ, Đơn vị, Chỉ tiêu Tháng, Chỉ tiêu Quý, Chỉ tiêu Năm, Trọng số, Xóa.
   - Cho phép chỉnh sửa trực tiếp các chỉ tiêu Tháng, Quý, Năm ngay trên từng dòng của bảng.
   - Bấm "LƯU CẤU TRÚC ĐỊNH BIÊN" lưu thành công vào CSDL và toast thông báo thành công.
   - Tải lại trang hoặc chuyển VTVL thì dữ liệu định biên Tháng, Quý, Năm được nạp lại chính xác.

## 5. Phản Biện Kế Hoạch (Plan Critique)
- **Rủi ro CSDL**: Bảng `rank_quotas` đang có 5+ bản ghi trên môi trường chạy. Thêm cột mới bằng `ALTER TABLE ... ADD COLUMN ... NULL` đảm bảo không mất dữ liệu cũ và không downtime.
- **Rủi ro Fallback**: Nếu một bộ phận chưa có định biên riêng, hệ thống tự động fallback hiển thị định biên mẫu chung theo `rankCode` để người dùng không gặp màn hình trống.
- **Rủi ro UX**: Tự động tính Quý = Tháng * 3 và Năm = Tháng * 12 khi người dùng gõ số Tháng giúp tăng tốc nhập liệu x3 lần, nhưng vẫn cho phép sửa độc lập.

**KẾT LUẬN PHẢN BIỆN**:
`PLAN_APPROVED`


## Dispatch status (2026-10-13)
- Pipeline status reported ready, accountMode=shared, quotaPoolShared=true; this is one shared Antigravity account/session, not separate sessions.
- Isolated backend path was created at .agent-worktrees/20261013-hrm-digitize-five-forms/backend from HEAD de346b51819dafc618c8a3f37a64e34f17ce6968.
- run_backend_agent failed before starting the coder: runner CLI error said --print took "--output-format" as the prompt and ignored the intended prompt.
- After dispatch failure, the backend worktree showed unrelated edits for rank quota/task template (including shared/protos/hrm/rank_quota.proto and a new rank-quota migration). These were not created by this task and were left untouched. Do not dispatch into that worktree or clean it.
- No product code edits or database seed were performed. A ready-to-run backend prompt is saved alongside this record.
- Status: PLAN_APPROVED; BACKEND_RUNNER_BLOCKED; no AGENT_ACCEPTED/REVISION_REQUIRED decision because no coder ran.