# Daklak Workspace Deployment Guide

Hướng dẫn build và deploy ứng dụng Daklak vào Kubernetes (k8s).

## 1. Build Docker Images
Chạy script PowerShell từ thư mục gốc để build các microservices:
```powershell
./build-images.ps1
```
*Lưu ý: Script mặc định bỏ qua `admin-khcn`.*

## 2. Deploy với Helm
Cập nhật dependencies và thực hiện cài đặt/nâng cấp:

```bash
# Cập nhật dependencies
helm dependency update ./deploy/daklak-chart

# Deploy vào namespace 'daklak'
helm upgrade --install daklak ./deploy/daklak-chart --create-namespace --namespace daklak
```

## 3. Các lệnh quản lý khác
- **Gỡ bỏ ứng dụng:** `helm uninstall daklak -n daklak`
- **Xóa PVCs:** `kubectl delete pvc --all -n daklak`
- **Cài đặt với Local Storage:** `helm install daklak ./deploy/daklak-chart --set global.storageClass=hostpath -n daklak`

## 4. Thông tin Tài khoản & Kết nối
Dưới đây là thông tin đăng nhập mặc định cho các dịch vụ trong namespace `daklak`:

### Infrastructure
| Dịch vụ | Hostname | Tài khoản | Mật khẩu |
| :--- | :--- | :--- | :--- |
| **MySQL** | `mysql` | `root` | `mypassword` |
| **RabbitMQ** | `rabbitmq` | `admin` | `admin123` |
| **MinIO** | `minio` | `admin` | `password123` |
| **Redis** | `redis` | - | - |

### Microservices Databases
| Dịch vụ | Database Name |
| :--- | :--- |
| `user-service` | `admin_systems` |
| `hrm-service` | `admin_hrm` |
| `translate-service` | `daklak_translation` |
| `api-gateway` | `daklak_db` |

*Lưu ý: Tất cả các dịch vụ sử dụng chung JWT_SECRET để xác thực token.*
 kubectl get pods -A

kubectl port-forward service/admin-khcn 3000:3000 -n daklak

kubectl port-forward svc/minio 9001:9001 -n infra-system

kubectl port-forward svc/rabbitmq 15672:15672 -n infra-system


docker build --target runner -t daklak-user-service:latest -f apps/user-service/Dockerfile .



docker tag daklak-user-service:latest thanhtran1993/daklak-user-service:latest

docker login

docker push thanhtran1993/daklak-user-service:latest


git clone https://github.com/bitnami/charts.git
cd charts/bitnami/mysql