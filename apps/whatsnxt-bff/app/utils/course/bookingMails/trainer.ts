const { nodeMailer } = require("../../nodeMailerConfig");

const pendingEmail = (data) => {
  const subject = "New request for booking";

  const html = `
    <p>Dear ${data.name}r,</p>
    <p>${data.studentName} submitted a request to hire you.</p>
    <p>Accept or Reject this request for further processing.</p>
    <p>
        <a href="${process.env.ROOT_URL}/my-bookings">Click here to accept or reject this request</a>
    </p>
    <p>Thank you</p>
    <p>Regards,</p>
    <p>Whatsnxt</p>
    `;

  return { subject, html };
};

const acceptedEmail = (data) => {
  const subject = "You've accepted a booking";

  const html = `
    <p>Dear ${data.name},</p>
    <p>You have accepted booking.</p>
    <p>You can contact to student after successful payment.</p>
    <p><a href="${process.env.ROOT_URL}/my-bookings">Click here to check status</a></p>
    <p>Thank you</p>
    <p>Regards,</p>
    <p>Whatsnxt</p>
    `;

  return { subject, html };
};

const rejectedEmail = (data) => {
  const subject = "You've rejected a booking";

  const html = `
    <p>Dear ${data.name},</p>
    <p>You have rejected a booking.</p>
    <p>Thank you</p>
    <p>Regards,</p>
    <p>Whatsnxt</p>
    `;

  return { subject, html };
};

const cancelledEmail = (data) => {
  const subject = "Booking is cancelled";

  const html = `
    <p>Dear ${data.name},</p>
    <p>A booking is cancelled.</p>
    <p><a href="${process.env.ROOT_URL}/my-bookings">Click here to view status</a></p>
    <p>Thank you</p>
    <p>Regards,</p>
    <p>Whatsnxt</p>
    `;

  return { subject, html };
};

const bookedEmail = (data) => {
  const subject = "Successfully booked";

  const html = `
    <p>Dear ${data.name},</p>
    <p>${data.studentName} booked a slot.</p>
    <p>Contact to ${data.studentName}.</p>
    <p><a href="${process.env.ROOT_URL}/my-bookings">Click here</a></p>
    <p>Thank you</p>
    <p>Regards,</p>
    <p>Whatsnxt</p>
    `;

  return { subject, html };
};

const generateEmails = {
  pending: pendingEmail,
  accepted: acceptedEmail,
  unavailable: rejectedEmail,
  cancelled: cancelledEmail,
  booked: bookedEmail,
};

const sendEmailToTrainer = async (data) => {
  const generatedEmail = generateEmails[data.status];
  const { subject, html } = generatedEmail(data);

  const options = {
    from: process.env.EMAIL,
    to: data.email,
    subject: subject,
    html: html,
  };

  await nodeMailer.sendMail(options);
};

export default sendEmailToTrainer;
