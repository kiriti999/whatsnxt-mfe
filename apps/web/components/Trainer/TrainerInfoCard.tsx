'use client';

import React, { useState } from 'react'; // Import useState
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Avatar, Button, Text, Grid, Flex, HoverCard, Modal, LoadingOverlay, Input, Box } from '@mantine/core';
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
        <Grid.Col span={{ base: 12, sm: 12, md: 4 }} style={{ display: 'flex', flexDirection: 'column' }}>
          <Flex justify="start" gap="lg" wrap="nowrap">
            <Avatar src={trainer.image} alt="no image here" size="xl" />
            <div style={{ marginLeft: '20px' }}>
              <Text size="lg" fw={700}>
                {trainer.name}
              </Text>
              <div>
                {Array(5)
                  .fill(null)
                  .map((_, i) => (
                    <span
                      key={i}
                      style={{
                        color: Math.ceil(trainer.rating) >= i + 1 ? 'rgb(255, 215, 0)' : 'black',
                      }}
                    >
                      &#9733;
                    </span>
                  ))}
              </div>
            </div>
          </Flex>

          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Button color="red" variant="outline" onClick={handleShowCourses} fullWidth={isMobile}>
              View Courses {showCourses ? '-' : '+'}
            </Button>
            <Flex justify="space-between" gap="md" wrap={isMobile ? 'wrap' : 'nowrap'}>
              {/* Open modal when the Contact trainer button is clicked */}
              {trainer.revealTrainerInfo === 'yes' && !hasPurchased && (
                <Button
                  variant="outline"
                  color="blue"
                  fullWidth={true}
                  onClick={() => {
                    setPayNowModalOpened(true);
                  }}
                >
                  Contact trainer
                </Button>
              )}
              {hasPurchased && (
                <Button
                  variant="outline"
                  color="blue"
                  fullWidth={true}
                  onClick={() => {
                    setContactDetailsOpened(true);
                  }}
                >
                  View contact
                </Button>
              )}
              <Button variant="outline" color="red" fullWidth={true}>
                &#8377; {trainer?.rate}/hr
              </Button>
            </Flex>

          </div>
        </Grid.Col>

        {/* Column 2 - Experience & Skills */}
        <Grid.Col span={{ base: 12, sm: 12, md: 8 }} pl={'5em'}>
          <Flex justify="space-between" wrap="wrap">
            <div>
              <Text fw={700} size="lg" mb={12}>
                Skills & Experience
              </Text>
              {trainer?.skills.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {trainer?.skills.map((skill: string, i: number) => (
                    <Button key={i} variant="outline" size="xs" color="red">
                      {skill}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </Flex>
          {trainer.about && (
            <Text c="black" fz={15} lineClamp={4} mt={18}>
              {trainer.about}
            </Text>
          )}
        </Grid.Col>
      </Grid>

      <Grid gutter={0} justify='end'>
        <Link href={`/trainer-details/${trainer._id}`}>
          <Text size="sm" fw={600}>
            View full profile
          </Text>
        </Link>
      </Grid>
    </Box>
  );
};

export default TrainerInfoCard;
