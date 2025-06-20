'use client';

import { Image, Paper, Stack } from '@mantine/core';
import { Avatar, Box, Button, Container, Flex, Grid, Group, LoadingOverlay, Modal, Text, Title } from "@mantine/core";
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
            <LoadingOverlay visible={isVisible} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
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

            <Grid>
                <Grid.Col span={12}>
                    <Paper p="md" radius="md" withBorder>
                        <Flex direction={{ base: 'column', sm: 'row' }} gap="md" align={{ base: 'center', sm: 'flex-start' }}>
                            {/* Trainer Avatar/Image */}
                            <Box>
                                {trainer?.trainerProfilePhoto ? (
                                    <Image
                                        w={{ base: '5rem', sm: '7.5rem' }}
                                        h={{ base: '5rem', sm: '7.5rem' }}
                                        radius="md"
                                        src={trainer?.trainerProfilePhoto}
                                        alt={(trainerName)?.slice(0, 1)?.toUpperCase()}
                                    />
                                ) : (
                                    <Avatar
                                        radius="md"
                                        color="cyan"
                                    >
                                        {(trainerName)?.slice(0, 1)?.toUpperCase()}
                                    </Avatar>
                                )}
                            </Box>

                            {/* Trainer Info */}
                            <Box style={{ flex: 1 }}>
                                <Title mb="xs" order={3}>{trainerName}</Title>

                                <Grid>
                                    <Grid.Col span={{ base: 12, md: 6 }}>
                                        <Stack gap="xs">
                                            <Flex align="center" gap="xs">
                                                <IconScreenShare size={18} color="#228be6" />
                                                <Text size="sm">Online classes</Text>
                                            </Flex>

                                            {trainer?.highestQualification && (
                                                <Flex align="center" gap="xs">
                                                    <IconBrandDatabricks size={18} color="#228be6" />
                                                    <Text size="sm">{trainer.highestQualification}</Text>
                                                </Flex>
                                            )}

                                            <Flex align="center" gap="xs">
                                                <IconBrandRedhat size={18} color="#228be6" />
                                                <Text size="sm">{experience} years of experience</Text>
                                            </Flex>
                                        </Stack>
                                    </Grid.Col>

                                    <Grid.Col span={{ base: 12, md: 6 }}>
                                        <Stack gap="xs">
                                            <Flex align="center" gap="xs">
                                                <IconSchool size={18} color="#228be6" />
                                                <Text size="sm">{contactsCount} students contacted so far</Text>
                                            </Flex>

                                            {rate > 0 && (
                                                <Flex align="center" gap="xs">
                                                    <IconCurrencyRupee size={18} color="#228be6" />
                                                    <Text size="sm" fw={500}>{rate} per hour</Text>
                                                </Flex>
                                            )}
                                        </Stack>
                                    </Grid.Col>
                                </Grid>

                                {/* Contact Section */}
                                <Flex
                                    mt="md"
                                    gap="md"
                                    align="center"
                                    direction={{ base: 'column', sm: 'row' }}
                                    justify={{ base: 'flex-start', sm: 'space-between' }}
                                >
                                    <Group>
                                        {revealTrainerInfo === 'yes' && !hasPurchased ? (
                                            <>
                                                <Button
                                                    size='xs'
                                                    variant="filled"
                                                    color="blue"
                                                    onClick={() => setPayNowModalOpened(true)}
                                                >
                                                    Contact trainer
                                                </Button>
                                                <Text size='0.93rem'>Contact to Book a Free Demo Class</Text>
                                            </>
                                        ) : hasPurchased ? (
                                            <Button
                                                size='xs'
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
