import mongoose from "mongoose";
const Schema = mongoose.Schema;

// LinkedIn Post schema
const linkedInPostSchema = new Schema(
  {
    postId: {
      type: String,
      required: true,
      unique: true, // LinkedIn post IDs should be unique
      index: true,
      validate: {
        validator: function (v) {
          // Validate LinkedIn URN format
          return /^urn:li:(ugcPost|share|post):\d+$/.test(v);
        },
        message:
          'Invalid LinkedIn post ID format. Expected URN format like "urn:li:ugcPost:123456789012345678"',
      },
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000, // LinkedIn post character limit
    },
    organizationId: {
      type: String,
      required: true,
      index: true,
      validate: {
        validator: function (v) {
          // Validate LinkedIn organization URN format
          return /^urn:li:organization:\d+$/.test(v);
        },
        message:
          'Invalid LinkedIn organization ID format. Expected URN format like "urn:li:organization:105606569"',
      },
    },
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "users", // Reference to your User model
      index: true,
    },
    status: {
      type: String,
      enum: ["PUBLISHED", "DRAFT", "DELETED", "FAILED", "PENDING"],
      default: "DRAFT",
      index: true,
    },
    mediaCategory: {
      type: String,
      enum: ["NONE", "IMAGE", "VIDEO", "DOCUMENT", "ARTICLE"],
      default: "NONE",
    },
    media: [
      {
        type: String,
        validate: {
          validator: function (v) {
            // Basic URL validation
            try {
              new URL(v);
              return true;
            } catch {
              return false;
            }
          },
          message: "Invalid media URL format",
        },
      },
    ],
    isHidden: {
      type: Boolean,
      default: false,
      index: true,
    },
    // LinkedIn-specific metadata
    linkedInMetadata: {
      authorUrn: String, // LinkedIn author URN
      activityUrn: String, // LinkedIn activity URN
      shareUrn: String, // LinkedIn share URN if it's a share
      visibility: {
        type: String,
        enum: ["PUBLIC", "CONNECTIONS_ONLY", "LOGGED_IN_ONLY"],
        default: "PUBLIC",
      },
      lifecycleState: {
        type: String,
        enum: ["PUBLISHED", "DRAFT", "PUBLISHED_EDITED"],
      },
    },
    // Engagement metrics (optional - can be updated via LinkedIn API)
    engagement: {
      likes: { type: Number, default: 0 },
      blogComments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      reactions: { type: Number, default: 0 },
      lastUpdated: Date,
    },
    // Error tracking
    errors: [
      {
        message: String,
        code: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    // Sync status
    lastSyncedAt: Date,
    syncStatus: {
      type: String,
      enum: ["SYNCED", "PENDING", "FAILED", "NOT_SYNCED"],
      default: "NOT_SYNCED",
    },
  },
  {
    timestamps: true, // Creates createdAt and updatedAt automatically
    collection: "linkedInPosts",
  },
);

// Compound indexes for better query performance
linkedInPostSchema.index({ userId: 1, status: 1 });
linkedInPostSchema.index({ organizationId: 1, createdAt: -1 });
linkedInPostSchema.index({ status: 1, createdAt: -1 });
linkedInPostSchema.index({ userId: 1, createdAt: -1 });

// Instance methods
linkedInPostSchema.methods.publish = async function () {
  this.status = "PUBLISHED";
  this.linkedInMetadata.lifecycleState = "PUBLISHED";
  return await this.save();
};

linkedInPostSchema.methods.unpublish = async function () {
  this.status = "DRAFT";
  return await this.save();
};

linkedInPostSchema.methods.hide = async function () {
  this.isHidden = true;
  return await this.save();
};

linkedInPostSchema.methods.show = async function () {
  this.isHidden = false;
  return await this.save();
};

linkedInPostSchema.methods.addError = function (message, code = null) {
  this.errors.push({
    message,
    code,
    timestamp: new Date(),
  });
  this.syncStatus = "FAILED";
  return this.save();
};

linkedInPostSchema.methods.markSynced = function () {
  this.lastSyncedAt = new Date();
  this.syncStatus = "SYNCED";
  return this.save();
};

linkedInPostSchema.methods.updateEngagement = function (metrics) {
  this.engagement = {
    ...this.engagement,
    ...metrics,
    lastUpdated: new Date(),
  };
  return this.save();
};

// Static methods
linkedInPostSchema.statics.findByUser = function (userId, options = {}) {
  const { status, includeHidden = false, page = 1, limit = 10 } = options;

  const query: any = { userId };

  if (status) {
    query.status = status;
  }

  if (!includeHidden) {
    query.isHidden = { $ne: true };
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("userId", "name email");
};

linkedInPostSchema.statics.findByOrganization = function (
  organizationId,
  options = {},
) {
  const { status, page = 1, limit = 10 } = options;

  const query: any = { organizationId };

  if (status) {
    query.status = status;
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("userId", "name email");
};

linkedInPostSchema.statics.findPendingSync = function () {
  return this.find({
    syncStatus: { $in: ["PENDING", "NOT_SYNCED"] },
    status: { $ne: "DELETED" },
  }).sort({ createdAt: 1 });
};

linkedInPostSchema.statics.getEngagementStats = async function (
  userId,
  dateRange = {},
) {
  const { startDate, endDate } = dateRange;
  const matchQuery: any = { userId };

  if (startDate || endDate) {
    matchQuery.createdAt = {};
    if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
    if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
  }

  const stats = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalPosts: { $sum: 1 },
        totalLikes: { $sum: "$engagement.likes" },
        totalComments: { $sum: "$engagement.blogComments" },
        totalShares: { $sum: "$engagement.shares" },
        totalReactions: { $sum: "$engagement.reactions" },
        avgLikes: { $avg: "$engagement.likes" },
        avgComments: { $avg: "$engagement.blogComments" },
        avgShares: { $avg: "$engagement.shares" },
      },
    },
  ]);

  return (
    stats[0] || {
      totalPosts: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      totalReactions: 0,
      avgLikes: 0,
      avgComments: 0,
      avgShares: 0,
    }
  );
};

// Pre-save middleware
linkedInPostSchema.pre("save", function (next) {
  // Validate media array based on mediaCategory
  if (this.mediaCategory === "NONE" && this.media && this.media.length > 0) {
    this.media = [];
  }

  // Limit errors array to last 10 entries
  if (this.errors && this.errors.length > 10) {
    this.errors = this.errors.slice(-10) as any;
  }

  next();
});

// Virtual for formatted post URL
linkedInPostSchema.virtual("linkedInUrl").get(function () {
  if (!this.postId) return null;

  // Extract the numeric ID from URN
  const matches = this.postId.match(/(\d+)$/);
  if (matches) {
    return `https://www.linkedin.com/feed/update/${this.postId}`;
  }
  return null;
});

// Ensure virtual fields are included in JSON output
linkedInPostSchema.set("toJSON", { virtuals: true });
linkedInPostSchema.set("toObject", { virtuals: true });

const LinkedInPost = mongoose.model("linkedinPosts", linkedInPostSchema);

export {
  LinkedInPost,
  linkedInPostSchema, // Export schema for potential embedding
};
