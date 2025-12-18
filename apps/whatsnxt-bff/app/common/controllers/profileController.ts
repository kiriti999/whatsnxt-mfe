import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mailer from "../../utils/mailer";
import { nodeMailer } from "../../utils/nodeMailerConfig";
import crypto from "crypto";
import { StatusCodes } from "http-status-codes";
import { getTime, getTimeZone } from "../../helper/course/time";
import { getLogger } from "../../../config/logger";
import { Request, Response } from "express";
const logger = getLogger("profileController");
const ObjectId = mongoose.Types.ObjectId;

const profileController = {
  handler: async function (req, res) {
    try {
      const userId = req.query?.userId;
      const profile = await mongoose
        .model("users")
        .findOne(
          { _id: new mongoose.Types.ObjectId(userId || req.userId) },
          {
            name: 1,
            email: 1,
            phone: 1,
            experience: 1,
            skills: 1,
            rate: 1,
            languageIds: 1,
            from: 1,
            to: 1,
            availability: 1,
            about: 1,
            certification: 1,
            designation: 1,
            trainerProfilePhoto: 1,
            highestQualification: 1,
            role: 1,
          },
        )
        .populate("languageIds", "name abbr");

      if (!profile) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Profile not found" });
      }

      const profileData = {
        ...profile.toObject(), // or profile.toObject() if using Mongoose
        isAuthenticated: req.isAuthenticated,
      };

      res.status(StatusCodes.OK).json(profileData);
    } catch (error) {
      logger.info("error fetching profile", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send("Error fetching profile! Try again.");
    }
  },

  // Get user profile
  getProfile: async (req, res) => {
    try {
      const { email } = req.params;
      const userFromToken = req.user; // Assuming middleware sets this

      const targetEmail = email || userFromToken?.email;

      if (!targetEmail) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      const user = await mongoose.model("users").find({ email: targetEmail });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Remove sensitive data
      const userProfile: any = { ...user };
      delete userProfile.password;
      delete userProfile.emailVerificationToken;

      res.status(200).json({
        success: true,
        data: userProfile,
      });
    } catch (error) {
      logger.error("getProfile :: error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get profile",
      });
    }
  },

  editProfileInfo: async function (req, res) {
    if (!Object.keys(req.body)) {
      res.status(404).json({ message: "request body is not provided" });
    }

    try {
      const newProfileInfo = await mongoose
        .model("users")
        .findOneAndUpdate(
          { _id: new mongoose.Types.ObjectId(req.userId) },
          {
            ...req.body,
            availability: `${getTime(req.body.from)} to ${getTime(req.body.to)} ${getTimeZone()}`,
          },
          { new: true },
        )
        .populate("languageIds");
      res.status(StatusCodes.OK).json(newProfileInfo);
    } catch (err) {
      res.status(400).json({ message: "error in editProfileInfo handler" });
    }
  },

  editProfile: async (req, res) => {
    let { name } = req.body;
    try {
      const profile = await mongoose
        .model("users")
        .findOneAndUpdate(
          { _id: new mongoose.Types.ObjectId(req.userId) },
          { name: name },
          { new: true },
        );

      res.status(StatusCodes.OK).send({ profile });
    } catch (error) {
      logger.info("Routes:: /edit:: error:", error);
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const { email, name, photo, profile, settings, socialMedia } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      const allowedFields = { name, photo, profile, settings, socialMedia };
      const updateData = { updatedAt: new Date() };

      // Filter out undefined values
      Object.keys(allowedFields).forEach((key) => {
        if (allowedFields[key] !== undefined) {
          updateData[key] = allowedFields[key];
        }
      });

      const genericDb = mongoose.connection.db;
      const result = await genericDb
        .collection("users")
        .findOneAndUpdate(
          { email: email.toLowerCase() },
          { $set: updateData },
          { returnDocument: "after" },
        );

      const updatedUser = result?.value || result;
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Remove sensitive data
      const userData: any = updatedUser;
      delete userData.password;
      delete userData.emailVerificationToken;

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      logger.error("updateProfile :: error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update profile",
      });
    }
  },

  editPassword: async function (req, res) {
    let { password, newPassword } = req.body;
    try {
      if (password !== newPassword) {
        res
          .status(StatusCodes.UNPROCESSABLE_ENTITY)
          .send("Password doesn't match");
      }
      if (password.length < 6) {
        res
          .status(StatusCodes.UNPROCESSABLE_ENTITY)
          .send("Password should be minimum of Six characters long");
      }
      // Encrypt password with bcrypt
      const passwordHash = await bcrypt.hash(password, 10);

      await mongoose
        .model("users")
        .findOneAndUpdate(
          { _id: new mongoose.Types.ObjectId(req.userId) },
          { password: passwordHash },
        );
      res.status(StatusCodes.OK).send("Password has been updated!");
    } catch (error) {
      logger.info("Error updating password! Try again:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send("Error updating password! Try again.");
    }
  },

  resetPassword: async function (req, res) {
    try {
      const { email } = req.body;
      let lowerCaseEmail = String(email).toLowerCase();
      // Check if user exists with the provided email
      const user = await mongoose
        .model("users")
        .findOne({ email: lowerCaseEmail });
      if (!user) {
        res.status(StatusCodes.NOT_FOUND).json({ error: "User not found" });
      }

      // Check if a reset token already exists for the user and delete if it does
      let token = await mongoose.model("tokens").findOne({ userId: user._id });
      if (token) await mongoose.model("tokens").deleteOne({ _id: token._id });

      // Generate a new reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hash = await bcrypt.hash(resetToken, 10);

      // Save the new token to the database
      await mongoose.model("tokens").create({
        userId: user._id,
        token: hash,
      });

      // Create the reset link
      const resetLink = `${process.env.DOMAIN_URL}/set-password?token=${resetToken}&id=${user._id}`;

      // Prepare email data
      const resetData = {
        from: process.env.EMAIL,
        to: email,
        subject: "Password Reset Request",
        html: `
            <p>Hi,</p>
            <p>You requested to reset your password. Please click the link below to reset your password:</p>
            <a href="${resetLink}">Reset Password</a>
            <p>If you did not request a password reset, please ignore this email.</p>
        `,
      };
      // Send the reset email
      await nodeMailer.sendMail(resetData);

      res
        .status(StatusCodes.OK)
        .json({ message: "Password reset email sent successfully" });
    } catch (error) {
      logger.error("Error processing password reset request:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          error:
            "Error processing password reset request. Please try again later.",
        });
    }
  },

  createResetPasswordToken: async function (req, res) {
    try {
      const { userId, token: resetToken } = req.params;
      const { password } = req.body;

      // Validate the user ID and fetch the user
      const user = await mongoose.model("users").findById(userId);
      if (!user)
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: "Invalid or expired link" });

      // Validate the reset token
      const tokenData = await mongoose
        .model("tokens")
        .findOne({ userId: user._id });
      if (!tokenData)
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: "Invalid or expired password reset request" });

      const isTokenValid = await bcrypt.compare(resetToken, tokenData.token);
      if (!isTokenValid)
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: "Invalid or expired password reset token" });

      // Hash the new password and update the user
      user.password = await bcrypt.hash(password, 10);
      await user.save();

      // Delete the token after successful password reset
      await mongoose.model("tokens").deleteOne({ _id: tokenData._id });

      res
        .status(StatusCodes.OK)
        .json({ message: "Password reset successfully." });
    } catch (error) {
      logger.error("Error updating password. Try again:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Error updating password. Please try again later." });
    }
  },

  // Password reset request
  requestPasswordReset: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      const user = await findUser(email);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const genericDb = mongoose.connection.db;

      // Delete existing reset tokens
      await genericDb.collection("passwordResetTokens").deleteMany({
        userId: user._id,
      });

      // Generate new reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hash = await bcrypt.hash(resetToken, 10);

      // Store reset token
      await genericDb.collection("passwordResetTokens").insertOne({
        userId: user._id,
        token: hash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      });

      // Send reset email
      const sender = process.env.MAIL_SENDER;
      const link = `${process.env.DOMAIN_URL}/reset-password?token=${resetToken}&id=${user._id}`;
      const emailData = {
        from: process.env[`${sender}_EMAIL`],
        to: email,
        subject: "Password Reset Request",
        html: `
                    <p>Hi ${user.name || "there"},</p>
                    <p>You requested to reset your password.</p>
                    <p>Click the link below to reset your password:</p>
                    <a href="${link}">Reset Password</a>
                    <p>This link expires in 1 hour.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                `,
      };

      await nodeMailer.sendMail(emailData);

      res.status(200).json({
        success: true,
        message: "Password reset link sent to your email",
      });
    } catch (error) {
      logger.error("requestPasswordReset :: error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send reset email",
      });
    }
  },

  // Password reset token generation
  generatePasswordResetToken(userId) {
    try {
      const payload = {
        sub: userId,
        type: "password_reset",
      };

      return jwt.sign(payload, this.jwtConstants.secret, {
        expiresIn: "1h", // Password reset tokens expire in 1 hour
      });
    } catch (error) {
      logger.error(
        "AuthService :: generatePasswordResetToken :: error:",
        error,
      );
      throw new Error("Failed to generate password reset token");
    }
  },

  // Verify password reset token
  verifyPasswordResetToken(token) {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "");

      if (decoded.type !== "password_reset") {
        throw new Error("Invalid token type");
      }

      return decoded;
    } catch (error) {
      logger.error("AuthService :: verifyPasswordResetToken :: error:", error);
      throw new Error("Invalid or expired password reset token");
    }
  },

  verifyEmail: async (req, res) => {
    try {
      const { userId, token } = req.body;

      if (!userId || !token) {
        return res.status(400).json({
          success: false,
          message: "User ID and token are required",
        });
      }

      if (!ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      const genericDb = mongoose.connection.db;

      const user = await genericDb.collection("users").findOne({
        _id: new ObjectId(userId),
        emailVerificationToken: token,
        emailVerificationExpiry: { $gt: new Date() },
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired verification token",
        });
      }

      await genericDb.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            isEmailVerified: true,
            updatedAt: new Date(),
          },
          $unset: {
            emailVerificationToken: "",
            emailVerificationExpiry: "",
          },
        },
      );

      res.status(200).json({
        success: true,
        message: "Email verified successfully",
      });
    } catch (error) {
      logger.error("verifyEmail :: error:", error);
      res.status(500).json({
        success: false,
        message: "Email verification failed",
      });
    }
  },

  isCreator: async (req, res) => {
    try {
      const { email } = req.params;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      const emailId = email.toLowerCase();

      // Check if user has own database (legacy) - DISABLED
      // const hasOwnDb = await dbService.isDbExists(emailId);
      // if (hasOwnDb) {
      //     return res.status(200).json({
      //         success: true,
      //         data: { isCreator: true }
      //     });
      // }

      // Check creator status in generic database
      const genericDb = mongoose.connection.db;
      const user = await genericDb
        .collection("users")
        .findOne({ email: emailId });

      res.status(200).json({
        success: true,
        data: { isCreator: user ? user.creator : false },
      });
    } catch (error) {
      logger.error("isCreator :: error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to check creator status",
      });
    }
  },
};

export default profileController;

async function findUser(email) {
  if (!email) return null;
  const lowerCaseEmail = String(email).toLowerCase();
  return await mongoose.model("users").findOne({ email: lowerCaseEmail });
}
