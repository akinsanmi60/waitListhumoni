import express, { type Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import session from "express-session";
import MemoryStore from "memorystore";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { CONFIG } from "./config";
import * as path from "path";

const app = express();

// Configure trust proxy for Replit environment
app.set("trust proxy", "loopback, linklocal, uniquelocal");

// Basic middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure rate limiting - more permissive in development
const limiter = rateLimit({
  windowMs: CONFIG.RATE_LIMIT_WINDOW_MS,
  max:
    CONFIG.NODE_ENV === "development" ? 1000 : CONFIG.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    error: "RATE_LIMIT_EXCEEDED",
    message: "Too many requests, please try again later",
  },
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

// Apply rate limiting to all routes except in development
if (CONFIG.NODE_ENV !== "development") {
  app.use(limiter);
}

// Configure session handling
const SessionStore = MemoryStore(session);
app.use(
  session({
    store: new SessionStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    secret: CONFIG.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: CONFIG.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Health check endpoint
app.get(CONFIG.HEALTH_CHECK_PATH, (_req, res) => {
  res
    .status(200)
    .json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

(async () => {
  try {
    const server = registerRoutes(app);

    // Global error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      // Don't expose stack traces in production
      const error =
        CONFIG.NODE_ENV === "production"
          ? { message }
          : { message, stack: err.stack };

      res.status(status).json({
        success: false,
        error: "SERVER_ERROR",
        ...error,
      });

      // Log errors in development
      if (CONFIG.NODE_ENV !== "production") {
        console.error(err);
      }
    });

    // Setup static file serving and Vite middleware based on environment
    if (CONFIG.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Start server with proper error handling
    const PORT = parseInt(CONFIG.PORT as string, 10) || 5000;
    server.listen(PORT, "0.0.0.0", () => {
      log(
        `Server running at http://0.0.0.0:${PORT} in ${CONFIG.NODE_ENV} mode`
      );
    });

    // Set server timeout
    server.setTimeout(120000); // 2 minutes

    // Handle server errors
    server.on("error", (error: Error) => {
      console.error("Server error:", error);
      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
