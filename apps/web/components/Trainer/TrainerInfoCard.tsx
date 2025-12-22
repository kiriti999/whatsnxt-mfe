'use client';

import React, { useState } from 'react'; // Import useState
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Avatar, Button, Text, Grid, Flex, HoverCard, Modal, LoadingOverlay, Box, Stack, Badge } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks'; // Import the hook
import { useQuery } from '@tanstack/react-query';
import { IconClockHour2 } from '@tabler/icons-react';
import useTrainerContactedPayment from '../../hooks/useTrainerContactedPayment';
import useTrainerContactedRefund from '../../hooks/useTrainerContactedRefund';
import ContactDetailsModal from './ContactDetailsModal';
import useAuth from '../../hooks/Authentication/useAuth';
import { trainerContactedPaymentAPI } from '../../apis/v1/trainer-contacted-payment';

export type TrainerType = {
  _id: string;
  image?: string;
  name: string;
  rating: number;
  phone: string;
  email: string;
  about?: string;
  skills?: string[];
  status: 'online' | 'offline';
  availability?: string;
  rate?: number;
  revealTrainerInfo?: 'yes' | 'no';
};

type TrainerInfoCardProps = {
  trainer: TrainerType;
  handleShowCourses: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleHireMeClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  showCourses: boolean;
  total: number;
};

const TrainerInfoCard: React.FC<TrainerInfoCardProps> = ({
  trainer,
  handleShowCourses,
  showCourses,
  handleHireMeClick,
  total,
}) => {
  console.log(trainer, 'trainer data');
  const isMobile = useMediaQuery('(max-width: 768px)'); // Determine if the screen is mobile
  const searchParams = useSearchParams();
  const trainerId = trainer?._id;
  const query = searchParams.get('query');
  const returnPath = `/search-trainer?query=${query}`;

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
    isRefundLoading
  } = useTrainerContactedRefund({
    trainerName: trainer?.name,
    paymentId: data?.paymentId,
    buyerEmail,
    refetchQuery,
    setContactDetailsOpened
  });

  return (
    <Box px={'md'}>
      <LoadingOverlay visible={isVisible} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      {/* Modal for payment message */}
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

      {/* Modal for trainer contact details */}
      <ContactDetailsModal
        contactDetailsOpened={contactDetailsOpened}
        setContactDetailsOpened={setContactDetailsOpened}
        // handleRefund={handleRefund}
        // isRefundLoading={isRefundLoading}
        // purchaseDate={data?.updatedAt}
        trainerName={trainer.name}
        trainerEmail={trainer.email}
        trainerPhone={trainer.phone}
      />

      <Grid gutter={0} justify='end'>
        <HoverCard width={280} shadow="md">
          <HoverCard.Target>
            <IconClockHour2 stroke={2} />
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <Text fw={500} size="sm">Trainer's availability</Text>
            <Text size="sm">
              {trainer.availability || 'Monday - Friday : 10AM - 5PM'}
            </Text>
          </HoverCard.Dropdown>
        </HoverCard>
      </Grid>

      <Grid align="stretch" justify="space-between" style={{ minWidth: '320px' }}>
        {/* Column 1 - Avatar, Name, and Buttons */}
        <Grid.Col span={{ base: 12, sm: 12, md: 4 }}>
          <Flex direction="column" gap="md">
            <Flex justify="start" gap="md" align="center" wrap="nowrap">
              <Avatar src={trainer.image} alt={trainer.name} size={80} radius="xl" />
              <div>
                <Text size="xl" fw={700} lh={1.2}>
                  {trainer.name}
                </Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  {Array(5)
                    .fill(null)
                    .map((_, i) => (
                      <span
                        key={i}
                        style={{
                          color: Math.ceil(trainer.rating) >= i + 1 ? '#FFD700' : 'var(--mantine-color-gray-3)',
                          fontSize: '14px'
                        }}
                      >
                        &#9733;
                      </span>
                    ))}
                  <Text size="xs" c="dimmed">({trainer.rating || 0})</Text>
                </div>
              </div>
            </Flex>

            <Stack gap="sm">
              <Button
                variant="light"
                color="indigo"
                onClick={handleShowCourses}
                fullWidth={isMobile}
                leftSection={showCourses ? null : <IconClockHour2 size={16} />} // Reuse icon or new one
              >
                {showCourses ? 'Hide Courses' : 'View Courses'}
              </Button>

              <Flex gap="sm" direction={isMobile ? 'column' : 'row'}>
                {/* Open modal when the Contact trainer button is clicked */}
                {trainer.revealTrainerInfo === 'yes' && !hasPurchased && (
                  <Button
                    variant="gradient"
                    gradient={{ from: 'blue', to: 'cyan' }}
                    fullWidth
                    onClick={() => {
                      setPayNowModalOpened(true);
                    }}
                  >
                    Contact
                  </Button>
                )}
                {hasPurchased && (
                  <Button
                    variant="gradient"
                    gradient={{ from: 'teal', to: 'green' }}
                    fullWidth
                    onClick={() => {
                      setContactDetailsOpened(true);
                    }}
                  >
                    View Contact
                  </Button>
                )}
                <Button variant="outline" color="gray" fullWidth style={{ borderColor: 'var(--mantine-color-gray-3)', color: 'var(--mantine-color-text)' }}>
                  &#8377; {trainer?.rate}/hr
                </Button>
              </Flex>
            </Stack>
          </Flex>
        </Grid.Col>

        {/* Column 2 - Experience & Skills */}
        <Grid.Col span={{ base: 12, sm: 12, md: 8 }}>
          <Box pl={{ md: 'xl' }} mt={{ base: 'md', md: 0 }}>
            <Flex justify="space-between" align="center" mb="sm">
              <Text fw={700} size="lg">
                Skills & Expertise
              </Text>
              <Link href={`/trainer-details/${trainer._id}`} style={{ textDecoration: 'none' }}>
                <Button variant="subtle" size="xs">View Profile &rarr;</Button>
              </Link>
            </Flex>

            {trainer?.skills.length > 0 && (
              <Flex gap="xs" wrap="wrap" mb="md">
                {trainer?.skills.map((skill: string, i: number) => (
                  <Badge key={i} variant="light" size="lg" radius="sm" color="indigo">
                    {skill}
                  </Badge>
                ))}
              </Flex>
            )}

            {trainer.about && (
              <Text c="dimmed" size="sm" lineClamp={3}>
                {trainer.about}
              </Text>
            )}
          </Box>
        </Grid.Col>
      </Grid>

    </Box>
  );
};

export default TrainerInfoCard;
