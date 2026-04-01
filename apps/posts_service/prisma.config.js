const { defineConfig } = require("prisma/config");
require("dotenv").config();

module.exports = defineConfig({
  schema: "prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "prisma/seed.ts",
  }
});
