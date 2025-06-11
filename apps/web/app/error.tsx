'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import styles from './error.module.css';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={styles.container}>
      <h2>Oops! Something went wrong.</h2>
      {error.message && <p>Details: {error.message}</p>}
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
