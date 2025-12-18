import mongoose from "mongoose";
import { formatDate } from "../utils/dbHelper";
const Schema = mongoose.Schema;

// TutorialArticle subdocument schema
const tutorialArticleSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { _id: false },
); // _id: false prevents MongoDB from creating an _id for subdocuments

// CloudinaryAsset subdocument schema
const cloudinaryAssetSchema = new Schema(
  {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    secure_url: {
      type: String,
      required: true,
    },
    resource_type: {
      type: String,
      required: true,
    },
    format: {
      type: String,
    },
    width: {
      type: Number,
    },
    height: {
      type: Number,
    },
  },
  { _id: false },
);

// Main Post schema
const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
    },
    contentFormat: {
      type: String,
      enum: ["HTML", "MARKDOWN"],
      default: "HTML",
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    categoryId: {
      type: String,
      trim: true,
    },
    categoryName: {
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
    published: {
      type: Boolean,
      default: false,
    },
    listed: {
      type: Boolean,
      default: true,
    },
    tutorial: {
      type: Boolean,
      default: false,
    },
    tutorials: [tutorialArticleSchema],
    cloudinaryAssets: [cloudinaryAssetSchema],
    timeToRead: {
      type: String,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
  },
  {
    timestamps: true,
    collection: "blogPosts",
    // Add the date formatting transform
    toJSON: {
      transform: function (doc, ret) {
        // Format createdAt and updatedAt
        if (ret.createdAt) {
          ret.createdAt = formatDate(ret.createdAt);
        }
        if (ret.updatedAt) {
          ret.updatedAt = formatDate(ret.updatedAt);
        }

        // Format any other date fields you might have
        const dateFields = ["publishedAt", "deletedAt", "completedAt"];
        dateFields.forEach((field) => {
          if (ret[field]) {
            ret[field] = formatDate(ret[field]);
          }
        });

        console.log(" ret:", ret);
        console.log(" ret:", ret);
        console.log(" ret:", ret);
        console.log(" ret:", ret);
        console.log(" ret:", ret);
        return ret;
      },
    },
  },
);

// Indexes for better query performance
postSchema.index({ slug: 1 }, { unique: true });
postSchema.index({ userId: 1 });
postSchema.index({ categoryId: 1 });
postSchema.index({ published: 1, listed: 1 });
postSchema.index({ updatedAt: -1 });

// Static methods
postSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug });
};

postSchema.statics.findPublished = function () {
  return this.find({ published: true, listed: true });
};

postSchema.statics.findByCategory = function (categoryId) {
  return this.find({ categoryId, published: true, listed: true });
};

postSchema.statics.paginate = async function (
  query = {},
  page = 1,
  limit = 10,
  sort = { createdAt: -1 },
) {
  const skip = (page - 1) * limit;

  const [posts, totalRecords] = await Promise.all([
    this.find(query).sort(sort).skip(skip).limit(limit).exec(),
    this.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalRecords / limit);

  return {
    posts,
    totalRecords,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

postSchema.set("toJSON", { virtuals: true });
const Post = mongoose.model("blogPosts", postSchema);

export default Post;
