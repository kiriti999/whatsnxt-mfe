import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { getTime, getTimeZone } from "../../helper/course/time";
import { setAccessCookie, setUserCookie } from "../../common/utils";

const IS_PROD = process.env.NODE_ENV === "prod";
const COOKIES_DOMAIN = process.env.COOKIES_DOMAIN;
const COOKIES_USER_INFO = process.env.COOKIES_USER_INFO;
const COOKIES_ACCESS_TOKEN = process.env.COOKIES_ACCESS_TOKEN;
const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

const userController = {
  apply: async (req, res) => {
    let {
      about,
      designation,
      experience,
      number,
      skills,
      rate,
      from,
      to,
      languages,
      certificate_name,
      certificate_link,
      highestQualification,
      trainerProfilePhoto,
      revealTrainerInfo,
    } = req.body;

    try {
      const languagesData = await mongoose
        .model("languages")
        .find({ abbr: languages });
      if (!languagesData) {
        res
          .status(404)
          .json({ message: "languages not found in user controller" });
      }
      const languageIds = [];

      languagesData.forEach(({ _id: languageId }) => {
        if (!languageIds.includes(languageId)) {
          languageIds.push(languageId);
        }
      });
      const certification = {
        name: certificate_name,
        link: certificate_link,
      };

      if (from) {
        from = getTime(from);
      }
      if (to) {
        to = getTime(to);
      }

      const newUser = await mongoose.model("users").findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(req.userId) },
        {
          role: "trainer",
          about,
          phone: number,
          designation,
          experience,
          skills:
            skills
              .join(",")
              .split(",")
              .map((x) => x.trim()) || [],
          rate,
          languageIds,
          from,
          to,
          timeZone: `${getTimeZone()}`,
          highestQualification,
          certification,
          trainerProfilePhoto,
          revealTrainerInfo,
        },
        { new: true },
      );

      const token = jwt.sign(
        { userId: newUser._id.toString(), userRole: "trainer" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );

      const userData = {
        _id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      };
      setAccessCookie(
        res,
        COOKIES_ACCESS_TOKEN,
        token,
        IS_PROD,
        COOKIES_DOMAIN,
        MAX_AGE,
      );
      setUserCookie(
        res,
        COOKIES_USER_INFO,
        userData,
        IS_PROD,
        COOKIES_DOMAIN,
        MAX_AGE,
      );
      res.status(StatusCodes.OK).send("Successfully applied as trainer!");
    } catch (error) {
      console.log("user/apply/index.js:: error:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send("User apply handler failed!");
    }
  },
};

export default userController;
