import pino from "pino";
import { env } from "../../config/env";
import path from "path";
import fs from "fs";

// Ensure logs directory exists
const logDir = path.dirname(env.logFilePath);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const isDevelopment = env.nodeEnv === "development";

const transports = pino.transport({
  targets: [
    {
      target: "pino-pretty",
      level: env.logLevel,
      options: {
        colorize: true,
        ignore: "pid,hostname",
        translateTime: "HH:MM:ss Z",
      },
    },
    {
      target: "pino-roll",
      level: env.logLevel,
      options: {
        file: env.logFilePath,
        frequency: "daily",
        size: "10m",
        mkdir: true,
      },
    },
  ],
});

export const logger = pino(
  {
    level: env.logLevel,
    base: isDevelopment ? undefined : { pid: process.pid },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  transports
);
