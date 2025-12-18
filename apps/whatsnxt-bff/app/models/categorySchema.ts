import mongoose from "mongoose";
const Schema = mongoose.Schema;

// SubSubCategory subdocument schema
const subSubCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

// SubCategory subdocument schema
const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    subcategories: [subSubCategorySchema],
  },
  { _id: false },
);

// Blog Category schema
const blogCategorySchema = new Schema(
  {
    categoryName: {
      type: String,
      required: true,
      unique: true,
    },
    subcategories: [subCategorySchema],
  },
  {
    timestamps: true,
    collection: "blogCategories",
  },
);

// Blog Category Count schema (for analytics/reporting)
const blogCategoryCountSchema = new Schema(
  {
    categoryName: {
      type: String,
      required: true,
    },
    categoryId: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "blogCategoryCount",
  },
);

// Static methods for BlogCategory
blogCategorySchema.statics.findByName = function (categoryName) {
  return this.findOne({ categoryName: categoryName });
};

blogCategorySchema.statics.getActiveCategories = function () {
  return this.find({}).sort({ categoryName: 1 });
};

blogCategorySchema.statics.getCategoriesWithCounts = async function () {
  const BlogCategoryCount = mongoose.model("blogCategoryCount");
  return await this.aggregate([
    {
      $lookup: {
        from: "blogCategoryCount",
        localField: "_id",
        foreignField: "categoryId",
        as: "countData",
      },
    },
    {
      $addFields: {
        count: { $ifNull: [{ $arrayElemAt: ["$countData.count", 0] }, 0] },
      },
    },
    {
      $project: {
        categoryName: 1,
        subcategories: 1,
        count: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
    { $sort: { categoryName: 1 } },
  ]);
};

// Instance methods for category counting
blogCategorySchema.methods.incrementCount = async function () {
  const BlogCategoryCount = mongoose.model("blogCategoryCount");
  return await BlogCategoryCount.findOneAndUpdate(
    { categoryId: this._id.toString() },
    {
      $inc: { count: 1 },
      categoryName: this.categoryName,
    },
    { upsert: true, new: true },
  );
};

blogCategorySchema.methods.decrementCount = async function () {
  const BlogCategoryCount = mongoose.model("blogCategoryCount");
  return await BlogCategoryCount.findOneAndUpdate(
    { categoryId: this._id.toString() },
    {
      $inc: { count: -1 },
      categoryName: this.categoryName,
    },
    { upsert: true, new: true },
  );
};

// Validation middleware
blogCategorySchema.pre("save", function (next) {
  if (this.categoryName) {
    this.categoryName = this.categoryName.trim();
  }
  next();
});

// Create models
const BlogCategory = mongoose.model("blogCategories", blogCategorySchema);
const BlogCategoryCount = mongoose.model(
  "blogCategoryCount",
  blogCategoryCountSchema,
);

export {
  BlogCategory,
  BlogCategoryCount,

  // Schema exports for reference
  blogCategorySchema,
  blogCategoryCountSchema,
  subCategorySchema,
  subSubCategorySchema,
};
