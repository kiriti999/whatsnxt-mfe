import React, { FC } from 'react';
import styles from './CartItems.module.css';
import Link from 'next/link';
import { kConverter } from '@whatsnxt/core-util';
import { Anchor, Avatar, Box, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';

type CartItemsProps = {
  id: string
  courseName: string
  slug: string
  total_cost: any
  purchaseType: string
  image: any
  onRemove: any
}

export const CartItems: FC<CartItemsProps> = ({
  id,
  courseName,
  slug,
  total_cost,
  purchaseType,
  image,
  onRemove,
}) => {

  return (
    <tr>
      <td className={styles['product-thumbnail']}>
        <Anchor component={Link} href="#">
          <Avatar src={image} radius="sm" alt="cart item" />
        </Anchor>
      </td>

      <td className={styles['product-name']}>
        <Box w={200}>
          <Anchor component={Link} href={`/courses/${slug}`}>
            <Text truncate="end">{courseName}</Text>
          </Anchor>
        </Box>
      </td>

      <td className={styles['product-price']}>
        <Text>&#8377;{kConverter(total_cost)}</Text>
      </td>

      <td className={styles['product-name']}>
        <Text>{purchaseType}</Text>
      </td>

      <td className={`${styles['product-subtotal']} text`} id={id}>
        <IconTrash className={styles.cursor} size={20} onClick={() => onRemove(id)} />
      </td>
    </tr>
  );
};
