# Workflow Rules

## workflow-service là Business Rule Authority
- `workflow-service` là chủ sở hữu của quy trình (workflow configuration, definition, version, instance, rules, state, transition).
- Các service khác (ví dụ: `hrm-service`, `document-service`) KHÔNG ĐƯỢC tự hard-code quy trình duyệt, transition hoặc trạng thái quy trình.
- Khi cần duyệt/chuyển trạng thái: `Service` -> gọi `workflow-service` (qua gRPC/RabbitMQ) -> `workflow-service` thực thi rule -> Trả về kết quả.
