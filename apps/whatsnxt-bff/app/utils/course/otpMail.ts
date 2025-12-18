import { nodeMailer } from "./nodeMailerConfig";

function generateOTP() {
  let otp = "";
  const digits = "0123456789";
  for (let i = 0; i < 6; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp.toString();
}

const otpEmail = async (name, email) => {
  const otp = generateOTP();

  const subject = "otp for signup";

  const html = `
    <p>Dear ${name},</p>
    <p>Thank you for signing up with our service! To complete your registration, please use the following one-time verification code:</p>
    <h2>${otp}</h2>
    <p>This code is valid for 10 minutes. Please enter it on the registration page to verify your email address.</p>
    <p>If you did not sign up for our service, please ignore this email.</p>
    <p>Thank you for choosing our service!</p>
    <p>Best regards,</p>
    <p>Whatsnxt</p>
    `;

  const options = {
    from: process.env.EMAIL,
    to: email,
    subject: subject,
    html: html,
  };

  const info = await nodeMailer.sendMail(options);
  if (info) return otp;
  return false;
};

export default otpEmail;
