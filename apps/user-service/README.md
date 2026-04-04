# User Service

Microservice NestJS (gRPC) quản lý user và PBAC (chính sách phân quyền), dùng Prisma + MySQL, Redis cache.

## Cấu trúc (chuẩn NestJS)

```
user-service/

## Test

- **Unit test:** `npm test` — chạy Jest (UsersService: createUser, findOne).
- **Test gRPC (integration):**
  1. Khởi chạy service: `npm run start` hoặc `npm run start:dev` (cần DB, Redis, RabbitMQ trong `.env`).
  2. Chạy client gRPC: `npm run test:grpc` — gọi CreateUser và FindOne.

Nếu port 50051 đang bị chiếm, tắt process đang dùng hoặc đổi `GRPC_URL` khi chạy.
├── prisma/
│   ├── schema.prisma      # Một file schema (tránh lỗi multi-file)
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── common/            # Shared: guards, decorators, enums
│   │   ├── decorators/
│   │   ├── enums/
│   │   └── guards/
│   ├── config/            # ConfigModule (env)
│   ├── database/          # PrismaModule, PrismaService
│   ├── modules/
│   │   └── users/
│   │       ├── dto/
│   │       ├── users.controller.ts
│   │       ├── users.service.ts
│   │       └── users.module.ts
│   ├── proto/             # File .proto cho gRPC
│   ├── app.module.ts
│   └── main.ts
├── prisma.config.ts
└── package.json
```

## Scripts

- `npm run build` — Build
- `npm run start:dev` — Chạy dev (watch)
- `npm run start:prod` — Chạy production
- `npm run prisma:generate` — Generate Prisma Client
- `npm run prisma:migrate` — Chạy migration
- `npm run prisma:seed` — Seed dữ liệu
- `npm run prisma:studio` — Mở Prisma Studio

## Biến môi trường

- `DATABASE_URL` — MySQL connection string
- `REDIS_HOST`, `REDIS_PORT` — Redis (cache)
- `GRPC_URL` — URL gRPC (mặc định `0.0.0.0:50051`)

## Path alias

Import dùng alias `@/*` → `src/*`, ví dụ: `@/common/decorators/roles.decorator`.

## Deployment & Migrations

### Chạy migration trên Production (VPS)
Dùng docker compose profile `migrate` để update database:

```bash
docker compose -f docker-compose.prod.yml --profile migrate run --rm user-service-migrate
```
