import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { getLogger } from "../../../config/logger";
const logger = getLogger("extract-user");
const ObjectId = mongoose.Types.ObjectId;

function extractUser(req, res, next) {
  let token = null;

  // Prioritize cookie for web requests
  if (req.cookies && req.cookies.whatsnxt_access_token) {
    token = req.cookies.whatsnxt_access_token;
  }
  // Fallback to Authorization header
  else if (req.headers.authorization) {
    token = req.headers.authorization;
  }

  // If no token found, continue without setting user info
  if (!token) {
    return next();
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (typeof decodedToken === "object" && "userId" in decodedToken) {
      req.userId = new ObjectId(decodedToken.userId);
      if (decodedToken?.userRole) {
        req.userRole = decodedToken.userRole;
      }
    }
  } catch (error) {
    logger.info("Unable to extract user as token is invalid or expired");
  }

  // Always continue to next middleware regardless of token validity
  return next();
}

export default extractUser;
