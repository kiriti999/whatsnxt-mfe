/*!
 * Module dependencies
 */
import mongoose from "mongoose";
const Schema = mongoose.Schema;

/**
 * Unified User Schema
 * Combines authentication, profile, and trainer features
 */
const UserSchema = new Schema(
  {
    // Core Identity Fields
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      validate: {
        validator: function (v) {
          // Skip validation if user has googleId (Google login)
          if (this.googleId) return true;
          // Skip validation if password is not provided
          if (!v) return true;
          // Otherwise validate length
          return v.length >= 6;
        },
        message: "Password must be at least 6 characters",
      },
    },

    // Authentication & External IDs
    googleId: {
      type: String,
      sparse: true, // Allows multiple null values but unique non-null values
      index: true,
    },
    apiKey: {
      type: String,
      required: false,
      select: false,
    },

    // Profile Photos
    photo: {
      type: String,
      validate: {
        validator: function (v) {
          if (!v) return true; // nullable field
          try {
            new URL(v);
            return true;
          } catch {
            return false;
          }
        },
        message: "Invalid photo URL format",
      },
    },
    profilePhoto: String, // Legacy field compatibility
    trainerProfilePhoto: String, // Trainer-specific photo

    // User Roles & Permissions
    role: {
      type: String,
      enum: ["student", "admin", "trainer"],
      default: "student",
      index: true, // Frequently queried for role-based operations
    },
    creator: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Account Status & Verification
    active: {
      type: Boolean,
      default: true,
      index: true, // Frequently filtered field
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailConfirmed: {
      type: Boolean,
      default: false,
    },
    emailConfirmedAt: Date,
    accountStatus: {
      type: String,
      enum: ["active", "suspended", "banned", "pending"],
      default: "pending",
    },
    agreedTerms: {
      type: Boolean,
      default: false,
    },

    // OTP & Verification
    otp: {
      type: String,
      select: false, // Don't include OTP in queries by default
    },
    otpExpiry: {
      type: Date,
      select: false,
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },

    // Password Reset & Email Reset
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpiry: {
      type: Date,
      select: false,
    },
    passwordUpdatedAt: Date,
    emailResetToken: {
      type: String,
      select: false,
    },

    // Email Verification
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpiry: {
      type: Date,
      select: false,
    },

    // Login Tracking
    lastLogin: Date,
    loginCount: {
      type: Number,
      default: 0,
    },

    // Professional Information
    designation: String,
    experience: Number,
    about: String,
    highestQualification: String,
    certification: {
      name: String,
      link: String,
    },

    // Contact Information
    location: String,
    phone: String,
    isEmailPublic: Boolean,

    // Social Media & External Links
    linkedInUrl: String,
    githubUrl: String,
    socialMedia: {
      linkedin: String,
      twitter: String,
      github: String,
      instagram: String,
    },

    // Profile Details
    profile: {
      bio: String,
      website: String,
      location: String,
      birthDate: Date,
      phoneNumber: String,
    },
    gender: String,

    // Skills & Languages
    skills: {
      type: Array,
      default: [],
    },
    languageIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "languages" }],
      required: false,
      default: [],
    },

    // Trainer-Specific Fields
    rating: Number,
    rate: Number,
    from: String,
    to: String,
    timeZone: String,
    availability: String,
    revealTrainerInfo: {
      type: String,
      enum: ["yes", "no"],
      default: "no",
    },

    // Contact Management
    contactsCount: {
      type: Number,
      default: 0,
    },
    contactedStudents: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
      default: [],
    },

    // Account Settings
    settings: {
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        marketing: { type: Boolean, default: false },
      },
      privacy: {
        profileVisible: { type: Boolean, default: true },
        emailVisible: { type: Boolean, default: false },
      },
      theme: {
        type: String,
        enum: ["light", "dark", "auto"],
        default: "light",
      },
    },

    // Metadata
    registrationMethod: {
      type: String,
      enum: ["email", "google", "linkedin"],
      default: "email",
    },
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
    collection: "users",
  },
);

// Compound Indexes for Performance
UserSchema.index({ email: 1, active: 1 });
UserSchema.index({ email: 1, role: 1 });
UserSchema.index({ creator: 1, active: 1 });
UserSchema.index({ googleId: 1, active: 1 });
UserSchema.index({ role: 1, active: 1 });

// Virtual for display name
UserSchema.virtual("displayName").get(function () {
  return this.name;
});

// Virtual for profile completion percentage
UserSchema.virtual("profileCompletion").get(function () {
  let completed = 0;
  const fields = [
    "name",
    "email",
    "photo",
    "about",
    "location",
    "designation",
    "skills",
    "highestQualification",
  ];

  fields.forEach((field) => {
    const value = field.includes(".")
      ? field.split(".").reduce((obj, key) => obj?.[key], this)
      : this[field];

    if (value) {
      if (Array.isArray(value) && value.length > 0) {
        completed++;
      } else if (typeof value === "string" && value.trim()) {
        completed++;
      } else if (typeof value !== "string" && value !== null) {
        completed++;
      }
    }
  });

  return Math.round((completed / fields.length) * 100);
});

// Virtual for trainer status
UserSchema.virtual("isTrainer").get(function () {
  return this.role === "trainer";
});

// Virtual for admin status
UserSchema.virtual("isAdmin").get(function () {
  return this.role === "admin";
});

// Instance Methods
UserSchema.methods.isPasswordValid = function (password) {
  // Implement with bcrypt comparison
  const bcrypt = require("bcryptjs");
  return bcrypt.compare(password, this.password);
};

UserSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  this.otpVerified = false;
  return otp;
};

UserSchema.methods.verifyOTP = function (inputOtp) {
  if (!this.otp || !this.otpExpiry) {
    return false;
  }

  if (new Date() > this.otpExpiry) {
    return false; // OTP expired
  }

  if (this.otp === inputOtp) {
    this.otpVerified = true;
    this.isEmailVerified = true;
    this.emailConfirmed = true;
    this.emailConfirmedAt = new Date();
    this.accountStatus = "active";
    this.otp = undefined;
    this.otpExpiry = undefined;
    return true;
  }

  return false;
};

UserSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  this.loginCount += 1;
  return this.save();
};

UserSchema.methods.makeCreator = function () {
  this.creator = true;
  return this.save();
};

UserSchema.methods.revokeCreator = function () {
  this.creator = false;
  return this.save();
};

UserSchema.methods.makeTrainer = function () {
  this.role = "trainer";
  return this.save();
};

UserSchema.methods.makeAdmin = function () {
  this.role = "admin";
  return this.save();
};

UserSchema.methods.generateEmailVerificationToken = function () {
  const crypto = require("crypto");
  const token = crypto.randomBytes(32).toString("hex");
  this.emailVerificationToken = token;
  this.emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return token;
};

UserSchema.methods.generatePasswordResetToken = function () {
  const crypto = require("crypto");
  const token = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = token;
  this.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  return token;
};

UserSchema.methods.suspend = function (reason = "") {
  this.accountStatus = "suspended";
  this.active = false;
  this.isActive = false;
  return this.save();
};

UserSchema.methods.activate = function () {
  this.accountStatus = "active";
  this.active = true;
  this.isActive = true;
  return this.save();
};

UserSchema.methods.addContactedStudent = function (studentId) {
  if (!this.contactedStudents.includes(studentId)) {
    this.contactedStudents.push(studentId);
    this.contactsCount = this.contactedStudents.length;
  }
  return this.save();
};

UserSchema.methods.removeContactedStudent = function (studentId) {
  this.contactedStudents = this.contactedStudents.filter(
    (id) => !id.equals(studentId),
  );
  this.contactsCount = this.contactedStudents.length;
  return this.save();
};

// Static Methods
UserSchema.statics.findByEmail = function (email) {
  return this.findOne({
    email: email.toLowerCase(),
    active: true,
    isActive: true,
  });
};

UserSchema.statics.findByGoogleId = function (googleId) {
  return this.findOne({
    googleId,
    active: true,
    isActive: true,
  });
};

UserSchema.statics.findCreators = function (options = {}) {
  const { page = 1, limit = 10, isActive = true } = options;

  return this.find({
    creator: true,
    active: isActive,
    isActive,
  })
    .select("name email photo profilePhoto createdAt")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

UserSchema.statics.findTrainers = function (options = {}) {
  const { page = 1, limit = 10, isActive = true } = options;

  return this.find({
    role: "trainer",
    active: isActive,
    isActive,
  })
    .select(
      "name email photo profilePhoto trainerProfilePhoto rating rate skills experience location",
    )
    .sort({ rating: -1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

UserSchema.statics.searchUsers = function (searchTerm, options = {}) {
  const { page = 1, limit = 10, role = null, creatorsOnly = false } = options;

  const query: any = {
    active: true,
    isActive: true,
    $or: [
      { name: { $regex: searchTerm, $options: "i" } },
      { email: { $regex: searchTerm, $options: "i" } },
      { designation: { $regex: searchTerm, $options: "i" } },
      { skills: { $in: [new RegExp(searchTerm, "i")] } },
    ],
  };

  if (role) {
    query.role = role;
  }

  if (creatorsOnly) {
    query.creator = true;
  }

  return this.find(query)
    .select(
      "name email photo profilePhoto creator role designation skills experience",
    )
    .sort({ name: 1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

UserSchema.statics.getUserStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: { $cond: ["$active", 1, 0] },
        },
        creators: {
          $sum: { $cond: ["$creator", 1, 0] },
        },
        trainers: {
          $sum: { $cond: [{ $eq: ["$role", "trainer"] }, 1, 0] },
        },
        students: {
          $sum: { $cond: [{ $eq: ["$role", "student"] }, 1, 0] },
        },
        admins: {
          $sum: { $cond: [{ $eq: ["$role", "admin"] }, 1, 0] },
        },
        verifiedUsers: {
          $sum: { $cond: ["$isEmailVerified", 1, 0] },
        },
        googleUsers: {
          $sum: { $cond: [{ $ne: ["$googleId", null] }, 1, 0] },
        },
      },
    },
  ]);

  return (
    stats[0] || {
      totalUsers: 0,
      activeUsers: 0,
      creators: 0,
      trainers: 0,
      students: 0,
      admins: 0,
      verifiedUsers: 0,
      googleUsers: 0,
    }
  );
};

UserSchema.statics.getTrainersBySkills = function (skills, options = {}) {
  const { page = 1, limit = 10, minRating = 0 } = options;

  return this.find({
    role: "trainer",
    active: true,
    isActive: true,
    skills: { $in: skills },
    rating: { $gte: minRating },
  })
    .select(
      "name email photo trainerProfilePhoto rating rate skills experience location availability",
    )
    .sort({ rating: -1, experience: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// Pre-save Middleware
UserSchema.pre("save", function (next) {
  // Ensure email is lowercase
  if (this.isModified("email")) {
    this.email = this.email.toLowerCase();
  }

  // Set registration method
  if (this.isNew) {
    if (this.googleId) {
      this.registrationMethod = "google";
    } else {
      this.registrationMethod = "email";
    }
  }

  // Sync active fields
  if (this.isModified("active")) {
    this.isActive = this.active;
  }
  if (this.isModified("isActive")) {
    this.active = this.isActive;
  }

  // Sync email verification fields
  if (this.isModified("isEmailVerified") && this.isEmailVerified) {
    this.emailConfirmed = true;
    if (!this.emailConfirmedAt) {
      this.emailConfirmedAt = new Date();
    }
  }

  next();
});

// Ensure virtual fields are included in JSON output
UserSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    // Remove sensitive fields from JSON output
    delete ret.password;
    delete ret.otp;
    delete ret.otpExpiry;
    delete ret.emailVerificationToken;
    delete ret.passwordResetToken;
    delete ret.emailResetToken;
    delete ret.apiKey;
    return ret;
  },
});

UserSchema.set("toObject", { virtuals: true });

export default mongoose.models.users || mongoose.model("users", UserSchema);
