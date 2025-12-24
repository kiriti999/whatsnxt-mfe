import React, { FC } from 'react';
import styles from './CartItems.module.css';
import Link from 'next/link';
import { kConverter } from '@whatsnxt/core-util';
import { Anchor, Avatar, Box, Text, Table } from '@mantine/core';
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
    <Table.Tr>
      <Table.Td className={styles['product-thumbnail']}>
        <Anchor component={Link} href="#">
          <Avatar src={image} radius="sm" alt="cart item" />
        </Anchor>
      </Table.Td>

      <Table.Td className={styles['product-name']}>
        <Box w={200}>
          <Anchor component={Link} href={slug ? `/courses/${slug}` : '/courses'}>
            <Text truncate="end">{courseName}</Text>
          </Anchor>
        </Box>
      </Table.Td>

      <Table.Td className={styles['product-price']}>
        <Text>&#8377;{kConverter(total_cost)}</Text>
      </Table.Td>

      <Table.Td className={styles['product-name']}>
        <Text>{purchaseType}</Text>
      </Table.Td>

      <Table.Td className={`${styles['product-subtotal']} text`} id={id}>
        <IconTrash className={styles.cursor} size={20} onClick={() => onRemove(id)} />
      </Table.Td>
    </Table.Tr>
  );
};
