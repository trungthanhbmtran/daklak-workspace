# Rà soát đăng nhập, liên thông và quy trình agent

Ngày rà soát: 02/10/2026. Phạm vi: đăng nhập nội bộ cơ quan, phiên Hub, Gateway, proxy liên thông, nguồn báo cáo và cấu hình triển khai liên quan. Chưa tích hợp VNeID/SSO.

**Kết luận:** đã sửa và kiểm thử các lỗi mới ở ranh giới Gateway. Chưa đủ bằng chứng để xác nhận toàn hệ thống đạt yêu cầu an toàn thông tin theo cấp độ. Những mục chưa đạt dưới đây là công việc còn tồn tại, không phải mục đã hoàn thành.

## Căn cứ đối chiếu

- Quy trình và quy tắc nội bộ: `.agents/AGENTS.md`, `.agents/rules/04-security.md`, `.agents/rules/00-architecture-critique.md`, `.agents/rules/08-integration-reporting.md`, skill authentication-authorization, api-gateway, grpc và docker.
- [Nghị định 85/2016/NĐ-CP trên Cổng thông tin Chính phủ](https://chinhphu.vn/default.aspx?docid=185601&pageid=27160): bảo đảm an toàn hệ thống thông tin theo cấp độ.
- [Thông tư 12/2022/TT-BTTTT trên Cổng thông tin Chính phủ](https://chinhphu.vn/?docid=206402&pageid=27160): hướng dẫn một số điều của Nghị định 85.
- [Tài liệu Express về reverse proxy](https://expressjs.com/en/guide/behind-proxies/): chỉ tin địa chỉ proxy đã cấu hình và xác định IP từ chuỗi proxy theo ranh giới tin cậy.

Hai văn bản trên là nguồn đối chiếu đã kiểm tra trên cổng chính thức; báo cáo này không thay thế hồ sơ cấp độ, đánh giá pháp lý hay kiểm định của cơ quan có thẩm quyền. Chưa có hồ sơ cấp độ/quy chế tài khoản được cung cấp trong workspace để xác định bộ yêu cầu áp dụng đầy đủ. Không đồng nhất ASVS với văn bản pháp luật Việt Nam. Đã bỏ comment gán ASVS Level 2 cho Thông tư 06/2023 trong token-validator.

Các mốc access 15 phút, idle 30 phút, phiên tuyệt đối 8 giờ và ngưỡng đăng nhập sai là chính sách mặc định của ứng dụng, có thể cấu hình; không khẳng định đây là thời hạn luật định.

## Lỗi được sửa ở lượt rà soát này

| Vấn đề trước sửa | Hành vi sau sửa | Bằng chứng |
| --- | --- | --- |
| Rate limit, JWT guard và security middleware lấy IP đầu tiên từ X-Forwarded-For do client gửi | Dùng chung clientIp từ Express; chỉ tin proxy được cấu hình; chuẩn hoá IPv4 mapped | Test đổi header giả vẫn dùng cùng bucket; HTTP qua Express thật kiểm tra peer gần nhất |
| Nginx nối thêm header X-Forwarded-For của client | Nginx tại biên ghi đè bằng remote_addr | Cấu hình trong nginx/conf.d/default.conf; cần nginx -t trên máy chủ |
| Proxy cho qua ngay khi roles trống, bỏ qua allowedMethods; chưa kiểm tra scopes/allowedPaths | Bắt buộc quyền INTEGRATION:READ hoặc MANAGE, phương thức, mọi scope và đường dẫn đã đăng ký | Test DELETE, đường dẫn ngoài danh sách và thiếu quyền đều trả 403, không gọi upstream |
| Cookie/access token của Hub có thể được chuyển tới upstream, kể cả khi cấu hình basic/apiKey | Luôn loại thông tin xác thực trình duyệt; chỉ dùng secretRef của backend | Test none/basic/apiKey và thiếu secret; thiếu/không hỗ trợ xác thực trả 503 trước khi gọi |
| Header danh tính và đơn vị được gửi cả tới hệ thống ngoài | Chỉ gửi ID/đơn vị đã xác thực tới upstream internal; nguồn báo cáo cũng dùng cùng nguyên tắc | Test proxy và report source với nguồn external/internal |
| Upstream có thể ghi Set-Cookie trên origin của Hub | Bỏ Set-Cookie và header hop-by-hop từ phản hồi | Test upstream cố đặt accessToken không được ghi cookie |
| Đường dẫn mã hoá hoặc traversal có thể vượt danh sách đường dẫn | Chặn dot segments, encoded slash/backslash, mã hoá lồng, ký tự điều khiển và đường dẫn không đăng ký; giữ nguyên query hợp lệ | Các test đường dẫn, query và quy tắc dùng chung với báo cáo |
| Proxy ghi lỗi thô và thiếu nhật ký gọi upstream | Log JSON gồm requestId, userId, IP đã xác định, upstream, method, status, thời gian; không ghi token, cookie, secret hoặc query | Mã IntegrationService; chưa thay thế kho IntegrationLog bền vững |

Các hạn chế roles đã tồn tại vẫn được giữ như điều kiện từ chối bổ sung để không mở quyền trong khi chuyển cấu hình cũ sang scopes. Chưa coi đây là hoàn tất chuyển đổi toàn hệ thống sang PBAC. Không suy diễn tên role thành quyền.

## Những khoảng trống còn tồn tại

| Mức độ | Phát hiện có bằng chứng trong mã/cấu hình | Việc cần hoàn tất |
| --- | --- | --- |
| P1 | ChatGateway vẫn xác minh JWT bằng secret cũ thay vì TokenValidatorService; tasks.service và ai-feature.service còn phát hành token nội bộ theo luồng khác, có fallback secret trong source | Đồng bộ các luồng HTTP/WebSocket/gRPC về cùng mô hình xác thực; bỏ fallback; kiểm thử hợp đồng phía dịch vụ nhận trước khi chuyển đổi |
| P1 | join_room của ChatGateway nhận conversationId rồi join trực tiếp, chưa kiểm tra thành viên; các sự kiện typing dùng phòng do client chọn | Kiểm tra quyền trên hội thoại ở chat-service; bổ sung hợp đồng RPC và ngắt kết nối/loại khỏi phòng khi phiên hoặc quyền bị thu hồi |
| P1 | setPassword và setUserActive ghi DB trước khi revokeAllForUser; nếu thu hồi Redis lỗi có thể có thay đổi DB đã hoàn tất nhưng phiên cũ chưa bị thu hồi | Thiết kế phiên bản xác thực bền vững và cơ chế đồng bộ/retry có kiểm soát; kiểm thử đồng thời, mất Redis và khôi phục. Đảo hai lời gọi đơn giản không giải quyết race với login |
| P1 | RegistryService kiểm tra DNS một lần, bỏ qua lỗi DNS và chỉ nhận diện nhóm địa chỉ IPv4; chưa ghim/kiểm tra DNS ở lúc mở kết nối | Hoàn thiện chống SSRF cho IPv4/IPv6 và DNS rebinding; chặn metadata/loopback tại cả cấu hình và kết nối |
| P1 | API quản lý template/widget báo cáo có JWT nhưng chưa có permission riêng ở nhiều thao tác; quyền đọc nguồn không chứng minh quyền xem từng dòng theo đơn vị | Bổ sung PBAC theo resource/action và phạm vi đơn vị tại report-service; không tự gán quyền hoặc tự suy diễn bộ lọc đơn vị cho mọi API ngoài |
| P1 vận hành | Nginx hiện nghe HTTP; cấu hình HTTPS đang comment. Compose công bố nhiều cổng hạ tầng ra host | Cấp chứng thư, bật TLS theo cấu hình được phê duyệt, bật Secure cookie; kiểm tra firewall và thu hẹp cổng hạ tầng |
| P2 quy tắc agent | Rule 04 yêu cầu Gateway phát hành JWT, trong khi issuer RS256 hiện nằm ở user-service | Chọn kiến trúc được phê duyệt rồi thực hiện chuyển đổi hoặc cập nhật ADR/quy tắc qua quy trình của dự án; không tự sửa rule để đánh dấu đạt |
| P2 | AUTH_AUDIT và log proxy hiện chưa chứng minh có kho lưu trữ chống sửa/xoá, retention và correlation xuyên dịch vụ; audit user-service chưa kèm IP người gọi | Hoàn thiện vận chuyển log, lưu trữ, quyền truy cập, định danh tác nhân và correlation; kiểm tra IntegrationLog theo rule 08 |
| P2 vận hành | Khóa RSA cố định, Redis dùng chung/HA, gRPC TLS, sao lưu/khôi phục và MFA chưa được xác minh trên máy chủ | Đối chiếu hồ sơ cấp độ/quy chế của cơ quan và kiểm chứng cấu hình chạy thực tế |
| P2 quy tắc agent | Tài liệu agent có khác biệt với hiện trạng: mô tả PostgreSQL trong khi hệ thống dùng Prisma/MariaDB; rule nhắc PBAC/RBAC nhưng skill yêu cầu PBAC | Chuẩn hoá tài liệu/ADR để agent không áp dụng giả định mâu thuẫn. Lượt này dùng cấu hình và hợp đồng thật làm căn cứ |

Các phát hiện này không được tự đánh dấu đã sửa bởi kiểm thử đăng nhập. Việc thay đổi issuer, quyền dữ liệu hoặc giao thức nội bộ cần thiết kế và kiểm thử các dịch vụ liên quan, không thể suy ra từ một test AuthService.

## Báo cáo Thực thi 9 Bước

1. **Read AGENTS.md:** đọc quy trình bắt buộc và yêu cầu có test/benchmark.
2. **Rules:** đối chiếu bảo mật, ranh giới dịch vụ, hợp đồng, SSRF, audit và PBAC.
3. **Workflow:** áp dụng bug-fix: tái hiện bằng test, sửa tại nguồn, kiểm thử hồi quy.
4. **Discovery:** lần theo HTTP login → JWT/session Redis → guards → proxy → nguồn báo cáo; kiểm tra Nginx/Compose và các điểm xác thực cũ.
5. **Analysis:** lỗi nằm ở tin IP/header và không thực thi đủ cấu hình upstream. Không dùng quyền do frontend gửi. Lookup registry là O(1); quyền dùng Set là O(P + S + R); so khớp đường dẫn O(A × L), có giới hạn độ dài 2.048 ký tự. Proxy vẫn truyền stream, không tải toàn bộ phản hồi vào RAM.
6. **Decision:** dùng danh sách proxy rõ ràng, helper kiểm tra upstream dùng chung, cách ly cookie/danh tính bên ngoài, giữ nguyên những hạn chế legacy để tránh mở quyền.
7. **Implementation:** sửa Gateway, report-source và Nginx; không đọc/ghi secrets thật, không đổi DB schema, không sửa hồ sơ/quy tắc để tạo kết quả đạt giả.
8. **Validation:** 9 kiểm thử mới thất bại trên mã cũ; sau sửa Gateway 171/171 test (16 suites), user-service 45/45 test (6 suites). Gateway/user-service TypeScript và frontend typecheck qua; Gateway build qua. Benchmark 5.000 mẫu với 200 quyền: median 0,0129 ms, p95 0,0142 ms. RS256 200 mẫu: median 0,224 ms, p95 0,267 ms. Đây là đo tại máy phát triển, Redis được mock cho RS256; không phải tải thật hay SLA production.
9. **Critique:** backend chọn endpoint từ registry cấu hình phía server, không nhận URL tuỳ ý từ client; thực thi quyền trước gọi nguồn; query không đổi đích kết nối. Tuy vậy chống SSRF ở registry, PBAC theo từng dòng, issuer/luồng legacy và audit bền vững còn chưa đạt đầy đủ các quy tắc nội bộ như bảng trên.

ESLint các file sửa: 0 lỗi; còn 3 cảnh báo có sẵn trong token-validator (directive không cần thiết, biến catch và tham số IP chưa dùng). Nginx chưa được chạy nginx -t vì Docker engine ở máy phát triển không hoạt động. Chưa triển khai hay kiểm thử đăng nhập trên máy chủ 14.174.183.56.

## Triển khai và kiểm tra vận hành

Theo deploy/README.auth.md. Cần đặt TRUSTED_PROXY_CIDRS theo đúng địa chỉ/CIDR của proxy thực tế trước khi cập nhật Gateway. Không dùng true, wildcard hoặc CIDR /0. Để trống thì Gateway không tin forwarded header và thấy IP peer trực tiếp; sau Nginx, nhiều người dùng sẽ dùng chung một bucket rate limit nếu chưa khai báo proxy.

Nginx ở repo được xem là biên Internet trực tiếp. Nếu máy chủ còn load balancer/proxy ở phía trước, cấu hình real_ip và chuỗi proxy tin cậy phải được đánh giá đúng sơ đồ thực tế; không mở trust toàn bộ mạng chỉ để lấy được IP.

Chạy kiểm tra cấu hình Nginx trước reload, cập nhật Gateway cùng cấu hình proxy, rồi kiểm tra: IP thật trong log; đổi X-Forwarded-For không đổi danh tính/bucket; login/me/menus/Hub; refresh/logout; 403 nguồn ngoài quyền; upstream không nhận cookie Hub. Hồ sơ cấp độ, TLS, quyền dữ liệu và các tồn đọng P1 cần được xử lý trước khi nghiệm thu an toàn thông tin.
