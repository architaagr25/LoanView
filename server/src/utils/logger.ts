type Level = "info" | "warn" | "error";

/**
 * Minimal timestamped logger. Deliberately thin — a logging library would add
 * a dependency and configuration surface this project does not need.
 */
function write(level: Level, message: string, meta?: unknown): void {
  const timestamp = new Date().toISOString();
  const line = `${timestamp} [${level.toUpperCase()}] ${message}`;

  if (level === "error") {
    console.error(line, meta ?? "");
    return;
  }

  console.log(line, meta ?? "");
}

export const logger = {
  info: (message: string, meta?: unknown) => write("info", message, meta),
  warn: (message: string, meta?: unknown) => write("warn", message, meta),
  error: (message: string, meta?: unknown) => write("error", message, meta),
};
