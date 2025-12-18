import { isMainThread, parentPort, workerData } from "worker_threads";
import mailer from "./mailer";

import path from "path";
import { Worker } from "worker_threads";

const createWorker = (type, params) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.resolve(__dirname, "./worker.js"), {
      workerData: { type, params },
    });

    worker.once("message", (message) => {
      if (message.success) {
        resolve(message.data);
      } else {
        reject(message.error);
      }
    });

    worker.once("error", reject);
  });
};

if (!isMainThread) {
  (async () => {
    try {
      const { type, params } = workerData;

      let result;
      switch (type) {
        case "purchaseMail":
          result = await mailer.sendPurchaseMail(params);
          break;
        case "contactMail":
          result = await mailer.sendContactUsMail(params);
          break;
        case "applyMail":
          result = await mailer.sendTeacherApplyMail(params);
          break;
        case "courseReviewMail":
          result = await mailer.sendCourseReviewMail(params);
          break;
        case "refundMail":
          result = await mailer.sendContactDetailsRefundMail(params);
          break;
        case "courseRefundMail":
          result = await mailer.sendCourseRefundMail(params);
          break;
        default:
          throw new Error(`Unknown mail type: ${type}`);
      }

      parentPort.postMessage({ success: true, data: result });
    } catch (error) {
      console.error("Worker error:", {
        error: error.message,
        stack: error.stack,
        code: error.code,
        errno: error.errno,
        syscall: error.syscall,
      });
      parentPort.postMessage({
        success: false,
        error: error.message || "An error occurred",
      });
    }
  })();
}

export default createWorker;
