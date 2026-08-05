import express, { type Express } from "express";
import cors, { type CorsOptions } from "cors";
import { env } from "./config/env";
import { databaseStatus } from "./config/database";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { ApiError } from "./utils/ApiError";

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Requests from curl, Postman, or server-to-server calls carry no Origin
    // header at all — there is no browser policy to enforce for those.
    if (!origin || env.corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(ApiError.forbidden(`Origin not allowed by CORS: ${origin}`));
  },
};

export function createApp(): Express {
  const app = express();

  // Render terminates TLS at its proxy, so the client IP and protocol arrive in
  // X-Forwarded-* headers. Without this, req.ip reports the proxy's address.
  app.set("trust proxy", 1);

  app.use(cors(corsOptions));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Also serves as the wake-up ping for the free hosting tier, which suspends
  // the service after a period without traffic.
  app.get("/api/health", (_req, res) => {
    res.json({
      success: true,
      data: {
        status: "ok",
        environment: env.NODE_ENV,
        database: databaseStatus(),
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
      },
    });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
