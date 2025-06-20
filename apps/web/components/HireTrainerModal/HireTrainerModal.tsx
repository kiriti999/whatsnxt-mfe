import React, { FC, useEffect, useState } from 'react';
import styles from './HireTrainerModal.module.css';
import { notifications } from '@mantine/notifications';
import { Modal } from '@mantine/core';
import { TrainerAPI } from '../../apis/v1/courses/trainer/trainer';
import useAuth from '../../hooks/Authentication/useAuth';
// import { useQuery } from '@tanstack/react-query';
// import { ProfileAPI } from '../../apis/v1/user/profile';


type HireTrainerModalProps = {
  // Define your component props here
  opened: boolean;
  onClose: any
  author: string
  trainerId: string
  slug: string
}

export const HireTrainerModal: FC<HireTrainerModalProps> = ({ opened, onClose, author, trainerId, slug = '' }) => {
  const { token } = useAuth()
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTrainer, setSelectedTrainer] = useState(author) as any;
  const [active, setActive] = useState(0);
  const [type, setType] = useState('author');
  const [durationType, setDurationType] = useState('hours');
  const [duration, setDuration] = useState(1);
  const [terms, setTerms] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  // TODO: Enable after app router is created
  useEffect(() => {
    setName(user?.name)
    setEmail(user?.email)
  }, [user])

  const fetchTrainers = async () => {
    if (trainers.length) return;
    try {
      setLoading(true);
      const { data } = await TrainerAPI.getTrainers()
      setTrainers(data.trainers);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError('Failed to fetch trainers');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (type === 'trainer' && !selectedTrainer)
      return setError('Please select a trainer');
    if (!name) return setError('Name is required');
    if (!email) return setError('Email is required');
    if (!duration || duration < 1) return setError('Duration is required');
    if (!terms) return setError('Please accept terms and conditions');

    // Call API to submit the form
    const payload = {
      trainerId: selectedTrainer?._id || trainerId,
      name,
      email,
      message,
      duration,
      durationType,
      slug,
    };

    try {
      await TrainerAPI.hireTrainer(payload)

      onClose();
      setError(null);

      notifications.show({
        position: 'bottom-right',
        title: 'Hire Trainer',
        message: 'Your request has been submitted successfully.',
        color: 'green'
      });
    } catch (error) {
      notifications.show({
        position: 'bottom-right',
        title: 'Hire Trainer Error',
        message: 'Something went wrong.',
        color: 'red'
      });
      setError('Failed to submit the form');
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (type === 'trainer' && !selectedTrainer)
      return setError('Please select a trainer');
    if (!name) return setError('Name is required');
    if (!email) return setError('Email is required');
    setActive(1);
    setError(null);
  };

  return (
    <Modal opened={opened} onClose={onClose} className={styles.container} withCloseButton={false} classNames={{ content: styles.root }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div className={styles.close} onClick={onClose}>
          X
        </div>
        <h3>
          Hire a Trainer
        </h3>
        {error && <div className={styles.error}>{error}</div>}
        <fieldset className={active === 0 ? styles.active : ''}>
          {!trainerId && (
            <>
              <div className={styles.radioBtns}>
                <div>
                  <input
                    type="radio"
                    id="author"
                    name="trainer"
                    value="author"
                    defaultChecked
                    onChange={() => {
                      setType('author');
                      setSelectedTrainer(author);
                    }}
                  />
                  <label htmlFor="author">Hire original author</label>
                </div>
                <div>
                  <input
                    type="radio"
                    id="trainer"
                    name="trainer"
                    value="trainer"
                    onChange={() => {
                      setType('trainer');
                      setSelectedTrainer(null);
                      fetchTrainers();
                    }}
                  />
                  <label htmlFor="trainer">Hire experience trainer</label>
                </div>
              </div>
              {type === 'trainer' && (
                <div className={styles.formControl}>
                  <label htmlFor="trainer">Select Trainer</label>
                  <select
                    id="trainer"
                    onChange={(e) => {
                      setSelectedTrainer(
                        trainers.find(
                          (trainer) => trainer._id === e.target.value,
                        ),
                      );
                    }}
                  >
                    <option value="0">Select Trainer</option>
                    {loading && <option value="0">Loading...</option>}
                    {trainers.map((trainer, i) => (
                      <option key={i} value={trainer._id}>
                        {trainer.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}
          <div
            className={styles.formControl}
            style={{ display: token ? 'none' : 'block' }}
          >
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              placeholder="Your name"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div
            className={styles.formControl}
            style={{ display: token ? 'none' : 'block' }}
          >
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Your email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.formControl}>
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              placeholder="Your message"
              onChange={(e) => setMessage(e.target.value)}
              rows={token ? 5 : 2}
            ></textarea>
          </div>
          <div className={styles.submit}>
            <button type="button" onClick={handleNext}>
              Proceed Next
            </button>
          </div>
        </fieldset>
        <fieldset className={active === 1 ? styles.active : ''}>
          <div className={styles.formControl}>
            <label>How many hours/days you need support for?</label>
            <div className={styles.time_type}>
              <div className={durationType == 'hours' ? styles.active : ''}>
                <input
                  type="radio"
                  id="hours"
                  name="time"
                  value="hours"
                  defaultChecked
                  onChange={() => {
                    setDurationType('hours');
                  }}
                />
                <label htmlFor="hours">Hours</label>
              </div>
              <div className={durationType == 'days' ? styles.active : ''}>
                <input
                  type="radio"
                  id="days"
                  name="time"
                  value="days"
                  onChange={() => {
                    setDurationType('days');
                  }}
                />
                <label htmlFor="days">Days</label>
              </div>
            </div>
            <input
              type="number"
              placeholder={`How many ${durationType} you need support for. Minimum 1 ${durationType === 'hours' ? 'hour' : 'day'
                }`}
              value={duration}
              onChange={(e: any) => setDuration(e.target.value)}
            />
          </div>
          {duration && selectedTrainer && (
            <div>
              You will be charged Rs.{' '}
              {durationType === 'hours'
                ? (selectedTrainer?.rate || 200) * duration
                : (selectedTrainer?.rate || 200) * duration * 24}{' '}
              for {duration} {durationType}.
            </div>
          )}
          <div className={styles.terms}>
            <input
              type="checkbox"
              id="terms"
              onChange={(e) => {
                setTerms(e.target.checked);
              }}
              defaultChecked={terms}
            />
            <label htmlFor="terms">
              Your details such as email and name will be shared with the
              trainer.
            </label>
          </div>
          <div className={styles.submit}>
            <button
              type="button"
              onClick={() => {
                setActive(0);
              }}
            >
              Previous
            </button>
            <button type="submit" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
};
