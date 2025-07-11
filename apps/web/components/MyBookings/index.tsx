"use client"

import React, { useEffect, useState } from 'react';
import styles from './my-bookings.module.css';
import { createPortal } from 'react-dom';
import { notifications } from '@mantine/notifications';
import TrainerTable from './TrainerTable';
import StudentTable from './StudentTable';
import { TrainerAPI } from '../../apis/v1/courses/trainer/trainer';
import { Box, Title } from '@mantine/core';


function MyBookings() {
  const [show, setShow] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('');
  const [bookings, setBookings] = useState([]);

  const handleRejectClick = (e, i) => {
    e.preventDefault();
    setShow(i);
  };

  const handleReject = async (e) => {
    e.preventDefault();
    const payload = {
      reason: reason,
      id: bookings[show]._id,
      request: 'unavailable',
    };
    try {
      await TrainerAPI.updateBooking(payload)
      setShow(null);
      fetchBookings();
      setReason('');
      notifications.show({
        position: 'bottom-right',
        title: 'Booking Rejected',
        message: 'Your booking has been rejected.',
        color: 'green'
      });
    } catch (e) {
      notifications.show({
        position: 'bottom-right',
        title: 'Booking Error',
        message: 'Something went wrong',
        color: 'red'
      });
    }
  };

  const handleAccept = async (e, i) => {
    e.preventDefault();
    const payload = {
      id: bookings[i]._id,
      request: 'accepted',
    };
    try {
      await TrainerAPI.updateBooking(payload)

      setShow(null);
      fetchBookings();
      notifications.show({
        position: 'bottom-right',
        title: 'Booking Accepted',
        message: 'Your booking has been accepted.',
        color: 'green'
      });
    } catch (e) {

      notifications.show({
        position: 'bottom-right',
        title: 'Booking Error',
        message: 'Something went wrong',
        color: 'red'
      })
    }
  };

  const handleCancel = async (e, i) => {
    e.preventDefault();
    const payload = {
      id: bookings[i]._id,
      request: 'cancelled',
      reason: reason,
    };
    try {
      await TrainerAPI.updateBooking(payload)

      setShow(null);
      fetchBookings();

      notifications.show({
        position: 'bottom-right',
        title: 'Booking Cancelled',
        message: 'Your booking has been cancelled.',
        color: 'green'
      });
    } catch (e) {
      notifications.show({
        position: 'bottom-right',
        title: 'Booking Error',
        message: 'Something went wrong',
        color: 'red'
      });
    }
  };

  const handleBooked = async (i, payment = true, amount) => {
    const payload = {
      id: bookings[i]._id,
      request: 'booked',
      payment,
      amount,
    };
    try {

      await TrainerAPI.updateBooking(payload)
      setShow(null);
      fetchBookings();

      notifications.show({
        position: 'bottom-right',
        title: 'Booking Success',
        message: 'Your booking has been booked.',
        color: 'green'
      });
    } catch (e) {
      notifications.show({
        position: 'bottom-right',
        title: 'Booking Error',
        message: 'Something went wrong',
        color: 'red'
      });
    }
  };

  const fetchBookings = async () => {
    try {
      const { data } = await TrainerAPI.getBooking()

      setType(data.type);
      setBookings(data.bookings);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.log(e);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className={styles.container}>
      {show != null &&
        createPortal(
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2>Reject Booking</h2>
              <p>Are you sure you want to reject this booking?</p>
              <select
                className="form-select"
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="">Select reason</option>
                <option value="Not Available">Not available</option>
                <option value="Spam">Spam</option>
                <option value="Inappropriate">Inappropriate</option>
                <option value="Other">Other</option>
              </select>
              <div className={styles.btns + ' mt-3'}>
                <button
                  className="btn btn-danger"
                  onClick={() => setShow(null)}
                >
                  Cancel
                </button>
                <button className="btn btn-success" onClick={handleReject}>
                  Confirm
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
      <div>
        <Title order={3} ta="center">My Bookings</Title>
        {bookings.length != 0 ? (
          <>
            {type === 'trainer' ? (
              <TrainerTable
                bookings={bookings}
                handleAccept={handleAccept}
                handleRejectClick={handleRejectClick}
              />
            ) : (
              <StudentTable
                bookings={bookings}
                handleBooked={handleBooked}
                handleCancel={handleCancel}
              />
            )}
          </>
        ) : loading ? (
          <Box ta={'center'}>loading...</Box>
        ) : (
          <Title ta={'center'} order={3}>No bookings found</Title>
        )}
      </div>
    </div>
  );
}

export default MyBookings;
