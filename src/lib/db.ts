import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// 判断数据库类型
function getDatabaseType(url: string): "postgres" | "mysql" {
  if (url.startsWith("prisma+postgres://") || url.startsWith("postgres://") || url.startsWith("postgresql://")) {
    return "postgres";
  }
  return "mysql";
}

// 解析 MySQL DATABASE_URL
function parseMysqlUrl(url: string) {
  // mysql://user:password@host:port/database
  const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:/]+)(?::(\d+))?\/([^?]+)/);
  if (!match) {
    throw new Error(`Invalid MySQL DATABASE_URL format`);
  }
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: match[4] ? parseInt(match[4]) : 3306,
    database: match[5],
  };
}

// 创建数据库 adapter
function createAdapter() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.warn("DATABASE_URL not set, using placeholder adapter");
    // 返回一个占位 adapter
    return new PrismaPg({ connectionString: "postgresql://localhost:5432/placeholder" });
  }

  const dbType = getDatabaseType(databaseUrl);

  if (dbType === "postgres") {
    // 使用 Prisma Postgres 或标准 PostgreSQL
    return new PrismaPg({ connectionString: databaseUrl });
  } else {
    // 使用 MySQL/MariaDB
    const config = parseMysqlUrl(databaseUrl);
    return new PrismaMariaDb({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      connectionLimit: 5,
    });
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 创建 Prisma Client
function createPrismaClient() {
  return new PrismaClient({
    adapter: createAdapter(),
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
