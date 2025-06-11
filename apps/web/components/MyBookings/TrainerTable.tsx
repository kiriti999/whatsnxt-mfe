import React from 'react';
import Link from 'next/link';
import styles from './my-bookings.module.css';
import { Anchor } from '@mantine/core';

function TrainerTable({ bookings = [], handleAccept, handleRejectClick }) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>SN</th>
          <th>Name</th>
          <th>Email</th>
          <th>Message</th>
          <th>Duration</th>
          <th>Course Link</th>
          <th>Date</th>
          <th>Amount</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {bookings.map((booking, i) => (
          <tr key={i}>
            <td data-label="SN">{i + 1}</td>
            <td data-label="Name">{booking.name}</td>
            <td data-label="Email">
              <Anchor href={`mailto:${booking.email}`}>{booking.email}</Anchor>
            </td>
            <td data-label="Message">{booking.message}</td>
            <td data-label="Duration">
              {booking.duration + ' ' + booking.durationType}
            </td>
            <td data-label="Course Link">
              <Link href={`/courses/${booking?.course_slug}`}>
                {booking?.course_slug}
              </Link>
            </td>
            <td data-label="Date">
              {new Date(booking.createdAt).toLocaleDateString()}
            </td>
            <td data-label="Amount">
              Rs.{' '}
              {booking?.trainerId?.rate *
                (booking.durationType === 'hours'
                  ? booking.duration
                  : booking.duration * 24)}
            </td>
            <td
              data-label="Status"
              className={
                booking.status === 'accepted' || booking.status === 'booked'
                  ? styles.success
                  : booking.status === 'cancelled' ||
                    booking.status === 'unavailable'
                    ? styles.failed
                    : styles.pending
              }
            >
              {booking.status}
            </td>
            {booking.status === 'pending' && (
              <td>
                <div className={styles.btns}>
                  <button
                    className="btn btn-danger"
                    onClick={(e) => handleRejectClick(e, i)}
                  >
                    Reject
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={(e) => handleAccept(e, i)}
                  >
                    Accept
                  </button>
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default TrainerTable;
