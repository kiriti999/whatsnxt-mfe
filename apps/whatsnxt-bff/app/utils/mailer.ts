import { nodeMailer } from "./nodeMailerConfig"; // Import your existing setup
import {
  purchaseConfirmationTemplate,
  contactUsTemplate,
  teacherApplyTemplate,
  courseReviewTemplate,
  refundContactDetailsTemplate,
  refundCourseTemplate,
} from "./mailTemplates";

const externalEmailProvider = process.env.EMAIL_MEDIUM === "1";
console.log("externalEmailProvider:", externalEmailProvider);

const mailer = {
  sendPurchaseMail: async function (params) {
    const {
      buyerName,
      buyerEmail,
      cartItems = [],
      amount,
      orderId,
      subject,
      itemName,
    } = params;
    const html = purchaseConfirmationTemplate({
      userName: buyerName,
      cartItems,
      amount,
      orderId,
      itemName,
    });

    if (externalEmailProvider) {
      // add other email provider to send mails
    } else {
      const mailOptions = {
        from: process.env.EMAIL,
        to: buyerEmail,
        subject,
        html,
      };

      return nodeMailer.sendMail(mailOptions);
    }
  },

  sendContactUsMail: async function (params) {
    const { name, email, number, subject, text } = params;
    const { html } = contactUsTemplate(name, email, number, subject, text);

    if (externalEmailProvider) {
      // add other email provider to send mails
    } else {
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject,
        html,
      };

      return nodeMailer.sendMail(mailOptions);
    }
  },

  sendTeacherApplyMail: async function (params) {
    const { teacherName, emails, subject } = params;
    const { html } = teacherApplyTemplate(teacherName, emails, subject);

    if (externalEmailProvider) {
      // add other email provider to send mails
    } else {
      const mailOptions = {
        from: process.env.EMAIL,
        to: [...emails],
        subject,
        html,
      };

      return nodeMailer.sendMail(mailOptions);
    }
  },

  sendCourseReviewMail: async function (params) {
    const { courseName, teacherName, emails, subject } = params;
    const { html } = courseReviewTemplate(
      courseName,
      teacherName,
      emails,
      subject,
    );

    if (externalEmailProvider) {
      // add other email provider to send mails
    } else {
      const mailOptions = {
        from: process.env.EMAIL,
        to: [...emails],
        subject,
        html,
      };

      return nodeMailer.sendMail(mailOptions);
    }
  },

  sendContactDetailsRefundMail: async function (params) {
    const { reason, trainerName, email, subject, amount } = params;

    // const title = 'Refund action';
    // const description = `Refund of ${trainerName} contact details has been made`;
    const { html } = refundContactDetailsTemplate(reason, trainerName, amount);

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject,
      html,
    };

    return nodeMailer.sendMail(mailOptions);
  },

  sendCourseRefundMail: async function (params) {
    const { reasons, message, courseName, email, subject, refundAmount } =
      params;
    const { html } = refundCourseTemplate(
      reasons,
      message,
      courseName,
      refundAmount,
    );

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject,
      html,
    };

    return nodeMailer.sendMail(mailOptions);
  },
};

export default mailer;
