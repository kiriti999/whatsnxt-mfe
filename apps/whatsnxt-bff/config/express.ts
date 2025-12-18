import express, { Request, Response, NextFunction } from "express";
// @ts-ignore
import cors from "cors";
// @ts-ignore
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
/// <reference path="../declarations.d.ts" />
import session from "express-session";
// @ts-ignore
import passport from "passport";
import rateLimit from "express-rate-limit";
// @ts-ignore
import morgan from "morgan";
import { morganStream } from "./logger";
import { getLogger } from "./logger";

// @ts-ignore
import { setupSwagger } from "./swagger";
// @ts-ignore
import { setupRoutes } from "./routes";

const logger = getLogger("express");

function getAllowedOrigins(): string[] {
  return [
    "https://whatsnxt.in",
    "https://www.whatsnxt.in",
    "https://api.whatsnxt.in",
    "http://localhost:3000",
    "http://localhost:4444",
    "http://localhost:3001",
  ];
}

export function createExpressApp(): express.Application {
  const app = express();

  // Trust proxy
  app.set("trust proxy", 1);

  // CORS
  app.use(
    cors({
      credentials: true,
      origin: getAllowedOrigins(),
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
      allowedHeaders: [
        "Origin",
        "Content-Type",
        "Accept",
        "Authorization",
        "Cookie",
        "X-Requested-With",
        "Access-Control-Allow-Credentials",
      ],
      exposedHeaders: ["Set-Cookie"],
    }),
  );

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 150,
      keyGenerator: (req) => req.socket.remoteAddress || req.ip || "unknown",
      message: "Too many requests, please try again later",
    }),
  );

  // Body parsing
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));
  app.use(cookieParser());

  // Security
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
          ],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          connectSrc: ["'self'"],
          frameSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Compression
  app.use(compression({ level: 6, threshold: 1024 }));

  // Session
  app.use(
    session({
      secret: "MTJxd2Fzeng=",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 3600000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      },
    }),
  );

  // Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // HTTP request logging (morgan -> winston)
  const morganFormat =
    process.env.NODE_ENV === "production" ? "combined" : "dev";
  const morganSkip = (req: Request, res: Response) => {
    const url = req.originalUrl || req.url || "";
    return (
      url.startsWith("/health") ||
      url.startsWith("/_next") ||
      url.startsWith("/static") ||
      url.startsWith("/favicon.ico")
    );
  };
  app.use(morgan(morganFormat, { stream: morganStream, skip: morganSkip }));

  // Setup Swagger documentation
  setupSwagger(app);

  // Setup routes
  setupRoutes(app);

  return app;
}
