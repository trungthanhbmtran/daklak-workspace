# Đăng nhập nội bộ và áp dụng bản sửa Hub

Phạm vi: tài khoản nội bộ cơ quan nhà nước; chưa tích hợp VNeID/SSO. Đây là cấu hình kỹ thuật đề xuất, cần đối chiếu chính sách và cấp độ an toàn thông tin đã phê duyệt của cơ quan. Các mốc 15 phút, 30 phút, 8 giờ và 5 lần dưới đây là mặc định của dự án, không phải tuyên bố pháp luật bắt buộc dùng các mốc này.

Nguồn đối chiếu: [Thông tư 12/2022/TT-BTTTT về bảo đảm an toàn hệ thống thông tin theo cấp độ](https://cspl.mic.gov.vn/Pages/TinTuc/tinchitiet.aspx?tintucid=138448). Việc chứng nhận đáp ứng cấp độ, MFA, TLS và lưu trữ nhật ký phải được đánh giá trên môi trường triển khai thực tế.

## Một cấu hình dùng chung

`shared/core/auth-session.ts` định nghĩa chính sách và phép kiểm tra phiên Redis dùng chung cho user-service và gateway. Frontend gửi cookie HttpOnly; backend quyết định thời hạn, tính hợp lệ và quyền PBAC.

| Biến | Mặc định | Ý nghĩa |
| --- | --- | --- |
| AUTH_ACCESS_TTL_SECONDS | 900 | Access token tối đa 15 phút |
| AUTH_IDLE_TIMEOUT_SECONDS | 1800 | Phiên hết hạn sau 30 phút không có yêu cầu xác thực hợp lệ |
| AUTH_SESSION_MAX_SECONDS | 28800 | Phiên tối đa 8 giờ, refresh không kéo dài mốc này |
| AUTH_LOGIN_FAILURE_LIMIT | 5 | Giới hạn đăng nhập sai theo định danh tài khoản |
| AUTH_LOGIN_FAILURE_WINDOW_SECONDS | 900 | Cửa sổ giới hạn đăng nhập sai |
| AUTH_COOKIE_SECURE | false | Tương thích HTTP hiện tại; dùng true khi đã có HTTPS |
| AUTH_TRUSTED_ORIGINS | cùng host khi không cấu hình | Danh sách origin cho yêu cầu xác thực trình duyệt, phân cách bằng dấu phẩy |
| AUTH_REQUIRE_PERSISTENT_KEYS | false | Dùng true khi triển khai RSA key cố định |
| REDIS_URL / REDIS_DB | redis://redis:6379 / 0 | Hai backend phải cùng endpoint và database |

Chuyển cấu hình thời hạn cũ `JWT_EXPIRES_IN` sang `AUTH_ACCESS_TTL_SECONDS`; luồng này không đọc biến thời hạn cũ. Thời gian access/idle phải nhỏ hơn hoặc bằng thời hạn tối đa. Cấu hình sai bị từ chối khi khởi động.

Mật khẩu mới/đổi mật khẩu: ít nhất 12 ký tự, tối đa 72 byte UTF-8 do giới hạn bcrypt. Mật khẩu được so sánh nguyên trạng, bao gồm khoảng trắng. Tài khoản có mật khẩu cũ vẫn đăng nhập bằng mật khẩu hiện tại. Login trả thông báo chung để hạn chế lộ tài khoản tồn tại.

RSA private/public key phải cùng cặp, ít nhất 2048 bit. Thiết lập `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY` và `JWT_KID` cho user-service qua cấu hình bí mật của môi trường; PEM hỗ trợ newline được escape thành `\n`. Tất cả replica user-service phải dùng cùng cặp khóa. Bật `AUTH_REQUIRE_PERSISTENT_KEYS=true` sau khi cấp khóa. Không ghi khóa vào Git hoặc log. Nếu chưa cấp khóa và cờ này chưa bật, chế độ tương thích dùng khóa tạm; restart sẽ yêu cầu làm mới phiên.

## Luồng đã đồng bộ

1. Gateway nhận login, kiểm tra nguồn trình duyệt và giới hạn theo IP; user-service kiểm tra mật khẩu và giới hạn theo tài khoản.
2. User-service ký RS256 bằng cùng khóa cung cấp cho gateway; công bố đầy đủ context quyền vào Redis trước khi login thành công.
3. Gateway đặt cookie access/refresh theo thời hạn thực tế. Frontend kiểm tra /auth/me trước khi chuyển Hub.
4. Yêu cầu 401 được gom thành một refresh trong mỗi phiên frontend và thử lại tối đa một lần. Refresh token được tra cứu bằng hash và đổi nguyên tử; lỗi chuẩn bị dữ liệu không tiêu thụ token cũ.
5. Phiên có định danh riêng, mốc tuyệt đối và thời hạn idle trong Redis. Logout xoá phiên của thiết bị; đổi mật khẩu hoặc khoá tài khoản tăng phiên bản để vô hiệu hoá mọi phiên cũ.
6. 403 giữ nguyên trạng thái đăng nhập. Lỗi Redis/gRPC trả 503; deadline trả 504, không giả báo hết hạn. Login luôn truy cập được để tránh vòng lặp login ↔ Hub.

Nhật ký `AUTH_AUDIT` ghi sự kiện, ID tài khoản khi biết và timestamp; không ghi password/access/refresh token. Cần chuyển nhật ký tới nơi lưu trữ tập trung theo chính sách của cơ quan. Cơ chế idle tính theo hoạt động API đã xác thực; yêu cầu nền cũng được tính là hoạt động.

## Áp dụng bằng Docker Compose

Bản sửa cần cập nhật đồng bộ **user-service, api-gateway, admin-frontend**. Không có migration cơ sở dữ liệu cho bản sửa đăng nhập này. Phiên phát hành theo luồng cũ cần đăng nhập lại sau chuyển đổi.

Trên máy chủ, cập nhật source tới phiên bản chứa bản sửa. Ghép các giá trị cần thiết từ `deploy/auth.env.example` vào `.env.production`; giữ nguyên các cấu hình database, queue và image đang dùng. File ví dụ bật yêu cầu khóa cố định: phải cấp khóa trước khi áp dụng cờ đó. Với địa chỉ HTTP hiện tại, giữ Secure=false cho tới khi HTTPS hoạt động; chưa thể coi đường truyền HTTP là triển khai đạt yêu cầu bảo mật.

Nếu build từ source ngay trên máy chủ, chạy từ thư mục gốc dự án:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml -f deploy/compose.auth-build.yml config --quiet
docker compose --env-file .env.production -f docker-compose.prod.yml -f deploy/compose.auth-build.yml build user-service api-gateway admin-frontend
docker compose --env-file .env.production -f docker-compose.prod.yml -f deploy/compose.auth-build.yml up -d --no-deps user-service api-gateway admin-frontend
docker compose --env-file .env.production -f docker-compose.prod.yml ps user-service api-gateway admin-frontend
```

Nếu dùng image đã build qua CI/registry, bảo đảm cả ba image thuộc cùng phiên bản chứa bản sửa rồi chạy:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml pull user-service api-gateway admin-frontend
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --no-deps user-service api-gateway admin-frontend
```

Không chạy migration kèm seed chỉ để sửa đăng nhập. Không xoá Redis/database/volume để xử lý phiên cũ. Ghi lại ba image/tag trước khi cập nhật để có thể quay lại nếu kiểm tra vận hành thất bại.

## IP thật và giới hạn đăng nhập

Gateway dùng IP được Express xác định, không lấy trực tiếp IP đầu tiên trong header của trình duyệt. Đặt `TRUSTED_PROXY_CIDRS` trong `.env.production` theo IP/CIDR của các proxy thực tế được phép gửi request tới Gateway. Biến này áp dụng cho Gateway; user-service không cần khai báo proxy.

Để trống thì không tin forwarded header. Trong triển khai sau Nginx, tất cả người dùng có thể bị tính cùng một bucket IP nếu chưa khai báo proxy. Không cấu hình `true`, wildcard, CIDR /0 hoặc tin toàn bộ mạng riêng mặc định. Không chỉ dùng số hop vì cổng Gateway có thể được truy cập qua đường đi ngắn hơn.

Nginx trong repo ghi đè X-Forwarded-For bằng remote_addr tại biên. Nếu có load balancer trước Nginx, cần cấu hình real_ip và ranh giới tin cậy theo sơ đồ thật. Sau cập nhật source, kiểm tra rồi reload cấu hình Nginx:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T nginx nginx -t
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T nginx nginx -s reload
```

Proxy liên thông bây giờ bắt buộc quyền INTEGRATION:READ hoặc INTEGRATION:MANAGE, mọi scopes đã cấu hình, allowedMethods và allowedPaths. Cấu hình thiếu danh sách phương thức/đường dẫn sẽ bị từ chối. Xác thực nguồn hiện hỗ trợ none/basic/apiKey; phương thức chưa triển khai hoặc secret thiếu trả 503. Cookie Hub và danh tính người dùng không được chuyển tới nguồn bên ngoài; Set-Cookie từ upstream bị loại.

Xem `deploy/REVIEW.auth-government.md` để biết kết quả rà soát, các điểm legacy và điều kiện còn chưa đạt; các bản sửa HTTP không chứng minh toàn hệ thống đã đạt chuẩn an toàn thông tin.

## Kiểm tra sau triển khai

- Login thành công → /auth/me và /menus/me trả 200 → Hub tải được.
- Access cookie có TTL theo cấu hình; refresh cookie hết hạn ở mốc tuyệt đối của phiên.
- Token access hết hạn → một refresh → yêu cầu được thử lại; refresh hết hạn → login, không tự bật lại Hub.
- Logout xoá cookie và trả thành công cho trình duyệt; khi Redis/user-service hoạt động, token của phiên cũ bị từ chối. Nếu thu hồi phía server lỗi, ghi log LOGOUT_REVOCATION; không bảo đảm phiên server đã bị xoá trong trường hợp này. Đổi mật khẩu/khoá tài khoản → mọi phiên cũ bị từ chối, kể cả khi context quyền còn ở cache gateway.
- Mất kết nối Redis/user-service → 503 và thông báo thử lại; không tạo vòng lặp chuyển trang.
- Origin ngoài danh sách bị chặn; HTTPS sử dụng cookie Secure.

Các kiểm thử tự động chạy từ từng ứng dụng:

```bash
cd apps/api-gateway
npm test -- --runInBand
npx tsc --noEmit
cd ../user-service
npm test -- --runInBand
npx tsc --noEmit
cd ../admin_khcn
npm run typecheck
```

Benchmark trong test validator đo RSA thật với Redis giả lập; không đại diện cho độ trễ mạng/server thực tế. Build Docker và kiểm tra Redis thật cần môi trường có Docker engine đang chạy.

## Kết quả kiểm tra mã nguồn (02/10/2026)

- Gateway: 128 test qua, toàn bộ 12 suite; gồm hồi quy Hub, cookie, nhiều yêu cầu 401, xung đột refresh giữa tab, login/logout khi refresh đang chạy, DTO, null/undefined, deadline 504, dữ liệu HRM, origin và thu hồi phiên.
- User-service: 45 test qua, toàn bộ 6 suite; gồm idle, mốc tuyệt đối, rotation, mật khẩu, khoá tài khoản, RSA key cố định và khởi tạo module AI.
- TypeScript: hai backend và toàn bộ frontend đều qua. Đã bỏ ignoreBuildErrors; build frontend không còn bỏ qua lỗi kiểu dữ liệu. ESLint phần đăng nhập và các file frontend sửa trong lần rà soát này đều qua.
- Build Node.js của gateway, user-service và frontend thành công. Frontend dựng đủ 75 trang, không còn lỗi cookies() trong prerender ở trang phân loại chức danh.
- Benchmark 200 lần RS256 với Redis giả lập: median khoảng 0,23 ms; p95 khoảng 0,28 ms/lần. Không phải kết quả tải thực tế.
- Compose build override hợp lệ khi kiểm tra cấu trúc, không đọc file cấu hình bí mật.
- Chưa build/chạy container hoặc xác nhận đăng nhập trên website thật: Docker engine trên máy làm việc chưa chạy; chưa triển khai bản sửa lên máy chủ.

## Lỗi đã sửa trong lần rà soát bổ sung

- Refresh đồng thời trả 409 cho token đã đổi khi phiên còn tồn tại. Token cũ không được cấp quyền hoặc tái sử dụng; metadata hash có TTL chỉ phục vụ nhận diện xung đột và thu hồi phiên. Frontend kiểm tra cookie hiện tại qua /auth/me, không xoá phiên mới từ phản hồi cũ.
- Login/logout được xếp thứ tự với refresh trong cùng frontend. Lua thu hồi phiên nguyên tử, kể cả khi refresh đang dùng token cũ; không quét toàn bộ Redis.
- Callback chuẩn hoá đường dẫn, chặn login/refresh/API sau giải mã để tránh vòng lặp; giữ nguyên query đã mã hoá.
- Dynamic proxy chỉ nhận đường dẫn /gw/ có prefix hợp lệ, bao gồm /api/v1/admin/gw/; query chứa /gw/ không bị nhận nhầm thành proxy.
- AuthService dùng ClientGrpc, DTO và request có kiểu. Không trả rpc.details; lỗi null/undefined được xử lý, deadline trả 504 và có log chẩn đoán không chứa token/password/thông điệp nội bộ.
- Kiểm tra thời hạn có thể biểu diễn thành ngày trước khi ghi cookie; bỏ sessionId ngẫu nhiên không gắn với phiên thực.
- /me kiểm tra ID protobuf int32 và tài khoản hoạt động; đọc employeeCode từ user-service rồi gọi GetEmployeeByCode với timeout 5 giây. Lỗi HRM được log và giữ hồ sơ user-service.
- Sửa prefix lặp /admin của API cấu hình liên thông và kiểu dữ liệu danh sách.
- Nút văn bản đến gọi syncOnline chưa tồn tại được thay bằng tải lại danh sách từ API đang có; chưa thêm tích hợp đồng bộ LGSP.
- Server fetch truyền cookie tới gateway được cấu hình với no-store, không chuyển credential sang localhost khi lỗi; trạng thái request/prerender của Next.js được truyền đúng lên framework. Hằng số phân loại đơn vị được tách khỏi module client.
- Module AI dùng randomUUID của Node.js để tránh lỗi nạp uuid ESM trong Jest; test khởi tạo bổ sung global cache đúng cấu hình ứng dụng.
- Docker frontend giữ cấu trúc apps/admin_khcn và shared khi build, chạy đúng apps/admin_khcn/server.js trong standalone, dùng non-root user và dumb-init. .dockerignore loại file môi trường khỏi build context.

Cấu hình root và standalone được đối chiếu với [tài liệu output của Next.js](https://nextjs.org/docs/app/api-reference/config/next-config-js/output) và [tài liệu Turbopack root](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory). Dockerfile đã rà soát cấu trúc; kết quả build Linux/container cần kiểm chứng trên máy có Docker engine.
