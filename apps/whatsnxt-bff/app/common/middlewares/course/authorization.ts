import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

const Authorization = class {
  async verifyAdminUser(req, res, next) {
    try {
      let token = null;

      // Prioritize cookie for web requests
      if (req.cookies && req.cookies.whatsnxt_access_token) {
        token = req.cookies.whatsnxt_access_token;
      }
      // Fallback to Authorization header
      else if (req.headers.authorization) {
        token = req.headers.authorization;
      }

      if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message: "No authorization token",
          isAuthenticated: false,
        });
      }

      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

      if (typeof decodedToken === "object" && "userId" in decodedToken) {
        req.userId = new ObjectId(decodedToken.userId);

        if (!decodedToken?.userRole || decodedToken?.userRole !== "admin") {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "You are not authorized - admin access required",
            isAuthenticated: false,
          });
        }

        req.userRole = "admin";
        req.isAuthenticated = true;
        return next();
      } else {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message: "Invalid token",
          isAuthenticated: false,
        });
      }
    } catch (error) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Invalid or expired token",
        isAuthenticated: false,
      });
    }
  }

  async verifyTrainer(req, res, next) {
    try {
      let token = null;

      // Prioritize cookie for web requests
      if (req.cookies && req.cookies.whatsnxt_access_token) {
        token = req.cookies.whatsnxt_access_token;
      }
      // Fallback to Authorization header
      else if (req.headers.authorization) {
        token = req.headers.authorization;
      }

      if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message: "No authorization token",
          isAuthenticated: false,
        });
      }

      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

      if (typeof decodedToken === "object" && "userId" in decodedToken) {
        req.userId = new ObjectId(decodedToken.userId);

        if (!decodedToken?.userRole) {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "You are not authorized",
            isAuthenticated: false,
          });
        }

        if (decodedToken?.userRole !== "trainer") {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "You are not authorized - trainer access required",
            isAuthenticated: false,
          });
        }

        req.userRole = "trainer";
        req.isAuthenticated = true;
        return next();
      } else {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message: "Invalid token",
          isAuthenticated: false,
        });
      }
    } catch (error) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Invalid or expired token",
        isAuthenticated: false,
      });
    }
  }

  async verifyAdminOrTrainer(req, res, next) {
    try {
      let token = null;

      // Prioritize cookie for web requests
      if (req.cookies && req.cookies.whatsnxt_access_token) {
        token = req.cookies.whatsnxt_access_token;
      }
      // Fallback to Authorization header
      else if (req.headers.authorization) {
        token = req.headers.authorization;
      }

      if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message: "No authorization token",
          isAuthenticated: false,
        });
      }

      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

      if (typeof decodedToken === "object" && "userId" in decodedToken) {
        req.userId = new ObjectId(decodedToken.userId);

        if (!decodedToken?.userRole) {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "You are not authorized",
            isAuthenticated: false,
          });
        }

        if (
          decodedToken?.userRole !== "trainer" &&
          decodedToken?.userRole !== "admin"
        ) {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            message:
              "You are not authorized - admin or trainer access required",
            isAuthenticated: false,
          });
        }

        req.userRole = decodedToken?.userRole;
        req.isAuthenticated = true;
        return next();
      } else {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message: "Invalid token",
          isAuthenticated: false,
        });
      }
    } catch (error) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Invalid or expired token",
        isAuthenticated: false,
      });
    }
  }
};

export default new Authorization();
