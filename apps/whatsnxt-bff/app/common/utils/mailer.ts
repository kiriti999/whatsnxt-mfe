import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({
  path: path.resolve(__dirname, `../../.env.${process.env.NODE_ENV}`),
});

const envVars = process.env;
const sender = envVars.MAIL_SENDER || "GMAIL";

const smtpConfig = {
  host: envVars[`${sender}_HOST`] || "",
  port: Number(envVars[`${sender}_PORT`]) || 587,
  auth: {
    user: envVars[`${sender}_EMAIL`] || "",
    pass: envVars[`${sender}_PASSWORD`] || "",
  },
};

export const mailer = nodemailer.createTransport(smtpConfig);
