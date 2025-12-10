import React, { FC } from 'react';
import Link from 'next/link';
import { ActionIcon, Indicator, rem } from '@mantine/core';
import { IconShoppingCart } from '@tabler/icons-react';

type CartProps = {
  cartItems: any[];
  iconSize?: number | string;
  buttonSize?: string;
}

export const Cart: FC<CartProps> = ({ cartItems, iconSize = 24, buttonSize = "lg" }) => {
  return (
    <ActionIcon
      component={Link}
      href="/cart"
      variant="transparent"
      size={buttonSize}
      style={{
        color: 'var(--mantine-color-text)',
        overflow: 'visible'
      }}
    >
      <Indicator
        inline
        label={cartItems.length}
        size={16}
        offset={-4}
        color="red"
        radius="xl"
        disabled={cartItems.length === 0}
        styles={{ indicator: { padding: '0 6px' } }}
      >
        <IconShoppingCart stroke={1.5} style={{ width: rem(iconSize), height: rem(iconSize) }} />
      </Indicator>
    </ActionIcon>
  );
};
