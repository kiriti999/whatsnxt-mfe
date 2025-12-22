"use client";

import React, { FC, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from '../../store/hooks'; // Create this hook
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

// Import RTK actions and selectors
import {
  selectCartItems,
  removeFromCart,
  updateCart,
  updateCartOnServer  // <-- Add this import
} from '../../store/slices/cartSlice';

export const ShoppingCart: FC = () => {
  const [cartAmount, setCartAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const cartItems = useSelector(selectCartItems) as any;
  const dispatch = useAppDispatch(); // Use typed dispatch
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  useEffect(() => {
    const { cartTotal } = calculateCartTotal(cartItems);
    setCartAmount(cartTotal);
  }, [cartItems]);

  const handleRemove = async (cartId: string) => {
    // Remove item from local state
    dispatch(removeFromCart(cartId));

    // Sync with server
    try {
      const updatedItems = cartItems.filter((item: any) => item.id !== cartId);
      const cartData = {
        cartItems: updatedItems,
        discount: 0 // Get from state if needed
      };

      await dispatch(updateCartOnServer(cartData)).unwrap();
    } catch (error) {
      console.error('Failed to sync cart removal with server:', error);
    }
  };

  // Standard table view for cart items (desktop)
  const renderDesktopView = () => (
    <Paper withBorder radius="lg" p="md" style={{ overflow: 'hidden' }}>
      <ScrollArea>
        <Table
          striped
          highlightOnHover
          styles={{
            thead: {
              backgroundColor: 'var(--mantine-color-gray-0)',
            },
            th: {
              fontWeight: 600,
              fontSize: '0.9rem',
              color: 'var(--mantine-color-dark-6)',
              padding: '1rem'
            },
            td: {
              padding: '1rem'
            }
          }}
        >
          <thead>
            <tr>
              <th>Product</th>
              <th>Name</th>
              <th>Price</th>
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
    </Paper>
  );

  // Mobile view with vertical rows for each field
  const renderMobileView = () => (
    <>
      {cartItems.length > 0 ? (
        cartItems.map((cart) => (
          <Card key={cart.id} withBorder shadow="sm" radius="md" mb="md" p="md">
            {/* Row 2: Name */}
            <Flex mb="0">
              <Text fw={500} size="cm" w="40%" c="dimmed">Name:</Text>
              <Text fw={500} size="cm">{cart.courseName || cart.name || 'Product'}</Text>
            </Flex>

            {/* Row 3: Price */}
            <Flex mb="0">
              <Text fw={500} size="sm" w="40%" c="dimmed">Price:</Text>
              <Text fw={500} size="sm">₹{kConverter(cart.total_cost || cart.price || 0)}</Text>
            </Flex>

            {/* Row 4: Type */}
            {/* <Flex mb="0">
              <Text fw={500} size="sm" w="40%" c="dimmed">Type:</Text>
              <Text fw={500} size="cm">{cart.purchaseType || ''}</Text>
            </Flex> */}

            {/* Row 5: Action */}
            <Flex justify={'center'}>
              <Button
                variant="light"
                color="red"
                size="sm"
                leftSection={<IconTrash size={16} />}
                onClick={() => handleRemove(cart.id)}
              >
                Delete
              </Button>
            </Flex>
          </Card>
        ))
      ) : (
        <Paper
          p="xl"
          withBorder
          ta="center"
          radius="lg"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.02) 0%, rgba(6, 182, 212, 0.02) 100%)'
          }}
        >
          <Stack align="center" gap="md">
            <Box
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(6, 182, 212, 0.1))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <IconShoppingCart size={40} color="var(--mantine-color-gray-5)" />
            </Box>
            <div>
              <Text size="lg" fw={600} c="dark.4" mb="xs">Your cart is empty</Text>
              <Text size="sm" c="dimmed">Add some courses to get started!</Text>
            </div>
            <Button
              component={Link}
              href="/courses"
              variant="light"
              color="indigo"
              size="md"
              radius="md"
              mt="sm"
            >
              Browse Courses
            </Button>
          </Stack>
        </Paper>
      )}
    </>
  );

  const [cartData, setCartData] = useState([]);

  const compareItems = (apiData: any[]) => {
    try {
      const localCartData = JSON.parse(localStorage.getItem('cart') || '{"cartItems":[]}');
      const localCartItems = localCartData?.cartItems || [];

      if (localCartData) {
        const apiDataIds = apiData.map(item => item.id);
        const newLocalItems = localCartItems.filter(item => apiDataIds.includes(item.id));

        const updatedCartData = {
          cartItems: newLocalItems,
          discount: localCartData.discount || 0
        };

        dispatch(updateCart(updatedCartData));
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

            // Update Redux state
            dispatch(updateCart({ cartItems: [], discount: 0 }));
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
    if (cartItems !== undefined) {
      getCartData();
    }
  }, []);

  return (
    <Box pos='relative' my={'5rem'}>
      <LoadingOverlay visible={isLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      {!isLoading && (
        <Container size={isMobile ? "100%" : "xl"} px={isMobile ? "xs" : "md"} py="md">
          <Grid justify='center'>
            <Grid.Col span={{ base: 12, md: 8, lg: 7 }}>
              <form>
                {/* Enhanced Header with Icon */}
                <Flex align="center" gap="md" mb="xl">
                  <Box
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--mantine-color-indigo-6), var(--mantine-color-cyan-5))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)'
                    }}
                  >
                    <IconShoppingCart size={20} color="white" />
                  </Box>
                  <div>
                    <Title
                      order={4}
                      fw={800}
                      style={{
                        background: 'linear-gradient(135deg, var(--mantine-color-indigo-7) 0%, var(--mantine-color-cyan-6) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      Shopping Cart
                    </Title>
                    <Text c="dimmed" size="sm">
                      {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                    </Text>
                  </div>
                </Flex>

                <Box mt={isMobile ? "xs" : "md"}>
                  {isMobile ? renderMobileView() : renderDesktopView()}
                </Box>

                {cartAmount > 0 && (
                  <Card
                    mt={isMobile ? "md" : "xl"}
                    padding={isMobile ? "md" : "xl"}
                    shadow="lg"
                    withBorder
                    radius="lg"
                    style={{
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(6, 182, 212, 0.03) 100%)',
                      borderColor: 'var(--mantine-color-indigo-2)'
                    }}
                  >
                    <Stack align="center" gap={isMobile ? "sm" : "lg"}>
                      <Title
                        order={3}
                        fw={700}
                        style={{
                          color: 'var(--mantine-color-dark-7)'
                        }}
                      >
                        Cart Summary
                      </Title>

                      <Box
                        p="md"
                        style={{
                          background: 'white',
                          borderRadius: 'var(--mantine-radius-md)',
                          width: '100%',
                          maxWidth: 400
                        }}
                      >
                        <Flex justify="space-between" align="center" mb="xs">
                          <Text size="md" c="dimmed">Subtotal:</Text>
                          <Text size="md" fw={500}>₹{kConverter(cartAmount)}</Text>
                        </Flex>
                        <Flex justify="space-between" align="center" mb="md">
                          <Text size="md" c="dimmed">Tax:</Text>
                          <Text size="md" fw={500}>₹0</Text>
                        </Flex>
                        <Box
                          pt="md"
                          style={{
                            borderTop: '2px solid var(--mantine-color-gray-2)'
                          }}
                        >
                          <Flex justify="space-between" align="center">
                            <Text size="xl" fw={700}>Total:</Text>
                            <Text
                              size="xl"
                              fw={800}
                              style={{
                                background: 'linear-gradient(135deg, var(--mantine-color-indigo-6), var(--mantine-color-cyan-5))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                              }}
                            >
                              ₹{kConverter(cartAmount)}
                            </Text>
                          </Flex>
                        </Box>
                      </Box>

                      <Button
                        component={Link}
                        variant="gradient"
                        gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
                        size={"sm"}
                        fullWidth
                        radius="xl"
                        leftSection={<IconShoppingCart size={isMobile ? 18 : 22} />}
                        href="/checkout/user-checkout"
                      >
                        Proceed to Checkout →
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