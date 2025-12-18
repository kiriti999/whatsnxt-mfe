// courseController.js

import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { applySlug } from "../../utils/course";
import calculateCourseDuration from "../../utils/course/courseUtils";
import { StatusCodes } from "http-status-codes";
import axios from "axios";

// Import models
import { deleteCourseFromCart } from "../../helper/course/course";
import courseSlugCacheUtils from "../../utils/course/courseSlugCacheUtils";
import courseCacheUtils from "../../utils/course/cacheUtils/courseCacheUtils";
import { cloudinaryService } from "../../services/cloudinaryService";

const courseController = {
  // Course Methods
  async getCourses(req, res) {
    const { tagName, limit = 8, offset = 0 } = req.query;

    try {
      // Base condition for course collection
      const courseCondition: any = {};

      // Add category filter if provided
      if (tagName) {
        courseCondition.categoryName = tagName;
      }

      // Fetch published courses
      const [courses, total] = await Promise.all([
        mongoose
          .model("coursesPublished")
          .find(courseCondition)
          .skip(parseInt(offset))
          .limit(parseInt(limit))
          .sort({ publishedAt: -1 })
          .populate("userId", "name email"),
        mongoose.model("coursesPublished").countDocuments({}),
      ]);

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);
      const currentPage = Math.ceil(offset / limit) + 1;

      const allCourses = await Promise.all(
        courses.map(async (course) => {
          // Get all sections for this course
          const sections = await mongoose
            .model("sections")
            .find({ courseId: course._id });

          // Calculate total duration for this course
          const totalDuration = sections.reduce((acc, section) => {
            // Sum up all video durations in each section
            const sectionDuration = section.videos
              ? section.videos.reduce(
                  (total, video) => total + (video.videoDuration || 0),
                  0,
                )
              : 0;

            return acc + sectionDuration;
          }, 0);

          // Get formatted duration text
          const { durationText } = calculateCourseDuration(totalDuration);

          // Return course with duration text
          return {
            ...course.toObject(),
            duration: durationText,
          };
        }),
      );

      return res.status(StatusCodes.OK).json({
        courses: allCourses,
        total,
        currentPage,
        totalPages,
      });
    } catch (error) {
      console.error("Error fetching courses:", error);

      // Only send error response if headers haven't been sent yet
      if (!res.headersSent) {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: error.message });
      }
    }
  },

  async createCourseName(req, res) {
    let {
      author,
      courseName,
      categoryName,
      subCategoryName,
      nestedSubCategoryName,
    } = req.body;
    const slug = applySlug(courseName);

    try {
      const result = await mongoose
        .model("courses")
        .findOne({ slug, categoryName })
        .exec();

      if (result?.slug === slug) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: `Course name with ${courseName} already exists`,
        });
      }

      const userId = req.userId;
      const languageIds = [];
      const language = await mongoose
        .model("languages")
        .findOne({ abbr: "en" });
      if (language?._id) {
        languageIds.push(language.id);
      }

      const response = await mongoose.model("courses").create({
        author,
        courseName,
        slug,
        userId,
        categoryName,
        subCategoryName,
        nestedSubCategoryName,
        languageIds,
      });

      const courseId = response._id;

      // For each new course, create a default section
      const section = {
        sectionTitle: "Introduction 1",
        sectionSlug: applySlug("Introduction 1"),
        order: 1,
        description: "Sample section",
        courseId,
      };

      const sectionResponse = await mongoose.model("sections").create(section);

      // For each new course, create default video title
      const videoData = {
        name: "Introduction 1",
        courseId,
        sectionId: sectionResponse._id,
        userId,
        order: 1,
      };

      await mongoose.model("sections").findByIdAndUpdate(
        { _id: sectionResponse._id, courseId },
        {
          $addToSet: {
            videos: videoData,
          },
        },
        { new: true },
      );

      return res.status(StatusCodes.OK).json(response);
    } catch (error) {
      console.log("post:: courses/course/create-course-name:: error:", error);

      // Only send error response if headers haven't been sent yet
      if (!res.headersSent) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: "Error creating course",
        });
      }
    }
  },

  async getCourseBySlug(req, res) {
    let { slug } = req.params;

    const parts = slug.split("-");
    const firstPart = parts.slice(0, -1).join("-");
    const lastPart = parts[parts.length - 1];

    if (lastPart === "invalidate") {
      await courseSlugCacheUtils.invalidateCourseSlugCache(firstPart);
      await courseSlugCacheUtils.invalidateCourseSlugCache(slug);
      slug = firstPart;
    }

    try {
      const courseModel = mongoose.model("courses");
      const publishedCourseModel = mongoose.model("coursesPublished");
      const unpublishedCourseModel = mongoose.model("coursesUnpublished");
      const sectionModel = mongoose.model("sections");
      const userModel = mongoose.model("users");
      const orderModel = mongoose.model("orders");

      let trainerInfo = null;
      let showAll = false;
      let isAdmin = false;
      let isTrainer = false;
      let userId = null;
      let isCourseOwner = false;

      // Check authentication and get user details
      const { authorization } = req.headers;
      if (authorization && authorization !== "undefined") {
        const decoded = jwt.verify(
          authorization,
          process.env.JWT_SECRET,
        ) as any;
        userId = decoded.userId;
        const user = await userModel.findById(userId).select("-password");

        if (!user) {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "User not found" });
        }

        isAdmin = user.role === "admin";
        isTrainer = user.role === "trainer";

        // Admin and trainer roles can access all videos
        if (isAdmin || isTrainer) {
          showAll = true;
        }
      }

      // First check main course collection to get basic info and status
      const mainCourse = await courseModel
        .findOne({ slug })
        .populate("languageIds");

      if (!mainCourse) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "getCourseBySlug:: Course not found" });
      }

      // Check if logged-in user is the course owner
      if (userId && mainCourse.userId.toString() === userId.toString()) {
        isCourseOwner = true;
        showAll = true;
      }

      // Different query strategies based on user authentication and role
      let courseToSend = mainCourse;
      let courseSource = "main";

      // For non-logged in users, only show published courses
      if (!userId) {
        const publishedCourse = await publishedCourseModel
          .findOne({
            courseId: mainCourse._id,
          })
          .populate("languageIds")
          .populate("userId");

        if (!publishedCourse) {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "Course not found" });
        }

        courseToSend = publishedCourse;
        courseSource = "published";
      }

      // For admins or course owners, show the most relevant data
      else if (isAdmin || isCourseOwner) {
        // If course is in draft/review/rejected/approved, use unpublished data
        // If course is in published, use published data
        if (
          ["pending_review", "rejected", "approved"].includes(mainCourse.status)
        ) {
          const unpublishedCourse = await unpublishedCourseModel
            .findOne({
              courseId: mainCourse._id,
            })
            .populate("languageIds");

          if (unpublishedCourse) {
            courseToSend = unpublishedCourse;
            courseSource = "unpublished";
          }
        }
        // If published, use published data
        else if (mainCourse.status === "published") {
          const publishedCourse = await publishedCourseModel
            .findOne({
              courseId: mainCourse._id,
            })
            .populate("languageIds")
            .populate("userId");

          if (publishedCourse) {
            courseToSend = publishedCourse;
            courseSource = "published";
          }
        }
      }

      // For other logged-in users (students, non-owner trainers), show published data if available
      else {
        const publishedCourse = await publishedCourseModel
          .findOne({
            courseId: mainCourse._id,
          })
          .populate("languageIds")
          .populate("userId");

        if (publishedCourse) {
          courseToSend = publishedCourse;
          courseSource = "published";
        } else {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "Course not found" });
        }
      }

      // For students, check if they've purchased the course
      if (userId && !showAll) {
        trainerInfo = await userModel
          .findOne({ _id: courseToSend.userId })
          .select("name about experience designation trainerProfilePhoto");

        // Check if the user has paid for the course
        const payments = await orderModel.find({ userId }).select("courseInfo");

        for (let i = 0; i < payments.length; i++) {
          const payment = payments[i];
          const courseInfo = payment.courseInfo[0];
          const courseIdToCheck =
            courseSource === "published"
              ? courseToSend.courseId.toString()
              : courseToSend._id.toString();

          if (courseInfo.courseId.toString() === courseIdToCheck) {
            showAll = true;
            break;
          }
        }
      }

      // Get the courseId based on the source
      const courseId =
        courseSource === "published" || courseSource === "unpublished"
          ? courseToSend.courseId
          : courseToSend._id;

      // Fetch associated sections
      const sections = await sectionModel.find({ courseId }).sort({ order: 1 });

      // Filter sections based on preview logic and published videos
      const filteredSections = sections
        .map((section) => {
          const filteredVideos = showAll
            ? section.videos // Include all videos for authorized users
            : section.videos.filter((video) => video.isPreview); // Show only preview videos otherwise

          // Send API streaming Urls
          if (section.videos) {
            section.videos.map((video) => {
              if (video.videoUrl && video.videoPublicId) {
                let videoUrl = video.videoUrl.split("/upload/")[1];
                video.videoUrl = `${process.env.BACKEND_BASE_URL}/course/courses/course/stream?path=${videoUrl}`;
              }
            });
          }
          return {
            ...section.toObject(),
            videos: filteredVideos,
          };
        })
        .filter((section) => {
          // Only include sections that have at least one published video (isPublish: true)
          return section.videos.some((video) => video.isPublish);
        });

      // Calculate total video duration and number of videos
      const { totalDuration, totalVideos } = filteredSections.reduce(
        (acc, section) => {
          const sectionDuration = section.videos.reduce(
            (total, video) => total + (video.videoDuration || 0),
            0,
          );
          return {
            totalDuration: acc.totalDuration + sectionDuration,
            totalVideos: acc.totalVideos + section.videos.length,
          };
        },
        { totalDuration: 0, totalVideos: 0 },
      );

      // Use calculateCourseDuration to calculate and format duration
      const { durationText } = calculateCourseDuration(totalDuration);

      // Prepare the course object
      const courseData =
        typeof courseToSend.toObject === "function"
          ? courseToSend.toObject()
          : courseToSend;

      // Add duration data to the course object
      courseData.duration = durationText;

      // Fetch latest reviews (limit 10)
      const feedbackComments = await mongoose
        .model("courseFeedbacks")
        .aggregate([
          {
            $match: {
              courseId: new mongoose.Types.ObjectId(courseId),
              flags: { $lt: 5 },
            },
          },
          { $sort: { createdAt: -1 } },
          { $limit: 10 },
          {
            $project: {
              _id: 1,
              content: 1,
              userId: 1,
              email: 1,
              courseId: 1,
              flags: 1,
              likes: 1,
              dislikes: 1,
              likedBy: 1,
              disLikedBy: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ]);

      const reviewCount = await mongoose
        .model("courseFeedbacks")
        .countDocuments({
          courseId: new mongoose.Types.ObjectId(courseId),
          flags: { $lt: 5 },
        });

      // Combine course data with filtered sections and reviews
      const courseWithSections = {
        ...courseData,
        sections: filteredSections,
        totalVideos: totalVideos,
        trainerInfo: trainerInfo,
        reviews: feedbackComments,
        reviewCount: reviewCount,
      };

      // Replace with video api proxy endpoints
      return res.status(StatusCodes.OK).json({ course: courseWithSections });
    } catch (error) {
      console.error("Error in getCourseBySlug:", error);

      // Only send error response if headers haven't been sent yet
      if (!res.headersSent) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: "Internal server error",
          error: error.message,
        });
      }
    }
  },

  // Fetch video streams / poster
  getVideoStream: async (req, res) => {
    if (!req.query || !req.query.path) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({
          message: "Invalid request, Missing 'path' in request parameter",
        });
    }

    let range = req.headers.range;
    if (!range && !req.query.poster) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "range headers not found" });
    }

    const videoPath = req.query.poster
      ? `so_8/${req.query.path.replace(/\.mp4$/, "")}.jpg`
      : req.query.path;
    const cdnBaseUrl = `https://res.cloudinary.com/cloudinary999/video/upload`;
    try {
      const fullUrl = `${cdnBaseUrl}/${videoPath}`;
      let options: any = {
        responseType: "stream",
      };

      if (!req.query.poster) {
        // Fallback to HEAD request if headers not sent
        const headResp = await axios.head(fullUrl);
        const videoSize = parseInt(headResp.headers["content-length"], 10);
        const contentType = headResp.headers["content-type"];

        // Create range chunks
        const start = Number(range.replace(/\D/g, ""));
        const chunkSize = 1 * 1024 * 1024; // 1MB chunks
        const end = Math.min(start + chunkSize - 1, videoSize - 1);

        // Set appropriate response headers
        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${videoSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": end - start + 1,
          "Content-Type": contentType,
        });

        options.headers = {
          Range: `bytes=${start}-${end}`,
        };
      }

      const response = await axios.get(fullUrl, options);
      response.data.pipe(res);
    } catch (error) {
      console.error("Something went wrong while streaming video", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: "Error streaming video",
          error: error.message || "Unexpected error",
        });
    }
  },

  // Get current course status for review
  getCourseStatus: async (req, res) => {
    const { tagName, limit = 8, offset = 0, status } = req.query;
    const isAdmin = req?.userRole === "admin";

    try {
      const condition: any = {};

      if (tagName) {
        condition.categoryName = tagName;
      }

      if (isAdmin && status === "pending_review") {
        condition.status = "pending_review";
      }

      // Fetch courses and total count concurrently
      const [courses, total] = await Promise.all([
        mongoose
          .model("courses")
          .find(condition)
          .skip(parseInt(offset))
          .limit(parseInt(limit))
          .sort({ createdAt: -1 }),
        mongoose.model("courses").countDocuments(condition),
      ]);

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);
      const currentPage = Math.ceil(offset / limit) + 1;

      return res.status(StatusCodes.OK).json({
        courses,
        total,
        currentPage,
        totalPages,
      });
    } catch (error) {
      console.error("Error fetching courses:", error);

      // Only send error response if headers haven't been sent yet
      if (!res.headersSent) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: error.message,
        });
      }
    }
  },

  async publishCourse(req, res) {
    const { courseId } = req.params;
    const { publish } = req.body;

    try {
      const userID = new mongoose.Types.ObjectId(req.userId);

      // Verify ownership of the course
      const course = await mongoose
        .model("courses")
        .findOne({ _id: courseId, userId: userID });
      if (!course) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Course not found or unauthorized" });
      }

      // Check if course is in the approved state
      if (publish === true && course.status !== "approved") {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Course must be approved before publishing",
        });
      }

      // Check if publishing
      if (publish === true) {
        // Check for existing published course first
        let publishedCourse = await mongoose
          .model("coursesPublished")
          .findOne({ courseId: courseId });

        // Find the unpublished course data (if it exists)
        const unpublishedCourse = await mongoose
          .model("coursesUnpublished")
          .findOne({
            courseId: courseId,
          });

        // If no unpublished version exists and no published version exists, return error
        if (!unpublishedCourse && !publishedCourse) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            message: "No course data found to publish",
          });
        }

        // If there's an unpublished version, use it for updates
        if (unpublishedCourse) {
          // Convert to plain object and prepare for publishing
          const unPublishData = unpublishedCourse.toObject();
          delete unPublishData._id;
          delete unPublishData.__v;
          delete unPublishData.createdAt;
          delete unPublishData.updatedAt;

          if (publishedCourse) {
            // Get published course as an object
            const publishedData = publishedCourse.toObject();

            // Create a new merged object with careful handling of fields
            const mergedPublishData = { ...publishedData };

            // Only copy non-empty and non-null values from unpublished to published
            for (const key in unPublishData) {
              // Skip system fields
              if (
                [
                  "_id",
                  "__v",
                  "createdAt",
                  "updatedAt",
                  "publishedAt",
                  "version",
                ].includes(key)
              ) {
                continue;
              }

              // Check if the field has a valid value (not null, not undefined, and not empty string)
              const unpublishedValue = unPublishData[key];
              const isValidValue =
                unpublishedValue !== null &&
                unpublishedValue !== undefined &&
                !(
                  typeof unpublishedValue === "string" &&
                  unpublishedValue.trim() === ""
                ) &&
                !(
                  Array.isArray(unpublishedValue) &&
                  unpublishedValue.length === 0
                );

              // Only update if the value is valid
              if (isValidValue) {
                mergedPublishData[key] = unpublishedValue;
              }
            }

            // Set course ID, version and publish date
            mergedPublishData.courseId = courseId;
            mergedPublishData.version = publishedData.version + 1;
            mergedPublishData.publishedAt = new Date();

            // Remove system-specific fields
            delete mergedPublishData._id;
            delete mergedPublishData.__v;
            delete mergedPublishData.createdAt;
            delete mergedPublishData.updatedAt;

            // Update existing published course with merged data
            publishedCourse = await mongoose
              .model("coursesPublished")
              .findOneAndUpdate(
                { courseId: courseId },
                { $set: mergedPublishData },
                { new: true },
              );
          } else {
            // Create new published course if it doesn't exist
            // For new courses, use all values from unpublished version
            unPublishData.version = 1;
            unPublishData.publishedAt = new Date();
            publishedCourse = await mongoose
              .model("coursesPublished")
              .create(unPublishData);
          }

          // After successfully publishing with unpublished data, delete the unpublished version
          await mongoose
            .model("coursesUnpublished")
            .deleteOne({ courseId: courseId });
        } else {
          // No unpublished version exists, but published course exists
          // This means we're "republishing" an existing course (maybe status change only)
          // Update the published date and increment version
          const publishedData = publishedCourse.toObject();
          publishedData.version = publishedData.version + 1;
          publishedData.publishedAt = new Date();

          // Remove system-specific fields
          delete publishedData._id;
          delete publishedData.__v;
          delete publishedData.createdAt;
          delete publishedData.updatedAt;

          publishedCourse = await mongoose
            .model("coursesPublished")
            .findOneAndUpdate(
              { courseId: courseId },
              { $set: publishedData },
              { new: true },
            );
        }

        // Update home page courses cache with the new published course
        await courseCacheUtils.updateHomeCoursesCache(publishedCourse);

        // Update main course to show it's published
        const updatedCourse = await mongoose.model("courses").findByIdAndUpdate(
          { _id: courseId },
          {
            $set: {
              published: true,
              status: "published",
              courseName: publishedCourse.courseName,
              slug: applySlug(publishedCourse.courseName),
            },
          },
          { new: true },
        );

        // Update related interview data if any
        await mongoose
          .model("interviews")
          .updateMany(
            { courseId: courseId, status: { $in: ["pending", "updated"] } },
            [
              {
                $set: {
                  status: "active",
                  question: { $ifNull: ["$questionUpdated", "$question"] },
                  answer: { $ifNull: ["$answerUpdated", "$answer"] },
                },
              },
            ],
          );

        console.log(" publishCourseData:", publishedCourse);
        return res.status(StatusCodes.OK).json({
          message: "Course published successfully",
          course: publishedCourse,
          status: updatedCourse.status,
        });
      } else {
        // Unpublishing logic remains the same
        const publishedCourse = await mongoose
          .model("coursesPublished")
          .findOne({ courseId: courseId });

        if (publishedCourse) {
          let unpublishedCourse = await mongoose
            .model("coursesUnpublished")
            .findOne({
              courseId: courseId,
            });

          if (!unpublishedCourse) {
            const publishedData = publishedCourse.toObject();
            delete publishedData._id;
            delete publishedData.__v;
            delete publishedData.publishedAt;
            delete publishedData.version;

            publishedData.courseId = courseId;

            unpublishedCourse = await mongoose
              .model("coursesUnpublished")
              .create(publishedData);
          }

          // Remove from published collection
          await mongoose
            .model("coursesPublished")
            .deleteOne({ courseId: courseId });

          // Update main course to show it's not published
          const updatedCourse = await mongoose
            .model("courses")
            .findByIdAndUpdate(
              { _id: courseId },
              {
                $set: {
                  published: false,
                  status: "approved",
                },
              },
              { new: true },
            );

          console.log(" unPublishCourseData:", unpublishedCourse);
          return res.status(StatusCodes.OK).json({
            message: "Course unpublished successfully",
            course: updatedCourse,
            status: updatedCourse.status,
          });
        } else {
          return res.status(StatusCodes.NOT_FOUND).json({
            message: "No published course found to unpublish",
          });
        }
      }
    } catch (error) {
      console.error("Error publishing course:", error);

      // Only send error response if headers haven't been sent yet
      if (!res.headersSent) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: "Error publishing course",
          error: error.message,
        });
      }
    }
  },

  async deleteCourse(req, res) {
    const { id } = req.params;

    try {
      // Check if any students are enrolled
      const enrolledCount = await mongoose
        .model("enrolledCourses")
        .countDocuments({ course: id });

      if (enrolledCount > 0) {
        return res.status(StatusCodes.CONFLICT).json({
          message: `Unable to delete as ${enrolledCount} ${enrolledCount > 1 ? "students" : "student"} enrolled in this course`,
        });
      }

      // Find the course to get its details before deletion
      const courseToDelete = await mongoose.model("courses").findById(id);
      if (!courseToDelete) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Course not found" });
      }

      // Collect all assets for cloudinary deletion
      const assetsToDelete = [];
      if (courseToDelete.courseImagePublicId) {
        assetsToDelete.push({
          type: "image",
          public_id: courseToDelete.courseImagePublicId,
        });
      }

      // Find and collect assets from sections and videos
      const sections = await mongoose.model("sections").find({ courseId: id });
      sections.forEach((section) => {
        section.videos?.forEach((video) => {
          if (video.videoPublicId) {
            assetsToDelete.push({
              type: "videos",
              public_id: video.videoPublicId,
            });
          }
          if (video.docPublicId) {
            assetsToDelete.push({ type: "raw", public_id: video.docPublicId });
          }
        });
      });

      // Delete assets from Cloudinary if any
      if (assetsToDelete.length > 0) {
        try {
          await cloudinaryService.deleteMultiAssets(assetsToDelete);
        } catch (cloudinaryError) {
          console.warn(
            "Cloudinary deletion failed, continuing with course deletion:",
            cloudinaryError,
          );
          // Continue with course deletion even if Cloudinary fails
        }
      }

      // Delete from all collections
      await Promise.all([
        mongoose.model("courses").findByIdAndDelete(id),
        mongoose.model("coursesUnpublished").deleteMany({ courseId: id }),
        mongoose.model("coursesPublished").deleteMany({ courseId: id }),
        mongoose.model("sections").deleteMany({ courseId: id }),
        mongoose.model("courseFeedbacks").deleteMany({ courseId: id }),
        mongoose.model("interviews").deleteMany({ courseId: id }),
        deleteCourseFromCart(id),
      ]);

      return res
        .status(StatusCodes.OK)
        .json({ message: `Successfully deleted the course with id: ${id}` });
    } catch (error) {
      console.error("Error deleting course:", error);

      // Only send error response if headers haven't been sent yet
      if (!res.headersSent) {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "Error deleting course" });
      }
    }
  },

  async publishVideo(req, res) {
    try {
      const { sectionId, videoId } = req.params;
      const { isPublish } = req.body;

      await mongoose
        .model("sections")
        .findOneAndUpdate(
          { _id: sectionId, "videos._id": videoId },
          {
            $set: { "videos.$.isPublish": isPublish },
          },
          { new: true },
        )
        .exec();

      return res
        .status(StatusCodes.OK)
        .send(`Video successfully ${isPublish ? "published" : "unpublished"}`);
    } catch (error) {
      console.error("Error publishing video:", error);

      // Only send error response if headers haven't been sent yet
      if (!res.headersSent) {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .send("An error occurred while publishing the video.");
      }
    }
  },

  async publishAllVideosInSection(req, res) {
    try {
      const { sectionId } = req.params;
      const { isPublish } = req.body;

      await mongoose
        .model("sections")
        .findOneAndUpdate(
          { _id: sectionId },
          {
            $set: { "videos.$[].isPublish": isPublish },
          },
          { new: true },
        )
        .exec();

      return res
        .status(StatusCodes.OK)
        .send(
          `All videos in the section successfully ${isPublish ? "published" : "unpublished"}`,
        );
    } catch (error) {
      console.error("Error publishing all videos in section:", error);

      // Only send error response if headers haven't been sent yet
      if (!res.headersSent) {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .send(
            "An error occurred while publishing all videos in the section.",
          );
      }
    }
  },
};

export default courseController;

// Course builder steps and its function names:
// | Stage                   | Function Name            | Allowed Course Status                     |
// |-------------------------|--------------------------|-------------------------------------------|
// | **Course Creation**     |                          |                                           |
// | Create Course Name      | `createCourseName`       | draft                                     |
// | **Course Type**         |                          |                                           |
// | Update Course Type      | `updateCourseType`       | draft/pending_review/approved/published   |
// | **Pricing**             |                          |                                           |
// | Update Pricing          | `updatePricing`          | draft/pending_review/approved/published   |
// | **Curriculum**          |                          |                                           |
// | Update Course Name      | `updateCourseName`       | draft/pending_review/approved/published   |
// | Update Section Title    | `updateSectionOrVideoTitle` | -                                     |
// | Update Lecture Title    | `updateSectionOrVideoTitle` | -                                     |
// | Upload Lecture Video    | `addVideoToLecture`      | -                                         |
// | Upload Lecture Document | `addDocToLecture`        | -                                         |
// | Update Course Details   | `updateCourseLandingPageDetails`    | draft/pending_review/approved/published   |
// | - Course Overview       | "                        | "                                         |
// | - Description           | "                        | "                                         |
// | - Image                 | "                        | "                                         |
// | - Language              | "                        | "                                         |
// | - Category              | "                        | "                                         |
// | Add Interview Question  | `createQuestionAnswer`   | -                                         |
// | **Final Step**          |                          |                                           |
// | Submit for Review       | -                        | → pending_review                          |
