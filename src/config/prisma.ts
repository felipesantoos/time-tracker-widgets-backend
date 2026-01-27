import { PrismaClient } from "@prisma/client";
import { logger } from "../infra/logging/Logger";

export const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "query" },
    { emit: "event", level: "info" },
    { emit: "event", level: "warn" },
    { emit: "event", level: "error" },
  ],
});

prisma.$on("query" as any, (e: any) => {
  logger.debug({
    query: e.query,
    params: e.params,
    duration: `${e.duration}ms`,
  }, "Prisma Query");
});

prisma.$on("info" as any, (e: any) => {
  logger.info(e.message);
});

prisma.$on("warn" as any, (e: any) => {
  logger.warn(e.message);
});

prisma.$on("error" as any, (e: any) => {
  logger.error(e.message);
});
