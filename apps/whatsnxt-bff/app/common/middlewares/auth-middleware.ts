import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

function auth(req, res, next) {
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

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (typeof decodedToken === "object" && "userId" in decodedToken) {
      req.userId = new ObjectId(decodedToken.userId);
      if (decodedToken?.userRole) {
        req.userRole = decodedToken.userRole;
        req.isAuthenticated = true;
        req.token = token;
      }
      return next();
    } else {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Invalid token" });
    }
  } catch (error) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Invalid or expired token" });
  }
}

export default auth;
