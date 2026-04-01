const { defineConfig } = require("prisma/config");
require("dotenv").config();

console.log(process.env.DATABASE_URL);
module.exports = defineConfig({
  schema: "prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
