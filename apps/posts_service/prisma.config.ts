import "dotenv/config";
import type { PrismaConfig } from "prisma";

if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is missing");
}

export default {
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },

  datasource: {
    url: process.env.DATABASE_URL,
  },
} satisfies PrismaConfig;