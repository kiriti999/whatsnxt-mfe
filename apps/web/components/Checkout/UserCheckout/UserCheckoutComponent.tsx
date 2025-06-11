"use client"

import React, { FC, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useDisclosure } from '@mantine/hooks';
import { Anchor, Box, Container, Divider, Flex, Group, LoadingOverlay, Text, Title } from '@mantine/core';
import { PaymentButton } from '../paymentButton';
import { calculateCartTotal } from '../../../utils/calculateCartTotal';

export const UserCheckoutComponent: FC = () => {
  const cartItems = useSelector((state: any) => state.cart.cartItems);
  const [cartAmount, setCartAmount] = useState(0);
  const dispatch = useDispatch();
  const [isVisible, { open, close }] = useDisclosure(false);

  useEffect(() => {
    const { cartTotal } = calculateCartTotal(cartItems);
    setCartAmount(cartTotal);
  }, [cartItems]);

  const onClearCart = () => {
    dispatch({
      type: 'RESET_CART',
    });
  };

  return (
    <Box pos='relative'>
      <LoadingOverlay visible={isVisible} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

      <Container size={'lg'} className='ptb-80'>
        <Title order={3}>Your Order</Title>

        <Box>
          {/* Header */}
          <Flex mb="md" justify="space-between" align="center">
            <Text size="md" m={0}>
              Product Name
            </Text>
            <Text size="md" m={0}>
              Total
            </Text>
          </Flex>
          <Divider />

          {/* Cart Items */}
          {cartItems.length > 0 &&
            cartItems.map((cart) => (
              <Group key={cart.id} py="sm" justify='space-between'>
                <Anchor href="#" size="sm">
                  <Text size='md' m={0}>{cart.courseName}</Text>
                </Anchor>
                <Text m={0}>&#8377;{cart.total_cost}</Text>
              </Group>
            ))}

          <Divider />

          {/* Order Total */}
          <Flex mb="md" justify="space-between" align="center" mt={'xs'}>
            <Text>Order Total</Text>
            <Text>&#8377;{cartAmount}</Text>
          </Flex>
        </Box>

        <PaymentButton
          loading={false}
          amount={cartAmount.toString()}
          cartItems={cartItems}
          onClearCart={onClearCart}
          open={open}
          close={close}
        />
      </Container>
    </Box>
  );
};
