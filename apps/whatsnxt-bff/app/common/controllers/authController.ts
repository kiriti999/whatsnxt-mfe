import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { setAccessCookie, setUserCookie, clearCookies } from "../utils";

import { otpEmail } from "../utils/otpMail";
import { matchPassword } from "../utils/crypto";
import { getLogger } from "../../../config/logger";
const logger = getLogger("authController");

const IS_PROD = process.env.NODE_ENV === "prod";
const COOKIES_DOMAIN = process.env.COOKIES_DOMAIN;
const COOKIES_USER_INFO = process.env.COOKIES_USER_INFO;
const COOKIES_ACCESS_TOKEN = process.env.COOKIES_ACCESS_TOKEN;

const authController = {
  createOtp: async (req, res) => {
    // Received params from request
    let { name, email } = req.body;

    try {
      // Input validation
      if (!name || name.length < 3) {
        return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
          message: "The name should be a minimum of three characters long", // Fixed: was saying "six" but checking for 3
          status: StatusCodes.UNPROCESSABLE_ENTITY,
        });
      }

      if (!email) {
        return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
          message: "Email should be a valid email address",
          status: StatusCodes.UNPROCESSABLE_ENTITY,
        });
      }

      const emailId = email.toLowerCase(); // Fixed typo: toLocaleLowerCase -> toLowerCase

      // Check if user with that email already exists
      const existingUser = await mongoose
        .model("users")
        .findOne({ email: emailId }); // Use findOne instead of find, and consistent model name
      logger.info(
        "routes:: auth/index.js:: /otp:: checking for existing user:",
        existingUser,
      );

      if (existingUser) {
        return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
          message: `User already exists with email ${emailId}`,
          status: StatusCodes.UNPROCESSABLE_ENTITY,
        });
      }

      // Clean up any existing OTPs for this email
      await mongoose.model("otps").deleteMany({ email: emailId }); // Use consistent model name

      // Generate and send OTP
      const otp = await otpEmail(name, emailId);
      logger.info("🚀 ~ router.post ~ otp:", otp);

      // Store OTP in database
      await mongoose.model("otps").create({
        name,
        email: emailId,
        otp,
        purpose: "registration", // Add purpose for better tracking
      });

      // Send success response
      return res.status(StatusCodes.CREATED).json({
        message: "OTP sent successfully",
        email: emailId,
        status: StatusCodes.CREATED,
      });
    } catch (error) {
      logger.error("Create OTP error:", error);

      // Only send error response if headers haven't been sent yet
      if (!res.headersSent) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: "Internal server error while sending OTP",
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          // Don't expose the full error object in production
          ...(process.env.NODE_ENV === "development" && {
            error: error.message,
          }),
        });
      }
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      // Input validation
      if (!email) {
        return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
          message: "Email should be a valid email address",
          status: StatusCodes.UNPROCESSABLE_ENTITY,
        });
      }

      if (!password) {
        return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
          message: "Password is required",
          status: StatusCodes.UNPROCESSABLE_ENTITY,
        });
      }

      const emailId = email.toLowerCase();

      // Find user
      const user = await mongoose.model("users").findOne({ email: emailId });

      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: "User account does not exist",
          status: StatusCodes.NOT_FOUND,
        });
      }

      if (user.active === false) {
        return res.status(StatusCodes.FORBIDDEN).json({
          message:
            "This account is temporarily disabled, please contact the support email",
          status: StatusCodes.FORBIDDEN,
        });
      }

      // Verify password
      const passwordsMatch = matchPassword(password, user.password);
      if (!passwordsMatch) {
        logger.info("auth/login:: password incorrect");

        return res.status(StatusCodes.UNAUTHORIZED).json({
          message: "Password is not correct",
          status: StatusCodes.UNAUTHORIZED,
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, userRole: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );

      const userData = {
        _id: user._id.toString(),
        name: user.name,
        email: emailId,
        role: user.role,
      };

      // Fixed: Use correct environment check
      const isProd = process.env.NODE_ENV === "prod";

      // Set cookies
      setAccessCookie(
        res,
        process.env.COOKIES_ACCESS_TOKEN,
        token,
        isProd,
        process.env.COOKIES_DOMAIN,
        Number(process.env.MAX_AGE),
      );

      setUserCookie(
        res,
        process.env.COOKIES_USER_INFO,
        userData,
        isProd,
        process.env.COOKIES_DOMAIN,
        Number(process.env.MAX_AGE),
      );

      return res.status(StatusCodes.OK).json({
        message: "Login successful",
        token,
        status: StatusCodes.OK,
      });
    } catch (error) {
      logger.error("auth/login:: error: ", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Internal server error",
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  },

  async validateUser(email, password) {
    try {
      const emailId = email.toLowerCase();
      const user = await this.usersService.findUser(emailId);

      if (!user) {
        throw new Error("Could not find the user");
      }

      // If user has Google login and no password, return user
      if (!user.password && user.googleId) {
        return user;
      }

      // Compare the provided password with the stored hashed password
      const passwordValid = matchPassword(password, user.password);

      if (passwordValid) {
        return user;
      }

      throw new Error("Invalid credentials");
    } catch (error) {
      logger.error("AuthService :: validateUser :: error:", error);
      throw error;
    }
  },

  async jwtSignature(payload) {
    try {
      const token = jwt.sign(payload, this.jwtConstants.secret, {
        expiresIn: `${this.jwtConstants.maxAge}s`,
      });
      return token;
    } catch (error) {
      logger.error("authController :: jwtSignature :: error:", error);
      throw new Error("Failed to generate JWT token");
    }
  },

  logout: async (req, res) => {
    try {
      // Get the token from the request cookies
      const token = req?.cookies[process.env.COOKIES_ACCESS_TOKEN];

      if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "No token found",
          status: StatusCodes.BAD_REQUEST,
        });
      }

      // Clear the token cookie
      clearCookies(
        res,
        COOKIES_ACCESS_TOKEN,
        COOKIES_USER_INFO,
        IS_PROD,
        COOKIES_DOMAIN,
      );

      // Respond with a success message
      return res.status(StatusCodes.OK).json({
        message: "Logout successful",
        status: StatusCodes.OK,
      });
    } catch (error) {
      logger.error("Logout error:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "An error occurred while logging out",
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  },

  // Additional utility methods for Express middleware
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new Error("Token has expired");
      } else if (error.name === "JsonWebTokenError") {
        throw new Error("Invalid token");
      } else {
        throw new Error("Token verification failed");
      }
    }
  },

  // Middleware for protecting routes (equivalent to JwtAuthGuard)
  authenticateToken(req, res, next) {
    try {
      const authHeader = req.headers["authorization"];
      const cookieToken = req.cookies[process.env.COOKIES_ACCESS_TOKEN];

      // Check for token in header or cookie
      const token = authHeader?.split(" ")[1] || cookieToken;

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Access token required",
        });
      }

      const decoded = this.verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Optional middleware to check if user is authenticated (doesn't fail if not)
  optionalAuth(req, res, next) {
    try {
      const authHeader = req.headers["authorization"];
      const cookieToken = req.cookies[process.env.COOKIES_ACCESS_TOKEN];

      const token = authHeader?.split(" ")[1] || cookieToken;

      if (token) {
        try {
          const decoded = this.verifyToken(token);
          req.user = decoded;
        } catch (error) {
          // Silently fail for optional auth
          req.user = null;
        }
      }

      next();
    } catch (error) {
      next();
    }
  },

  // Refresh token functionality
  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET) as any;

      // Generate new access token
      const payload = {
        username: decoded.username || decoded.userId,
        sub: decoded.sub || decoded.userId,
      };

      return await this.jwtSignature(payload);
    } catch (error) {
      logger.error("AuthService :: refreshToken :: error:", error);
      throw new Error("Invalid refresh token");
    }
  },
};

export default authController;
