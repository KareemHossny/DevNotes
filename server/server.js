const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const pinoHttp = require("pino-http");
const Sentry = require("@sentry/node");
const connectDB = require("./config/db");
const { ensureUserIndexes } = require("./utils/ensureIndexes");
const { fail } = require("./utils/response");
const logger = require("./utils/logger");
const requestId = require("./middleware/requestId");

dotenv.config();

const app = express();

const isProd = process.env.NODE_ENV === "production";
const requiredEnv = ["MONGO_URI", "JWT_SECRET"];
if (isProd) requiredEnv.push("CLIENT_URL");

const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required env: ${missing.join(", ")}`);
  process.exit(1);
}

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "script-src": ["'self'"],
        "img-src": ["'self'", "data:", "https:"],
        "style-src": ["'self'", "'unsafe-inline'"],
      },
    },
  })
);
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1),
  });
  // Newer SDK exposes middleware on Sentry.Handlers; fallback avoids crash.
  const sentryHandlers = Sentry.Handlers;
  if (sentryHandlers?.requestHandler) {
    app.use(sentryHandlers.requestHandler());
  }
  if (sentryHandlers?.tracingHandler) {
    app.use(sentryHandlers.tracingHandler());
  }
}
app.use(requestId());
app.use(
  pinoHttp({
    logger,
    customProps: (req) => ({ requestId: req.id }),
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  return res.status(200).json({ success: true, data: { status: "ok" }, error: null });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));

app.use((req, res) => {
  return fail(res, "Route not found", 404);
});

if (process.env.SENTRY_DSN && Sentry.Handlers?.errorHandler) {
  app.use(Sentry.Handlers.errorHandler());
}

app.use((err, req, res, next) => {
  if (err?.name === "ValidationError") {
    const firstError = Object.values(err.errors || {})[0];
    return fail(res, firstError?.message || "Validation failed", 400);
  }

  if (err?.code === 11000) {
    const duplicateField = Object.keys(err.keyValue || {})[0] || "field";
    return fail(res, `${duplicateField} already exists`, 409);
  }

  if (err?.name === "CastError") {
    return fail(res, "Invalid resource id", 400);
  }

  logger.error({ err, requestId: req.id }, "Unhandled error");
  return fail(res, "Server error", 500);
});

const PORT = process.env.PORT || 5000;
let server;

const start = async () => {
  await connectDB();
  await ensureUserIndexes();

  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();

process.on("unhandledRejection", (err) => {
  logger.error({ err }, "Unhandled Rejection");
  if (server) {
    server.close(() => process.exit(1));
    return;
  }
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error({ err }, "Uncaught Exception");
  if (server) {
    server.close(() => process.exit(1));
    return;
  }
  process.exit(1);
});
