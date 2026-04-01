import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "schema",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL || "mysql://root:password@localhost:3306/db",
  },
});
