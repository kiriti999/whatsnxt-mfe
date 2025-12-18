import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Import the cloudinary asset schema from your cloudinary models
// import { cloudinaryAssetSchema } from './cloudinary.model';

// CloudinaryAsset subdocument schema (inline definition if not importing)
const cloudinaryAssetSchema = new Schema(
  {
    public_id: {
      type: String,
      required: true,
    },
    resource_type: {
      type: String,
      required: true,
      enum: ["image", "video", "raw", "auto"],
    },
    url: String,
    secure_url: String,
    width: Number,
    height: Number,
    format: String,
  },
  { _id: false },
);

// Tutorial subdocument schema (for nested tutorials within a tutorial collection)
const tutorialSubdocumentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    cloudinaryAssets: [cloudinaryAssetSchema],
  },
  { _id: false },
);

// Main Tutorial schema
const tutorialSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    categoryName: {
      type: String,
      required: true,
      index: true,
    },
    categoryId: {
      type: String,
      required: true,
      index: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    subCategory: {
      type: String,
      trim: true,
    },
    nestedSubCategory: {
      type: String,
      trim: true,
    },
    tutorials: [tutorialSubdocumentSchema],
    published: {
      type: Boolean,
      default: false,
      index: true,
    },
    cloudinaryAssets: [cloudinaryAssetSchema],

    // Additional useful fields
    slug: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    author: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      index: true,
    },
    publishedAt: {
      type: Date,
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    estimatedDuration: {
      type: Number, // in minutes
      min: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "blogTutorials",
  },
);

// Compound indexes for better query performance
tutorialSchema.index({ categoryName: 1, published: 1 });
tutorialSchema.index({ author: 1, published: 1 });
tutorialSchema.index({ published: 1, createdAt: -1 });
tutorialSchema.index({ categoryName: 1, subCategory: 1 });

// Pre-save middleware to generate slug
tutorialSchema.pre("save", function (next) {
  if (this.isModified("title") && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  // Set publishedAt when first published
  if (this.isModified("published") && this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

// Instance methods
tutorialSchema.methods.publish = function () {
  this.published = true;
  this.publishedAt = new Date();
  return this.save();
};

tutorialSchema.methods.unpublish = function () {
  this.published = false;
  return this.save();
};

tutorialSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

tutorialSchema.methods.addLike = function () {
  this.likes += 1;
  return this.save();
};

tutorialSchema.methods.removeLike = function () {
  if (this.likes > 0) {
    this.likes -= 1;
  }
  return this.save();
};

// Static methods
tutorialSchema.statics.findPublished = function (options = {}) {
  const { page = 1, limit = 10, categoryName, author } = options;
  const query: any = { published: true, isActive: true };

  if (categoryName) {
    query.categoryName = categoryName;
  }

  if (author) {
    query.author = author;
  }

  return this.find(query)
    .sort({ publishedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("author", "name email");
};

tutorialSchema.statics.findByCategory = function (
  categoryName,
  subCategory = null,
) {
  const query: any = {
    categoryName,
    published: true,
    isActive: true,
  };

  if (subCategory) {
    query.subCategory = subCategory;
  }

  return this.find(query)
    .sort({ publishedAt: -1 })
    .populate("author", "name email");
};

tutorialSchema.statics.search = function (searchTerm, options = {}) {
  const { page = 1, limit = 10 } = options;

  const query = {
    published: true,
    isActive: true,
    $or: [
      { title: { $regex: searchTerm, $options: "i" } },
      { description: { $regex: searchTerm, $options: "i" } },
      { tags: { $in: [new RegExp(searchTerm, "i")] } },
    ],
  };

  return this.find(query)
    .sort({ publishedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("author", "name email");
};

// Virtual for tutorial count in nested tutorials
tutorialSchema.virtual("tutorialCount").get(function () {
  return this.tutorials ? this.tutorials.length : 0;
});

// Virtual for reading time estimation (based on description length)
tutorialSchema.virtual("estimatedReadingTime").get(function () {
  const doc = this as any;
  if (!doc.description) return 0;
  const wordsPerMinute = 200;
  const wordCount = doc.description.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
});

// Ensure virtual fields are included in JSON output
tutorialSchema.set("toJSON", { virtuals: true });
tutorialSchema.set("toObject", { virtuals: true });

// Create models
const Tutorial = mongoose.model("blogTutorials", tutorialSchema);

export {
  Tutorial,
  tutorialSchema, // Export schema for potential embedding
  tutorialSubdocumentSchema, // Export subdocument schema
};
