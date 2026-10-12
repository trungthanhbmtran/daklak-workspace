# Multi-Agent Pipeline: Plan → Critique → Parallel Code

Daklak Government Workflow Platform

Quy trình hỗn hợp tài khoản: Codex khảo sát blacklist, kiến trúc, lịch sử lỗi và Git history; sau đó lập plan và tự phản biện plan trước; sau khi plan đạt, Codex chuẩn bị hai lane Backend và Frontend. Khi daklak-agent-orchestrator MCP cùng hai runner tài khoản đã sẵn sàng, Codex dispatch tự động; nếu chưa, Codex xuất hai prompt sẵn dùng và nêu blocker. Các file trong subagents/ là tài liệu vai trò cũ/tham khảo. Antigravity tự phát hiện custom agents từ .agents/agents/.

## Vai trò và giai đoạn

| Vai trò | Cấu hình | Quyền và nhiệm vụ | Đầu ra |
|---|---|---|---|
| Codex Orchestrator | AGENTS.md, .agents/AGENTS.md | Khảo sát, lập plan, tự phản biện, rồi điều phối; chưa sửa mã sản phẩm trước PLAN_APPROVED. | .agents/current_plan.md có contract, acceptance criteria, file ownership và quyết định plan. |
| Backend Coder | .agents/agents/backend-coder.md | Chỉ sửa file backend được giao trong plan. | Backend diff và báo cáo kiểm chứng. |
| Frontend Coder | .agents/agents/frontend-coder.md | Chỉ sửa file frontend được giao trong plan. | Frontend diff và báo cáo kiểm chứng. |

## Quy trình bắt buộc

1. Codex khảo sát yêu cầu và repo, rồi ghi plan, contract, tiêu chí nghiệm thu, phụ thuộc và chủ sở hữu từng file vào .agents/current_plan.md.
2. Codex tự phản biện plan bằng checklist phù hợp. Nếu có lỗi, sửa plan và phản biện lại. Chỉ ghi PLAN_APPROVED khi rủi ro đã được xử lý.
3. Sau PLAN_APPROVED, Codex chuẩn bị hai task riêng nhưng cùng contract. Nếu MCP và runner tài khoản đã sẵn sàng, gọi prepare_agent_worktrees rồi dispatch hai lane song song; nếu chưa, xuất hai prompt độc lập và nêu blocker. Chỉ chạy song song khi file ownership không chồng lấn; task chỉ thuộc một lane thì chỉ chạy một coder.
4. Mỗi coder dùng worktree riêng, không sửa file điều phối hoặc file của nhau, không tự merge. Khi từng agent xong, Codex nghiệm thu riêng diff của agent đó theo file ownership, plan và checklist; ghi AGENT_ACCEPTED hoặc AGENT_REVISION_REQUIRED. Finding chỉ trả về đúng coder đó.
5. Chỉ tích hợp sau khi cả hai lane đều AGENT_ACCEPTED. Codex rà soát chéo contract và overlap trên diff hợp nhất, chạy verification tích hợp, rồi cập nhật plan/log/roadmap nếu cần.

## Handoff cho hai coder

Mỗi prompt phải bao gồm:
- Đường dẫn được giao và đường dẫn bị cấm.
- Contract đã chốt trong plan.
- Acceptance criteria và lệnh kiểm chứng phù hợp.
- Yêu cầu dùng worktree riêng và không tự merge.
- Yêu cầu báo cáo file thay đổi, chứng cứ kiểm chứng và blocker.

Không tạo handoff coder khi plan chưa có PLAN_APPROVED hoặc chưa chỉ rõ ownership. File shared như libs/**, root configs, roadmap.md, .agents/current_plan.md, và .agents/execution_log.md thuộc điều phối viên trừ khi plan giao rõ cho đúng một coder.

## Ranh giới mặc định

- Backend: apps/api-gateway/**, apps/*-service/**, shared/protos/**, shared/security/**.
- Frontend: apps/admin_khcn/**, apps/portal-goverment/**, packages/ui/**.
- libs/**, root configs và file shared chỉ có một owner được nêu rõ trong plan.
- Cấm hai coder sửa cùng một file. Nếu phát hiện overlap trong diff, dừng tích hợp và phân lại ownership.

## Giới hạn nền tảng

Các file repo định nghĩa role và cách handoff. Chúng không đăng nhập, chọn tài khoản hoặc tự khởi chạy ứng dụng Antigravity từ Codex. Muốn dispatch tự động xuyên nền tảng cần connector/API/SDK và xác thực riêng; không lưu thông tin đăng nhập trong repo.
## Decision visibility and project history

All roles follow .agents/roles/agent-operations.md. Before coding, consult the relevant blacklist, architecture/source-of-truth maps, targeted execution-log incidents, and Git history for affected paths; verify historical fixes against the current implementation. Do not read the full chronological execution log by default.

Each role writes a concise evidence-based decision record to its own file under .agents/reports/<task-id>/ using .agents/templates/decision-record.md. The user-visible record shows inspected sources, relevant prior failures, short rationale, files changed, actual checks, risks, and reviewer decision. It is a summary, not private chain-of-thought.