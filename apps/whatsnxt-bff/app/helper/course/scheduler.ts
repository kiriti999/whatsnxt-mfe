import cron from "node-cron";
import mongoose from "mongoose";

const reviewCommentJob = cron.schedule("0 0 * * *", async () => {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const result = await mongoose
      .model("courseFeedbacks")
      .updateMany(
        { createdAt: { $lt: threeDaysAgo }, is_editable: true },
        { $set: { is_editable: false } },
      );

    console.log(`updated ${result.modifiedCount} documents`);
  } catch (error) {
    console.log("Error running cron job", error);
  }
});

export default reviewCommentJob;
