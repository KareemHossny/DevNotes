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
const apiRoutes = require("./routes");

dotenv.config();

const app = express();
const isProd = process.env.NODE_ENV === "production";
const API_PREFIX = "/api";
const requiredEnv = ["MONGO_URI", "JWT_SECRET"];
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (isProd) {
  requiredEnv.push("CLIENT_URL");
}

const missing = requiredEnv.filter((key) => !process.env[key]);

if (missing.length) {
  logger.error({ missing }, "Missing required environment variables");
}

app.set("trust proxy", 1);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-csrf-token"],
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

app.get(`${API_PREFIX}/health`, (req, res) => {
  if (missing.length) {
    return fail(res, `Missing required env: ${missing.join(", ")}`, 500);
  }

  return res.status(200).json({ success: true, data: { status: "ok" }, error: null });
});

app.use(API_PREFIX, apiRoutes);

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

let initPromise = null;

const initializeApp = async () => {
  if (missing.length) {
    throw new Error(`Missing required env: ${missing.join(", ")}`);
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    await connectDB();
    await ensureUserIndexes();
  })().catch((err) => {
    initPromise = null;
    throw err;
  });

  return initPromise;
};

if (require.main === module) {
  const PORT = process.env.PORT || 5001;

  initializeApp()
    .then(() => {
      app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      logger.error({ err }, "Failed to start server");
      process.exit(1);
    });
}

module.exports = app;
module.exports.app = app;
module.exports.initializeApp = initializeApp;
module.exports.default = app;
