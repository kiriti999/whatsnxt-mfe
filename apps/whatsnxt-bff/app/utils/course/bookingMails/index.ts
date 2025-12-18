const { nodeMailer } = require("../../nodeMailerConfig");

function generateCardsHTML(cards) {
  return cards
    .map(
      (card, i) =>
        `<a href="https://www.whatsnxt.in/search-trainer?query=${encodeURIComponent(card.name)}" key=${i} style="border: 1px solid #fff; border-radius: 5px; padding: 5px;">
            <img src="${card?.image || "https://www.whatsnxt.in/images/default-avatar.png"}" alt="${card.name}" width="100px"/>
            <p>${card.name}</p>
        </a>`,
    )
    .join("");
}

const sendEmailForBooking = async ({ status, cards = [], email, name }) => {
  let subject = "";
  let html = "";

  if (status === "sent") {
    subject = `${name} submitted a request to hire you.`;
    html = `
        <p>Dear Trainer,</p>
        <p>${name} submitted a request to hire you.</p>
        <p>Accept or Reject this request for further processing.</p>
        <p>
            <a href="${process.env.ROOT_URL}/my-bookings">Click here to accept or reject this request</a>
        </p>
        <p>Thank you</p>
        <p>Regards,</p>
        <p>Whatsnxt</p>
        `;
  }

  if (status === "accepted") {
    subject = `${name} accepted your request.`;
    html = `
        <p>Dear Student,</p>
        <p>Booking has been accepted. Trainer will contact you shortly, if you don't receive any communication from trainer  with in 1 hour from now. Please write to us at support@whatsnxt.in</p>
        <p>Book a time slot for further processing.</p>
        <p><a href="${process.env.ROOT_URL}/my-bookings">Click here to book</a></p>
        <p>Thank you</p>
        <p>Regards,</p>
        <p>Whatsnxt</p>
        `;
  }

  if (status === "booked") {
    subject = `${name} booked a slot.`;
    html = `
        <p>Dear Trainer,</p>
        <p>${name} booked a slot.</p>
        <p>Contact to ${name}.</p>
        <p><a href="${process.env.ROOT_URL}/my-bookings">Click here</a></p>
        <p>Thank you</p>
        <p>Regards,</p>
        <p>Whatsnxt</p>
        `;
  }

  if (status === "cancelled") {
    subject = `Booking cancelled.`;
    html = `
        <p>Dear Trainer,</p>
        <p>Booking is cancelled.</p>
        <p>Contact to ${name}.</p>
        <p><a href="${process.env.ROOT_URL}/my-bookings">Click here to view status</a></p>
        <p>Thank you</p>
        <p>Regards,</p>
        <p>Whatsnxt</p>
        `;
  }

  if (status === "rejected") {
    subject = `${name} rejected your booking.`;
    html = `
        <p>Dear Student,</p>
        <p>${name} rejected your booking.</p>
        <p>Trainer is currently not available.</p>
        <p>Here are the list of experienced trainers matching the requested skills</a>
        <div>
            ${generateCardsHTML(cards)};
        </div>
        <p><a href="https://whatsnxt.in/courses">view more trainers</a></p>
        <p>Thank you</p>
        <p>Regards,</p>
        <p>Whatsnxt</p>
        `;
  }

  if (status === "unavailable") {
    subject = `Trainer is currently not available.`;
    html = `
        <p>Dear Student,</p>
        <p>Trainer is currently not available.</p>
        <p>Here are the list of experienced trainers matching the requested skills</a>
        <div>
        ${generateCardsHTML(cards)};
        </div>
        <p><a href="https://whatsnxt.in/courses">view more trainers</a></p>
        <p>Thank you</p>
        <p>Regards,</p>
        <p>Whatsnxt</p>
        `;
  }

  const options = {
    from: process.env.EMAIL,
    to: email,
    subject: subject,
    html: html,
  };

  await nodeMailer.sendMail(options);
};

export default sendEmailForBooking;
