# ==========================================
# 1️⃣ Builder Stage
# ==========================================
FROM python:3.11-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends gcc libc6-dev
RUN pip install --no-cache-dir grpcio-tools

COPY apps/translate_service/requirements.txt .
RUN pip install --no-cache-dir --target=/app/dependencies -r requirements.txt

# Compile gRPC
COPY shared/protos /app/protos_temp
RUN python -m grpc_tools.protoc -I/app/protos_temp/translate --python_out=/app/dependencies --grpc_python_out=/app/dependencies /app/protos_temp/translate/translation.proto

# ==========================================
# 2️⃣ Runner Stage
# ==========================================
FROM gcr.io/distroless/python3-debian12 AS runner
WORKDIR /app

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app/dependencies:/app/src
ENV PROTO_PATH=/app/protos

COPY --from=builder /app/dependencies /app/dependencies
COPY apps/translate_service .
COPY shared/protos ./protos

USER 1000

EXPOSE 50059
CMD ["main.py"]