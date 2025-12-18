import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import { mailData } from "./mailTemplates";

interface WorkerData {
  name?: string;
  email?: string;
  cartItems?: any;
  amount?: number;
  orderId?: string;
  subject: string;
  to: string;
  html: string;
}

interface MailParams {
  name?: string;
  email?: string;
  cartItems?: any;
  amount?: number;
  orderId?: string;
  subject: string;
  to: string;
  html: string;
}

interface WorkerMessage {
  success: boolean;
  response?: string;
  data?: any;
  error?: any;
}

if (!isMainThread) {
  const { mailer: nMailer } = require("../common/utils/mailer");

  try {
    const { name, email, cartItems, amount, orderId, subject, to, html } =
      workerData as WorkerData;

    // Determine the HTML content: use provided HTML or generate it from a template
    const resetData = {
      from: process.env.EMAIL,
      to: email || to,
      subject,
      html,
    };

    nMailer
      .sendMail(resetData)
      .then((res: any) =>
        parentPort?.postMessage({ success: true, response: res.response }),
      )
      .catch((error: any) =>
        parentPort?.postMessage({ success: false, error }),
      );
  } catch (error) {
    console.error("Unable to send purchase mail:: error:", error);
  }
} else {
  const mailer = {
    sendMail: async function (params: MailParams): Promise<any> {
      return new Promise((resolve, reject) => {
        const worker = new Worker(__filename, { workerData: params });
        worker.once("message", (message: WorkerMessage) => {
          if (message.success) {
            resolve(message.data || message.response);
          } else {
            reject(message.error);
          }
        });
        worker.once("error", reject);
      });
    },
  };

  module.exports = { mailer, mailData };
}
