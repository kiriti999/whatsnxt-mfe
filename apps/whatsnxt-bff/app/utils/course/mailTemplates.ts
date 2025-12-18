const applySlug = (str) => {
  // Step 1: Decode the string
  const decodedStr = decodeURIComponent(str.toLowerCase());

  // Step 2: Replace special characters (+, :, ., ?, etc.) and spaces with hyphens
  const slug = decodedStr
    .replace(/[\s+]+/g, "-") // Replace spaces and '+' with a single hyphen
    .replace(/[^\w-]+/g, "") // Remove any non-word characters (except hyphens)
    .replace(/\./g, "") // Remove any dots from the string
    .replace(/--+/g, "-") // Replace multiple hyphens with a single one
    .replace(/^-+|-+$/g, "") // Trim hyphens from the start and end
    .replace(/\?+$/, ""); // Remove trailing question marks (?)

  return slug;
};

//Access environment variables
const envVars = process.env;

const getWelcomeSection = (userName, itemName) => {
  let info = "";
  if (!!userName && itemName === "courses") {
    info += ` <tr>
                <td style="padding: 20px; text-align: center; background-color: #ffffff;">
                    <h1 style="font-size: 24px; color: #333;">Welcome Aboard, ${userName}!</h1>
                    <a 
                        href="https://www.whatsnxt.in/my-courses"
                        style="display: inline-block; padding: 10px 15px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; margin-top: 20px;">
                            Access Course
                    </a>
                </td>
            </tr>`;
  }

  return info;
};

const courseInfo = (cartItems) => {
  let info = "";
  for (let index = 0; index < cartItems.length; index++) {
    const item = cartItems[index];
    const courseName = item.courseName;
    const slug = applySlug(courseName);

    if (item.id.includes("live")) {
      info += `<tr>
                    <td width="75%" align="left"
                        style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;">
                        <b>Live training:</b> <span>${courseName} (${item.quantity})</span>
                        <p>Our team will share the live training dates and meeting link soon</p>
                    </td>
                    <td width="25%" align="right"
                        style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;">
                        ₹ ${item.total_cost}
                    </td>
                </tr>`;
    }

    if (item.id.includes("courses")) {
      info += `<tr>
                    <td width="75%" align="left"
                        style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;">
                        <b>Course videos:</b> <span>${courseName} (${item.quantity})</span><br>
                    </td>
                    <td width="25%" align="right"
                        style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;">
                        ₹ ${item.total_cost}
                    </td>
                </tr>`;
    }

    info += `<tr>
            <td width="75%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;">
                <b>Course link:</b> <a href="https://www.whatsnxt.in/courses/${slug}">${courseName}</a>
            </td>
        </tr>`;
  }

  return info;
};

const displayReason = (reasons, message = "") => {
  let reason = message;
  if (!message) {
    reasons.forEach((item, i) =>
      i !== reasons.length - 1 ? (reason += `${item}, `) : (reason += item),
    );
  }
  return `<p>Reason: ${reason}</p>`;
};

const mailData = {
  Destination: {
    CcAddresses: [envVars.EMAIL],
    ToAddresses: [],
  },
  Message: {
    Body: {
      Html: {
        Charset: "UTF-8",
        Data: "HTML_FORMAT_BODY",
      },
      Text: {
        Charset: "UTF-8",
        Data: "TEXT_FORMAT_BODY",
      },
    },
    Subject: {
      Charset: "UTF-8",
      Data: "Test email",
    },
  },
  Source: envVars.EMAIL,
  ReplyToAddresses: [envVars.EMAIL],
};

const logo = `<tr>
    <td align="center" valign="top" style="font-size:0; padding: 35px;" bgcolor="#F44336">
        <div
            style="display:inline-block; max-width:50%; min-width:100px; vertical-align:top; width:100%;">
            <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%"
                style="max-width:300px;">
                <tr>
                    <td align="left" valign="top"
                        style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 36px; font-weight: 800; line-height: 48px;"
                        class="mobile-center">
                        <h1
                            style="font-size: 36px; font-weight: 800; margin: 0; color: #ffffff;">
                            Whatsnxt</h1>
                    </td>
                </tr>
            </table>
        </div>
        <div style="display:inline-block; max-width:50%; min-width:100px; vertical-align:top; width:100%;"
            class="mobile-hide">
        </div>
    </td>
</tr>`;

function purchaseConfirmationTemplate({
  userName,
  cartItems = [],
  amount,
  orderId,
  itemName = "",
  title = "Purchase confirmation",
  description = `Thank you for purchasing the ${itemName}. We hope you enjoy it!`,
}) {
  return `<!doctype html>
    <html>
    
    <head>
        <meta charset='utf-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1'>
        <title>Whatsnxt Edu</title>
        <link href='https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css' rel='stylesheet'>
        <link href='#' rel='stylesheet'>
        <style>
            ::-webkit-scrollbar {
                width: 8px;
            }
    
            /* Track */
            ::-webkit-scrollbar-track {
                background: #f1f1f1;
            }
    
            /* Handle */
            ::-webkit-scrollbar-thumb {
                background: #888;
            }
    
            /* Handle on hover */
            ::-webkit-scrollbar-thumb:hover {
                background: #555;
            }
    
            #
        </style>
    </head>
    
    <body className='snippet-body'>
        <!DOCTYPE html>
        <html>
    
        <head>
            <title></title>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <style type="text/css">
                body,
                table,
                td,
                a {
                    -webkit-text-size-adjust: 100%;
                    -ms-text-size-adjust: 100%;
                }
    
                table,
                td {
                    mso-table-lspace: 0pt;
                    mso-table-rspace: 0pt;
                }
    
                img {
                    -ms-interpolation-mode: bicubic;
                }
    
                img {
                    border: 0;
                    height: auto;
                    line-height: 100%;
                    outline: none;
                    text-decoration: none;
                }
    
                table {
                    border-collapse: collapse !important;
                }
    
                body {
                    height: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    width: 100% !important;
                }
    
    
                a[x-apple-data-detectors] {
                    color: inherit !important;
                    text-decoration: none !important;
                    font-size: inherit !important;
                    font-family: inherit !important;
                    font-weight: inherit !important;
                    line-height: inherit !important;
                }
    
                @media screen and (max-width: 480px) {
                    .mobile-hide {
                        display: none !important;
                    }
    
                    .mobile-center {
                        text-align: center !important;
                    }
                }
    
                div[style*="margin: 16px 0;"] {
                    margin: 0 !important;
                }
            </style>
    
        <body style="margin: 0 !important; padding: 0 !important; background-color: #eeeeee;" bgcolor="#eeeeee">
            <div
                style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: Open Sans, Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
                For what reason would it be advisable for me to think about business content? That might be little bit risky
                to have crew member like them.
            </div>
    
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                    <td align="center" style="background-color: #eeeeee;" bgcolor="#eeeeee">
    
                        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%"
                            style="max-width:600px;">
                            ${logo}
                            <tr>
                                <td align="center" style="padding: 35px 35px 20px 35px; background-color: #ffffff;"
                                    bgcolor="#ffffff">
                                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%"
                                        style="max-width:600px;">
                                        <tr>
                                            <td align="center"
                                                style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 25px;">
                                                <img 
                                                    src="https://ik.imagekit.io/kiriti369/whatsnxt-courses/checked-checkbox.svg" 
                                                    alt="Checkbox Icon" 
                                                    width="125" 
                                                    height="120" 
                                                    style="display: block; border: 0;" 
                                                    />
                                                    <br>
                                                <h2
                                                    style="font-size: 30px; font-weight: 800; line-height: 36px; color: #333333; margin: 0;">
                                                    ${title}
                                                </h2>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="center"
                                                style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 10px;">
                                                <p
                                                    style="font-size: 16px; font-weight: 400; line-height: 24px; color: #777777;">
                                                    ${description}
                                                </p>
                                            </td>
                                        </tr>
                                        ${getWelcomeSection(userName, itemName)}
                                        <tr>
                                            <td align="left" style="padding-top: 20px;">
                                                <table cellspacing="0" cellpadding="0" border="0" width="100%">
                                                    <tr>
                                                        <td width="75%" align="left" bgcolor="#eeeeee"
                                                            style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;">
                                                            Order Confirmation #
                                                        </td>
                                                        <td width="25%" align="right" bgcolor="#eeeeee"
                                                            style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;">
                                                            ${orderId}
                                                        </td>
                                                    </tr>
                                                    ${courseInfo(cartItems)}
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="left" style="padding-top: 20px;">
                                                <table cellspacing="0" cellpadding="0" border="0" width="100%">
                                                    <tr>
                                                        <td width="75%" align="left"
                                                            style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px; border-top: 3px solid #eeeeee; border-bottom: 3px solid #eeeeee;">
                                                            TOTAL
                                                        </td>
                                                        <td width="25%" align="right"
                                                            style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px; border-top: 3px solid #eeeeee; border-bottom: 3px solid #eeeeee;">
                                                            ₹ ${amount / 100}
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
    
                                </td>
                            </tr>
                            <tr>
                                <td align="center" height="100%" valign="top" width="100%"
                                    style="padding: 0 35px 35px 35px; background-color: #ffffff;" bgcolor="#ffffff">
                                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%"
                                        style="max-width:660px;">
                                        <tr>
                                            <td align="left"
                                                style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 10px;">
                                                <p
                                                    style="font-size: 16px; font-weight: 400; line-height: 24px; color: #777777;">
                                                    If you have any questions or need assistance, please don't hesitate to
    
                                                    <a href="https://www.whatsnxt.in/contact">contact us</a>
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
    
        </body>
    
        </html>
    
        <script type='text/javascript'
            src='https://stackpath.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.bundle.min.js'></script>
        <script type='text/javascript' src='#'></script>
        <script type='text/javascript' src='#'></script>
        <script type='text/javascript' src='#'></script>
        <script type='text/javascript'>#</script>
        <script type='text/javascript'>var myLink = document.querySelector('a[href="#"]');
            myLink.addEventListener('click', function (e) {
                e.preventDefault();
            });</script>
    
    </body>
    
    </html>`;
}

function contactUsTemplate(name, email, number, subject, text) {
  const mailData = {
    from: envVars.EMAIL,
    to: email,
    cc: envVars.EMAIL,
    subject: subject,
    html: `
        <p>Dear support team,</p>
        <p>Message: ${text}</p>
        <p>You can mail me on: ${email}</p>
        <p>My mobile number: ${number}</p>
        <p>Regards,</p>
        <p>${name}</p>
      `,
  };

  return mailData;
}

function teacherApplyTemplate(name, emails, subject) {
  const mailData = {
    from: envVars.EMAIL,
    to: [...emails],
    subject,
    html: `
        <p>${name} has applied as trainer</p>
        <p>Make actions by following the link: </p><a href="${process.env.ROOT_URL}/admin">here</a>
      `,
  };
  return mailData;
}

function courseReviewTemplate(course, trainer, emails, subject) {
  const mailData = {
    from: envVars.EMAIL,
    to: [...emails],
    subject,
    html: `
        <p>Trainer: ${trainer}</p>
        <p>${course} is pending review</p>
        <p>Review the course by following the link: </p><a href="${process.env.ROOT_URL}/admin/course-review-request">here</a>
      `,
  };
  return mailData;
}

function refundContactDetailsTemplate(reason, trainer, amount) {
  const mailData = {
    html: `
        <body>
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
            ${logo}
            </table>
            <p>Title: Refund of '${trainer}' contact details has been made</p>
            <p>Reason: ${reason}</p>
            <p>Amount refunded: ₹ ${amount / 100}</p>
        </body >
        `,
  };
  return mailData;
}

function refundCourseTemplate(reasons, message, courseName, refundAmount) {
  const mailData = {
    html: `
        <body>
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
            ${logo}
            </table>
            <p>Title: Refund of '${courseName}' course has been made</p>
            <p>Refund amount: ₹ ${refundAmount / 100}</p>
             ${displayReason(reasons, message)}
        </body >
    `,
  };
  return mailData;
}

export {
  contactUsTemplate,
  purchaseConfirmationTemplate,
  teacherApplyTemplate,
  courseReviewTemplate,
  refundContactDetailsTemplate,
  refundCourseTemplate,
  mailData,
};
