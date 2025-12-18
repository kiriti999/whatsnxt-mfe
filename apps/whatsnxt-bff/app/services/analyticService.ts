import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { hashPassword, matchPassword } from "../common/utils/crypto";

// JWT constants
const jwtConstants = {
  secret: process.env.JWT_SECRET || "your-secret-key",
  maxAge: parseInt(process.env.JWT_EXPIRES_IN || "3600"), // 1 hour in seconds
};

class AuthService {
  async validateUser(email, password) {
    try {
      if (!email || !password)
        throw new Error("Email and password are required");
      const emailId = email.toLowerCase();
      const User = mongoose.model("users");
      const user = await User.findOne({ email: emailId }).lean();
      if (!user) throw new Error("Could not find the user");

      const userData = user as any;

      // Handle Google OAuth users (no password)
      if (!userData.password && userData.googleId) return user;
      if (!userData.password)
        throw new Error("Invalid credentials - no password set");
      const passwordValid = await matchPassword(password, userData.password);
      if (passwordValid) return user;
      throw new Error("Invalid credentials");
    } catch (error) {
      throw new Error(`Failed to validate user: ${error.message}`);
    }
  }

  async jwtSignature(payload) {
    try {
      if (!payload) throw new Error("Payload is required for JWT signature");
      return jwt.sign(payload, jwtConstants.secret as string, {
        expiresIn: `${jwtConstants.maxAge}s`,
      });
    } catch (error) {
      throw new Error(`Failed to create JWT: ${error.message}`);
    }
  }

  async verifyJwtToken(token) {
    try {
      if (!token) throw new Error("Token is required");
      return jwt.verify(token, jwtConstants.secret);
    } catch (error) {
      if (error.name === "TokenExpiredError")
        throw new Error("Token has expired");
      if (error.name === "JsonWebTokenError") throw new Error("Invalid token");
      throw new Error(`Failed to verify JWT: ${error.message}`);
    }
  }

  async getUserById(userId) {
    try {
      if (!userId) throw new Error("User ID is required");
      const User = mongoose.model("users");
      const user = await User.findById(userId).select("-password").lean();
      if (!user) throw new Error("User not found");
      return user;
    } catch (error) {
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  async getUserByEmail(email) {
    try {
      if (!email) throw new Error("Email is required");
      const emailId = email.toLowerCase();
      const User = mongoose.model("users");
      const user = await User.findOne({ email: emailId })
        .select("-password")
        .lean();
      if (!user) throw new Error("User not found");
      return user;
    } catch (error) {
      throw new Error(`Failed to get user by email: ${error.message}`);
    }
  }

  async createUser(userData) {
    try {
      if (!userData.email || !userData.name)
        throw new Error("Email and name are required");
      const emailId = userData.email.toLowerCase();
      const User = mongoose.model("users");
      const existingUser = await User.findOne({ email: emailId }).lean();
      if (existingUser) throw new Error("User already exists with this email");

      const newUser = await User.create({
        ...userData,
        email: emailId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const { password, ...userWithoutPassword } = newUser.toObject();
      return userWithoutPassword;
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async updateUser(userId, updateData) {
    try {
      if (!userId) throw new Error("User ID is required");
      const User = mongoose.model("users");
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { ...updateData, updatedAt: new Date() },
        { new: true, select: "-password" },
      ).lean();
      if (!updatedUser) throw new Error("User not found");
      return updatedUser;
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  async changePassword(userId, oldPassword, newPassword) {
    try {
      if (!userId || !oldPassword || !newPassword)
        throw new Error("User ID, old password, and new password are required");
      const User = mongoose.model("users");
      const user = await User.findById(userId).lean();
      if (!user) throw new Error("User not found");

      const userData = user as any;
      const oldPasswordValid = await matchPassword(
        oldPassword,
        userData.password,
      );
      if (!oldPasswordValid) throw new Error("Current password is incorrect");

      const hashedNewPassword = await hashPassword(newPassword);
      await User.findByIdAndUpdate(userId, {
        password: hashedNewPassword,
        updatedAt: new Date(),
      });
      return { message: "Password changed successfully" };
    } catch (error) {
      throw new Error(`Failed to change password: ${error.message}`);
    }
  }

  async refreshToken(oldToken) {
    try {
      const decoded = (await this.verifyJwtToken(oldToken)) as any;
      const newPayload = { userId: decoded.userId, email: decoded.email };
      return await this.jwtSignature(newPayload);
    } catch (error) {
      throw new Error(`Failed to refresh token: ${error.message}`);
    }
  }

  async logout(userId) {
    try {
      // For JWT, logout is stateless; you may want to blacklist token elsewhere if needed
      return { message: "Logged out successfully" };
    } catch (error) {
      throw new Error(`Failed to logout: ${error.message}`);
    }
  }

  getServiceInfo() {
    return {
      service: "AuthService",
      features: [
        "user_validation",
        "jwt_management",
        "password_management",
        "user_crud_operations",
      ],
      jwtConfig: { expiresIn: `${jwtConstants.maxAge}s` },
      databaseType: "mongoose",
    };
  }
}

// Singleton
const authService = new AuthService();
export { AuthService, authService };
