import mongoose from "mongoose";
import { HttpException, HttpStatus } from "../utils/dbHelper";
import { matchPassword } from "../common/utils/crypto";

class AuthService {
  private jwtService: any;

  constructor() {
    // JWT service should be initialized if needed
    this.jwtService = null;
  }

  async validateUser(email, password) {
    try {
      const emailId = email.toLowerCase();
      const users = await mongoose.model("users").find({ email: emailId });
      if (!users || users.length === 0) {
        throw new HttpException(
          "Could not find the user",
          HttpStatus.NOT_FOUND,
        );
      }

      const user = users[0] as any;

      if (!user.password && user.googleId) return user;

      // Compare the provided password with the stored hashed password
      const passwordValid = matchPassword(password, user.password);

      if (passwordValid) {
        return user;
      }

      throw new HttpException("Invalid credentials", HttpStatus.UNAUTHORIZED);
    } catch (error) {
      throw new Error(`Failed to validate user: ${error.message}`);
    }
  }

  async jwtSignature(payload) {
    const jwtConstants = {
      maxAge: 3600,
      secret: process.env.JWT_SECRET || "default-secret",
    };

    if (!this.jwtService) {
      throw new Error("JWT service not initialized");
    }

    const whatsnxt_blog_access_token = this.jwtService.sign(payload, {
      expiresIn: `${jwtConstants.maxAge}s`,
      secret: jwtConstants.secret,
    });
    return whatsnxt_blog_access_token;
  }
}

// Create a singleton instance
const authService = new AuthService();

export {
  AuthService,
  authService, // Export singleton instance
};
