import React, { FC } from 'react';
import Link from 'next/link';
import { Anchor } from '@mantine/core';
import styles from './Cart.module.css';
import { IconShoppingCart } from '@tabler/icons-react';

type CartProps = {
  cartItems: any[]
}

export const Cart: FC<CartProps> = ({ cartItems }) => {
  return (
    <Anchor component={Link} href="/cart" className={styles['cart-container']}>
      <IconShoppingCart stroke={2} />
      <span className={styles['cart-item-count']}>{cartItems.length}</span>
    </Anchor>
  );
};
