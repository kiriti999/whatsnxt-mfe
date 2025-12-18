// auth.js (your Google auth routes file)
import express from "express";
import passport from "passport";
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const router = express.Router();
import googleAuthController from "../../../../common/controllers/googleAuthController";
import { getLogger } from "../../../../../config/logger";
const logger = getLogger("index");

// Passport Google OAuth setup
passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Pass the profile and token to the controller
        done(null, { profile, accessToken, refreshToken });
      } catch (error) {
        logger.error("Google Strategy Error:", error);
        done(error, null);
      }
    },
  ),
);

// Passport session setup
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Google Login Route - preserve returnto parameter
router.get("/login", (req, res, next) => {
  logger.info("Google login initiated, query params:", req.query);

  // Store the returnto parameter in session for use in callback
  if (req.query.returnto) {
    (req.session as any).returnto = req.query.returnto;
    logger.info("Stored returnto in session:", (req.session as any).returnto);
  }

  // Use passport authenticate
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
});

// Google OAuth callback route
router.get(
  "/callback",
  (req, res, next) => {
    logger.info("Google callback received, query params:", req.query);
    logger.info("Session returnto:", (req.session as any)?.returnto);

    passport.authenticate("google", {
      failureRedirect: `${process.env.GOOGLE_REDIRECT_URL}&google=error&error=auth_failed`,
    })(req, res, next);
  },
  googleAuthController.getCallback,
);

export default router;
