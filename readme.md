# Daklak Workspace Deployment Guide
npx prisma migrate dev --name init
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

# Khởi động lại các services
docker compose -f docker-compose.prod.yml up -d

# Chạy seeders (nếu cần dữ liệu mẫu)
# Lưu ý: Nên chạy theo thứ tự dưới đây
docker exec -it daklak-workspace-user-service-1 npx prisma db seed
docker exec -it daklak-workspace-hrm-service-1 npx prisma db seed
docker exec -it daklak-workspace-workflow-service-1 npx prisma db seed
docker exec -it daklak-workspace-media-service-1 npx prisma db seed
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

*Lưu ý: Đảm bảo file `.env` trên server chứa đầy đủ các biến môi trường cần thiết (JWT_SECRET, DATABASE_URL, v.v.)*
