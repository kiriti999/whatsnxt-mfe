"use client";

import React, { FC, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Table,
  Container,
  Title,
  Stack,
  Box,
  Text,
  Card,
  Grid,
  LoadingOverlay,
  ScrollArea,
  Flex,
  useMantineTheme,
  Paper,
} from "@mantine/core";
import { IconShoppingCart, IconTrash } from "@tabler/icons-react";
import { CartItems } from "../CartItems/CartItems";
import { calculateCartTotal } from "../../utils/calculateCartTotal";
import { kConverter } from "@whatsnxt/core-util";
import Link from 'next/link';
import { CartAPI } from '../../apis/v1/cart/cart';
import { useMediaQuery } from '@mantine/hooks';

export const ShoppingCart: FC = () => {
  const [cartAmount, setCartAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const cartItems = useSelector((state: any) => state.cart.cartItems) as any[];
  const dispatch = useDispatch();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  useEffect(() => {
    const { cartTotal } = calculateCartTotal(cartItems) as any;
    setCartAmount(cartTotal);
  }, [cartItems]);

  const handleRemove = (cartId) => {
    dispatch({
      type: "REMOVE_CART",
      id: cartId,
    });
  };

  // Standard table view for cart items (desktop)
  const renderDesktopView = () => (
    <ScrollArea>
      <Table striped highlightOnHover>
        <thead>
          <tr>
            <th>Product</th>
            <th>Name</th>
            <th>Price</th>
            <th>Type</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.length > 0 ? (
            cartItems.map((cart) => (
              <CartItems
                key={cart.id}
                {...cart}
                onRemove={() => handleRemove(cart.id)}
              />
            ))
          ) : (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>
                Empty
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </ScrollArea>
  );

  // Mobile view with vertical rows for each field
  const renderMobileView = () => (
    <>
      {cartItems.length > 0 ? (
        cartItems.map((cart) => (
          <Card key={cart.id} withBorder shadow="sm" radius="md" mb="md" p="md">
            {/* Row 2: Name */}
            <Flex mb="0">
              <Text fw={500} size="sm" w="40%" c="dimmed">Name:</Text>
              <Text>{cart.name || 'Product'}</Text>
            </Flex>

            {/* Row 3: Price */}
            <Flex mb="0">
              <Text fw={500} size="sm" w="40%" c="dimmed">Price:</Text>
              <Text fw={500} size="sm">₹{kConverter(cart.total_cost || 0)}</Text>
            </Flex>

            {/* Row 4: Type */}
            <Flex mb="0">
              <Text fw={500} size="sm" w="40%" c="dimmed">Type:</Text>
              <Text>{cart.purchaseType || ''}</Text>
            </Flex>

            {/* Row 5: Action */}
            <Flex justify={'center'}>
              <Button
                variant="light"
                color="red"
                size="xs"
                leftSection={<IconTrash size={16} />}
                onClick={() => handleRemove(cart.id)}
              >
                Delete
              </Button>
            </Flex>
          </Card>
        ))
      ) : (
        <Paper p="md" withBorder ta="center">
          <Text c="dimmed">Your cart is empty</Text>
        </Paper>
      )}
    </>
  );

  const [cartData, setCartData] = useState([]);

  const compareItems = (apiData) => {
    try {
      const localCartData = JSON.parse(localStorage.getItem('cart') || '{"cartItems":[]}');
      const localCartItems = localCartData?.cartItems || [];
      if (localCartData) {
        const apiDataIds = apiData.map(item => item.id);
        const newLocalItems = localCartItems.filter(item => apiDataIds.includes(item.id));
        localCartData.cartItems = newLocalItems;
        dispatch({ type: 'UPDATE_CART', data: localCartData });
      }
    } catch (error) {
      console.log("Error comparing items:", error.message);
    }
  }

  const getCartData = async () => {
    try {
      await CartAPI.fetch().then((res) => {
        if (res?.cart?.cartItems) {
          setCartData(res?.cart?.cartItems);
          compareItems(res?.cart?.cartItems);
        } else {
          try {
            const localCartData = JSON.parse(localStorage.getItem('cart') || '{"cartItems":[]}');
            localCartData.cartItems = [];
            localStorage.setItem('cart', JSON.stringify(localCartData));
          } catch (error) {
            console.log("Error updating local cart:", error.message);
          }
        }
      })
    } catch (error) {
      console.log("Error fetching shopping cart:", error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (cartItems) {
      getCartData();
    }
  }, []);

  return (
    <Box pos='relative'>
      <LoadingOverlay visible={isLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      {!isLoading && (
        <Container size={isMobile ? "100%" : "xl"} px={isMobile ? "xs" : "md"} py="md">
          <Grid justify='center'>
            <Grid.Col span={{ base: 12, md: 8, lg: 7 }}>
              <form>
                <Title order={2} mb={isMobile ? "sm" : "md"} size={isMobile ? "h3" : "h2"}>
                  Shopping Cart
                </Title>

                <Box mt={isMobile ? "xs" : "md"}>
                  {isMobile ? renderMobileView() : renderDesktopView()}
                </Box>

                {cartAmount > 0 && (
                  <Card mt={isMobile ? "md" : "xl"} padding={isMobile ? "sm" : "lg"} shadow="sm" withBorder>
                    <Stack align="center" gap={isMobile ? "xs" : "md"}>
                      <Title order={isMobile ? 4 : 3}>Cart Totals</Title>
                      <Text fw={500} size={isMobile ? "md" : "xl"}>
                        Total: <strong>₹{kConverter(cartAmount)}</strong>
                      </Text>
                      <Button
                        component={Link}
                        color="red"
                        c="white"
                        variant="filled"
                        size={isMobile ? "sm" : "md"}
                        fullWidth={isMobile}
                        leftSection={<IconShoppingCart size={isMobile ? 16 : 21} />}
                        href="/checkout/user-checkout"
                      >
                        Proceed to Checkout
                      </Button>
                    </Stack>
                  </Card>
                )}
              </form>
            </Grid.Col>
          </Grid>
        </Container>
      )}
    </Box>
  );
};