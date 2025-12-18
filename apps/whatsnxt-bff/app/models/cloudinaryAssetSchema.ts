import mongoose from "mongoose";
const Schema = mongoose.Schema;

// CloudinaryAsset subdocument schema
const cloudinaryAssetSchema = new Schema(
  {
    public_id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["image", "video", "raw", "auto"], // Common Cloudinary asset types
    },
  },
  { _id: false },
);

// Main CloudinaryAsset schema (if you want to store as separate documents)
const cloudinaryAssetDocumentSchema = new Schema(
  {
    public_id: {
      type: String,
      required: true,
      unique: true, // Ensure no duplicate assets
    },
    type: {
      type: String,
      required: true,
      enum: ["image", "video", "raw", "auto"],
    },
    url: String, // Optional: store the full Cloudinary URL
    secure_url: String, // Optional: store the secure URL
    format: String, // Optional: file format (jpg, png, mp4, etc.)
    width: Number, // Optional: asset dimensions
    height: Number,
    bytes: Number, // Optional: file size
    uploadedBy: {
      type: String, // User email or ID
      required: false,
    },
  },
  { timestamps: true, collection: "blogCloudinaryAssets" },
);

// CloudinaryAssets collection schema (for batch operations)
const cloudinaryAssetsCollectionSchema = new Schema(
  {
    assets: [cloudinaryAssetSchema],
    batchId: {
      type: String,
      unique: true,
    },
    operation: {
      type: String,
      enum: ["upload", "delete", "transform"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    processedBy: String,
    errorMessage: String,
  },
  { timestamps: true, collection: "blogCloudinaryAssetsBatch" },
);

// Create models
const CloudinaryAsset = mongoose.model(
  "blogCloudinaryAsset",
  cloudinaryAssetDocumentSchema,
);
const CloudinaryAssetsBatch = mongoose.model(
  "blogCloudinaryAssetsBatch",
  cloudinaryAssetsCollectionSchema,
);

// Export both the models and the subdocument schema for embedding
export {
  CloudinaryAsset,
  CloudinaryAssetsBatch,
  cloudinaryAssetSchema, // For embedding in other schemas
};
