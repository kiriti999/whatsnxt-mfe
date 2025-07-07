import React from 'react';
import styles from './refund.module.css';
import { PageBanner } from '@whatsnxt/core-ui';

const RefundPolicy = () => {
  return (
    <>
      <div className="refund-policy-area pb-100 pt-20">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 col-md-12">
              <div className={styles['refund-policy-content']}>
                <p>
                  <i>This Refund Policy was last updated on July 6, 2025.</i>
                </p>

                <h3>1. Refund for Video Recorded Courses</h3>
                <blockquote className={styles['blockquote']}>
                  <p>
                    If you have purchased a video recorded course and are unsatisfied with it, you may request a refund within 30 days of purchase. Please note that after this 30-day period, refunds for video recorded courses will no longer be issued.
                  </p>
                </blockquote>

                <h3>2. Refund for Live Training Courses</h3>
                <p>
                  For live training courses, you must request a refund before attending the third session with the trainer. Refund requests after attending the third session will not be entertained. To initiate a refund, please contact us via email at <a href="mailto:info@whatsnxt.in">info@whatsnxt.in</a>.
                </p>

                <h3>3. How to Request a Refund</h3>
                <ol>
                  <li>Email us at <a href="mailto:info@whatsnxt.in">info@whatsnxt.in</a> with your order details and the reason for your refund request.</li>
                  <li>
                    For video recorded courses, the refund request must be made within 30 days of purchase.
                  </li>
                  <li>
                    For live training courses, the refund request must be made before attending the third session with the trainer.
                  </li>
                </ol>

                <h3>4. Refund Processing</h3>
                <p>
                  Refunds will be processed within 7-10 business days after the refund request has been approved. Refunds will be credited to the original payment method used at the time of purchase.
                </p>

                <h3>5. Exceptions to the Refund Policy</h3>
                <ul>
                  <li>Refunds will not be issued for courses that have been completed or for which certificates have been issued.</li>
                  <li>Refund requests made outside of the allowed timeframe (30 days for video courses, before the 3rd session for live training) will not be considered.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RefundPolicy;
