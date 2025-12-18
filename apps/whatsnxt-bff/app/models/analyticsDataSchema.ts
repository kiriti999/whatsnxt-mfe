import mongoose from "mongoose";
const Schema = mongoose.Schema;

// MetadataValues subdocument schema
const metadataValuesSchema = new Schema(
  {
    value: {
      type: String,
      required: true,
    },
    oneValue: {
      type: String,
      required: true,
    },
  },
  { _id: false },
); // _id: false prevents MongoDB from creating an _id for subdocuments

// Metadata subdocument schema
const metadataSchema = new Schema(
  {
    dimensionValues: [metadataValuesSchema],
    metricValues: [metadataValuesSchema],
  },
  { _id: false },
);

// Main AnalyticsData schema
const analyticsDataSchema = new Schema(
  {
    rowCount: {
      type: Number,
      required: true,
    },
    rows: [metadataSchema],
  },
  { timestamps: true, collection: "blogAnalyticsData" },
);

const AnalyticsData = mongoose.model("blogAnalyticsData", analyticsDataSchema);
export default AnalyticsData;
