import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import axios from "axios";
const v4 = require("uuid").v4;
import { StatusCodes } from "http-status-codes";
import { setAccessCookie, setUserCookie } from "../utils";
import { getLogger } from "../../../config/logger";
const logger = getLogger("googleAuthController");
import { HttpException, HttpStatus } from "../../utils/dbHelper";
import userController from "../../controllers/course/userController";
import { Request, Response } from "express";

const IS_PROD = process.env.NODE_ENV === "prod";
const COOKIES_DOMAIN = process.env.COOKIES_DOMAIN;
const COOKIES_USER_INFO = process.env.COOKIES_USER_INFO;
const COOKIES_ACCESS_TOKEN = process.env.COOKIES_ACCESS_TOKEN;
const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

const googleAuthController = {
  getCallback: async (req, res) => {
    const { displayName, emails, id } = req.user.profile;
    const emailId = emails[0].value.toLowerCase();
    const confirmToken = v4();

    try {
      // Check if the user already exists
      let user = await mongoose.model("users").findOne({ email: emailId });

      if (!user) {
        // User doesn't exist, create a new user
        user = await mongoose.model("users").create({
          name: displayName,
          email: emailId,
          googleId: id, // Save the Google ID for future use
          // password: '', // No password since this user uses Google login
          emailResetToken: confirmToken,
          role: "student",
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, userRole: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );

      // Set cookies for both existing and new users

      const userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      setAccessCookie(
        res,
        COOKIES_ACCESS_TOKEN,
        token,
        IS_PROD,
        COOKIES_DOMAIN,
        MAX_AGE,
      );
      setUserCookie(
        res,
        COOKIES_USER_INFO,
        userData,
        IS_PROD,
        COOKIES_DOMAIN,
        MAX_AGE,
      );

      // Build redirect URL with success parameter
      const redirectUrl = new URL(process.env.GOOGLE_REDIRECT_URL);
      redirectUrl.searchParams.set("google", "success");

      // Preserve the returnto parameter if it exists in session
      const returnto =
        req.session?.returnto ||
        redirectUrl.searchParams.get("returnto") ||
        "/";
      redirectUrl.searchParams.set("returnto", returnto);

      logger.info(
        "Google login successful. Redirecting to:",
        redirectUrl.toString(),
      );

      // Clear the session returnto since we're using it
      if (req.session?.returnto) {
        delete req.session.returnto;
      }

      // Redirect to frontend with success parameter
      res.redirect(redirectUrl.toString());

      // Redirect to a specific URL after login
      // res.redirect(process.env.GOOGLE_REDIRECT_URL);
    } catch (error) {
      logger.error("Error during Google login:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },

  async googleLogin(name, email, googleId) {
    try {
      const user = this.createGoogleUser(name, email, googleId);
      return user;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.CONFLICT);
    }
  },

  async verifyGoogleCode(accessToken) {
    try {
      const isProd = process.env.NODE_ENV === "prod";

      // Use the access token to get user info
      const userResponse = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 10000, // 10 second timeout
        },
      );

      const { sub, email, name, picture } = userResponse.data;
      const user = {
        googleId: sub,
        email,
        displayName: name,
        photo: picture,
      };

      // Check if user exists
      const isUserExist = await mongoose.model("users").findOne({ email });

      if (!isUserExist) {
        // Create new user via createGoogleUser method instead
        await this.createGoogleUser(name, user.email, user.googleId);
      }

      return user;
    } catch (error) {
      logger.error("AuthService :: verifyGoogleCode :: error:", error);

      if (error.response?.status === 401) {
        throw new Error("Invalid Google access token");
      }

      if (error.code === "ECONNABORTED") {
        throw new Error("Google API request timeout");
      }

      throw new Error("Failed to verify Google code");
    }
  },

  async createGoogleUser(name, email, googleId) {
    try {
      const emailId = email.toLocaleLowerCase();
      const exists = await mongoose.model("users").findOne({ email: emailId });

      if (exists) {
        throw new HttpException("User already exists", HttpStatus.CONFLICT);
      }

      let user = null;

      const newUser = {
        name,
        email: email.toLowerCase(),
        googleId,
        creator: false,
      };

      user = await mongoose.model("users").create(newUser);

      return user;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.CONFLICT);
    }
  },
};

export default googleAuthController;
