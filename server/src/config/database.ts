import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../utils/logger";

export async function connectDatabase(): Promise<void> {
  // Reject queries containing fields absent from the schema rather than
  // silently ignoring them, which would turn a typo into an empty result set.
  mongoose.set("strictQuery", true);

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB connection lost — driver will retry automatically");
  });

  mongoose.connection.on("reconnected", () => {
    logger.info("MongoDB connection re-established");
  });

  await mongoose.connect(env.MONGODB_URI, {
    // Surface an unreachable cluster in ten seconds instead of hanging for the
    // 30 second default while a request waits on it.
    serverSelectionTimeoutMS: 10_000,
  });

  logger.info(`MongoDB connected — database "${mongoose.connection.name}"`);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.connection.close();
  logger.info("MongoDB connection closed");
}

// Mongoose reports connection state as a number, including 99 for a connection
// that was never initialised — hence a map rather than an array lookup.
const CONNECTION_STATES: Record<number, string> = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
  99: "uninitialized",
};

/** Human-readable connection state, used by the health endpoint. */
export function databaseStatus(): string {
  return CONNECTION_STATES[mongoose.connection.readyState] ?? "unknown";
}
