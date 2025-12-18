import mongoose from "mongoose";
import User from "../models/user";
import jwt from "jsonwebtoken";
const v4 = require("uuid").v4;
import { StatusCodes } from "http-status-codes";
import { hashPassword } from "../utils/crypto";
import { getLogger } from "../../../config/logger";
const logger = getLogger("accountController");

const accountController = {
  createAccount: async (req, res) => {
    const confirmToken = v4();
    // Received params from request
    let { name, email, password, otp } = req.body;
    try {
      // Input validation
      if (!name || name.length < 3) {
        return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
          message: "The name should be a minimum of three characters long",
          status: StatusCodes.UNPROCESSABLE_ENTITY,
        });
      }

      if (!email) {
        return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
          message: "Email should be a valid email address",
          status: StatusCodes.UNPROCESSABLE_ENTITY,
        });
      }

      if (!password || password.length < 6) {
        return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
          message: "Password should be minimum of six characters long",
          status: StatusCodes.UNPROCESSABLE_ENTITY,
        });
      }

      if (!otp) {
        return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
          message: "OTP is required",
          status: StatusCodes.UNPROCESSABLE_ENTITY,
        });
      }

      const emailId = email.toLowerCase(); // Fixed typo: toLocaleLowerCase -> toLowerCase

      // Check if user with that email already exists
      const existingUser = await mongoose
        .model("users")
        .findOne({ email: emailId }); // Use User model name consistently

      if (existingUser) {
        return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
          message: `User already exists with email ${emailId}`,
          status: StatusCodes.UNPROCESSABLE_ENTITY,
        });
      }

      // Verify OTP
      const isotpsValid = await mongoose.model("otps").findOne({
        otp,
        email: emailId,
      });

      if (!isotpsValid) {
        return res.status(StatusCodes.FORBIDDEN).json({
          message: "OTP is invalid or expired",
          status: StatusCodes.FORBIDDEN,
        });
      }

      // Encrypt password with bcrypt
      const passwordHash = hashPassword(password);

      const newUser = await mongoose.model("users").create({
        name,
        email: emailId,
        password: passwordHash,
        plainPassword: password,
        emailResetToken: confirmToken,
        accountStatus: "active",
        isActive: true,
        otpVerified: true,
        role: "student",
      });

      await mongoose.model("otps").deleteMany({ email: emailId });

      const token = jwt.sign(
        { userId: newUser._id.toString(), userRole: "student" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );

      // Prepare user data (exclude sensitive information)
      const userData = {
        _id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role || "student",
      };

      // Set cookies
      // const isProd = process.env.NODE_ENV === 'local';
      // const MAX_AGE = 7 * 24 * 60 * 60 * 1000;
      // setAccessCookie(res, process.env.COOKIES_ACCESS_TOKEN, token, isProd, process.env.COOKIES_DOMAIN, MAX_AGE);
      // setUserCookie(res, process.env.COOKIES_USER_INFO, userData, isProd, process.env.COOKIES_DOMAIN, MAX_AGE);

      // Send success response
      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Registration successful",
        user: userData,
      });
    } catch (error) {
      logger.error("Create account error:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Internal server error during registration",
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  },

  updateAccount: async (req, res) => {
    const { name, designation, location, description } = req.body;

    try {
      const result = await User.updateOne(
        { _id: req.userId },
        { name, designation, location, description },
      );

      if (result.modifiedCount > 0) {
        res
          .status(StatusCodes.OK)
          .json({ message: "Profile updated successfully!" });
      } else {
        res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
      }
    } catch (error) {
      logger.error("accountController::updateAccount: error:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Error updating profile" });
    }
  },
};

export default accountController;
