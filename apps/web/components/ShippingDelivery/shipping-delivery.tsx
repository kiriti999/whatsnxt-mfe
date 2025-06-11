import React from 'react';
import styles from './shipping-delivery.module.css';
import { PageBanner } from '@whatsnxt/core-ui';

const ShippingDelivery = () => {
  return (
    <>
      <div className="terms-of-service-area pb-100 pt-20">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 col-md-12">
              <div className={styles['terms-of-service-content']}>
                <p>
                  <i>
                    This Information was last updated on January 1, 2024.
                  </i>
                </p>
                <h3>1. Shipping and Delivery</h3>
                <p>
                  As an online learning platform, all our courses and content are delivered digitally. There are no physical products to ship, and access to your purchased courses is provided instantly upon successful payment.
                </p>

                <h4>Instant Access Upon Purchase</h4>
                <p>
                  Once your payment is processed, you will receive immediate access to the courses and learning materials. This includes video content, downloadable resources, and any other educational materials offered as part of the course.
                </p>

                <h4>Delivery Methods</h4>
                <ul>
                  <li>
                    <strong>Video Streaming:</strong> Course materials are delivered through live or pre-recorded video content that can be streamed directly from our platform. You can access these videos on demand, at your own pace.
                  </li>
                  <li>
                    <strong>Downloadable Resources:</strong> Additional resources such as PDFs, exercise files, and other course materials may be available for download for offline access.
                  </li>
                </ul>

                <h4>Scheduled Live Courses</h4>
                <p>
                  For courses that include live sessions, you will receive scheduled times for these events, and they will be delivered through live-streaming. You will also receive notifications and calendar invites to remind you of upcoming sessions.
                </p>

                <h4>Confirmation and Setup</h4>
                <p>
                  Upon purchasing a course, you will receive a confirmation email with all the necessary information to access the course, including login credentials (if applicable), access instructions, and links to any resources required.
                </p>

                <h4>Access Duration</h4>
                <p>
                  Your access to the purchased course may vary depending on the terms of the course offering. Some courses may provide lifetime access, while others may be accessible for a limited time (e.g., 6 months or 1 year). Please refer to the specific course details for information on access duration.
                </p>

                <h4>Customer Support</h4>
                <p>
                  If you experience any issues accessing your course materials, our support team is available to assist you. This support includes troubleshooting issues such as broken links, missing resources, or any other technical difficulties.
                </p>

                <h4>Platform Updates and Notifications</h4>
                <p>
                  As part of our commitment to providing high-quality learning experiences, we may periodically update or add new materials to your purchased courses. You will be notified of any significant updates or additional resources that become available.
                </p>

                <h4>Returns or Refunds</h4>
                <p>
                  Since our courses are digital products delivered instantly, refunds are typically not offered once a course has been accessed. However, if there is an issue with the course content or delivery, you can reach out to our support team for assistance or resolution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShippingDelivery;
