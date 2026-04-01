const { defineConfig, env } = require("prisma/config");

module.exports = defineConfig({
  schema: "prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
