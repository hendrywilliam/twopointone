import { defineConfig } from "drizzle-kit";
import "dotenv/config";
export default defineConfig({
    dialect: "postgresql",
    out: "./drizzle",
    schema: "./db/schema.ts",
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
});
