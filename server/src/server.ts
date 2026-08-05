import type { Server } from "node:http";
import { createApp } from "./app";
import { env } from "./config/env";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { logger } from "./utils/logger";

async function bootstrap(): Promise<void> {
  // Connect before listening so the service never accepts a request it cannot
  // serve — a request arriving during startup would otherwise fail confusingly.
  await connectDatabase();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`API listening on port ${env.PORT} (${env.NODE_ENV})`);
    logger.info(`Allowed origins: ${env.corsOrigins.join(", ")}`);
  });

  registerShutdownHandlers(server);
}

/**
 * Hosting platforms send SIGTERM before replacing a container. Draining
 * in-flight requests and closing the database cleanly avoids dropped responses
 * and connection churn on the cluster during every redeploy.
 */
function registerShutdownHandlers(server: Server): void {
  let shuttingDown = false;

  const shutdown = async (signal: string): Promise<void> => {
    if (shuttingDown) return;
    shuttingDown = true;

    logger.info(`${signal} received — shutting down`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });

    // Do not wait forever on a connection that refuses to close.
    setTimeout(() => {
      logger.error("Shutdown timed out — forcing exit");
      process.exit(1);
    }, 10_000).unref();
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

bootstrap().catch((error: unknown) => {
  logger.error("Failed to start server", error);
  process.exit(1);
});
