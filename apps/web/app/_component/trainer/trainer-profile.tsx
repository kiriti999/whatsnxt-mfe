'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Box,
    Group,
    Text,
    Container,
    Badge,
    Tooltip,
    Button,
    Paper,
    Anchor,
    TextInput,
    Textarea,
    NumberInput,
    TagsInput,
    MultiSelect,
    FileInput,
    Grid,
    Title,
    Flex
} from '@mantine/core';
import { FullPageOverlay } from '@/components/Common/FullPageOverlay';
import { IconEdit, IconDeviceFloppy, IconX, IconUpload } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';
import useAuth from '../../../hooks/Authentication/useAuth';
import { useDisclosure } from '@mantine/hooks';
import { ProfileAPI } from '../../../apis/v1/profile/profile';
import { uploadImage } from '../../../components/Blog/Form/util';


const TrainerProfile = ({ profile: profileData }) => {
    const [profile, setProfile] = useState(profileData);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [skills, setSkills] = useState(profile.skills || []);
    const [profileImage, setProfileImage] = useState(null);
    const { user } = useAuth();
    const [isVisible, { open, close }] = useDisclosure(false);

    const availability = `${profile.from} - ${profile.to} ${profile.timeZone}`;

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isValid },
    } = useForm({
        mode: "onChange",
        defaultValues: {
            name: profile.name || "",
            email: profile.email || "",
            phone: profile.phone || "",
            designation: profile.designation || "",
            from: profile.from || "",
            to: profile.to || "",
            experience: profile.experience || 0,
            rate: profile.rate || "",
            about: profile.about || "",
            languageIds: profile.languageIds || [],
            certification: {
                name: profile.certification?.name || "",
                link: profile.certification?.link || "",
            },
            photo: profile.photo || "",
        },
    });

    const languageOptions = profile.languageIds?.map(({ _id, name, abbr }) => ({
        value: _id,
        label: `${name} (${abbr})`,
    })) || [];

    const handleEdit = () => {
        setIsEditing(true);
        reset({
            name: profile.name || "",
            email: profile.email || "",
            phone: profile.phone || "",
            designation: profile.designation || "",
            from: profile.from || "",
            to: profile.to || "",
            experience: profile.experience || 0,
            rate: profile.rate || "",
            about: profile.about || "",
            languageIds: profile.languageIds || [],
            certification: {
                name: profile.certification?.name || "",
                link: profile.certification?.link || "",
            },
            photo: profile.photo || "",
        });
        setSkills(profile.skills || []);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setProfileImage(null);
        reset();
    };

    const handleSave = async (payload) => {
        try {
            setLoading(true);
            payload.skills = skills;
            let photo = profile.photo;


            // Handle profile image upload
            if (profileImage) {
                try {
                    const bffApiUrl = process.env.NEXT_PUBLIC_BFF_HOST_IMAGEKIT_API;
                    const { secure_url } = await uploadImage(
                        profileImage,
                        `users/${profile.name}/profile`,
                        true,
                        bffApiUrl
                    );

                    if (secure_url) {
                        photo = secure_url.replace(/^http:\/\//i, "https://");
                        payload.photo = photo;
                    }
                } catch (uploadError) {
                    console.error('Profile image upload failed:', uploadError);
                    throw new Error('Failed to upload profile image. Please try again.');
                }
            }

            const updatedProfile = await ProfileAPI.editProfileInfo(payload);
            console.log('API response:', updatedProfile);

            if (updatedProfile.status) {
                notifications.show({
                    position: 'bottom-right',
                    title: "Profile Updated",
                    message: "Your profile has been updated successfully.",
                    color: "green",
                });

                const mergedProfile = {
                    ...profile,
                    ...updatedProfile?.data,
                };
                setProfile(mergedProfile);
                setIsEditing(false);
                setProfileImage(null);
            }

        } catch (error) {
            console.error('Profile update error:', error);
            notifications.show({
                position: 'bottom-right',
                title: "Update Failed",
                message: error?.message || "Failed to update profile.",
                color: "red",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <FullPageOverlay visible={isVisible || loading} />
            <Container>
                <Box>

                    <Paper radius="md" p="xl" withBorder w="100%" mb={'3rem'}>
                    {/* Header with Edit/Save/Cancel buttons */}
                    <Flex justify="space-between" align="center" mb="lg">
                        <Title order={2}>Trainer Profile</Title>
                        {user?.role !== 'admin' && (
                            <Group>
                                {!isEditing ? (
                                    <Tooltip label='Edit trainer profile'>
                                        <Button
                                            size='sm'
                                            onClick={handleEdit}
                                            leftSection={<IconEdit size={16} />}
                                        >
                                            Edit Profile
                                        </Button>
                                    </Tooltip>
                                ) : (
                                    <Group>
                                        <Button
                                            size='sm'
                                            variant="outline"
                                            onClick={handleCancel}
                                            leftSection={<IconX size={16} />}
                                        >
                                            Cancel
                                        </Button>
                                    </Group>
                                )}
                            </Group>
                        )}
                    </Flex>

                    <form onSubmit={handleSubmit(handleSave)}>
                        <Grid gutter="md">
                            {/* Basic Information */}
                            <Grid.Col span={12}>
                                <Title order={4} mb="md">Basic Information</Title>
                            </Grid.Col>

                            <Grid.Col span={6}>
                                {isEditing ? (
                                    <TextInput
                                        label="Name"
                                        placeholder="Your Name"
                                        {...register("name", { required: "Name is required" })}
                                        error={errors.name?.message as string}
                                    />
                                ) : (
                                    <Box>
                                        <Text size="sm" fw={500} c="dimmed">Name</Text>
                                        <Text>{profile.name}</Text>
                                    </Box>
                                )}
                            </Grid.Col>

                            <Grid.Col span={6}>
                                {isEditing ? (
                                    <TextInput
                                        label="Email"
                                        placeholder="Your Email"
                                        {...register("email", { required: "Email is required" })}
                                        error={errors.email?.message as string}
                                        disabled // Usually email shouldn't be editable
                                    />
                                ) : (
                                    <Box>
                                        <Text size="sm" fw={500} c="dimmed">Email</Text>
                                        <Text>{profile.email}</Text>
                                    </Box>
                                )}
                            </Grid.Col>

                            <Grid.Col span={6}>
                                {isEditing ? (
                                    <TextInput
                                        label="Phone"
                                        placeholder="Your phone number"
                                        {...register("phone", { required: "Phone number is required" })}
                                        error={errors.phone?.message as string}
                                    />
                                ) : (
                                    <Box>
                                        <Text size="sm" fw={500} c="dimmed">Phone</Text>
                                        <Text>{profile.phone}</Text>
                                    </Box>
                                )}
                            </Grid.Col>

                            <Grid.Col span={6}>
                                {isEditing ? (
                                    <TextInput
                                        label="Designation"
                                        placeholder="Enter your designation"
                                        {...register("designation", { required: "Designation is required" })}
                                        error={errors.designation?.message as string}
                                    />
                                ) : (
                                    <Box>
                                        <Text size="sm" fw={500} c="dimmed">Designation</Text>
                                        <Text>{profile.designation}</Text>
                                    </Box>
                                )}
                            </Grid.Col>

                            {/* Profile Image */}
                            {isEditing && (
                                <Grid.Col span={12}>
                                    <FileInput
                                        clearable
                                        label="Profile Image"
                                        placeholder="Upload profile image"
                                        leftSection={<IconUpload size={16} />}
                                        value={profileImage}
                                        onChange={setProfileImage}
                                        accept=".png,.jpg,.jpeg"
                                    />
                                </Grid.Col>
                            )}

                            {/* About */}
                            <Grid.Col span={12}>
                                {isEditing ? (
                                    <Textarea
                                        label="About"
                                        placeholder="Tell us about your teaching profession"
                                        {...register("about", { required: "About is required" })}
                                        error={errors.about?.message as string}
                                        maxLength={500}
                                        autosize
                                        minRows={3}
                                        maxRows={6}
                                    />
                                ) : (
                                    <Box>
                                        <Text size="sm" fw={500} c="dimmed">About</Text>
                                        <Text>{profile.about}</Text>
                                    </Box>
                                )}
                            </Grid.Col>

                            {/* Professional Information */}
                            <Grid.Col span={12}>
                                <Title order={4} mb="md" mt="md">Professional Information</Title>
                            </Grid.Col>

                            <Grid.Col span={6}>
                                {isEditing ? (
                                    <Controller
                                        name="experience"
                                        control={control}
                                        rules={{ required: "Experience is required" }}
                                        render={({ field }) => (
                                            <NumberInput
                                                label="Experience (Years)"
                                                placeholder="Years of experience"
                                                min={0}
                                                {...field}
                                                error={errors.experience?.message as string}
                                            />
                                        )}
                                    />
                                ) : (
                                    <Box>
                                        <Text size="sm" fw={500} c="dimmed">Experience</Text>
                                        <Text>{profile.experience} years</Text>
                                    </Box>
                                )}
                            </Grid.Col>

                            <Grid.Col span={6}>
                                {isEditing ? (
                                    <TextInput
                                        label="Hourly Rate"
                                        placeholder="Enter your hourly rate"
                                        {...register("rate", { required: "Rate is required" })}
                                        error={errors.rate?.message as string}
                                    />
                                ) : (
                                    <Box>
                                        <Text size="sm" fw={500} c="dimmed">Hourly Rate</Text>
                                        <Text>₹{profile.rate} / hour</Text>
                                    </Box>
                                )}
                            </Grid.Col>

                            {/* Skills */}
                            <Grid.Col span={12}>
                                {isEditing ? (
                                    <TagsInput
                                        value={skills}
                                        onChange={setSkills}
                                        label="Skills"
                                        placeholder="Enter a skill and press Enter"
                                        error={skills.length === 0 ? "At least one skill is required" : undefined}
                                    />
                                ) : (
                                    <Box>
                                        <Text size="sm" fw={500} c="dimmed" mb="xs">Skills</Text>
                                        <Group>
                                            {profile.skills?.map((skill, index) => (
                                                <Badge key={index} color="blue" variant="light">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </Group>
                                    </Box>
                                )}
                            </Grid.Col>

                            {/* Certification */}
                            <Grid.Col span={12}>
                                <Title order={4} mb="md" mt="md">Certification</Title>
                            </Grid.Col>

                            <Grid.Col span={6}>
                                {isEditing ? (
                                    <TextInput
                                        label="Certification Name"
                                        placeholder="Enter your certification name"
                                        {...register("certification.name")}
                                    />
                                ) : (
                                    <Box>
                                        <Text size="sm" fw={500} c="dimmed">Certification</Text>
                                        <Text>{profile.certification?.name || "No certification added"}</Text>
                                    </Box>
                                )}
                            </Grid.Col>

                            <Grid.Col span={6}>
                                {isEditing ? (
                                    <TextInput
                                        label="Certification Link"
                                        placeholder="Enter your certification link"
                                        {...register("certification.link")}
                                    />
                                ) : (
                                    <Box>
                                        <Text size="sm" fw={500} c="dimmed">Certification Link</Text>
                                        {profile.certification?.link ? (
                                            <Anchor component={Link} href={profile.certification.link} target="_blank">
                                                {profile.certification.link}
                                            </Anchor>
                                        ) : (
                                            <Text c="dimmed">No link provided</Text>
                                        )}
                                    </Box>
                                )}
                            </Grid.Col>

                            {/* Availability */}
                            <Grid.Col span={12}>
                                <Title order={4} mb="md" mt="md">Availability</Title>
                            </Grid.Col>

                            <Grid.Col span={6}>
                                {isEditing ? (
                                    <TextInput
                                        label="Available From"
                                        placeholder="Start time"
                                        type="time"
                                        {...register("from", { required: "Start time is required" })}
                                        error={errors.from?.message as string}
                                    />
                                ) : (
                                    <Box>
                                        <Text size="sm" fw={500} c="dimmed">Available From</Text>
                                        <Text>{profile.from}</Text>
                                    </Box>
                                )}
                            </Grid.Col>

                            <Grid.Col span={6}>
                                {isEditing ? (
                                    <TextInput
                                        label="Available To"
                                        placeholder="End time"
                                        type="time"
                                        {...register("to", { required: "End time is required" })}
                                        error={errors.to?.message as string}
                                    />
                                ) : (
                                    <Box>
                                        <Text size="sm" fw={500} c="dimmed">Available To</Text>
                                        <Text>{profile.to}</Text>
                                    </Box>
                                )}
                            </Grid.Col>

                            <Grid.Col span={12}>
                                {!isEditing && (
                                    <Box>
                                        <Text size="sm" fw={500} c="dimmed">Full Availability</Text>
                                        <Text>{availability}</Text>
                                    </Box>
                                )}
                            </Grid.Col>

                            {/* Languages */}
                            {isEditing && (
                                <Grid.Col span={12}>
                                    <Controller
                                        name="languageIds"
                                        control={control}
                                        render={({ field }) => (
                                            <MultiSelect
                                                label="Languages"
                                                placeholder="Select languages"
                                                data={languageOptions}
                                                value={field.value?.map((lang) => lang._id) || []}
                                                onChange={(selectedIds) => {
                                                    const selectedLanguages = selectedIds.map(
                                                        (id) => languageOptions.find((option) => option.value === id) || {}
                                                    );
                                                    field.onChange(selectedLanguages);
                                                }}
                                            />
                                        )}
                                    />
                                </Grid.Col>
                            )}
                        </Grid>

                        {/* Save button inside the form */}
                        {isEditing && (
                            <Group justify="flex-end" mt="xl">
                                <Button
                                    size='sm'
                                    type="submit"
                                    onClick={handleSubmit(handleSave)}
                                    loading={loading}
                                    leftSection={<IconDeviceFloppy size={16} />}
                                >
                                    Save Changes
                                </Button>
                            </Group>
                        )}
                    </form>
                </Paper>
            </Box>
        </Container>
        </>
    );
};

export default TrainerProfile;