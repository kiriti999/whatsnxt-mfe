"use client"

import React, { FC, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useDisclosure } from '@mantine/hooks';
import { Anchor, Box, Container, Divider, Flex, Group, Text, Title } from '@mantine/core';
import { FullPageOverlay } from '@/components/Common/FullPageOverlay';
import { PaymentButton } from '../paymentButton';
import { calculateCartTotal } from '../../../utils/calculateCartTotal';

// Import RTK actions and selectors
import { selectCartItems, resetCart, updateCart, addToCart } from '../../../store/slices/cartSlice'; // Adjust path as needed
import { CartAPI } from '../../../apis/v1/cart/cart';

export const UserCheckoutComponent: FC = () => {
  // Use RTK selector
  const cartItems = useSelector(selectCartItems) as any;
  const [cartAmount, setCartAmount] = useState(0);
  const dispatch = useDispatch();
  const [isVisible, { open, close }] = useDisclosure(false);
  const [hasSynced, setHasSynced] = useState(false);

  useEffect(() => {
    const syncCart = async () => {
      if (hasSynced) return;
      setHasSynced(true);

      try {
        const cartRes = await CartAPI.fetch();
        const localCarts = localStorage.getItem("cart");

        if (cartRes.cart) {
          dispatch(updateCart({
            cartItems: cartRes.cart.cartItems || [],
            discount: cartRes.cart.discount || 0
          }));

          if (localCarts) {
            const localCartObj = JSON.parse(localCarts) as { cartItems: any[] };
            localCartObj.cartItems.forEach(item => {
              const itemExists = cartRes.cart.cartItems.some(cartItem => item.id === cartItem.id);
              if (itemExists) return;

              const courseObj = {
                ...item,
                id: item.id.replace("price_", ""),
                price: item.total_cost || item.price || 0,
                quantity: item.quantity || 1
              };
              dispatch(addToCart(courseObj));
            });
          }
          return;
        }

        // If no server cart, create one and sync local items
        if (localCarts) {
          await CartAPI.createCart();
          const localCartObj = JSON.parse(localCarts) as { cartItems: any[] };
          localCartObj.cartItems.forEach(item => {
            const courseObj = {
              ...item,
              id: item.id.replace("price_", ""),
              price: item.total_cost || item.price || 0,
              quantity: item.quantity || 1
            };
            dispatch(addToCart(courseObj));
          });
        }
      } catch (error) {
        console.error("Failed to sync cart", error);
      }
    };

    syncCart();
  }, [dispatch, hasSynced]);

  useEffect(() => {
    const { cartTotal } = calculateCartTotal(cartItems);
    setCartAmount(cartTotal);
  }, [cartItems]);

  const onClearCart = () => {
    // Use RTK action creator
    dispatch(resetCart());
  };

  return (
    <>
      <FullPageOverlay visible={isVisible} />
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
                <Text m={0}>&#8377;{cart.total_cost || cart.price}</Text>
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
    </>
  );
};