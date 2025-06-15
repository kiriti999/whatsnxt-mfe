/* eslint-disable turbo/no-undeclared-env-vars */
import { useCallback, useState } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useRazorPayment } from '@whatsnxt/core-util/src/RazorPayment';
import { Anchor } from '@mantine/core';
import { TrainerAPI } from '../../api/v1/courses/trainer/trainer';
import styles from './my-bookings.module.css';

function CancelBookingModal({ onCancel, setReason }) {
  return createPortal(
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Cancel Booking</h2>
        <p>Are you sure you want to cancel this booking?</p>
        <select
          className="form-select"
          onChange={(e) => setReason(e.target.value)}
        >
          <option value="">Select reason</option>
          <option value="No more requirement">No more requirement</option>
          <option value="Booked mistakenly">Booked mistakenly</option>
          <option value="Too high cost">Too high cost</option>
          <option value="Other">Other</option>
        </select>
        <div className={styles.btns + ' mt-3'}>
          <button className="btn btn-danger" onClick={onCancel}>
            Close
          </button>
          <button className="btn btn-success" onClick={onCancel}>
            Cancel Booking
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function StudentTable({ bookings, handleBooked, handleCancel }) {
  const [showCancel, setShowCancel] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingIndex, setBookingIndex] = useState<number>();
  const [amount, setAmount] = useState(null);

  const processPayment = ({ paymentId, amount }) => {
    handleBooked(bookingIndex, paymentId, amount / 100);
  }

  // FIX: Destructure the object returned by useRazorPayment
  const { makePayment, isLoading: razorPayLoading, error: razorPayError } = useRazorPayment({
    processPayment
  });

  const handlePayment = useCallback(
    async (bookingIndex: number) => {
      setLoading(true);
      const booking = bookings[bookingIndex];

      try {
        const response = await TrainerAPI.checkout({ id: booking._id });
        const { data: order, success } = response;

        if (success) {
          setAmount(order.amount);

          // Create the payload that matches the Payload type
          const razorpayPayload = {
            name: 'Trainer hiring',
            description: 'Whatsnxt trainer hiring',
            amount: order.amount,
            prefill: {
              name: booking.name,
              email: booking.email,
              contact: booking.phone,
            }
          };

          // FIX: Call makePayment as a function
          makePayment(order.id, razorpayPayload, () => setLoading(false));
        }
      } catch (error) {
        console.error('Error during payment:', error);
        setLoading(false);
      }
    },
    [bookings, handleBooked, makePayment]
  );

  return (
    <>
      {showCancel !== null && (
        <CancelBookingModal
          onCancel={() => setShowCancel(null)}
          setReason={setReason}
        />
      )}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>SN</th>
            <th>Trainer Name</th>
            <th>Trainer Email</th>
            <th>Course Link</th>
            <th>Duration</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking, index: number) => (
            <tr key={index}>
              <td data-label="SN">{index + 1}</td>
              <td data-label="TrainerName">{booking.trainerId.name}</td>
              <td data-label="Trainer Email">
                <Anchor href={`mailto:${booking.trainerId.email}`}>
                  {booking.trainerId.email}
                </Anchor>
              </td>
              <td data-label="Course Link">
                <Link href={`/courses/${booking?.course_slug}`}>
                  {booking?.course_slug}
                </Link>
              </td>
              <td data-label="Duration">
                {booking.duration} {booking.durationType}
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
              {(booking.status === 'pending' || booking.status === 'accepted') && (
                <td>
                  <div className={styles.btns}>
                    <button
                      className="btn btn-danger"
                      onClick={() => setShowCancel(index)}
                    >
                      Cancel
                    </button>
                    {booking.status === 'accepted' && (
                      <button
                        className="btn btn-success"
                        disabled={loading || razorPayLoading}
                        onClick={(e) => {
                          e.preventDefault();
                          setBookingIndex(index);
                          handlePayment(index);
                        }}
                      >
                        {loading || razorPayLoading ? 'Processing...' : 'Book Now'}
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Optional: Display razor pay error if needed */}
      {razorPayError && (
        <div className="alert alert-danger mt-2">
          {razorPayError}
        </div>
      )}
    </>
  );
}

export default StudentTable;