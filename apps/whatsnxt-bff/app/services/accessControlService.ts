import mongoose from "mongoose";
import Lab from "../models/Lab";
import LabPurchase from "../models/LabPurchase";

class AccessControlService {
  private cache: Map<string, { value: boolean; expiresAt: number }>;
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.cache = new Map();
  }

  /**
   * Check if a student can access a lab
   * Returns: { hasAccess: boolean, reason?: string }
   */
  async canAccessLab(
    studentId: string,
    labId: string
  ): Promise<{ hasAccess: boolean; reason?: string }> {
    // Check cache first
    const cacheKey = `lab_access:${studentId}:${labId}`;
    const cached = this.getCached(cacheKey);
    if (cached !== null) {
      return { hasAccess: cached, reason: "cached" };
    }

    try {
      // 1. Load lab
      const lab: any = await Lab.findOne({ id: labId }).select("pricing").lean();
      if (!lab) {
        return { hasAccess: false, reason: "lab_not_found" };
      }

      // 2. Check if lab is free
      if ((lab as any).pricing?.purchaseType === "free") {
        this.setCache(cacheKey, true);
        return { hasAccess: true, reason: "free" };
      }

      // 3. Check for direct purchase
      const purchase = await LabPurchase.findOne({
        studentId: new mongoose.Types.ObjectId(studentId),
        labId: labId, // UUID string
        status: "completed",
      }).lean();

      if (purchase) {
        this.setCache(cacheKey, true);
        return { hasAccess: true, reason: "purchased" };
      }

      // 4. Check for course enrollment
      const hasEnrollmentAccess = await this.checkCourseEnrollment(
        studentId,
        labId
      );
      if (hasEnrollmentAccess) {
        this.setCache(cacheKey, true);
        return { hasAccess: true, reason: "course_enrollment" };
      }

      // 5. No access found
      this.setCache(cacheKey, false);
      return { hasAccess: false, reason: "no_access" };
    } catch (error: any) {
      console.error("Error checking lab access:", error);
      return { hasAccess: false, reason: "error" };
    }
  }

  /**
   * Check if student is enrolled in a course that includes this lab
   */
  private async checkCourseEnrollment(
    studentId: string,
    labId: string
  ): Promise<boolean> {
    try {
      // Find courses that include this lab
      const Course = mongoose.model("course");
      const coursesWithLab = await Course.find({
        labs: new mongoose.Types.ObjectId(labId),
      })
        .select("_id")
        .lean();

      if (coursesWithLab.length === 0) {
        return false;
      }

      const courseIds = coursesWithLab.map((c: any) => c._id);

      // Check if student is enrolled in any of those courses
      const EnrolledCourse = mongoose.model("enrolledCourses");
      const enrollment = await EnrolledCourse.findOne({
        userId: new mongoose.Types.ObjectId(studentId),
        courseId: { $in: courseIds },
        // Assuming active enrollment has no explicit status or status: 'active'
      }).lean();

      return !!enrollment;
    } catch (error) {
      console.error("Error checking course enrollment:", error);
      return false;
    }
  }

  /**
   * Invalidate cache for a student-lab combination
   */
  invalidateCache(studentId: string, labId: string): void {
    const cacheKey = `lab_access:${studentId}:${labId}`;
    this.cache.delete(cacheKey);
  }

  /**
   * Invalidate all cache entries for a lab
   */
  invalidateLabCache(labId: string): void {
    const prefix = `lab_access:`;
    const suffix = `:${labId}`;
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix) && key.endsWith(suffix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cached value
   */
  private getCached(key: string): boolean | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return cached.value;
  }

  /**
   * Set cache value
   */
  private setCache(key: string, value: boolean): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.CACHE_TTL_MS,
    });
  }
}

export default new AccessControlService();
