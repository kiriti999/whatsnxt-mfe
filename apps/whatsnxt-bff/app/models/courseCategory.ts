import mongoose from "mongoose";

// SubSubCategory subdocument schema
const subSubCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

// SubCategory subdocument schema
const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    subcategories: [subSubCategorySchema],
  },
  { _id: false },
);

// Course Category schema (maintains original structure)
const courseCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    subcategories: [subCategorySchema],
  },
  {
    timestamps: true,
    collection: "courseCategories",
  },
);

// Course Category Count schema (for analytics/reporting)
const courseCategoryCountSchema = new mongoose.Schema(
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
    collection: "courseCategoryCount",
  },
);

// Static methods
courseCategorySchema.statics.findByName = function (name) {
  return this.findOne({ name: name });
};

courseCategorySchema.statics.getActiveCategories = function () {
  return this.find({}).sort({ name: 1 });
};

courseCategorySchema.statics.getCategoriesWithCounts = async function () {
  return await this.aggregate([
    {
      $lookup: {
        from: "courseCategoryCount",
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
        name: 1,
        subcategories: 1,
        count: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
    { $sort: { name: 1 } },
  ]);
};

courseCategorySchema.statics.searchCategories = function (searchTerm) {
  return this.find({
    name: { $regex: searchTerm, $options: "i" },
  }).sort({ name: 1 });
};

// Instance methods
courseCategorySchema.methods.incrementCount = async function () {
  const CourseCategoryCount = mongoose.model("courseCategoryCount");
  return await CourseCategoryCount.findOneAndUpdate(
    { categoryId: this._id.toString() },
    {
      $inc: { count: 1 },
      categoryName: this.name,
    },
    { upsert: true, new: true },
  );
};

courseCategorySchema.methods.decrementCount = async function () {
  const CourseCategoryCount = mongoose.model("courseCategoryCount");
  return await CourseCategoryCount.findOneAndUpdate(
    { categoryId: this._id.toString() },
    {
      $inc: { count: -1 },
      categoryName: this.name,
    },
    { upsert: true, new: true },
  );
};

courseCategorySchema.methods.getSubcategoryNames = function () {
  return this.subcategories.map((sub) => sub.name);
};

// Validation middleware
courseCategorySchema.pre("save", function (next) {
  if (this.name) {
    this.name = this.name.trim();
  }
  next();
});

// Index for performance
courseCategorySchema.index({ name: 1 });
courseCategorySchema.index({ "subcategories.name": 1 });

// Create models
const CourseCategory = mongoose.model("courseCategories", courseCategorySchema);
const CourseCategoryCount = mongoose.model(
  "courseCategoryCount",
  courseCategoryCountSchema,
);

export {
  CourseCategory,
  CourseCategoryCount,

  // Schema exports for reference
  courseCategorySchema,
  courseCategoryCountSchema,
  subCategorySchema,
  subSubCategorySchema,
};
