import mongoose from "mongoose";
const Schema = mongoose.Schema;

// UserRes subdocument schema (based on your auth.dto)
const userResSchema = new Schema(
  {
    userId: String,
    id: String,
    type: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

// AuthUser schema
const authUserSchema = new Schema(
  {
    user: {
      type: userResSchema,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, collection: "blogAuthUsers" },
);

// GoogleAuthUser schema (same structure as AuthUser)
const googleAuthUserSchema = new Schema(
  {
    user: {
      type: userResSchema,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, collection: "blogGoogleAuthUsers" },
);

// MessageResponse schema
const messageResponseSchema = new Schema(
  {
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, collection: "blogMessageResponses" },
);

// Create models
const AuthUser = mongoose.model("blogAuthUser", authUserSchema);
const GoogleAuthUser = mongoose.model(
  "blogGoogleAuthUser",
  googleAuthUserSchema,
);
const MessageResponse = mongoose.model(
  "blogMessageResponse",
  messageResponseSchema,
);

export { AuthUser, GoogleAuthUser, MessageResponse };
