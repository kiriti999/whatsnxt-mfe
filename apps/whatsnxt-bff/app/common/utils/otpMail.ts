import { mailer } from "./mailer";
import { getLogger } from "../../../config/logger";

const logger = getLogger("otpMail");

/**
 * Generate a 6-digit OTP
 * @returns 6-digit OTP string
 */
function generateOTP(): string {
  let otp = "";
  const digits = "0123456789";
  for (let i = 0; i < 6; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

/**
 * Send OTP email to user
 * @param name - User's name
 * @param email - User's email address
 * @returns OTP string if successful, false otherwise
 */
export const otpEmail = async (
  name: string,
  email: string,
): Promise<string | false> => {
  const otp = generateOTP();

  const subject = "OTP for signup";

  const html = `
    <p>Dear ${name},</p>
    <p>Thank you for signing up with us! To complete your registration, please use the following one-time verification code:</p>
    <h2>${otp}</h2>
    <p>This code is valid for 10 minutes. Please enter it on the registration page to verify your email address.</p>
    <p>If you did not sign up for our service, please ignore this email.</p>
    <p>Thank you for choosing our service!</p>
    <p>Best regards,</p>
    <p>Whatsnxt</p>
  `;

  const options = {
    from: process.env.GODADDY_EMAIL,
    to: email,
    subject: subject,
    html: html,
  };

  try {
    const info = await mailer.sendMail(options);
    if (info) return otp;
    return false;
  } catch (err) {
    logger.error("🚀 ~ otpEmail ~ err:", err);
    throw err;
  }
};
