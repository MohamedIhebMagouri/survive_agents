import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "prisma/config";

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) {
    throw new Error("DATABASE_URL is not defined");
  }

  const envFile = readFileSync(envPath, "utf8");
  const match = envFile.match(/^DATABASE_URL\s*=\s*(.*)$/m);
  if (!match) {
    throw new Error("DATABASE_URL is not defined in .env");
  }

  const url = match[1].trim().replace(/^['\"]|['\"]$/g, "");
  process.env.DATABASE_URL = url;
  return url;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: getDatabaseUrl(),
  },
});
