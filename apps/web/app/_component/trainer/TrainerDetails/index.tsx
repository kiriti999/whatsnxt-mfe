'use client';

import { Image, Paper, Stack } from '@mantine/core';
import { Avatar, Box, Button, Container, Flex, Grid, Group, Modal, Text, Title } from "@mantine/core";
import { FullPageOverlay } from '@/components/Common/FullPageOverlay';
import { IconBrandDatabricks, IconBrandRedhat, IconCurrencyRupee, IconSchool, IconScreenShare } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import Sections from "./Sections";
import useTrainerContactedPayment from "../../../../hooks/useTrainerContactedPayment";
import useTrainerContactedRefund from '../../../../hooks/useTrainerContactedRefund';
import ContactDetailsModal from '../../../../components/Trainer/ContactDetailsModal';
import useAuth from '../../../../hooks/Authentication/useAuth';
import { trainerContactedPaymentAPI } from '../../../../apis/v1/trainer-contacted-payment';

const TrainerDetails = ({ trainer, courses }) => {
    const { _id: trainerId, name: trainerName, about, experience, contactsCount, skills, rate, languages, revealTrainerInfo } = trainer || {};
    const returnPath = `/trainer-details/${trainerId}`;

    const { user } = useAuth();
    const userId = user?._id;

    const { data, refetch: refetchGetPayment } = useQuery({
        queryKey: ['getPayment', trainerId],
        queryFn: async () => {
            const response = await trainerContactedPaymentAPI.getUserPayment(trainerId, userId);
            return response.data;
        },
    });

    const {
        isVisible,
        payNowModalOpened,
        setPayNowModalOpened,
        contactDetailsOpened,
        setContactDetailsOpened,
        handlePayment,
        hasPurchased,
        buyerEmail,
        refetchQuery,
    } = useTrainerContactedPayment(
        trainerId,
        returnPath,
        refetchGetPayment
    );

    const {
        handleRefund,
        isRefundLoading,
    } = useTrainerContactedRefund({
        trainerName,
        paymentId: data?.paymentId,
        buyerEmail,
        refetchQuery,
        setContactDetailsOpened
    });

    return (
        <Container>
            <FullPageOverlay visible={isVisible} />
            <Modal
                opened={payNowModalOpened}
                onClose={() => setPayNowModalOpened(false)} // Close modal when clicking outside or on close button
                title="Payment Required"
            >
                <Text>Make payment to reveal contact details</Text>
                <Button mt="md" fullWidth onClick={(e) => {
                    e.preventDefault();
                    handlePayment();
                }} >
                    Pay Now
                </Button>
            </Modal>
            <ContactDetailsModal
                contactDetailsOpened={contactDetailsOpened}
                setContactDetailsOpened={setContactDetailsOpened}
                // handleRefund={handleRefund}
                // isRefundLoading={isRefundLoading}
                // purchaseDate={data?.updatedAt}
                trainerName={trainerName}
                trainerEmail={trainer?.email}
                trainerPhone={trainer?.phone}
            />

            <Grid my={'6rem'}>
                <Grid.Col span={12}>
                    <Paper p="xl" radius="md" withBorder shadow="sm">
                        <Flex direction={{ base: 'column', sm: 'row' }} gap="xl" align={{ base: 'center', sm: 'flex-start' }}>
                            {/* Trainer Avatar/Image */}
                            <Box>
                                {trainer?.trainerProfilePhoto ? (
                                    <Image
                                        w={{ base: '6rem', sm: '8rem' }}
                                        h={{ base: '6rem', sm: '8rem' }}
                                        radius="md"
                                        src={trainer?.trainerProfilePhoto}
                                        alt={(trainerName)?.slice(0, 1)?.toUpperCase()}
                                        style={{
                                            border: '2px solid var(--mantine-color-gray-3)'
                                        }}
                                    />
                                ) : (
                                    <Avatar
                                        size="8rem"
                                        radius="md"
                                        color="cyan"
                                        style={{
                                            fontSize: '2.5rem',
                                            border: '2px solid var(--mantine-color-gray-3)'
                                        }}
                                    >
                                        {(trainerName)?.slice(0, 1)?.toUpperCase()}
                                    </Avatar>
                                )}
                            </Box>

                            {/* Trainer Info */}
                            <Box style={{ flex: 1, width: '100%' }}>
                                <Title mb="md" order={2} size="h3" fw={700}>
                                    {trainerName}
                                </Title>

                                <Grid gutter="md">
                                    <Grid.Col span={{ base: 12, md: 6 }}>
                                        <Stack gap="sm">
                                            <Flex align="center" gap="sm">
                                                <Box
                                                    style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '8px',
                                                        backgroundColor: 'var(--mantine-color-blue-0)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <IconScreenShare size={18} color="var(--mantine-color-blue-6)" />
                                                </Box>
                                                <Text size="sm" fw={500}>Online classes</Text>
                                            </Flex>

                                            {trainer?.highestQualification && (
                                                <Flex align="center" gap="sm">
                                                    <Box
                                                        style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            borderRadius: '8px',
                                                            backgroundColor: 'var(--mantine-color-blue-0)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        <IconBrandDatabricks size={18} color="var(--mantine-color-blue-6)" />
                                                    </Box>
                                                    <Text size="sm" fw={500}>{trainer.highestQualification}</Text>
                                                </Flex>
                                            )}

                                            <Flex align="center" gap="sm">
                                                <Box
                                                    style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '8px',
                                                        backgroundColor: 'var(--mantine-color-blue-0)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <IconBrandRedhat size={18} color="var(--mantine-color-blue-6)" />
                                                </Box>
                                                <Text size="sm" fw={500}>{experience} years of experience</Text>
                                            </Flex>
                                        </Stack>
                                    </Grid.Col>

                                    <Grid.Col span={{ base: 12, md: 6 }}>
                                        <Stack gap="sm">
                                            <Flex align="center" gap="sm">
                                                <Box
                                                    style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '8px',
                                                        backgroundColor: 'var(--mantine-color-blue-0)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <IconSchool size={18} color="var(--mantine-color-blue-6)" />
                                                </Box>
                                                <Text size="sm" fw={500}>{contactsCount} students contacted so far</Text>
                                            </Flex>

                                            {rate > 0 && (
                                                <Flex align="center" gap="sm">
                                                    <Box
                                                        style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            borderRadius: '8px',
                                                            backgroundColor: 'var(--mantine-color-blue-0)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        <IconCurrencyRupee size={18} color="var(--mantine-color-blue-6)" />
                                                    </Box>
                                                    <Text size="sm" fw={600} c="blue">{rate} per hour</Text>
                                                </Flex>
                                            )}
                                        </Stack>
                                    </Grid.Col>
                                </Grid>

                                {/* Contact Section */}
                                <Flex
                                    mt="xl"
                                    gap="md"
                                    align="center"
                                    direction={{ base: 'column', sm: 'row' }}
                                    justify={{ base: 'flex-start', sm: 'flex-start' }}
                                >
                                    <Group gap="md">
                                        {revealTrainerInfo === 'yes' && !hasPurchased ? (
                                            <>
                                                <Button
                                                    size='md'
                                                    variant="filled"
                                                    color="blue"
                                                    onClick={() => setPayNowModalOpened(true)}
                                                >
                                                    Contact trainer
                                                </Button>
                                                <Text size='sm' c="dimmed" fw={500}>Contact to Book a Free Demo Class</Text>
                                            </>
                                        ) : hasPurchased ? (
                                            <Button
                                                size='md'
                                                variant="filled"
                                                color="green"
                                                onClick={() => setContactDetailsOpened(true)}
                                            >
                                                View contact
                                            </Button>
                                        ) : null}
                                    </Group>
                                </Flex>
                            </Box>
                        </Flex>
                    </Paper>
                </Grid.Col>

                <Grid.Col span={12}>
                    <Sections skills={skills} about={about} languages={languages} courses={courses} certification={trainer?.certification} />
                </Grid.Col>
            </Grid>
        </Container>
    )
}

export default TrainerDetails;
