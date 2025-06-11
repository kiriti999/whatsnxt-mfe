'use client';

import React, { useState } from 'react';
import { Box, Stack, Group, Text, Container, Badge, Tooltip, Button, Paper, Anchor, LoadingOverlay } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import EditTrainerProfileForm from './EditTrainerProfileForm'; // Import the Edit form
import Link from 'next/link';
import useAuth from '../../../hooks/Authentication/useAuth';
import { useDisclosure } from '@mantine/hooks';

const TrainerProfile = ({ profile: profileData }) => {
    const [profile, setProfile] = useState(profileData);
    const [isEditing, setIsEditing] = useState(false);
    const { user } = useAuth();
    const [isVisible, { open, close }] = useDisclosure(false);

    const availability = `${profileData.from} - ${profileData.to} ${profileData.timeZone}`;

    const handleEditSuccess = (updatedProfile) => {
        const mergedProfile = {
            ...profile, // Keep existing fields
            ...updatedProfile?.data, // Override with updated fields
        };
        setProfile(mergedProfile); // Update the profile with the new data
        setIsEditing(false); // Close the edit form
    };

    return (
        <Container>
            <Box>
                <LoadingOverlay visible={isVisible} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
                {isEditing ? (
                    <EditTrainerProfileForm
                        profile={profile}
                        onUpdateSuccess={handleEditSuccess}
                        setIsEditing={setIsEditing}
                    />
                ) : (
                    <Stack>
                        <Paper radius="md" p="xl" withBorder w="100%" mb={'3rem'}>
                            {user?.role !== 'admin' && <Group mb={'lg'}>
                                <Tooltip label='Edit trainer profile'>
                                    <Button size='xs'
                                        onClick={() => setIsEditing(true)}
                                        leftSection={<IconEdit size={14} />}
                                    >
                                        Edit
                                    </Button>
                                </Tooltip>
                            </Group>}
                            <Text>Name: {profile.name}</Text>
                            <Text>Email: {profile.email}</Text>
                            <Text>Phone: {profile.phone}</Text>
                            <Text>About: {profile.about}</Text>
                            <Text>Designation: {profile.designation}</Text>
                            <Text>Experience: {profile.experience} years</Text>
                            <Text>Certifications: {profile.certification.name}</Text>
                            <Text>Certification link:
                                <Anchor ml={'xs'} component={Link} href={profile.certification.link}>
                                    {profile.certification.link}
                                </Anchor>
                            </Text>

                            <Text>Availability: {availability}</Text>
                            <Text>Rate: ₹{profile.rate} / hour</Text>
                            <Group>
                                <Text mb={0}>Skills:</Text>
                                {profile.skills.map((skill, index) => (
                                    <Badge key={index} color="blue" variant="light">
                                        {skill}
                                    </Badge>
                                ))}
                            </Group>
                        </Paper>
                    </Stack>
                )}
            </Box>
        </Container>
    );
};

export default TrainerProfile;
