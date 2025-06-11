import React, { FC } from 'react';
import styles from './ReviewForm.module.css';
import { Title } from '@mantine/core';

type ReviewFormProps = {
  // Define your component props here
  validationOptions: any
  register: any
}

export const ReviewForm: FC<ReviewFormProps> = ({ validationOptions, register }) => {

  return (
    <div className="mb-3">
      <label className="form-label">
        <Title order={4}>Why did you leave this rating?</Title>
      </label>
      <textarea
        className="form-control"
        {...register('review', validationOptions.review)}
        placeholder="Tell us about your own personal experience taking this course. Was it a good match for you?"
        rows="5"
      ></textarea>
      <button
        type="submit"
        className={`${styles['default-btn']} default-btn mt-20`}
      >
        Save and continue
      </button>
    </div>
  );
};
