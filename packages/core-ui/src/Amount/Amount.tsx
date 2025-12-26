import React, { FC } from 'react';
import styles from './Amount.module.css';
import { Title } from '@mantine/core';

type AmountProps = {
  amount: any
  discount?: any
}

export const Amount: FC<AmountProps> = ({ amount, discount }) => {
  const formattedAmount = discount > 0 ? (amount - (amount * discount) / 100) : amount
  return (
    <Title className={styles.amount} order={5}>
      ₹{formattedAmount}
    </Title>
  );
};
