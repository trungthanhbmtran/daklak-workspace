# Daklak Workspace Deployment Guide
npx prisma migrate dev --name init
npx prisma migrate dev --name mo_ta_su_thay_doi
npx prisma generate
Hướng dẫn build và deploy ứng dụng Daklak bằng Docker Compose thông qua GitHub Actions.

## 1. CI/CD Workflow
Ứng dụng được tự động deploy khi có hành động `push` vào nhánh `main`.

### Luồng hoạt động:
1. **Build & Push**: GitHub Actions build Docker images cho các dịch vụ thay đổi và push lên Docker Hub.
2. **Deploy**: GitHub Actions SSH vào server đích, copy file `docker-compose.prod.yml`, và chạy các lệnh docker compose để cập nhật ứng dụng.

## 2. Cấu hình GitHub SecretsƯ
Để workflow hoạt động, bạn cần cấu hình các Secrets sau trong repository:

| Biến | Mô tả |
| :--- | :--- |
| `DOCKER_USERNAME` | Username Docker Hub |
| `DOCKER_PASSWORD` | Password hoặc Token Docker Hub |
| `REMOTE_HOST` | IP/Hostname của server đích |
| `REMOTE_USER` | SSH user (vd: `root`, `ubuntu`) |
| `SSH_PRIVATE_KEY` | SSH Private Key để truy cập server |
| `DEPLOY_PATH` | Thư mục deploy trên server (vd: `/home/ubuntu/daklak`) |

## 3. Deploy thủ công (Manual)
Nếu muốn deploy thủ công trên server:
```bash

# Pull images mới nhất


docker compose -f docker-compose.prod.yml pull

# Chạy migrations (quan trọng)
docker compose -f docker-compose.prod.yml --profile migrate run --rm user-service-migrate
docker compose -f docker-compose.prod.yml --profile migrate run --rm hrm-service-migrate
docker compose -f docker-compose.prod.yml --profile migrate run --rm media-service-migrate
docker compose -f docker-compose.prod.yml --profile migrate run --rm posts-service-migrate
docker compose -f docker-compose.prod.yml --profile migrate run --rm workflow-service-migrate
docker compose -f docker-compose.prod.yml --profile migrate run --rm document-service-migrate


# echo "Xóa data cũ và tạo lại schema..."
# docker exec -it daklak-workspace-user-service-1 npx prisma migrate reset --force --skip-seed
# docker exec -it daklak-workspace-hrm-service-1 npx prisma migrate reset --force --skip-seed
# docker exec -it daklak-workspace-workflow-service-1 npx prisma migrate reset --force --skip-seed
# docker exec -it daklak-workspace-media-service-1 npx prisma migrate reset --force --skip-seed
# docker exec -it daklak-workspace-posts-service-1 npx prisma migrate reset --force --skip-seed
# docker exec -it daklak-workspace-document-service-1 npx prisma migrate reset --force --skip-seed

# Khởi động lại các services
docker compose -f docker-compose.prod.yml up -d portal-goverment nginx

# Chạy seeders (nếu cần dữ liệu mẫu)
# Lưu ý: Nên chạy theo thứ tự dưới đây
docker exec -it daklak-workspace-user-service-1 npx prisma db seed
docker exec -it daklak-workspace-hrm-service-1 npx prisma db seed
docker exec -it daklak-workspace-workflow-service-1 npx prisma db seed
docker exec -it daklak-workspace-media-service-1 npx prisma db seed
docker exec -it daklak-workspace-posts-service-1 npx prisma db seed

```

## 4. Thông tin Tài khoản & Kết nối
Thông tin đăng nhập mặc định cho các dịch vụ:

### Infrastructure
| Dịch vụ | Cổng | Tài khoản | Mật khẩu |
| :--- | :--- | :--- | :--- |
| **MySQL** | `3306` | `root` | `mypassword` |
| **RabbitMQ** | `5672`, `15672` | `admin` | `admin123` |
| **MinIO** | `9000` | `admin` | `password123` |
| **Redis** | `6379` | - | - |

### Microservices
| Dịch vụ | Port (Internal) | Database Name |
| :--- | :--- | :--- |
| `api-gateway` | `8080` | `admin_systems` |
| `user-service` | `3001` | `admin_systems` |
| `hrm-service` | `3002` | `admin_hrm` |
| `media-service` | `3003` | `admin_media` |
| `posts-service` | `3005` | `admin_posts` |
| `translate-service` | `3006` | `daklak_translation` |
| `workflow-service` | `50060` (gRPC), `3001` (REST) | `admin_workflow` |
| `admin-khcn` | `3007` | - |
| `portal-goverment` | `3000` | - |

### 5. Triển khai Cổng thông tin Công dân (`portal-goverment`)
Dịch vụ mới thêm **Cổng thông tin Công dân (`portal-goverment`)** chạy hoàn hảo bên dưới lớp proxy bảo mật của Nginx:
- **Đường dẫn truy cập người dân (Công khai)**: `http://<IP-SERVER>/` (Proxy qua Nginx trực tiếp vào container `portal-goverment:3000`).
- **Tích hợp API động**: Phía Client của Cổng thông tin gọi API Gateway thông qua đường dẫn bảo mật `/api/v1` được định nghĩa trong Nginx.
- **Cách deploy thủ công hoặc cập nhật**:
  ```bash
  # Khởi chạy toàn bộ dịch vụ kèm Portal mới
  docker compose -f docker-compose.prod.yml up -d portal-goverment nginx
  ```

*Lưu ý: Đảm bảo tệp `.env` trên server chứa đầy đủ các biến môi trường cần thiết (JWT_SECRET, DATABASE_URL, v.v.)*

## 6. Tài khoản thử nghiệm (Module Giao việc)
Dưới đây là danh sách các tài khoản tiêu biểu dùng để test các luồng của chức năng Giao việc (Task Management) dựa theo phân quyền PBAC. Tất cả tài khoản đều dùng mật khẩu mặc định là `Admin@123`.

### 6.1. Luồng Giao việc & Đánh giá (Dành cho Lãnh đạo Đơn vị - LEADER)
> **Quyền hạn**: `TASK.*` (Toàn quyền sinh việc, giao việc xuyên suốt từ trên xuống, đánh giá, phê duyệt).
- **Đỗ Hữu Huy** (Chủ tịch UBND Tỉnh)
  - Username: `dohuuhuy` (Cơ quan: UBND Tỉnh Đắk Lắk - `H15`)
- **Bùi Thanh Toàn** (Giám đốc Sở KHCN)
  - Username: `buithanhtoan` (Cơ quan: Sở Khoa học & Công nghệ - `H15.07`)
- **Phạm Gia Việt** (Phó Giám đốc Sở KHCN)
  - Username: `phamgiaviet` (Cơ quan: Sở Khoa học & Công nghệ - `H15.07`)
- **Võ Nguyễn Hoàng Nam** (Giám đốc Trung tâm IOC)
  - Username: `vonguyenhoangnam` (Cơ quan: Trung tâm IOC - `H15.07.04`)
- **Lê Xuân Quang** (Phó Giám đốc Trung tâm IOC)
  - Username: `lexuanquang` (Cơ quan: Trung tâm IOC - `H15.07.04`)
- **Trần Duy Tân** (Phó Giám đốc Trung tâm IOC)
  - Username: `tranduytan` (Cơ quan: Trung tâm IOC - `H15.07.04`)

### 6.2. Luồng Giao việc nội bộ phòng & Quản lý (Dành cho Quản lý cấp phòng - MANAGER)
> **Quyền hạn**: `TASK.CREATE`, `TASK.ASSIGN`, `TASK.COMPLETE`, `TASK.UPDATE`, `TASK.VIEW` (Chỉ giao việc trong phạm vi phòng ban mình quản lý hoặc công việc mình làm chủ sở hữu).
- **Nguyễn Văn A** (Chánh Văn phòng Sở)
  - Username: `nguyenvana` (Cơ quan: Văn phòng Sở KHCN - `H15.07.05`)
- **Ngô Thị H** (Giám đốc Trung tâm IOC)
  - Username: `ngothih` (Cơ quan: Trung tâm IOC - `H15.07.04`)
- **Lê Anh Tuấn** (Trưởng phòng Hành chính tổng hợp IOC)
  - Username: `leanhtuan` (Cơ quan: Phòng Hành chính tổng hợp IOC - `H15.07.04.01`)
- **Phạm Thị CN** (Trưởng phòng Hạ tầng Đô thị)
  - Username: `truongphongcn_ioc` (Cơ quan: Phòng Hạ tầng đô thị IOC - `H15.07.04.03`)
- **Lê Quang Thanh** (Trưởng phòng Hạ tầng Đô thị)
  - Username: `lequangthanh` (Cơ quan: Phòng Hạ tầng đô thị IOC - `H15.07.04.03`)
- **Lê Trọng Vũ** (Trưởng phòng Khai thác và Quản lý dữ liệu)
  - Username: `letrongvu` (Cơ quan: Phòng Khai thác và Quản lý dữ liệu - `H15.07.04.02`)

### 6.3. Luồng Nhận việc & Báo cáo tiến độ (Dành cho Nhân viên/Chuyên viên - STAFF)
> **Quyền hạn**: `TASK.VIEW`, `TASK.UPDATE`, `TASK.COMMENT`, `TASK.COMPLETE` (Chỉ được xem, nhận việc, cập nhật tiến độ, thảo luận, và báo cáo hoàn thành cho công việc được giao).
- **Trần Trung Thành** (Công chức phụ trách)
  - Username: `trungthanh` (Cơ quan: Sở KHCN - `H15.07`)
- **Trần Trung Thành** (Nhân viên)
  - Username: `trantrungthanh` (Cơ quan: Phòng Quản lý CĐMS - `H15.07.10`)
- **Nguyễn Kiều Trang** (Nhân viên)
  - Username: `nguyenkieutrang` (Cơ quan: Phòng Hành chính tổng hợp IOC - `H15.07.04.01`)
- **Châu Trọng Phát** (Kế toán)
  - Username: `chautrongphat` (Cơ quan: Phòng Hành chính tổng hợp IOC - `H15.07.04.01`)
- **Phạm Thế Anh** (Nhân viên)
  - Username: `phamtheanh` (Cơ quan: Phòng Hạ tầng đô thị IOC - `H15.07.04.03`)
- **Nguyễn Vũ Huy** (Nhân viên)
  - Username: `nguyenvuhuy` (Cơ quan: Phòng Hạ tầng đô thị IOC - `H15.07.04.03`)
- **Lê Thị Thanh Kiều** (Nhân viên)
  - Username: `lethithanhkieu` (Cơ quan: Phòng Khai thác và Quản lý dữ liệu - `H15.07.04.02`)
