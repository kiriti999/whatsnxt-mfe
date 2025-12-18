import mongoose from "mongoose";
import Lab from "../models/Lab";
import LabPurchase from "../models/LabPurchase";
import { HttpException, HttpStatus } from "../utils/dbHelper";
import accessControlService from "./accessControlService";

class LabPricingService {
  /**
   * Set or update pricing for a lab
   */
  async setPricing(
    labId: string,
    purchaseType: "free" | "paid",
    price: number | undefined,
    instructorId: string
  ): Promise<any> {
    try {
      // Validate pricing data
      if (purchaseType === "paid" && (price === undefined || price < 10 || price > 100000)) {
        throw new HttpException(
          "Price must be between ₹10 and ₹100,000 for paid labs",
          HttpStatus.BAD_REQUEST
        );
      }

      if (purchaseType === "free" && price !== undefined) {
        throw new HttpException(
          "Price should not be provided for free labs",
          HttpStatus.BAD_REQUEST
        );
      }

      // Check if lab exists
      const lab = await Lab.findById(labId);
      if (!lab) {
        throw new HttpException("Lab not found", HttpStatus.NOT_FOUND);
      }

      // Validate pricing update (if lab already has pricing)
      if (lab.pricing?.purchaseType) {
        await this.validatePricingUpdate(lab, purchaseType, price);
      }

      // Update lab pricing
      const pricingData: any = {
        purchaseType,
        currency: "INR",
        updatedAt: new Date(),
        updatedBy: new mongoose.Types.ObjectId(instructorId),
      };

      if (purchaseType === "paid") {
        pricingData.price = price;
      } else {
        pricingData.price = undefined;
      }

      lab.pricing = pricingData;
      await lab.save();

      // Invalidate cache for this lab
      accessControlService.invalidateLabCache(labId);

      return lab;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to set pricing: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get pricing for a lab
   */
  async getPricing(labId: string): Promise<any> {
    try {
      const lab: any = await Lab.findById(labId).select("title pricing").lean();
      if (!lab) {
        throw new HttpException("Lab not found", HttpStatus.NOT_FOUND);
      }

      return {
        labId: (lab as any)._id,
        title: (lab as any).title,
        pricing: (lab as any).pricing || null,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to get pricing: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Validate pricing update
   */
  async validatePricingUpdate(
    lab: any,
    newPurchaseType: "free" | "paid",
    newPrice: number | undefined
  ): Promise<void> {
    const currentPurchaseType = lab.pricing?.purchaseType;

    // Paid to Free: Check for existing purchases
    if (currentPurchaseType === "paid" && newPurchaseType === "free") {
      const purchaseCount = await LabPurchase.countDocuments({
        labId: lab._id,
        status: "completed",
      });

      if (purchaseCount > 0) {
        throw new HttpException(
          "Cannot change paid lab to free - students have already purchased this lab",
          HttpStatus.BAD_REQUEST
        );
      }
    }

    // Free to Paid: Handle grandfathering
    if (currentPurchaseType === "free" && newPurchaseType === "paid") {
      await this.handleFreeToPaidConversion(lab._id.toString(), lab.pricing.updatedBy);
    }
  }

  /**
   * Handle free to paid conversion with grandfathering
   */
  async handleFreeToPaidConversion(labId: string, instructorId: string): Promise<void> {
    try {
      // Find students who have accessed this free lab via course enrollment
      const Course = mongoose.model("course");
      const coursesWithLab = await Course.find({
        labs: new mongoose.Types.ObjectId(labId),
      }).select("_id").lean();

      if (coursesWithLab.length === 0) {
        return; // No courses include this lab
      }

      const courseIds = coursesWithLab.map((c: any) => c._id);

      // Get all enrolled students
      const EnrolledCourse = mongoose.model("enrolledCourses");
      const enrollments = await EnrolledCourse.find({
        courseId: { $in: courseIds },
      }).select("userId").lean();

      const studentIds = [...new Set(enrollments.map((e: any) => e.userId.toString()))];

      // Create grandfathered purchase records
      const grandfatheredPurchases = studentIds.map((studentId) => ({
        studentId: new mongoose.Types.ObjectId(studentId),
        labId: new mongoose.Types.ObjectId(labId),
        purchaseDate: new Date(),
        transactionId: `GRANDFATHERED_${labId}_${studentId}_${Date.now()}`,
        amountPaid: 0,
        currency: "INR",
        status: "completed",
        metadata: {
          razorpayOrderId: "N/A",
          razorpayPaymentId: "N/A",
          razorpaySignature: "N/A",
          reason: "free_to_paid_conversion",
          convertedBy: new mongoose.Types.ObjectId(instructorId),
          convertedAt: new Date(),
        },
      }));

      // Insert grandfathered records (ignore duplicates)
      if (grandfatheredPurchases.length > 0) {
        await LabPurchase.insertMany(grandfatheredPurchases, {
          ordered: false,
        }).catch((error) => {
          // Ignore duplicate key errors (student already has purchase record)
          if (error.code !== 11000) {
            throw error;
          }
        });
      }

      console.log(
        `Grandfathered ${grandfatheredPurchases.length} students for lab ${labId}`
      );
    } catch (error: any) {
      console.error("Error handling free to paid conversion:", error);
      // Don't throw - allow pricing update to proceed
    }
  }
}

export default new LabPricingService();
