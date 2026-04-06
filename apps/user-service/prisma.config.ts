import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
    seed: "prisma/seed.ts"
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
