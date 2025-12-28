import React from 'react';
import { Container, Grid, Table, Title, Text, Box, Anchor, Divider, Group, GridCol } from '@mantine/core';

const ReceiptPage = () => {
    return (
        <Container>
            <Title order={1} mb="md">Receipt</Title>
            <Text size="sm" mb="xl">Receipt for Cart - Feb. 6, 2024</Text>

            {/* Company and Order Info */}
            <Grid mb="xl">
                <GridCol span={6}>
                    <Box>
                        <Title order={4}>Udemy India LLP</Title>
                        <Text size="sm">
                            10th Floor, ResCowork 07, Tower B, Unitech Cyber Park, Sector 39
                        </Text>
                        <Text size="sm">Gurgaon, Haryana, India, 122003</Text>
                        <Anchor href="https://www.udemy.com" size="sm">udemy.com</Anchor>
                    </Box>
                </GridCol>
                <GridCol span={6} style={{ textAlign: 'right' }}>
                    <Box>
                        <Text>Date: <strong>Feb. 6, 2024</strong></Text>
                        <Text>Order #: <strong>AD-6657476D596E4F6C6C616D4159513D3D</strong></Text>
                    </Box>
                </GridCol>
            </Grid>


            {/* Sold To */}
            <Box mb="xl">
                <Text fw={700}>Sold To:</Text>
                <Text>Komaragiri Komaragiri</Text>
            </Box>

            <Divider mb="md" />

            {/* Table for Items */}
            <Table striped highlightOnHover>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Ordered</th>
                        <th>Coupon Codes</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>React Development From Scratch | Learn By Building Projects</td>
                        <td>Feb. 6, 2024</td>
                        <td>ST11MT20624</td>
                        <td>1</td>
                        <td>₹449.00</td>
                        <td>₹449.00</td>
                    </tr>
                </tbody>
            </Table>

            <Divider my="md" />

            {/* Totals */}
            <Box style={{ textAlign: 'right' }} mb="xl">
                <Group align='baseline'>
                    <Text>Subtotal:</Text>
                    <Text fw={700}>₹380.51</Text>
                </Group>
                <Group align='baseline'>
                    <Text>Tax*:</Text>
                    <Text fw={700}>₹68.49</Text>
                </Group>
                <Group align='baseline'>
                    <Text>Total Paid:</Text>
                    <Text fw={700}>₹449.00</Text>
                </Group>
            </Box>

            <Text size="xs" mt="sm">
                If you have any questions about this receipt please contact our <Anchor href="/contact-us">support team</Anchor>.
            </Text>
        </Container>
    );
};

export default ReceiptPage;
