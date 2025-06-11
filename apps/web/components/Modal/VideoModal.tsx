import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './VideoModal.module.css';
import { HireTrainerModal } from '../HireTrainerModal';

function VideoModal({ url, showHireBtn, onClose, author, course_slug }) {
  const [showModal, setShowModal] = useState(false);
  return (
    <div className={styles.container}>
      {showModal &&
        createPortal(
          <HireTrainerModal
            onClose={() => setShowModal(false)}
            author={author}
            slug={course_slug}
            trainerId={undefined} opened={false} />,
          document.body,
        )}
      <div className={styles.video_container}>
        <button onClick={onClose} className={styles.close}>
          X
        </button>
        <iframe src={url} />
        {showHireBtn && (
          <div className={styles.hireBtn}>
            <button onClick={() => setShowModal(true)}>
              Still have questions? Book a trainer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoModal;
