# Roadmap Dá»± Ãn Daklak-Workspace

TÃ i liá»‡u nÃ y lÆ°u váº¿t tiáº¿n Ä‘á»™ vÃ  cÃ¡c tÃ¡c vá»¥ phÃ¡t sinh (hotfixes, tÃ­nh nÄƒng má»›i) trong quÃ¡ trÃ¬nh váº­n hÃ nh cá»§a Antigravity Agent, theo nhÆ° yÃªu cáº§u trong `AGENTS.md`.

## Unplanned Tasks / Hotfixes

- [x] **HoÃ n thiá»‡n Workflow Binding Modal cho Auto-Binding (07/10/2026)**
  - **TÃ¡c vá»¥**: ThÃªm component `WorkflowBindingModal.tsx` vÃ  gáº¯n vÃ o `WorkflowBindingList.tsx`.
  - **Chi tiáº¿t**: Form cho phÃ©p chá»n Process Type (Äá»‘i tÆ°á»£ng nghiá»‡p vá»¥), Trigger (Sá»± kiá»‡n), vÃ  Quy trÃ¬nh thá»±c thi. Dá»¯ liá»‡u Ä‘Æ°á»£c gá»i tá»« API `/admin/workflow/catalog/process-types` vÃ  `/admin/workflow` Ä‘á»ƒ káº¿t ná»‘i linh hoáº¡t cÃ¡c trigger sá»± kiá»‡n vá»›i Ä‘á»‹nh nghÄ©a workflow mÃ  khÃ´ng cáº§n code.

- [x] **RÃ  soÃ¡t vÃ  lÃªn phÆ°Æ¡ng Ã¡n tÃ¡i cáº¥u trÃºc giao diá»‡n vÃ  há»‡ thá»‘ng quy trÃ¬nh nghiá»‡p vá»¥ (Workflow)**
  - TÃ¡c vá»¥: Tá»•ng há»£p tÃ i liá»‡u thiáº¿t káº¿ vÃ  tÃ¬nh tráº¡ng trá»±c tiáº¿p tá»« `/admin/services/workflow/workflows` Ä‘á»ƒ lÃªn phÆ°Æ¡ng Ã¡n tÃ¡i cáº¥u trÃºc giao diá»‡n (No-Code, Offline-Tolerant) vÃ  backend (PBAC, Idempotency, Transactional Outbox) ra má»™t artifact Ä‘á» xuáº¥t Ä‘á»™c láº­p.
- [x] **Thá»±c thi phÆ°Æ¡ng Ã¡n tÃ¡i cáº¥u trÃºc UI Workflow (No-Code & Binding)**
  - TÃ¡c vá»¥: Cáº­p nháº­t giao diá»‡n `WorkflowBindingList.tsx` Ä‘á»ƒ sá»­ dá»¥ng endpoint má»›i tá»« API Gateway thay cho endpoint deprecated. XÃ¡c nháº­n cÃ¡c tÃ­nh nÄƒng "Business Mode Toggle", "Rule Builder", "Assignment Builder", vÃ  "Glow Red Validation" Ä‘Ã£ Ä‘Æ°á»£c cÃ i Ä‘áº·t Ä‘áº§y Ä‘á»§ theo Giai Ä‘oáº¡n 3 & 5 cá»§a thiáº¿t káº¿ há»‡ thá»‘ng.

- [x] **RÃ  soÃ¡t chá»©c nÄƒng há»‡ thá»‘ng so vá»›i Äá» bÃ i kiá»ƒm tra nÄƒng lá»±c (CÃ¢u 2)**
  - TÃ¡c vá»¥: ÄÃ¡nh giÃ¡ há»‡ thá»‘ng theo 9 tiÃªu chÃ­ cá»§a CÃ¢u 2 trong tÃ i liá»‡u kiá»ƒm tra nÄƒng lá»±c vÃ  viáº¿t bÃ¡o cÃ¡o vÃ o `docs/Ra_soat_chuc_nang_cau_2.md`.

- [x] **[Hotfix] Sá»­a lá»—i parse JSON bá»‹ corrupted thÃ nh `"[object Object]"` trong Integration Upstream (07/10/2026)**
  - **Váº¥n Ä‘á»**: CÃ¡c thiáº¿t láº­p endpoints cá»§a API trong `/admin/hub` khÃ´ng lÆ°u Ä‘Æ°á»£c vÃ  lÃ m crash UI, dá»¯ liá»‡u á»Ÿ database hiá»ƒn thá»‹ thÃ nh `"[object Object]"`.
  - **NguyÃªn nhÃ¢n**: Lá»—i xáº£y ra do dá»¯ liá»‡u rá»—ng (`""`) hoáº·c stringified json bá»‹ nest trong `parseDto` (user-service) vÃ  `mapToUpstreamResponse` khi Ä‘i qua gRPC, dáº«n Ä‘áº¿n viá»‡c parse tháº¥t báº¡i vÃ  Ä‘áº©y nguyÃªn chuá»—i lá»—i xuá»‘ng Prisma lÆ°u trá»¯ dÆ°á»›i dáº¡ng JSON cá»§a 1 string.
  - **Giáº£i phÃ¡p**: Viáº¿t helper `safeParse` vÃ  `safeStringify` an toÃ n Ä‘á»ƒ Ä‘áº£m báº£o má»i payload Ä‘i vÃ o Prisma Ä‘á»u lÃ  JavaScript Object chuáº©n, tá»« Ä‘Ã³ Prisma tá»± Ä‘á»™ng chuyá»ƒn thÃ nh JSON Ä‘Ãºng Ä‘á»‹nh dáº¡ng. LÃ m sáº¡ch dá»¯ liá»‡u há»ng trong MySQL trá»±c tiáº¿p báº±ng SQL script.

## Roadmap ChÃ­nh - TÃ¡i cáº¥u trÃºc module quáº£n lÃ½ API

(Äá»“ng bá»™ tá»« `IMPLEMENTATION_PLAN.md` - Giai Ä‘oáº¡n thá»±c hiá»‡n vÃ  Gate)

- [ ] **P0: Baseline vÃ  Containment**
  - Inventory caller, data, routes vÃ  public paths hiá»‡n cÃ³.
  - XÃ¢y dá»±ng test fixtures Ä‘á»ƒ báº£o vá»‡ cÃ¡c chá»©c nÄƒng Ä‘ang hoáº¡t Ä‘á»™ng.
  - KhÃ³a Ä‘Æ°á»ng `test-auth` nguy hiá»ƒm (bypass TLS).
  - Validate láº¡i cÃ¡c contract cÅ© táº¡i module Ä‘á»ƒ Ä‘áº£m báº£o tÆ°Æ¡ng thÃ­ch.
- [ ] **P1: Contract vÃ  Schema**
  - Chá»‘t cÃ¡c Gate tá»« G-01 Ä‘áº¿n G-05 (Topology, Inbound Permissions, Legacy policies, Secrets).
  - XÃ¢y dá»±ng proto v2, HTTP schema, permission matrix.
  - Thiáº¿t káº¿ model vÃ  index má»›i (Migration additive).
- [ ] **P2: Backend Quáº£n Trá»‹ (User-service)**
  - TÃ¡i cáº¥u trÃºc cÃ¡c use cases CRUD, list, lá»c scope, OCC (Optimistic Concurrency Control).
  - Ãp dá»¥ng cÃ¡c tÃ­nh nÄƒng má»›i: Draft / Publish, Import API, Audit, Outbox pattern.
  - Quáº£n lÃ½ cÃ¡c tham chiáº¿u Credential.
- [ ] **P3: Runtime vÃ  Äá»“ng Bá»™ (API Gateway)**
  - Quáº£n lÃ½ cÆ¡ cháº¿ Snapshot / Revision / Broadcast giá»¯a cÃ¡c replicas.
  - TÃ¡i cáº¥u trÃºc HTTP Executor vÃ  cÃ¡c Adapter cho xÃ¡c thá»±c.
  - Ãp dá»¥ng Quota, Deadline, Redaction (cháº¿ Ä‘á»™ báº£o máº­t áº©n dá»¯ liá»‡u nháº¡y cáº£m).
- [ ] **P4: Giao Diá»‡n vÃ  Consumer (Frontend admin_khcn)**
  - XÃ¢y dá»±ng feature quáº£n lÃ½ API má»›i báº±ng React Server Components (RSC), React Query.
  - Endpoint explorer, Import wizard.
  - Cáº­p nháº­t adapter cho report, menu vÃ  URL.
- [ ] **P5: Inbound cÃ³ Ä‘iá»u kiá»‡n (DÃ nh cho Ä‘á»‘i tÃ¡c)**
  - Cáº¥p phÃ¡t API Consumer / Key, xoay vÃ²ng (Rotate), thu há»“i (Revoke).
  - Ãp dá»¥ng Scope vÃ  Quota cho Inbound.
  - Triá»ƒn khai xÃ¡c thá»±c Ä‘á»‘i tÃ¡c (Partner authentication) náº¿u Ä‘Æ°á»£c duyá»‡t qua G-02.
- [ ] **P6: Rehearsal vÃ  Cutover (PhÃ¡t hÃ nh)**
  - Reconcile, Backfill dá»¯ liá»‡u thá»±c (dry-run).
  - Kiá»ƒm tra cÃ¡c lá»—i giáº£ láº­p (Fault testing), Táº£i (Load), phÃ¡t hÃ nh thá»­ nghiá»‡m Canary.
  - Diá»…n táº­p rollback giá»¯ nguyÃªn tráº¡ng thÃ¡i.
- [ ] **P7: Dá»n Legacy vÃ  Váº­n HÃ nh**
  - VÃ´ hiá»‡u hoÃ¡ adapter cÅ© / schema cÅ© sau thá»i gian há»— trá»£ tÆ°Æ¡ng thÃ­ch.
  - HoÃ n thiá»‡n tÃ i liá»‡u, há»“ sÆ¡ An toÃ n thÃ´ng tin (ATTT) vÃ  runbook.
  - Äáº£m báº£o traffic vÃ  tham chiáº¿u tá»« legacy consumer trá»Ÿ vá» 0 trÆ°á»›c khi xÃ³a.











