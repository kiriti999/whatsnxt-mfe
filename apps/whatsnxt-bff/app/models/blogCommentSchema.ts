import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Main Comment schema
const blogCommentSchema = new Schema(
  {
    contentId: {
      type: mongoose.Types.ObjectId,
      required: true,
      index: true, // Index for faster queries by content
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      index: true, // Index for user-specific queries
    },
    parentId: {
      type: mongoose.Types.ObjectId,
      default: null,
      index: true, // Index for hierarchical queries
    },
    flags: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Types.ObjectId,
        ref: "users", // Optional: reference to User model
      },
    ],
    disLikedBy: [
      {
        type: mongoose.Types.ObjectId,
        ref: "users",
      },
    ],
    flaggedBy: [
      {
        type: mongoose.Types.ObjectId,
        ref: "users",
      },
    ],
    isHidden: {
      type: Boolean,
      default: false,
    },
    childCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // This creates createdAt and updatedAt automatically
    collection: "blogComments",
  },
);

// Compound indexes for better query performance
blogCommentSchema.index({ contentId: 1, parentId: 1 });
blogCommentSchema.index({ contentId: 1, createdAt: -1 });
blogCommentSchema.index({ email: 1, createdAt: -1 });

// Virtual for nested replies (populated dynamically)
blogCommentSchema.virtual("replies", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentId",
  options: { sort: { createdAt: 1 } }, // Sort replies by creation date
});

// Ensure virtual fields are included in JSON output
blogCommentSchema.set("toJSON", { virtuals: true });
blogCommentSchema.set("toObject", { virtuals: true });

// Instance methods
blogCommentSchema.methods.like = function (userId) {
  if (!this.likedBy.includes(userId)) {
    // Remove from disliked if present
    this.disLikedBy = this.disLikedBy.filter((id) => !id.equals(userId));
    this.likedBy.push(userId);
    this.likes = this.likedBy.length;
    this.dislikes = this.disLikedBy.length;
  }
  return this.save();
};

blogCommentSchema.methods.unlike = function (userId) {
  this.likedBy = this.likedBy.filter((id) => !id.equals(userId));
  this.likes = this.likedBy.length;
  return this.save();
};

blogCommentSchema.methods.dislike = function (userId) {
  if (!this.disLikedBy.includes(userId)) {
    // Remove from liked if present
    this.likedBy = this.likedBy.filter((id) => !id.equals(userId));
    this.disLikedBy.push(userId);
    this.likes = this.likedBy.length;
    this.dislikes = this.disLikedBy.length;
  }
  return this.save();
};

blogCommentSchema.methods.undislike = function (userId) {
  this.disLikedBy = this.disLikedBy.filter((id) => !id.equals(userId));
  this.dislikes = this.disLikedBy.length;
  return this.save();
};

blogCommentSchema.methods.flag = function (userId) {
  if (!this.flaggedBy.includes(userId)) {
    this.flaggedBy.push(userId);
    this.flags = this.flaggedBy.length;
  }
  return this.save();
};

blogCommentSchema.methods.hide = function () {
  this.isHidden = true;
  return this.save();
};

blogCommentSchema.methods.show = function () {
  this.isHidden = false;
  return this.save();
};

// Static methods
blogCommentSchema.statics.findByContent = function (contentId, options = {}) {
  const { page = 1, limit = 10, includeHidden = false } = options;
  const query: any = { contentId, parentId: null };

  if (!includeHidden) {
    query.isHidden = { $ne: true };
  }

  return this.find(query)
    .populate("replies")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

blogCommentSchema.statics.findReplies = function (parentId, options = {}) {
  const { limit = 5, includeHidden = false } = options;
  const query: any = { parentId };

  if (!includeHidden) {
    query.isHidden = { $ne: true };
  }

  return this.find(query).sort({ createdAt: 1 }).limit(limit);
};

blogCommentSchema.statics.getCommentTree = async function (
  contentId,
  options = {},
) {
  const { maxDepth = 3, includeHidden = false } = options;

  // Get root comments
  const rootComments = await (this as any).findByContent(contentId, {
    includeHidden,
  });

  // Recursively populate replies up to maxDepth
  const populateReplies = async (comments, depth = 0) => {
    if (depth >= maxDepth) return comments;

    for (let comment of comments) {
      const replies = await (this as any).findReplies(comment._id, {
        includeHidden,
      });
      comment.replies = await populateReplies(replies, depth + 1);
    }
    return comments;
  };

  return await populateReplies(rootComments);
};

// Pre-save middleware to update childCount
blogCommentSchema.pre("save", async function (next) {
  if (this.isNew && this.parentId) {
    // Increment parent's childCount
    await (this.constructor as any).findByIdAndUpdate(this.parentId, {
      $inc: { childCount: 1 },
    });
  }
  next();
});

// Pre-remove middleware to update childCount
// @ts-ignore - Using deprecated 'remove' hook for backwards compatibility
blogCommentSchema.pre("remove", async function (next) {
  if (this.parentId) {
    // Decrement parent's childCount
    await (this.constructor as any).findByIdAndUpdate(this.parentId, {
      $inc: { childCount: -1 },
    });
  }

  // Remove all child comments
  await (this.constructor as any).deleteMany({ parentId: this._id });
  next();
});

const Comment = mongoose.model("blogComments", blogCommentSchema);

export {
  Comment,
  blogCommentSchema, // Export schema for potential embedding
};
