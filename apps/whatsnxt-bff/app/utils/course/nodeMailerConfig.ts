const nodemailer = require("nodemailer");

const nodeMailer = nodemailer.createTransport({
  host: "smtpout.secureserver.net",
  pool: true,
  maxConnections: 5,
  connectionTimeout: 10000,
  rateLimit: true,
  secure: true,
  secureConnection: false,
  tls: {
    ciphers: "SSLv3",
  },
  requireTLS: true,
  port: 465,
  debug: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export { nodeMailer };
