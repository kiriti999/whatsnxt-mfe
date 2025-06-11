import { Anchor, Box, Container, Divider, Grid, GridCol, Group, Table, Text, Title } from "@mantine/core";

const Invoice = ({ order }) => {
    const formatedDate = new Date(order.createdAt).toDateString();

    return (
        <>
            <Container mb={2}>
                <Title order={1} mb="md">Invoice</Title>
                <Text size="sm" mb="xl">Invoice for Cart - {formatedDate}</Text>

                {/* Company and Order Info */}
                <Grid mb="xl">
                    <GridCol span={6}>
                        <Box>
                            <Title order={4}>Whats Nxt</Title>
                            <Text size="sm">
                                Plot 14 1st floor Jupiter colony, Karkhana, Hyderabad, India
                            </Text>
                            <Anchor href="https://www.whatsnxt.in" size="sm">whatsnxt.in</Anchor>
                        </Box>
                    </GridCol>
                    <GridCol span={6} style={{ textAlign: 'right' }}>
                        <Box>
                            <Text>Date: <strong>{formatedDate}</strong></Text>
                            <Text>Order #: <strong>{order.orderId}</strong></Text>
                            <Text>Receipt #: <strong>{order.receipt}</strong></Text>
                            <Text>Currency: <strong>{order.currency}</strong></Text>
                        </Box>
                    </GridCol>
                </Grid>

                {/* Sold To */}
                <Box mb="xl">
                    <Text fw={700}>Sold To:</Text>
                    <Text>{order.buyer}</Text>
                </Box>

                <Divider mb="md" />
                {/* Table for Items */}
                <Table striped highlightOnHover>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Ordered</th>
                            {/* <th>Coupon Codes</th> */}
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{order.trainer} contacts</td>
                            <td>{formatedDate}</td>
                            {/* <td>ST11MT20624</td> */}
                            <td>1</td>
                            <td>₹{order.cost / 100}</td>
                            <td>₹{order.cost / 100}</td>
                        </tr>
                    </tbody>
                </Table>

                <Divider my="md" />
                {/* Totals */}
                <Box style={{ textAlign: 'right' }} mb="xl">
                    <Group align='baseline'>
                        <Text>Subtotal:</Text>
                        <Text fw={700}>₹{order.cost / 100}</Text>
                    </Group>
                    <Group align='baseline'>
                        <Text>Tax*:</Text>
                        <Text fw={700}>₹0</Text>
                    </Group>
                    <Group align='baseline'>
                        <Text>Total Paid:</Text>
                        <Text fw={700}>₹{order.cost / 100}</Text>
                    </Group>
                </Box>

                <Text size="xs" my='sm'>
                    If you have any questions about this invoice please contact our <Anchor href="/contact-us">support team</Anchor>.
                </Text>
            </Container>
        </>
    )
}

export default Invoice;
