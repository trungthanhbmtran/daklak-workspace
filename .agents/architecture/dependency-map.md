# Dependency Map

- Các service phụ thuộc vào RabbitMQ (events) và Redis (cache/pubsub).
- `api-gateway` phụ thuộc gRPC tới `user-service`, `hrm-service`, `chat-service`.
- Mọi service có quy trình đều phụ thuộc (logical) vào `workflow-service`.
