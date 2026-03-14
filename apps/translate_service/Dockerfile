# ==========================================
# 1️⃣ Stage: Builder (Dùng Slim để lấy glibc và build wheel)
# ==========================================
FROM python:3.11-slim AS builder
WORKDIR /app

# Cài đặt công cụ build C-extension (chỉ nằm ở stage 1, không làm nặng stage 2)
RUN apt-get update && apt-get install -y --no-install-recommends gcc libc6-dev

# Cài đặt công cụ build gRPC cho Python
RUN pip install --no-cache-dir grpcio-tools

# Copy file requirements của service phiên dịch
COPY apps/translate_service/requirements.txt .
RUN pip install --no-cache-dir --target=/app/dependencies -r requirements.txt

# Copy TOÀN BỘ thư mục protos dùng chung để biên dịch
COPY shared/protos /app/protos_temp

# Biên dịch gRPC (Từ translation.proto ra translation_pb2.py)
RUN python -m grpc_tools.protoc -I/app/protos_temp/translate --python_out=/app/dependencies --grpc_python_out=/app/dependencies /app/protos_temp/translate/translation.proto

# ==========================================
# 2️⃣ Stage: Runner (LÕI GOOGLE DISTROLESS PYTHON)
# ==========================================
# Bản này không có bash/sh, cực nhẹ và bảo mật tuyệt đối
FROM gcr.io/distroless/python3-debian12 AS runner
WORKDIR /app

# Khai báo môi trường cực kỳ quan trọng cho Python trên K8s
# PYTHONUNBUFFERED=1 giúp log được đẩy thẳng ra stdout để kubectl logs nhìn thấy ngay lập tức
ENV PYTHONUNBUFFERED=1
# Trỏ đường dẫn để Python biết chỗ tìm các thư viện và source code
ENV PYTHONPATH=/app/dependencies:/app/src
# Đường dẫn để code gRPC tìm file .proto
ENV PROTO_PATH=/app/protos

# Copy thư viện từ stage 1 sang
COPY --from=builder /app/dependencies /app/dependencies

# Copy source code của service phiên dịch
COPY apps/translate_service .

# Copy TOÀN BỘ thư mục protos dùng chung từ monorepo root
COPY shared/protos ./protos
# Nếu service này cần gọi ra ngoài (ví dụ gọi user), bạn copy thêm:
# COPY shared/protos/users ./protos/users

# 🛡️ Distroless tự động có sẵn user non-root (ID: 1000)
USER 1000

# Cổng gRPC đã cấu hình
EXPOSE 50059

# ENTRYPOINT mặc định của image này đã là "python"
# Nên CMD chỉ cần truyền tên file chạy chính
CMD ["main.py"]