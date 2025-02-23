import { config } from 'dotenv';

// Load environment variables
config();

export const CONFIG = {
  // Server configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database configuration
  DATABASE_URL: process.env.DATABASE_URL,
  DB_RECONNECT_TRIES: 5,
  DB_RECONNECT_INTERVAL: 5000, // 5 seconds

  // Session configuration
  SESSION_SECRET: process.env.SESSION_SECRET || 'your-secret-key',

  // Email configuration
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100, // number of requests per window

  // Production specific
  TRUST_PROXY: process.env.NODE_ENV === 'production',

  // Cors configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

  // Health check
  HEALTH_CHECK_PATH: '/health',
  HEALTH_CHECK_INTERVAL: 30000, // 30 seconds
} as const;