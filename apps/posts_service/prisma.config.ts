import { defineConfig } from "prisma/config";
import dotenv from "dotenv";
dotenv.config();

export default defineConfig({
    schema: "prisma",
    migrations: {
        path: "prisma/migrations",
        seed: "prisma/seed.ts",
    },
    // datasource: {
    //     url: process.env.DATABASE_URL,
    // },
})