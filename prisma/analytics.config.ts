import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

loadEnv({ path: ".env.local" });
loadEnv();

export default defineConfig({
  schema: "analytics.prisma",
  datasource: {
    url: process.env["DATABASE_URL_ANALYTICS"],
  },
});
