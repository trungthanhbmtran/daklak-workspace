

## Kiáº¿n TrÃºc vÃ  RÃ ng Buá»™c Há»‡ Thá»‘ng (Architecture Guidelines & Design Decisions)

Pháº§n nÃ y mÃ´ táº£ cÃ¡c thiáº¿t káº¿ chuáº©n báº¯t buá»™c tuÃ¢n thá»§ Ä‘á»ƒ trÃ¡nh dÆ° thá»«a vÃ  hiá»ƒu sai kiáº¿n trÃºc:

- **Workflow Authority:** workflow-service náº¯m giá»¯ sinh má»‡nh cá»§a má»i quy trÃ¬nh. CÃ¡c service khÃ¡c (nhÆ° HRM, Document) KHÃ”NG tá»± code luá»“ng duyá»‡t, pháº£i gá»i RPC sang workflow-service.
- **Fail-Fast Error Handling:** Báº¯t lá»—i tá»«ng bÆ°á»›c, nÃ©m RpcException ngay láº­p tá»©c, khÃ´ng gá»™p Ä‘iá»u kiá»‡n báº±ng ||. TrÃ¡ch nhiá»‡m map lá»—i sang HTTP thuá»™c vá» API Gateway.
- **Data Envelope:** API Gateway tá»± Ä‘á»™ng bá»c response (Envelope) qua TransformInterceptor. CÃ¡c service/controller con tuyá»‡t Ä‘á»‘i khÃ´ng Ä‘Æ°á»£c tá»± bá»c tay { success, data }.
- **Dynamic gRPC Payload (Phi cáº¥u trÃºc):** Dá»¯ liá»‡u phi cáº¥u trÃºc (vÃ­ dá»¥ JSON config) truyá»n qua gRPC báº±ng kiá»ƒu string (káº¿t há»£p JSON.stringify/parse), tuyá»‡t Ä‘á»‘i khÃ´ng dÃ¹ng google.protobuf.Struct.
- **Performance:** Báº¯t buá»™c Ã¡p dá»¥ng Structural Sharing, trÃ¡nh .map().filter() láº·p dÆ° thá»«a. CÃ¡c List query pháº£i dÃ¹ng Pagination chuáº©n.

## Giai Ä‘oáº¡n triá»ƒn khai Agent Engineering System (Thá»±c thi & GiÃ¡m sÃ¡t)

- [x] Khá»Ÿi táº¡o bá»™ khung .agents/ (Rules, Skills, Commands).
- [x] Chá»‘t cáº¥u trÃºc critical-review (20 modules Ä‘Ã¡nh giÃ¡ kiáº¿n trÃºc).
- [x] Ãnh xáº¡ service-map.md, cáº¥m truy váº¥n chÃ©o cÆ¡ sá»Ÿ dá»¯ liá»‡u.
- [x] Chuáº©n hÃ³a Response Envelope & Cáº¥m chuyá»ƒn Ä‘á»•i dá»¯ liá»‡u dÆ° thá»«a táº¡i Gateway/Microservice.
- [x] Cáº¥m dÃ¹ng Struct trong gRPC, thay báº±ng string JSON.
- [x] Táº¡o performance-optimization.md báº¯t buá»™c Structural Sharing.
# Roadmap Dá»± Ãn Daklak-Workspace

TÃ i liá»‡u nÃ y lÆ°u váº¿t tiáº¿n Ä‘á»™ vÃ  cÃ¡c tÃ¡c vá»¥ phÃ¡t sinh (hotfixes, tÃ­nh nÄƒng má»›i) trong quÃ¡ trÃ¬nh váº­n hÃ nh cá»§a Antigravity Agent, theo nhÆ° yÃªu cáº§u trong AGENTS.md.

## Unplanned Tasks / Hotfixes

- [x] **HoÃ n thiá»‡n Workflow Binding Modal cho Auto-Binding (07/10/2026)**
  - **TÃ¡c vá»¥**: ThÃªm component WorkflowBindingModal.tsx vÃ  gáº¯n vÃ o WorkflowBindingList.tsx.
  - **Chi tiáº¿t**: Form cho phÃ©p chá»n Process Type (Äá»‘i tÆ°á»£ng nghiá»‡p vá»¥), Trigger (Sá»± kiá»‡n), vÃ  Quy trÃ¬nh thá»±c thi. Dá»¯ liá»‡u Ä‘Æ°á»£c gá»i tá»« API /admin/workflow/catalog/process-types vÃ  /admin/workflow Ä‘á»ƒ káº¿t ná»‘i linh hoáº¡t cÃ¡c trigger sá»± kiá»‡n vá»›i Ä‘á»‹nh nghÄ©a workflow mÃ  khÃ´ng cáº§n code.

- [x] **RÃ  soÃ¡t vÃ  lÃªn phÆ°Æ¡ng Ã¡n tÃ¡i cáº¥u trÃºc giao diá»‡n vÃ  há»‡ thá»‘ng quy trÃ¬nh nghiá»‡p vá»¥ (Workflow)**
  - TÃ¡c vá»¥: Tá»•ng há»£p tÃ i liá»‡u thiáº¿t káº¿ vÃ  tÃ¬nh tráº¡ng trá»±c tiáº¿p tá»« /admin/services/workflow/workflows Ä‘á»ƒ lÃªn phÆ°Æ¡ng Ã¡n tÃ¡i cáº¥u trÃºc giao diá»‡n (No-Code, Offline-Tolerant) vÃ  backend (PBAC, Idempotency, Transactional Outbox) ra má»™t artifact Ä‘Æ°á»£c láº­p.
- [x] **Thá»±c thi phÆ°Æ¡ng Ã¡n tÃ¡i cáº¥u trÃºc UI Workflow (No-Code & Binding)**
  - TÃ¡c vá»¥: Cáº­p nháº­t giao diá»‡n WorkflowBindingList.tsx Ä‘á»ƒ sá»­ dá»¥ng endpoint má»›i tá»« API Gateway thay cho endpoint deprecated. XÃ¡c nháº­n cÃ¡c tÃ­nh nÄƒng "Business Mode Toggle", "Rule Builder", "Assignment Builder", vÃ  "Glow Red Validation" Ä‘Ã£ Ä‘Æ°á»£c cÃ i Ä‘áº·t Ä‘áº§y Ä‘á»§ theo Giai Ä‘oáº¡n 3 & 5 cá»§a thiáº¿t káº¿ há»‡ thá»‘ng.

- [x] **RÃ  soÃ¡t chá»©c nÄƒng há»‡ thá»‘ng so vá»›i Ä‘á» bÃ i kiá»ƒm tra nÄƒng lá»±c (CÃ¢u 2)**
  - TÃ¡c vá»¥: ÄÃ¡nh giÃ¡ há»‡ thá»‘ng theo 9 tiÃªu chÃ­ cá»§a CÃ¢u 2 trong tÃ i liá»‡u kiá»ƒm tra nÄƒng lá»±c vÃ  viáº¿t bÃ¡o cÃ¡o vÃ o docs/Ra_soat_chuc_nang_cau_2.md.

- [x] **[Hotfix] Sá»­a lá»—i parse JSON bá»‹ corrupted thÃ nh "[object Object]" trong Integration Upstream (07/10/2026)**
  - **Váº¥n Ä‘á»**: CÃ¡c thiáº¿t láº­p endpoints cá»§a API trong /admin/hub khÃ´ng lÆ°u Ä‘Æ°á»£c vÃ  lÃ m crash UI, dá»¯ liá»‡u á»Ÿ database hiá»ƒn thá»‹ thÃ nh "[object Object]".
  - **NguyÃªn nhÃ¢n**: Lá»—i xáº£y ra do dá»¯ liá»‡u rá»—ng ("") hoáº·c stringified json bá»‹ nest trong parseDto (user-service) vÃ  mapToUpstreamResponse khi Ä‘i qua gRPC, dáº«n Ä‘áº¿n viá»‡c parse tháº¥t báº¡i vÃ  Ä‘áº©y nguyÃªn chuá»—i lá»—i xuá»‘ng Prisma lÆ°u trá»¯ dÆ°á»›i dáº¡ng JSON cá»§a 1 string.
  - **Giáº£i phÃ¡p**: Viáº¿t helper safeParse vÃ  safeStringify an toÃ n Ä‘á»ƒ Ä‘áº£m báº£o má»i payload Ä‘i vÃ o Prisma Ä‘á»u lÃ  JavaScript Object chuáº©n, tá»« Ä‘Ã³ Prisma tá»± Ä‘á»™ng chuyá»ƒn thÃ nh JSON Ä‘Ãºng Ä‘á»‹nh dáº¡ng. LÃ m sáº¡ch dá»¯ liá»‡u há»ng trong MySQL trá»±c tiáº¿p báº±ng SQL script.

- [x] **[Hotfix] Sá»­a lá»—i InvalidGrpcPackageException trong user-service (07/10/2026)**
  - **Váº¥n Ä‘á»**: user-service crash khi khá»Ÿi Ä‘á»™ng vá»›i lá»—i `InvalidGrpcPackageException [Error]: The invalid gRPC package (package "ai_assistant" not found)`.
  - **NguyÃªn nhÃ¢n**: Trong máº£ng cáº¥u hÃ¬nh packages gRPC á»Ÿ `apps/user-service/src/main.ts` chá»©a `'ai_assistant'` vÃ  `'ai'`, nhÆ°ng trong cÃ¡c file proto (`ai_assistant.proto`, `ai.proto`) láº¡i Ä‘á»‹nh nghÄ©a `package users;`.
  - **Giáº£i phÃ¡p**: XÃ³a `'ai_assistant'` vÃ  `'ai'` khá»i danh sÃ¡ch packages trong `main.ts` do package `users` Ä‘Ã£ Ä‘Æ°á»£c load.

- [x] **[Hotfix] Sá»­a lá»—i InvalidGrpcService cho ApiManagementService trong api-gateway (07/10/2026)**
  - **Váº¥n Ä‘á»**: api-gateway crash khi bootstrap do lá»—i `Error: The invalid gRPC service (service "ApiManagementService" not found)`.
  - **NguyÃªn nhÃ¢n**: Bá»‹ trÃ¹ng token DI. `ApiManagementGatewayModule` Ä‘Äƒng kÃ½ Client gRPC báº±ng `MICROSERVICES.INTEGRATION.SYMBOL`, nhÆ°ng token nÃ y Ä‘Ã£ Ä‘Æ°á»£c `GlobalClientModule` Ä‘Äƒng kÃ½ Ä‘á»ƒ load `users/integration.proto` (cho `IntegrationConfigService`). Háº­u quáº£ lÃ  NestJS DI container truyá»n nháº§m client gRPC cá»§a IntegrationConfigService cho cÃ¡c controller cá»§a api-management, dáº«n Ä‘áº¿n khÃ´ng tÃ¬m tháº¥y `ApiManagementService` (thuá»™c `api-management.proto`).
  - **Giáº£i phÃ¡p**: Táº¡o cáº¥u hÃ¬nh Ä‘á»™c láº­p `API_MANAGEMENT` trong `services.ts` vá»›i symbol riÃªng (`API_MANAGEMENT_PACKAGE`). Cáº­p nháº­t `ApiManagementGatewayModule` vÃ  toÃ n bá»™ cÃ¡c provider liÃªn quan (`api-management.controller.ts`, `executor.service.ts`, `partner-auth.guard.ts`, `registry.service.ts`) chuyá»ƒn sang dÃ¹ng `@Inject(MICROSERVICES.API_MANAGEMENT.SYMBOL)`.

- [x] **[Hotfix] Sá»­a lá»—i encodeURIComponent URL (07/10/2026)**
  - **Váº¥n Ä‘á»**: HÃ m `encodeURIComponent` á»Ÿ Next.js App Router (dÃ²ng sá»‘ 8) bá»‹ crash do nháº­n dá»¯ liá»‡u khÃ´ng tÆ°Æ¡ng thÃ­ch.
  - **Giáº£i phÃ¡p**: Bá» qua parse cá»©ng hoáº·c fallback URL an toÃ n Ä‘á»ƒ UI luÃ´n render Ä‘Æ°á»£c ká»ƒ cáº£ khi `id` chÆ°a Ä‘Æ°á»£c resolve xong tá»« Server Components.

## Roadmap ChÃ­nh - TÃ¡i cáº¥u trÃºc module quáº£n lÃ½ API

(Äá»“ng bá»™ tá»« IMPLEMENTATION_PLAN.md - Giai Ä‘oáº¡n thá»±c hiá»‡n vÃ  Gate)

- [x] **P0: Baseline vÃ  Containment**
  - Inventory caller, data, routes vÃ  public paths hiá»‡n cÃ³.
  - XÃ¢y dá»±ng test fixtures Ä‘á»ƒ báº£o vá»‡ cÃ¡c chá»©c nÄƒng Ä‘ang hoáº¡t Ä‘á»™ng.
  - KhÃ³a cá»•ng 	est-auth nguy hiá»ƒm (bypass TLS).
  - Validate láº¡i cÃ¡c contract cÃ¡c tÃ i module Ä‘á»ƒ Ä‘áº£m báº£o tÆ°Æ¡ng thÃ­ch.
- [x] **P1: Contract vÃ  Schema**
  - Chá»‘t cÃ¡c Gate tá»« G-01 Ä‘áº¿n G-05 (Topology, Inbound Permissions, Legacy policies, Secrets).
  - XÃ¢y dá»±ng proto v2, HTTP schema, permission matrix.
  - Thiáº¿t káº¿ model vÃ  index má»›i (Migration additive).
- [x] **P2: Backend Quáº£n Trá»‹ (User-service)**
  - TÃ¡i cáº¥u trÃºc cÃ¡c use cases CRUD, list, lá»c scope, OCC (Optimistic Concurrency Control).
  - Ãp dá»¥ng cÃ¡c tÃ­nh nÄƒng má»›i: Draft / Publish, Import API, Audit, Outbox pattern.
  - Quáº£n lÃ½ cÃ¡c tham chiáº¿u Credential.
- [x] **P3: Runtime vÃ  Äá»“ng Bá»™ (API Gateway)**
  - Quáº£n lÃ½ cÆ¡ cháº¿ Snapshot / Revision / Broadcast giá»¯a cÃ¡c replicas.
  - TÃ¡i cáº¥u trÃºc HTTP Executor vÃ  cÃ¡c Adapter cho xÃ¡c thá»±c.
  - Ãp dá»¥ng Quota, Deadline, Redaction (cháº¿ Ä‘á»™ báº£o máº­t áº©n dá»¯ liá»‡u nháº¡y cáº£m).
- [x] **P4: Giao Diá»‡n vÃ  Consumer (Frontend admin_khcn)**
  - XÃ¢y dá»±ng feature quáº£n lÃ½ API má»›i báº±ng React Server Components (RSC), React Query.
  - Endpoint explorer, Import wizard.
  - Cáº­p nháº­t adapter cho report, menu vÃ  URL.
- [x] **P5: Inbound cÃ³ Ä‘iá»u kiá»‡n (DÃ nh cho Ä‘á»‘i tÃ¡c)**
  - Cáº¥p phÃ¡t API Consumer / Key, xoay vÃ²ng (Rotate), thu há»“i (Revoke).
  - Ãp dá»¥ng Scope vÃ  Quota cho Inbound.
  - Triá»ƒn khai xÃ¡c thá»±c Ä‘á»‘i tÃ¡c (Partner authentication) náº¿u Ä‘Æ°á»£c duyá»‡t qua G-02.
- [x] **P6: Rehearsal vÃ  Cutover (PhÃ¡t hÃ nh)**
  - Reconcile, Backfill dá»¯ liá»‡u thá»±c (dry-run).
  - Kiá»ƒm tra cÃ¡c lá»—i giáº£ láº­p (Fault testing), Táº£i (Load), phÃ¡t hÃ nh thá»­ nghiá»‡m Canary.
  - Diá»…n táº­p rollback giá»¯ nguyÃªn tráº¡ng thÃ¡i.
- [x] **P7: Dá»n Legacy vÃ  Váº­n HÃ nh**
  - VÃ´ hiá»‡u hoÃ¡ adapter cÅ© / schema cÅ© sau thá»i gian há»— trá»£ tÆ°Æ¡ng thÃ­ch.
  - HoÃ n thiá»‡n tÃ i liá»‡u, há»“ sÆ¡ An toÃ n thÃ´ng tin (ATTT) vÃ  runbook.
  - Äáº£m báº£o traffic vÃ  tham chiáº¿u tá»« legacy consumer trá»Ÿ vá» 0 trÆ°á»›c khi xÃ³a.

- [x] **Dá»±ng láº¡i module Workflow Ä‘á»™ng trong admin_khcn (07/10/2026)**
  - XÃ¢y dá»±ng láº¡i danh sÃ¡ch/designer, binding vÃ  theo dÃµi instance theo API Gateway `/admin/workflow` lÃ m nguá»“n dá»¯ liá»‡u vÃ  nguá»“n quyáº¿t Ä‘á»‹nh tráº¡ng thÃ¡i.
  - Graph Ä‘Æ°á»£c lÆ°u qua API; publish Ä‘Æ°á»£c backend validate. Catalog node/binding láº¥y tá»« backend, khÃ´ng dÃ¹ng mock lÃ m dá»¯ liá»‡u váº­n hÃ nh.
  - Báº­t JWT guard cho Workflow Gateway; actor vÃ  pháº¡m vi Ä‘Æ¡n vá»‹ láº¥y tá»« JWT khi táº¡o/lá»c binding, thay vÃ¬ nháº­n actor/pháº¡m vi do client tá»± gá»­i.
  - Ghi contract vÃ  ranh giá»›i API trong `apps/admin_khcn/docs/WORKFLOW_ADMIN_MODULE.md`.
  - Kiá»ƒm tra: `admin_khcn` typecheck/lint; `api-gateway` build tsconfig typecheck/lint; `workflow-service` build tsconfig typecheck.

- [x] **[Hotfix] Sá»­a lá»—i API Gateway gá»i nháº§m gRPC localhost vÃ  bá»• sung nÃºt Táº¡o thá»§ cÃ´ng trong API Manager (07/10/2026)**
  - Sá»­a URL  .0.0.0:50051 hardcoded trong ApiManagementGatewayModule thÃ nh constant MICROSERVICES.API_MANAGEMENT.URL.
  - Triá»ƒn khai Dialog component cho nÃºt "Táº¡o thá»§ cÃ´ng" (gá»i useCreateConnection tá»« UI) cho pháº§n quáº£n trá»‹ API.
- [x] **[Hotfix] S?a l?i b? redirect ra mï¿½n hï¿½nh login khi vï¿½o trang Qu?n lï¿½ API (07/10/2026)**
  - ApiManagementController trong pi-gateway thi?u gRPC metadata (user-id) nï¿½n b? user-service t? ch?i (UNAUTHENTICATED), gï¿½y ra l?i 401 Unauthorized d?y user ra login.
  - ï¿½ï¿½ b? sung ti?n ï¿½ch d?c vï¿½ chï¿½n metadata vï¿½o l?i g?i gRPC trong Controller c?a gateway.

- [x] **[Hotfix] S?a l?i danh sï¿½ch workflow bindings khï¿½ng hi?n th? (07/10/2026)**
  - **V?n d?**: Truy c?p trang Qu?n lï¿½ G?n nghi?p v? (Bindings) nhung b?ng bï¿½o "Chua cï¿½ binding".
  - **Nguyï¿½n nhï¿½n**: gRPC t? d?ng cast organizationId t? undefined (khi admin khï¿½ng thu?c don v? nï¿½o) sang chu?i r?ng "". Service dï¿½ng "" query DB trong khi DB luu lï¿½ null, d?n d?n khï¿½ng tï¿½m th?y data.
  - **Gi?i phï¿½p**: S?a logic trong workflow-service (binding.service.ts) d? khi tï¿½m ki?m s? cho phï¿½p l?y cï¿½c global bindings (organizationId = null) ho?c bindings c?a t? ch?c.

- [x] **[Hotfix] S?a l?i API Manager (và các Service khác) b? l?i redirect login (401) do thi?u Server-Side Auth Guard (08/10/2026)**
  - **V?n d?**: Ngu?i dùng truy c?p /services/api-manager (ho?c các service khác) khi chua có quy?n (ho?c token dã h?t h?n) b? báo 401 trên client và vang ra màn hình dang nh?p.
  - **Nguyên nhân**: File layout.tsx c?a pi-manager, hrm, documents, v.v... b? thi?u hàm equireMenuAccess(pathname). Ði?u này khi?n trang Next.js render unprotected trên server, g?i xu?ng client. Client sau dó g?i API l?y Menu Sidebar v?i token h?ng/thi?u quy?n, d?n t?i Backend tr? v? 401, kích ho?t interceptor redirect v? /login.
  - **Gi?i pháp**: B? sung equireMenuAccess(pathname) vào toàn b? các file layout.tsx c?a các phân h? d? ch?n ngay t? Server. N?u thi?u quy?n s? hi?n th? Not Found (404), n?u h?t token s? Redirect an toàn trên server thay vì báo 401 trên client.

- [ ] **[Feature] Tích hợp SSO LifeSSO & VNeID cho portal-goverment (08/10/2026)**
  - Tích hợp đăng nhập SSO công dân bằng VNeID thông qua LifeSSO IS.
  - Implement Authorization Code flow trên Next.js (portal-goverment).