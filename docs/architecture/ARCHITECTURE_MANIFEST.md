# Architecture Manifest

## Government Workflow Platform

Version: 1.0

---

# 1. Vision

Hệ thống là một **Workflow Platform** dùng chung cho toàn bộ hệ sinh thái, không phải một hệ thống quản lý công việc.

Mọi nghiệp vụ đều phải có khả năng tái sử dụng Workflow Engine mà không cần sửa mã nguồn lõi.

Workflow chỉ chịu trách nhiệm điều phối (Orchestration), không thực hiện nghiệp vụ của Domain.

---

# 2. Core Principles

## 2.1 Domain First

Business Domain luôn quan trọng hơn Technical Framework.

NestJS, React Flow, Prisma, RabbitMQ hay bất kỳ thư viện nào đều có thể thay thế mà không làm thay đổi Domain.

---

## 2.2 Workflow is Generic

Workflow không được biết:

* Task
* Document
* Leave Request
* Payment
* GIS
* AI
* Complaint
* Public Service

Workflow chỉ biết:

* entityType
* entityId
* workflowId
* workflowVersion
* context
* variables

---

## 2.3 Separation of Concerns

Workflow chỉ điều phối.

Business Service chỉ xử lý nghiệp vụ.

Permission Service chỉ xử lý phân quyền.

Notification Service chỉ gửi thông báo.

Media Service chỉ quản lý tập tin.

Không được chồng chéo trách nhiệm.

---

## 2.4 Open for Extension

Mọi thành phần phải có khả năng mở rộng mà không sửa Core.

Node

Action

Assignment

Rule

Form

Event

đều phải đăng ký theo Plugin.

Không sửa Runtime khi thêm tính năng mới.

---

## 2.5 Event Driven

Workflow không gọi trực tiếp Business Service nếu có thể dùng Event.

Workflow chỉ phát sự kiện.

Business tự xử lý.

---

# 3. Architecture Layers

Presentation

↓

Application

↓

Domain

↓

Infrastructure

Không được vi phạm chiều phụ thuộc.

Infrastructure không được tham chiếu ngược Domain.

Controller không được chứa nghiệp vụ.

Repository không được chứa Business Rule.

---

# 4. Module Ownership

Mỗi Microservice sở hữu dữ liệu của chính nó.

Không truy cập database của service khác.

Trao đổi thông qua:

gRPC

REST

Message Broker

Event

---

# 5. Workflow Definition

Workflow Definition là dữ liệu bất biến.

Sau Publish:

Không sửa.

Không Update.

Không Delete.

Muốn thay đổi:

Tạo Version mới.

---

# 6. Workflow Runtime

Runtime chỉ chạy trên Definition đã Publish.

Không đọc React Flow JSON.

Không xử lý dữ liệu thiết kế.

Runtime chỉ hiểu:

Compiled Definition.

---

# 7. React Flow

React Flow chỉ là Designer.

Không chứa Runtime Logic.

Không lưu Business Logic.

Không chứa Permission.

Không thực hiện Execute.

---

# 8. Compiler

React Flow

↓

Workflow Compiler

↓

Workflow Definition

↓

Runtime

Không cho Runtime đọc trực tiếp dữ liệu Designer.

---

# 9. Business Object

Mọi nghiệp vụ muốn chạy Workflow phải cung cấp:

entityType

entityId

context

Workflow không biết Entity cụ thể là gì.

---

# 10. Assignment

Assignment phải Strategy Pattern.

Không hardcode:

userId

departmentId

roleId

Ví dụ:

Creator

Creator Manager

Department Leader

Role

Expression

API

Script

---

# 11. Rule Engine

Rule phải là dữ liệu.

Không if-else theo Business.

Không switch-case theo loại hồ sơ.

Rule phải có khả năng mở rộng bằng Builder.

---

# 12. Node Plugin

Mỗi Node phải implement cùng Interface.

execute()

validate()

render()

serialize()

propertySchema()

Node không được phụ thuộc Node khác.

---

# 13. Action Plugin

Action phải độc lập.

Ví dụ:

Email

Webhook

API

RabbitMQ

Kafka

gRPC

OCR

GIS

AI

PDF

Có thể thêm Action mới mà không sửa Runtime.

---

# 14. Form Engine

Form độc lập với Workflow.

Node chỉ tham chiếu formId.

Form quản lý:

Field

Validation

Layout

Permission

Component

---

# 15. Variable Engine

Workflow Context là nguồn dữ liệu duy nhất trong Runtime.

Không đọc dữ liệu trực tiếp từ Database nếu không cần.

Variables luôn được truyền qua Runtime Context.

---

# 16. Event

Workflow phát Event.

Workflow không biết ai subscribe.

Subscriber tự xử lý.

Workflow không chờ Subscriber hoàn thành.

---

# 17. Versioning

Workflow Version bất biến.

Workflow Instance luôn gắn với đúng Version.

Không Migration Runtime Instance.

Không Update Runtime sang Version mới.

---

# 18. Error Handling

Workflow không được Crash.

Node lỗi:

Retry

Skip

Compensation

Suspend

Rollback (nếu hỗ trợ)

Mọi lỗi phải ghi Audit.

---

# 19. Monitoring

Runtime phải có:

Audit

Timeline

Current Node

Execution History

Execution Log

Variables Snapshot

Retry History

Replay

---

# 20. Security

Permission luôn kiểm tra từ PBAC.

Workflow không lưu Permission.

Workflow chỉ gọi Permission Resolver.

---

# 21. Naming Rules

Tên phải phản ánh Domain.

Không dùng:

Utils

Manager

Helper

Common

BaseService

Service2

NewService

Ưu tiên:

WorkflowCompiler

NodeExecutor

WorkflowRuntime

RuleEvaluator

AssignmentResolver

ActionExecutor

WorkflowPublisher

---

# 22. Coding Rules

Không Duplicate Logic.

Không God Class.

Không God Service.

Không Circular Dependency.

Không Business Logic trong Controller.

Không Business Logic trong DTO.

Không Repository gọi Service.

Không dùng static helper cho Domain Logic.

Ưu tiên Composition hơn Inheritance.

---

# 23. Testing

Mỗi Module phải có:

Unit Test

Integration Test

Runtime Simulation

Workflow Validation

Plugin Validation

---

# 24. Performance

Không N+1 Query.

Không Mapping dư thừa.

Không Serialize nhiều lần.

Không Reflection không cần thiết.

Không Load toàn bộ Workflow nếu chỉ cần Runtime Context.

---

# 25. AI Coding Rules

Mọi AI Agent khi tạo mã nguồn phải:

* Tuân thủ Manifest này.
* Không tạo thêm Technical Debt.
* Không thêm Utility Class nếu có thể dùng Domain Service.
* Không thêm Generic Service vô nghĩa.
* Không sửa Core để hỗ trợ một Business cụ thể.
* Không tạo Dependency ngược.
* Luôn ưu tiên Plugin, Strategy, Event và Composition.
* Giải thích lý do của mọi thay đổi kiến trúc.
* Nếu có xung đột giữa code hiện tại và Manifest, Manifest được ưu tiên.

---

# 26. Definition of Done

Một tính năng chỉ được xem là hoàn thành khi:

* Tuân thủ Manifest.
* Không tạo Circular Dependency.
* Có Test.
* Có Audit.
* Có Logging.
* Có Validation.
* Có Version Compatibility.
* Có tài liệu cập nhật.
* Có khả năng tái sử dụng.
* Không phụ thuộc vào Business Domain cụ thể.

---

# Guiding Principle

Workflow Platform là nền tảng dùng chung cho toàn bộ hệ thống.

Mọi Business Domain đều là Plugin của Workflow.

Workflow Core không bao giờ được phụ thuộc vào Business.
