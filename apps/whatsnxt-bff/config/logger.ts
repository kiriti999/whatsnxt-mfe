import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf, colorize, errors } = format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

// Export as named for ES modules
export const getLogger = (context: string) => {
  return createLogger({
    level: process.env.NODE_ENV === "development" ? "debug" : "info",
    format: combine(
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      errors({ stack: true }),
      logFormat,
    ),
    transports: [
      new transports.Console({
        format: combine(colorize(), logFormat),
      }),
    ],
    defaultMeta: { service: "whatsnxt-bff", context },
  });
};

export const morganStream = {
  write: (message: string) => {
    // Use a default logger for morgan stream
    const logger = getLogger("morgan");
    logger.info(message.trim());
  },
};
