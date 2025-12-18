import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import Hiring from "../../models/hiring";
import Notification from "../../models/notification";
import BookingDetail from "../../models/bookingDetail";
import Razorpay from "razorpay";
import shortid from "shortid";
import sendEmailToStudent from "../../utils/course/bookingMails/student";
import sendEmailToTrainer from "../../utils/course/bookingMails/trainer";
import { NOTIFICATION_MAX_AGE } from "../../utils/course/constants";

const instance = new Razorpay({
  key_id: process.env.RAZOR_PAY_KEY,
  key_secret: process.env.RAZOR_PAY_SECRET,
});

function scheduleTask(id) {
  const task = async () => {
    try {
      const booking = await Hiring.findById(id).populate("trainerId");
      if (booking.status === "pending") {
        booking.status = "cancelled";
        await booking.save();
        const cards = await mongoose
          .model("users")
          .find({ as_trainer_apply: true, active: true })
          .limit(3);
        const user = await mongoose
          .model("users")
          .findOne({ email: booking.email });

        sendEmailToStudent({
          status: "cancelled",
          name: booking.name,
          email: booking.email,
          cards,
        });

        sendEmailToTrainer({
          status: "cancelled",
          name: (booking.trainerId as any).name,
          email: (booking.trainerId as any).email,
        });

        const newNotification = new Notification({
          userId: user._id,
          message: `Your booking request is cancelled due to unavailability of trainer.`,
          expiresAt: new Date(Date.now() + NOTIFICATION_MAX_AGE),
        });
        await newNotification.save();
      }
    } catch (e) {
      console.log("error on task");
    }
  };
  setTimeout(task, 3 * 60 * 60 * 1000);
}

const courseTrainerController = {
  getTrainerDetails: async function (req, res) {
    const { id: userId } = req.params;
    const objectUserId = new mongoose.Types.ObjectId(userId);

    try {
      const courses = await mongoose
        .model("coursesPublished")
        .find({ userId: objectUserId });

      const [trainerData] = await mongoose
        .model("users")
        .aggregate()
        .match({
          _id: objectUserId,
          role: "trainer",
        })
        .lookup({
          from: "languages",
          localField: "languageIds",
          foreignField: "_id",
          as: "languages",
        })
        .project({
          languages: 1,
          about: 1,
          experience: 1,
          rate: 1,
          skills: 1,
          name: 1,
          email: 1,
          phone: 1,
          contactsCount: 1,
          contactedStudents: 1,
          highestQualification: 1,
          certification: 1,
          trainerProfilePhoto: 1,
          revealTrainerInfo: 1,
        })
        .exec();

      res.status(200).json({ trainerData, courses });
    } catch (err) {
      console.log("courseTrainerController:: getTrainerDetails:: err:", err);
      res.status(500).json({ message: "error in getTrainerDetails handler" });
    }
  },

  updateContactedStudents: async function (req, res) {
    const { trainerId } = req.params;
    const { studentId } = req.body;

    if (!trainerId || !studentId) {
      return res
        .status(400)
        .json({ message: "trainerId and studentId must be provided" });
    }

    try {
      const trainer = await mongoose.model("users").findById(trainerId);
      const { contactedStudents, contactsCount } = trainer;
      if (!contactedStudents.includes(studentId)) {
        contactedStudents.push(studentId);

        await mongoose
          .model("users")
          .updateOne(
            { _id: trainerId },
            { contactsCount: contactsCount + 1, contactedStudents },
          );
      }
      res
        .status(StatusCodes.OK)
        .json({ message: "contactedStudents array successfully updated" });
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send("Failed to update trainer fields");
    }
  },

  notifications: async function (req, res) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = 5;
      const skip = (page - 1) * limit;

      const [notifications, total] = await Promise.all([
        Notification.find({ userId: req.userId })
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(skip)
          .exec(),
        Notification.countDocuments({ userId: req.userId }),
      ]);

      const totalUnseen = notifications.reduce(
        (count, notification) => count + (!notification.seen ? 1 : 0),
        0,
      );

      res.status(StatusCodes.OK).json({ notifications, total, totalUnseen });
    } catch (error) {
      console.error("Error in notifications:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to fetch notifications." });
    }
  },

  deleteNotifications: async function (req, res) {
    try {
      const { ids } = req.body;
      const userId = req.userId;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .send("Invalid or empty notification IDs");
      }

      console.log(
        "routes:: DELETE /notifications/delete::",
        "userId: ",
        userId,
        "IDs: ",
        ids,
      );

      const result = await Notification.deleteMany({
        _id: { $in: ids },
        userId: userId,
      });

      console.log(`${result.deletedCount} notifications deleted`);

      res.status(StatusCodes.OK).send({
        message: "Notifications deleted successfully",
        deletedCount: result.deletedCount,
      });
    } catch (error) {
      console.error("Error in deleteNotifications:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send("Failed to delete notifications");
    }
  },

  readNotifications: async function (req, res) {
    try {
      const userId = req.userId;
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .send("Invalid or empty notification IDs");
      }

      console.log(
        "routes:: notifications/readNotifications:: userId: ",
        userId,
        "IDs: ",
        ids,
      );

      const result = await Notification.updateMany(
        { _id: { $in: ids }, userId: userId, seen: false },
        { $set: { seen: true } },
      );

      console.log(`${result.modifiedCount} notifications marked as seen`);

      res
        .status(StatusCodes.OK)
        .send({
          message: "Notifications marked as seen",
          modifiedCount: result.modifiedCount,
        });
    } catch (error) {
      console.error("Error in readNotifications:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send("Failed to mark notifications as read");
    }
  },

  courseHistory: async function (req, res) {
    try {
      const userId = req.query.id || req.userId;
      const limit = 10;
      const page = req.query.page || 1;
      const skip = (page - 1) * limit;
      const searchTerm = req.query.search || "";

      const searchQuery = searchTerm
        ? { courseName: { $regex: searchTerm, $options: "i" } }
        : {};
      const query = { userId: userId, ...searchQuery };

      // const courses = await mongoose.model('courses')
      //     .find(query)
      //     .populate({
      //         path: 'userId',
      //         select: '-password -emailResetToken -__v' // Exclude sensitive fields
      //     })
      //     .sort({ createdAt: -1 })
      //     .limit(limit)
      //     .skip(skip)
      //     .exec();

      const statusParam = req.query.sort?.trim(); // e.g., "published" or blank

      const aggregationPipeline: any[] = [{ $match: query }];

      if (statusParam && statusParam !== "updatedAt") {
        // Add conditional sort priority
        aggregationPipeline.push(
          {
            $addFields: {
              statusPriority: {
                $cond: [{ $eq: ["$status", statusParam] }, 0, 1],
              },
            },
          },
          {
            $sort: {
              statusPriority: 1,
              updatedAt: -1,
            },
          },
        );
      } else {
        // Default sort
        aggregationPipeline.push({
          $sort: {
            updatedAt: -1,
          },
        });
      }

      // Pagination
      aggregationPipeline.push({ $skip: skip }, { $limit: limit });

      // Join user info
      aggregationPipeline.push(
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            "user.password": 0,
            "user.emailResetToken": 0,
            "user.__v": 0,
            ...(statusParam && { statusPriority: 0 }), // remove statusPriority only if added
          },
        },
      );

      // Fetch courses with aggregation
      const courses = await mongoose
        .model("courses")
        .aggregate(aggregationPipeline);

      const total = await mongoose.model("courses").countDocuments(query);

      const coursesWithSections = await Promise.all(
        courses.map(async (course) => {
          const sections = await mongoose
            .model("sections")
            .find({ courseId: course._id })
            .sort({ order: 1 })
            .exec();
          return {
            ...course,
            sections,
          };
        }),
      );
      res.status(StatusCodes.OK).send({ courses: coursesWithSections, total });
    } catch (error) {
      console.log(error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ error: "An error occurred while fetching courses." });
    }
  },

  trainerCourses: async function (req, res) {
    try {
      const userId = req.query.id || req.userId;
      const limit = 10;
      const page = req.query.page || 1;
      const skip = (page - 1) * limit;
      const searchTerm = req.query.search || "";

      const searchQuery = searchTerm
        ? { courseName: { $regex: searchTerm, $options: "i" } }
        : {};
      const query = { userId: userId, ...searchQuery };

      const courses = await mongoose
        .model("coursesPublished")
        .find(query)
        .populate("userId")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .exec();

      const total = await mongoose.model("courses").countDocuments(query);

      const coursesWithSections = await Promise.all(
        courses.map(async (course) => {
          const sections = await mongoose
            .model("sections")
            .find({ courseId: course._id })
            .exec();
          return {
            ...course.toObject(),
            sections,
          };
        }),
      );
      res.status(StatusCodes.OK).send({ courses: coursesWithSections, total });
    } catch (error) {
      console.log(error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ error: "An error occurred while fetching courses." });
    }
  },

  sections: async function (req, res) {
    try {
      const limit = 10;
      const page = req.query.page || 1;
      const skip = (page - 1) * limit;
      const searchTerm = req.query.search || "";
      const searchQuery = searchTerm
        ? { sectionTitle: { $regex: searchTerm, $options: "i" } }
        : {};

      const sections = await mongoose
        .model("sections")
        .find(searchQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .exec();

      const total = await mongoose
        .model("sections")
        .countDocuments(searchQuery);

      res.status(StatusCodes.OK).send({ sections, total });
    } catch (error) {
      console.log(error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ error: "An error occurred while fetching sections." });
    }
  },

  listNames: async function (req, res) {
    try {
      const userId = req.query.id || req.userId;
      const courses = await mongoose
        .model("courses")
        .find({ userId: userId })
        .select("courseName userId")
        .sort({ createdAt: -1 })
        .exec();
      console.log("courses:", courses);

      const courseNames = courses.map((course) => ({
        courseId: course._id,
        courseName: course.courseName,
      }));

      res.status(StatusCodes.OK).send({ courseNames });
    } catch (error) {
      console.log(error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ error: "An error occurred while fetching course names." });
    }
  },

  listSectionsByVideo: async function (req, res) {
    try {
      const id = req.query.id;

      const section = await mongoose
        .model("sections")
        .findOne(
          { "videos._id": id },
          {
            sectionTitle: 1,
            description: 1,
            order: 1,
            courseId: 1,
            videos: { $elemMatch: { _id: id } },
          },
        )
        .exec();

      console.log("get-sections-by-video:: section:", section);

      res.status(StatusCodes.OK).send({ section });
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Server error" });
    }
  },

  bookings: async function (req, res) {
    try {
      const userId = req.userId;
      const user = await mongoose.model("users").findOne({ _id: userId });

      if (user.as_trainer_apply) {
        const bookings = await Hiring.find({ trainerId: userId })
          .populate("trainerId")
          .sort({ createdAt: -1 })
          .exec();

        res.status(StatusCodes.OK).send({ bookings, type: "trainer" });
      } else {
        const bookings = await Hiring.find({ email: user.email })
          .populate("trainerId")
          .sort({ createdAt: -1 })
          .exec();

        res.status(StatusCodes.OK).send({ bookings, type: "users" });
      }
    } catch (error) {
      console.log(error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Server error" });
    }
  },

  updateBooking: async function (req, res) {
    const { request, id, reason, payment, amount } = req.body;
    try {
      const booking = await Hiring.findOne({ _id: id });
      if (
        booking.status === "cancelled" ||
        booking.status === "unavailable" ||
        booking.status === "booked"
      ) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Invalid request." });
      }
      booking.status = request;
      if (reason) booking.reason = reason;
      if (payment) booking.isPaymentDone = true;
      await booking.save();

      const student = await mongoose
        .model("users")
        .findOne({ email: booking.email });
      const trainer = await mongoose
        .model("users")
        .findOne({ _id: booking.trainerId });

      if (request === "accepted") {
        sendEmailToStudent({
          status: "accepted",
          name: student.name,
          email: student.email,
        });

        sendEmailToTrainer({
          status: "accepted",
          name: trainer.name,
          email: trainer.email,
        });

        const newNotification = new Notification({
          userId: student._id,
          message: `${trainer.name} accepted your request.`,
          expiresAt: new Date(Date.now() + NOTIFICATION_MAX_AGE),
        });
        await newNotification.save();
      }

      if (request === "unavailable") {
        const cards = await mongoose
          .model("users")
          .find({ as_trainer_apply: true, active: true })
          .limit(3);
        sendEmailToStudent({
          status: "unavailable",
          name: student.name,
          email: student.email,
          cards,
        });

        sendEmailToTrainer({
          status: "unavailable",
          name: trainer.name,
          email: trainer.email,
        });

        const newNotification = new Notification({
          userId: student._id,
          message: `${trainer.name} not available to accept your request. Search other similar trainers.`,
          expiresAt: new Date(Date.now() + NOTIFICATION_MAX_AGE),
        });
        await newNotification.save();
      }

      if (request === "cancelled") {
        const cards = await mongoose
          .model("users")
          .find({ as_trainer_apply: true, active: true })
          .limit(3);
        sendEmailToStudent({
          status: "cancelled",
          name: student.name,
          email: student.email,
          cards,
        });

        sendEmailToTrainer({
          status: "cancelled",
          name: trainer.name,
          email: trainer.email,
        });

        const newNotification = new Notification({
          userId: trainer._id,
          message: `${student.name} cancelled a hiring request.`,
          expiresAt: new Date(Date.now() + NOTIFICATION_MAX_AGE),
        });
        await newNotification.save();
      }

      if (request === "booked") {
        const course = await mongoose
          .model("course")
          .findOne({ slug: booking.course_slug });
        sendEmailToStudent({
          status: "booked",
          name: student.name,
          email: student.email,
          booking_number: payment,
          trainer_name: trainer.name,
          course: course?.title || "N/A",
          amount: amount,
          date: new Date().toDateString(),
        });

        sendEmailToTrainer({
          status: "booked",
          name: trainer.name,
          email: trainer.email,
          studentName: student.name,
        });

        const newBookingDetails = new BookingDetail({
          booking_id: booking._id,
          booking_status: "booked",
          payment_status: "success",
          trainer_email: trainer.email,
          student_email: student.email,
          order_id: payment || "",
        });
        await newBookingDetails.save();

        const newNotification = new Notification({
          userId: trainer._id,
          message: `${student.name} make payment and booked a slot. Contact to ${student.name} asap.`,
          expiresAt: new Date(Date.now() + NOTIFICATION_MAX_AGE),
        });
        await newNotification.save();
      }

      res.status(StatusCodes.OK).send({ message: "done" });
    } catch (e) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: e.message });
    }
  },

  trainers: async function (req, res) {
    try {
      const limit = 10;
      const page = req.query.page || 1;
      const skip = (page - 1) * limit;

      const trainers = await mongoose
        .model("users")
        .find({ as_trainer_apply: true, active: true })
        .select("name rate _id")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .exec();

      const total = await mongoose
        .model("users")
        .countDocuments({ as_trainer_apply: true, active: true });

      res.status(StatusCodes.OK).send({ trainers, total });
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Server error" });
    }
  },

  checkout: async function (req, res) {
    try {
      const booking = await Hiring.findOne({ _id: req.body.id }).populate(
        "trainerId",
      );

      const options = {
        amount: Number(
          (booking.durationType === "hours"
            ? booking.duration * (booking.trainerId as any).rate
            : booking.duration * (booking.trainerId as any).rate * 24) * 100,
        ),
        currency: "INR",
        receipt: `${shortid.generate()}`,
        payment_capture: 1,
        notes: {
          description: `Trainer hiring | User: ${booking.email}`,
        },
      };

      const response = await instance.orders.create(options);
      res.status(StatusCodes.OK).json({
        id: response.id,
        currency: response.currency,
        amount: response.amount,
      });
    } catch (e) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Server error" });
    }
  },

  hireTrainer: async function (req, res) {
    try {
      let {
        trainerId,
        name,
        email,
        message,
        duration,
        durationType,
        course_slug,
      } = req.body;
      if (req.headers.authorization) {
        const userId = req.userId;
        const user = await mongoose.model("users").findById(userId);
        name = user.name;
        email = user.email;
      }
      const newHiring = new Hiring({
        trainerId,
        name,
        email,
        message,
        duration,
        durationType,
        course_slug,
      });
      const result = await newHiring.save();

      const trainer = await mongoose.model("users").findOne({ _id: trainerId });

      sendEmailToStudent({
        status: "pending",
        name: name,
        email: email,
      });

      sendEmailToTrainer({
        status: "pending",
        name: trainer.name,
        email: trainer.email,
        studentName: name,
      });

      scheduleTask(result._id);

      const newNotification = new Notification({
        userId: trainer._id,
        message: `${name} sent a request to hire you.`,
        expiresAt: new Date(Date.now() + NOTIFICATION_MAX_AGE),
      });
      await newNotification.save();

      res
        .status(StatusCodes.OK)
        .send({
          message:
            "Request to hire a trainer to sent to the trainer. Waiting for trainer to accept",
        });
    } catch (error) {
      console.log("🚀 ~ error:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Server error" });
    }
  },

  searchTrainers: async (req, res) => {
    console.log("searching trainer...");
    const page = req.query.page || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const { query } = req.query;
    try {
      if (!query) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Query required." });
      }
      const words = query.split(/\s+/);
      const trainers = await mongoose
        .model("users")
        .find({
          role: "trainer",
          active: true,
          $or: [
            { name: { $in: words.map((w) => new RegExp(w, "i")) } },
            { skills: { $in: words.map((w) => new RegExp(w, "i")) } },
          ],
        })
        .sort({ rating: 1 })
        .limit(10)
        .skip(skip);

      const total = await mongoose.model("users").countDocuments({
        role: "trainer",
        active: true,
        $or: [
          { name: { $in: words.map((w) => new RegExp(w, "i")) } },
          { skills: { $in: words.map((w) => new RegExp(w, "i")) } },
        ],
      });
      res.status(StatusCodes.OK).send({ trainers, total });
    } catch (e) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: e.message });
    }
  },
};

export default courseTrainerController;
