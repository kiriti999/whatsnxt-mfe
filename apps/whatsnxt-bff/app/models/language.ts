import mongoose from "mongoose";
const Schema = mongoose.Schema;

const languageSchema = new Schema(
  {
    abbr: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    courseId: {
      type: mongoose.Types.ObjectId,
      ref: "courses",
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true, collection: "languages" },
);

const language = mongoose.model("languages", languageSchema);

export default language;
