import mongoose from "mongoose";
const Schema = mongoose.Schema;

const linkedinTokenSchema = new Schema(
  {
    organizationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "linkedinTokens",
  },
);

// Index for efficient queries by organization and expiry
linkedinTokenSchema.index({ organizationId: 1, expiresAt: 1 });

// Virtual to check if token is expired
linkedinTokenSchema.virtual("isExpired").get(function () {
  return Date.now() > this.expiresAt.getTime();
});

// Method to check if token needs refresh (expires in next 5 minutes)
linkedinTokenSchema.methods.needsRefresh = function () {
  const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;
  return this.expiresAt <= fiveMinutesFromNow;
};

// Static method to find valid token for organization
linkedinTokenSchema.statics.findValidToken = function (organizationId) {
  return this.findOne({
    organizationId,
    isActive: true,
    expiresAt: { $gt: new Date() },
  });
};

// Pre-save middleware to ensure expiresAt is a Date object
linkedinTokenSchema.pre("save", function (next) {
  if (this.expiresAt && typeof this.expiresAt === "number") {
    this.expiresAt = new Date(this.expiresAt);
  }
  next();
});

const LinkedInToken = mongoose.model("linkedinTokens", linkedinTokenSchema);
export default LinkedInToken;
