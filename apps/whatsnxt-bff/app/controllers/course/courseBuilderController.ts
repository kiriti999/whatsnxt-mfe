import mongoose from "mongoose";
import courseModel from "../../models/course";
import userModel from "../../common/models/user";
import sectionModel from "../../models/section";
const courseUnpublishedModel = require("../../models/courseUnpublished");
import { StatusCodes } from "http-status-codes";
import Notification from "../../models/notification";
import { NOTIFICATION_MAX_AGE } from "../../utils/constants";
import { applySlug } from "../../utils/course";
import courseStatusCacheUtils from "../../utils/course/courseStatusCacheUtils";
import courseSlugCacheUtils from "../../utils/course/courseSlugCacheUtils";
import { deleteCourseFromCart } from "../../helper/course/course";
import { cloudinaryService } from "../../services/cloudinaryService";

const courseBuilderController = {
  // Get course by ID
  getCourseById: async (req, res) => {
    try {
      const id = req.params.id;
      const userID = new mongoose.Types.ObjectId(req.userId);
      const user = await userModel
        .aggregate()
        .match({ _id: userID })
        .project({ password: 0 })
        .exec()
        .then((result) => result[0]);

      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).send("User not found");
      }

      // First find the main course record
      const mainCourse = await courseModel
        .findById(new mongoose.Types.ObjectId(id))
        .populate("languageIds")
        .exec();

      if (!mainCourse) {
        return res.status(StatusCodes.NOT_FOUND).send("Course not found");
      }

      // Determine if user is admin or course owner
      const isAdminOrOwner =
        user.role === "admin" ||
        mainCourse.userId.toString() === userID.toString();

      // Get base course data from the appropriate source
      let courseData;
      let hasUnpublishedChanges = false;

      // Find published and unpublished versions
      const publishedCourse = await mongoose
        .model("coursesPublished")
        .findOne({
          courseId: id,
        })
        .populate("languageIds");

      const unpublishedCourse = await mongoose
        .model("coursesUnpublished")
        .findOne({
          courseId: id,
        })
        .populate("languageIds");

      // Start with main course data as fallback
      courseData = mainCourse.toObject();

      // If published exists, use that as the base
      if (publishedCourse) {
        courseData = publishedCourse.toObject();
      }

      // For admin or owner, overlay unpublished changes if they exist
      if (isAdminOrOwner && unpublishedCourse) {
        // Get unpublished data as object
        const unpublishedData = unpublishedCourse.toObject();

        // Iterate through unpublished fields
        for (const key in unpublishedData) {
          // Skip system fields and metadata
          if (
            [
              "_id",
              "__v",
              "createdAt",
              "updatedAt",
              "courseId",
              "reviewerId",
              "reviewedAt",
            ].includes(key)
          ) {
            continue;
          }

          // Get the unpublished value
          const unpublishedValue = unpublishedData[key];

          // Check if the field has a valid value (not null, not undefined, and not empty string)
          const isValidValue =
            unpublishedValue !== null &&
            unpublishedValue !== undefined &&
            !(
              typeof unpublishedValue === "string" &&
              unpublishedValue.trim() === ""
            ) &&
            !(Array.isArray(unpublishedValue) && unpublishedValue.length === 0);

          // Check if value is different from published
          const publishedValue = courseData[key];
          const isDifferent =
            JSON.stringify(unpublishedValue) !== JSON.stringify(publishedValue);

          // Only update if it's a valid value and different from published
          if (isValidValue && isDifferent) {
            courseData[key] = unpublishedValue;
            hasUnpublishedChanges = true;
          }
        }
      }

      // Get sections
      const sections = await sectionModel.find({ courseId: id });

      const courseWithSections = {
        ...courseData,
        sections: sections,
        teacherName: user.name,
        hasUnpublishedChanges,
        originalStatus: mainCourse.status,
      };

      return res.status(StatusCodes.OK).send({ courseWithSections });
    } catch (error) {
      console.log("get:: courses/course/:id:: error: ", error);
      // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  },

  // Update course name - save to unpublished collection
  updateCourseName: async (req, res) => {
    const { courseId } = req.params;
    const { courseName } = req.body;

    try {
      const userID = new mongoose.Types.ObjectId(req.userId);

      // Verify ownership of the course
      const course = await courseModel.findOne({
        _id: courseId,
        userId: userID,
      });
      if (!course) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Course not found or unauthorized" });
      }

      // Check if the new course name already exists
      const slug = applySlug(courseName);

      const existingWithName = await courseModel.findOne({
        slug: slug,
        categoryName: course.categoryName,
        _id: { $ne: courseId }, // exclude current course
      });

      if (existingWithName) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: `Course name with ${courseName} already exists`,
        });
      }

      // Find or create unpublished version
      let unpublishedCourse = await courseUnpublishedModel.findOne({
        courseId: courseId,
      });

      if (unpublishedCourse) {
        // Update existing unpublished course
        unpublishedCourse.courseName = courseName;
        unpublishedCourse.slug = slug;
        await unpublishedCourse.save();
      } else {
        // Create new unpublished course based on original
        const courseData = course.toObject();
        delete courseData._id;
        delete (courseData as any).__v;

        unpublishedCourse = new courseUnpublishedModel({
          ...courseData,
          courseName: courseName,
          slug: slug,
          courseId: course._id,
          userId: userID,
        });

        await unpublishedCourse.save();
      }

      // If course is in draft status, update the name in the main course too
      // This provides better UX by showing the new name in the course list
      if (course.status === "draft") {
        await courseModel.findByIdAndUpdate(courseId, {
          courseName: courseName,
          slug: slug,
        });
      }

      return res.status(StatusCodes.OK).json({
        message:
          "Course name updated successfully. Changes will be applied after review and publishing.",
        unpublishedId: unpublishedCourse._id,
        courseName: courseName,
        slug: slug,
      });
    } catch (error) {
      console.error("Error updating course name:", error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Error updating course name" });
    }
  },

  // Update course type - save to unpublished collection
  updateCourseType: async (req, res) => {
    const { courseId } = req.params;
    const { courseType } = req.body;
    try {
      const userID = new mongoose.Types.ObjectId(req.userId);

      // Verify ownership of the course
      const course = await courseModel.findOne({
        _id: courseId,
        userId: userID,
      });
      if (!course) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Course not found or unauthorized" });
      }

      // Find or create unpublished version
      let unpublishedCourse = await courseUnpublishedModel.findOne({
        courseId: courseId,
      });

      if (unpublishedCourse) {
        // Update existing unpublished course
        unpublishedCourse.courseType = courseType;
        await unpublishedCourse.save();
      } else {
        // Create new unpublished course based on original
        const courseData = course.toObject();
        delete courseData._id;
        delete (courseData as any).__v;

        unpublishedCourse = new courseUnpublishedModel({
          ...courseData,
          courseType: courseType,
          courseId: course._id,
          userId: userID,
        });

        await unpublishedCourse.save();
      }

      return res.status(StatusCodes.OK).json({
        message:
          "Course type updated successfully. Changes will be applied after review and publishing.",
        unpublishedId: unpublishedCourse._id,
        courseType: courseType,
      });
    } catch (error) {
      console.error("Error updating course type:", error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Error updating course type" });
    }
  },

  // Update pricing - save to unpublished collection
  updatePricing: async (req, res) => {
    const { courseId } = req.params;
    const { courseType, paidType, price, lessons, course_preview_video } =
      req.body;

    try {
      const userID = new mongoose.Types.ObjectId(req.userId);

      // Verify ownership of the course
      const course = await courseModel.findOne({
        _id: courseId,
        userId: userID,
      });
      if (!course) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Course not found or unauthorized" });
      }

      // Find or create unpublished version
      let unpublishedCourse = await courseUnpublishedModel.findOne({
        courseId: courseId,
      });

      // Prepare update data
      const pricingUpdate = {
        courseType,
        paidType,
        price,
        lessons,
        course_preview_video,
      };

      if (unpublishedCourse) {
        // Update existing unpublished course
        Object.assign(unpublishedCourse, pricingUpdate);
        await unpublishedCourse.save();
      } else {
        // Create new unpublished course based on original
        const courseData = course.toObject();
        delete courseData._id;
        delete (courseData as any).__v;

        unpublishedCourse = new courseUnpublishedModel({
          ...courseData,
          ...pricingUpdate,
          courseId: course._id,
          userId: userID,
        });

        await unpublishedCourse.save();
      }

      return res.status(StatusCodes.OK).json({
        message:
          "Course pricing updated successfully. Changes will be applied after review and publishing.",
        unpublishedId: unpublishedCourse._id,
      });
    } catch (error) {
      console.error("Error updating course pricing:", error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Error updating course pricing" });
    }
  },

  // Add a new section
  addSection: async (req, res) => {
    const { courseId } = req.params;
    const { sectionTitle } = req.body;
    try {
      const userID = new mongoose.Types.ObjectId(req.userId);

      // Check if the course exists and is owned by the user
      const course = await courseModel.findOne({
        _id: courseId,
        userId: userID,
      });
      if (!course) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .send("Course not found or unauthorized");
      }

      // Create a new section and save it to the database
      const newSection = await sectionModel.create({
        sectionTitle,
        courseId: course._id,
        videos: [],
      });

      return res.status(StatusCodes.CREATED).json(newSection);
    } catch (error) {
      console.error("Error adding new section:", error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Error adding new section" });
    }
  },

  // Update section title or video title
  updateSectionOrVideoTitle: async (req, res) => {
    const { sectionId, videoId, newTitle } = req.body;
    const courseId = req.params.id;

    try {
      const userID = new mongoose.Types.ObjectId(req.userId);

      // Check if the course exists and is owned by the user
      const course = await courseModel.findOne({
        _id: courseId,
        userId: userID,
      });
      if (!course) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .send("Course not found or unauthorized");
      }

      if (sectionId && !videoId) {
        // Update section title
        await sectionModel.updateOne(
          { _id: sectionId, courseId: course._id },
          {
            $set: { sectionTitle: newTitle, sectionSlug: applySlug(newTitle) },
          },
        );
        return res
          .status(StatusCodes.OK)
          .json({ message: "Section title updated successfully" });
      } else if (sectionId && videoId) {
        // Update video title within the specified section
        await sectionModel.updateOne(
          { _id: sectionId, courseId: course._id, "videos._id": videoId },
          { $set: { "videos.$.name": newTitle } },
        );
        return res
          .status(StatusCodes.OK)
          .json({ message: "Video (lecture) title updated successfully" });
      } else {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Invalid request data" });
      }
    } catch (error) {
      console.log("Error updating title:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
  },

  // 10. Add lecture
  addLectureToSection: async (req, res) => {
    const { courseId, sectionId } = req.params;
    console.log(courseId, sectionId, "courseid, sectionId");
    const { name } = req.body;

    try {
      // Find the section and add the new lecture
      const section = await sectionModel.findById(sectionId);
      // const section = await sectionModel.findOne({ _id: sectionId, courseId, userId });
      if (!section) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({
            message:
              "error in addLectureToSection handler, section is not found",
          });
      }
      console.log(section, "found section");

      const maxOrder =
        section.videos.length > 0
          ? Math.max(...section.videos.map((v) => v.order))
          : 0;
      section.videos.push({ name, sectionId, order: maxOrder + 1 });
      await section.save();
      const newLecture = section.videos[section.videos.length - 1];
      return res.status(StatusCodes.CREATED).json(newLecture);
    } catch (error) {
      console.error("Error adding lecture:", error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Error adding lecture", error });
    }
  },

  // 11. Reorder section
  reorderSection: async (req, res) => {
    const { courseId } = req.params;
    const { oldOrder, newOrder } = req.body;
    try {
      const Section = sectionModel;
      await Section.bulkWrite([
        {
          updateOne: {
            filter: { courseId: courseId, order: oldOrder },
            update: { $set: { order: -1 } }, // Temporary placeholder to prevent conflicts
          },
        },
        {
          updateOne: {
            filter: { courseId: courseId, order: newOrder },
            update: { $set: { order: oldOrder } },
          },
        },
        {
          updateOne: {
            filter: { courseId: courseId, order: -1 },
            update: { $set: { order: newOrder } },
          },
        },
      ]);
      const updatedSections = await Section.find({ courseId }).sort({
        order: 1,
      });
      return res.status(StatusCodes.CREATED).json(updatedSections);
    } catch (error) {
      console.error("Error reordering sections:", error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Error reordering sections" });
    }
  },

  // 12. Reorder videos
  reorderVideos: async (req, res) => {
    const { sectionId } = req.params;
    const { oldOrder, newOrder } = req.body;
    try {
      const data = await sectionModel.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(sectionId) }, // Replace with actual section ID
        [
          {
            $set: {
              videos: {
                $sortArray: {
                  input: {
                    $map: {
                      input: "$videos",
                      as: "video",
                      in: {
                        $cond: [
                          { $eq: ["$$video.order", oldOrder] },
                          { $mergeObjects: ["$$video", { order: newOrder }] },
                          {
                            $cond: [
                              {
                                $and: [
                                  { $gte: ["$$video.order", newOrder] },
                                  { $lt: ["$$video.order", oldOrder] },
                                ],
                              },
                              {
                                $mergeObjects: [
                                  "$$video",
                                  { order: { $add: ["$$video.order", 1] } },
                                ],
                              },
                              {
                                $cond: [
                                  {
                                    $and: [
                                      { $gt: ["$$video.order", oldOrder] },
                                      { $lte: ["$$video.order", newOrder] },
                                    ],
                                  },
                                  {
                                    $mergeObjects: [
                                      "$$video",
                                      {
                                        order: {
                                          $subtract: ["$$video.order", 1],
                                        },
                                      },
                                    ],
                                  },
                                  "$$video",
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    },
                  },
                  sortBy: { order: 1 },
                },
              },
            },
          },
        ],
        { new: true },
      );
      return res.status(StatusCodes.CREATED).json(data.videos);
    } catch (error) {
      console.error("Error reordering videos:", error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Error reordering videos" });
    }
  },

  // 13. Add video to lecture
  addVideoToLecture: async (req, res) => {
    try {
      const { sectionId, lectureId } = req.params;
      const { videoUrl, videoDuration, isPreview, public_id, resource_type } =
        req.body;

      const section = await sectionModel.findById(sectionId);
      const lecture = section.videos.id(lectureId);

      // lecture.videoUrl = await encryptVideoUrl(videoUrl, section.courseId, req.userId);
      lecture.videoUrl = videoUrl;
      lecture.videoDuration = videoDuration;
      lecture.isPreview = isPreview;
      lecture.videoPublicId = public_id;
      lecture.videoResourceType = resource_type;
      section.status = "pending";
      await section.save();

      return res
        .status(StatusCodes.OK)
        .json({ message: "Video added successfully" });
    } catch (error) {
      console.error("addVideoURL:: error:", error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Error adding video URL" });
    }
  },

  // 14. Update video preview
  updateVideoPreview: async (req, res) => {
    const { sectionId, lectureId } = req.params;
    const { isPreview } = req.body;

    try {
      const section = await sectionModel.findById(sectionId);
      const lecture = section.videos.id(lectureId);
      lecture.isPreview = isPreview;

      await section.save();

      return res
        .status(StatusCodes.OK)
        .json({ message: "Video preview updated successfully" });
    } catch (error) {
      console.error("Error updating video preview mode:", error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to update video preview" });
    }
  },

  // 15. Add doc to lecture
  addDocToLecture: async (req, res) => {
    const { sectionId, lectureId } = req.params;
    const { docUrl, public_id, resource_type } = req.body;

    try {
      const section = await sectionModel.findById(sectionId);
      const lecture = section.videos.id(lectureId);
      lecture.docUrl = docUrl;
      lecture.docPublicId = public_id;
      lecture.docResourceType = resource_type;
      section.status = "pending";
      await section.save();

      return res
        .status(StatusCodes.OK)
        .json({ message: "Doc added to lecture successfully" });
    } catch (error) {
      console.error("Error updating lecture with doc URL:", error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to update lecture" });
    }
  },

  // 22. Add Lecture Links to lecture
  addLectureLinkToLecture: async (req, res) => {
    try {
      const { sectionId, lectureId } = req.params;
      const { link } = req.body;

      const section = await sectionModel.findById(sectionId);
      const lecture = section.videos.id(lectureId);

      lecture.lectureLinks.push({ link });
      section.status = "pending";
      await section.save();

      return res
        .status(StatusCodes.OK)
        .json({
          message: "Lecture Link added successfully",
          data: lecture.lectureLinks,
        });
    } catch (error) {
      console.error("addLectureLink:: error:", error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Error adding Lecture Link" });
    }
  },

  // 23. Update Lecture Links
  updateLectureLink: async (req, res) => {
    try {
      const { sectionId, lectureId, linkId } = req.params;
      const { link } = req.body;

      const section = await sectionModel.findById(sectionId);
      const lecture = section.videos.id(lectureId);
      const lectureeLinks: any = lecture.lectureLinks;
      const linkdata = lectureeLinks.id(linkId);

      linkdata.link = link;
      await section.save();

      return res
        .status(StatusCodes.OK)
        .json({
          message: "Lecture Link updated successfully",
          data: lectureeLinks,
        });
    } catch (error) {
      console.error("updateLectureLink:: error:", error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Error updating Lecture Link" });
    }
  },

  // 24. Delete Lecture Links from lecture
  deleteLectureLink: async (req, res) => {
    try {
      const { sectionId, lectureId, linkId } = req.params;

      const section = await sectionModel.findById(sectionId);
      const lecture = section.videos.id(lectureId);
      const linkdata = (lecture.lectureLinks as any).id(linkId);
      if (linkdata) {
        const updateSection = await sectionModel.updateOne(
          { _id: sectionId, "videos._id": lectureId },
          { $pull: { "videos.$.lectureLinks": { _id: linkId } } },
        );
        if (updateSection.modifiedCount > 0) {
          return res
            .status(StatusCodes.OK)
            .json({ message: "Lecture Link deleted successfully" });
        } else {
          return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: "Error deleting Lecture Link" });
        }
      } else {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Lecture Link not found" });
      }
    } catch (error) {
      console.error("deleteLectureLink:: error:", error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Error deleting Lecture Link" });
    }
  },

  // 16. Remove video
  deleteVideoFromLecture: async (req, res) => {
    const { courseId, sectionId, lectureId } = req.params;

    try {
      // Find the section by courseId and sectionId, then update the specific lecture to remove video fields
      const result = await sectionModel.updateOne(
        { _id: sectionId, courseId: courseId, "videos._id": lectureId },
        {
          $unset: {
            "videos.$.videoUrl": "",
            "videos.$.videoPublicId": "",
            "videos.$.videoResourceType": "",
          },
        },
      );

      console.log("🚀 ~ router.delete ~ result:", result);
      if (result.modifiedCount > 0) {
        return res
          .status(StatusCodes.OK)
          .json({
            status: StatusCodes.OK,
            message: "Video removed successfully from lecture",
          });
      } else {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({
            status: StatusCodes.NOT_FOUND,
            error: "Lecture or Section not found for the specified Course",
          });
      }
    } catch (error) {
      console.error("Error removing video:", error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          error: "Failed to remove video from lecture",
        });
    }
  },

  // 17. Remove document
  deleteDocFromLecture: async (req, res) => {
    const { courseId, sectionId, lectureId } = req.params;

    try {
      // Find the section and update the specific lecture to remove video URL
      const result = await sectionModel.updateOne(
        { _id: sectionId, courseId: courseId, "videos._id": lectureId },
        {
          $unset: {
            "videos.$.docUrl": "",
            "videos.$.docPublicId": "",
            "videos.$.docResourceType": "",
          },
        },
      );
      if (result.modifiedCount > 0) {
        return res
          .status(StatusCodes.OK)
          .json({
            status: StatusCodes.OK,
            message: "Doc removed successfully from lecture",
          });
      } else {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({
            status: StatusCodes.NOT_FOUND,
            error: "Lecture or Section not found for the specified Course",
          });
      }
    } catch (error) {
      console.error("Error removing doc:", error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to remove doc from lecture" });
    }
  },

  // 18. Delete section
  deleteSection: async (req, res) => {
    const { courseId } = req.params;
    const { sectionId } = req.body;

    try {
      // Delete the section
      await sectionModel.findByIdAndDelete(sectionId);

      // Optionally, remove section from course document (if needed)
      await courseModel.updateOne(
        { _id: courseId },
        { $pull: { sections: sectionId } },
      );

      return res
        .status(StatusCodes.OK)
        .send({ message: "Section deleted successfully" });
    } catch (error) {
      console.error("Error deleting section:", error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ error: "Error deleting section" });
    }
  },

  // 19. Delete video
  deleteVideo: async (req, res) => {
    const { sectionId, videoId } = req.body;

    try {
      // Delete the video from the section
      await sectionModel.updateOne(
        { _id: sectionId },
        { $pull: { videos: { _id: videoId } } },
      );

      return res
        .status(StatusCodes.OK)
        .send({ message: "Video deleted successfully" });
    } catch (error) {
      console.error("Error deleting video:", error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ error: "Error deleting video" });
    }
  },

  deleteCourse: async (req, res) => {
    const { courseId } = req.params;
    try {
      const userID = new mongoose.Types.ObjectId(req.userId);

      // Check if any students are enrolled
      const enrolledCount = await mongoose
        .model("enrolledCourses")
        .countDocuments({ course: courseId });

      if (enrolledCount > 0) {
        return res.status(StatusCodes.CONFLICT).json({
          message: `Unable to delete as ${enrolledCount} ${enrolledCount > 1 ? "students" : "student"} enrolled this course`,
        });
      }

      // Verify ownership of the course
      const course = await courseModel.findOne({
        _id: courseId,
        userId: userID,
      });

      if (!course) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Course not found or unauthorized" });
      }

      // Collect all assets for deletion from Cloudinary
      const assetsLists = [];

      // Get sections and collect video/doc assets
      const sectionLists = await mongoose.model("sections").find({ courseId });
      sectionLists.forEach((section) => {
        section?.videos?.forEach((video) => {
          if (video?.videoPublicId) {
            assetsLists.push({
              type: "videos",
              public_id: video?.videoPublicId,
            });
          }
          if (video?.docPublicId) {
            assetsLists.push({ type: "raw", public_id: video?.docPublicId });
          }
        });
      });

      // Add course image assets
      if (course?.courseImagePublicId) {
        assetsLists.push({
          type: "image",
          public_id: course?.courseImagePublicId,
        });
      }

      // Check for any unpublished versions and collect assets
      const unpublishedCourse = await courseUnpublishedModel.findOne({
        courseId,
      });
      if (
        unpublishedCourse?.courseImagePublicId &&
        unpublishedCourse.courseImagePublicId !== course.courseImagePublicId
      ) {
        assetsLists.push({
          type: "image",
          public_id: unpublishedCourse.courseImagePublicId,
        });
      }

      // Check for any published versions and collect assets
      const publishedCourse = await mongoose
        .model("coursesPublished")
        .findOne({ courseId });
      if (
        publishedCourse?.courseImagePublicId &&
        publishedCourse.courseImagePublicId !== course.courseImagePublicId &&
        publishedCourse.courseImagePublicId !==
          unpublishedCourse?.courseImagePublicId
      ) {
        assetsLists.push({
          type: "image",
          public_id: publishedCourse.courseImagePublicId,
        });
      }

      // Delete assets from Cloudinary
      if (assetsLists.length > 0) {
        await cloudinaryService.deleteMultiAssets(assetsLists);
      }

      // Delete all related data
      await Promise.all([
        // Delete sections and videos
        mongoose.model("sections").deleteMany({ courseId }),

        // Delete from cart
        deleteCourseFromCart(courseId),

        // Delete all versions of the course
        courseModel.findOneAndDelete({ _id: courseId }),
        courseUnpublishedModel.deleteMany({ courseId }),
        mongoose.model("coursesPublished").deleteMany({ courseId }),

        // Delete related content
        mongoose.model("courseFeedbacks").deleteMany({ courseId }),
        mongoose.model("interviews").deleteMany({ courseId }),
      ]);

      return res
        .status(StatusCodes.OK)
        .json({ message: "Course deleted successfully" });
    } catch (error) {
      console.error("Error deleting course:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error deleting course",
        error: error.message,
      });
    }
  },

  // Update course details - save to unpublished collection
  updateCourseLandingPageDetails: async (req, res) => {
    const { courseId } = req.params;
    const {
      overview,
      topics,
      course_preview_video,
      languages,
      categoryName,
      subCategoryName,
      nestedSubCategoryName,
      cloudinaryAssets,
      imageUrl,
      courseImagePublicId,
    } = req.body;

    try {
      const userID = new mongoose.Types.ObjectId(req.userId);

      // Verify ownership of the course
      const course = await courseModel.findOne({
        _id: courseId,
        userId: userID,
      });
      if (!course) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Course not found or unauthorized" });
      }

      // Get language IDs
      const languagesData = await mongoose
        .model("languages")
        .find({ abbr: languages });
      const languageIds = languagesData.map((lang) => lang._id);

      // Create update data object
      const updateData = {
        overview,
        topics,
        course_preview_video,
        categoryName,
        subCategoryName,
        nestedSubCategoryName,
        cloudinaryAssets,
        imageUrl,
        courseImagePublicId,
        languageIds,
      };

      // Find or create unpublished version
      let unpublishedCourse = await courseUnpublishedModel.findOne({
        courseId: courseId,
      });

      if (unpublishedCourse) {
        // Update existing unpublished course
        Object.assign(unpublishedCourse, updateData);
        await unpublishedCourse.save();
      } else {
        // Create new unpublished course based on original
        const courseData = course.toObject();
        delete courseData._id;
        delete (courseData as any).__v;

        unpublishedCourse = new courseUnpublishedModel({
          ...courseData,
          ...updateData,
          courseId: course._id,
          userId: userID,
        });

        await unpublishedCourse.save();
      }

      return res.status(StatusCodes.OK).json({
        status: "updated",
        message:
          "Course details updated successfully. Changes will be applied after review and publishing.",
        unpublishedId: unpublishedCourse._id,
      });
    } catch (error) {
      console.error("Error updating course details:", error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Error updating course details" });
    }
  },

  // Submit course for review
  submitCourseForReview: async (req, res) => {
    const { courseId } = req.params;
    try {
      const userID = new mongoose.Types.ObjectId(req.userId);

      // Verify course ownership
      const course = await courseModel.findOne({
        _id: courseId,
        userId: userID,
      });
      if (!course) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Course not found or unauthorized" });
      }

      // Update the status in the original course model
      await courseModel.findByIdAndUpdate(courseId, {
        status: "pending_review",
      });

      return res.status(StatusCodes.OK).json({
        message: "Course submitted for review",
        course: {
          id: courseId,
          name: course.courseName,
          status: "pending_review",
        },
      });
    } catch (error) {
      console.error("Error submitting course for review:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error submitting course for review",
        error: error.message,
      });
    }
  },

  // Approve course
  approveCourse: async (req, res) => {
    const { courseId } = req.params;
    try {
      // Check if the course exists and is in pending_review status
      const course = await courseModel.findOne({
        _id: courseId,
        status: "pending_review",
      });

      if (!course) {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: "Course not found or not in review status",
        });
      }

      // Update main course status to approved (but not yet published)
      await courseModel.findByIdAndUpdate(
        { _id: courseId },
        {
          status: "approved",
          reviewerId: req.userId,
          reviewedAt: new Date(),
        },
      );

      // Invalidate course status caches
      await courseStatusCacheUtils.invalidateCourseStatusCache({
        status: "pending_review", // Invalidate pending review cache
      });

      await courseStatusCacheUtils.invalidateCourseStatusCache({
        limit: 1,
        offset: 1,
        status: "pending_review", // Invalidate pending review cache
      });

      await courseStatusCacheUtils.invalidateCourseStatusCache({
        limit: 1,
        offset: 0,
        status: "pending_review", // Invalidate pending review cache
      });

      await courseSlugCacheUtils.invalidateCourseSlugCache(
        `${course.slug}-true`,
      );

      // Optionally, invalidate all course status caches if you want to be thorough
      await courseStatusCacheUtils.invalidateAllCourseStatusCaches();

      const courseLink = `<a href="/courses/${course.slug}" target="_blank" rel="noopener noreferrer">${course.courseName}</a>`;

      // Trigger notification to trainer
      const newNotification = new Notification({
        userId: course.userId,
        message: `Course - ${courseLink} has been approved, now you can publish your course.`,
        expiresAt: new Date(Date.now() + NOTIFICATION_MAX_AGE),
      });
      await newNotification.save();

      return res.status(StatusCodes.OK).json({
        message: "Course approved",
        course: { id: courseId, name: course.courseName, status: "approved" },
      });
    } catch (error) {
      console.error("Error approving course:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error approving course",
        error: error.message,
      });
    }
  },

  // Reject course
  rejectCourse: async (req, res) => {
    const { courseId } = req.params;
    const { reason } = req.body;
    try {
      // Check if the course exists and is in pending_review status
      const course = await courseModel.findOne({
        _id: courseId,
        status: "pending_review",
      });

      if (!course) {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: "Course not found or not in review status",
        });
      }

      // Update main course status to rejected
      await courseModel.findByIdAndUpdate(courseId, {
        status: "rejected",
        statusUpdateReason: reason || "No reason provided",
        reviewerId: req.userId,
        reviewedAt: new Date(),
      });

      // Trigger notification to trainer
      const newNotification = new Notification({
        userId: course.userId,
        message: `Course - ${course.courseName} is rejected. Reason - ${reason || "No reason provided"}.`,
        expiresAt: new Date(Date.now() + NOTIFICATION_MAX_AGE),
      });
      await newNotification.save();

      return res.status(StatusCodes.OK).json({
        message: "Course rejected",
        course: { id: courseId, name: course.courseName, status: "rejected" },
      });
    } catch (error) {
      console.error("Error rejecting course:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error rejecting course",
        error: error.message,
      });
    }
  },
};

export default courseBuilderController;
