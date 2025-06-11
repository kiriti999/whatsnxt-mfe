"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
    Button,
    Textarea,
    TextInput,
    Paper,
    Title,
    Grid,
    TagsInput,
    NumberInput,
    Stepper,
    Group,
    MultiSelect,
    FileInput,
    Flex,
    Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconUpload } from "@tabler/icons-react";
import { uploadToCloudinary } from "../../../utils/image-upload";
import { ProfileAPI } from '../../../api/v1/profile/profile';

type EditFormValues = {
    name: string;
    phone: string;
    designation: string;
    from: string;
    to: string;
    experience: number;
    skills: string[];
    availability: string;
    rate: string;
    about: string;
    languageIds: Array<{ _id: string; name: string; abbr: string }>;
    linkedin: string;
    github: string;
    profile_photo: string;
    certificate_name: string;
    certificate_link: string;
    highestQualification: string;
};

interface EditTrainerProfileFormProps {
    profile: EditFormValues;
    onUpdateSuccess?: (updatedProfile: EditFormValues) => void; // Updated type
    setIsEditing: any
}

const EditTrainerProfileForm: React.FC<EditTrainerProfileFormProps> = ({
    profile,
    onUpdateSuccess,
    setIsEditing
}) => {
    const [skills, setSkills] = useState<string[]>(profile.skills || []);
    const [activeStep, setActiveStep] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [profileImage, setProfileImage] = useState<File | null>(null);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isValid },
    } = useForm<EditFormValues>({
        mode: "onChange",
        defaultValues: {
            ...profile,
            languageIds: profile.languageIds, // Extract IDs for value
        },
    });

    const languageOptions = profile.languageIds.map(({ _id, name, abbr }) => ({
        value: _id,
        label: `${name} (${abbr})`,
    }));

    const handleUpdate: SubmitHandler<EditFormValues> = async (payload) => {
        try {
            setLoading(true);
            payload.skills = skills;
            let profile_photo_url = profile.profile_photo;

            if (profileImage) {
                const cloudinary = await uploadToCloudinary(
                    profileImage,
                    `users/${profile.name}/profile`
                );
                profile_photo_url = cloudinary?.secure_url.replace(
                    /^http:\/\//i,
                    "https://"
                );
                payload.profile_photo = profile_photo_url;
            }

            const updatedProfile = await ProfileAPI.editProfileInfo(payload);

            if (updatedProfile.status) {
                notifications.show({
                    position: 'bottom-left',
                    title: "Profile Updated",
                    message: "Your profile has been updated successfully.",
                    color: "green",
                });

                if (onUpdateSuccess) onUpdateSuccess(updatedProfile);
            }

        } catch (error: any) {
            notifications.show({
                position: 'bottom-left',
                title: "Update Failed",
                message: error?.message || "Failed to update profile.",
                color: "red",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper shadow="xs" p="xl" withBorder>
            <Flex justify={'space-between'} mb={'lg'}>
                <Title order={2} mb="sm">
                    Edit Profile
                </Title>
                <Tooltip label='Cancel edit'>
                    <Button size='xs' onClick={() => setIsEditing(false)}>Cancel</Button>
                </Tooltip>
            </Flex>
            <form onSubmit={handleSubmit(handleUpdate)}>
                <Stepper active={activeStep} onStepClick={setActiveStep}>
                    <Stepper.Step label="Basic Info">
                        <Grid gutter="md">
                            <Grid.Col span={6}>
                                <TextInput
                                    label="Your Name"
                                    placeholder="Your Name"
                                    {...register("name", { required: "Name is required" })}
                                    error={errors.name?.message}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <TextInput
                                    label="Your Phone Number"
                                    placeholder="Your phone number"
                                    {...register("phone", { required: "Phone number is required" })}
                                    error={errors.phone?.message}
                                />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <FileInput
                                    clearable
                                    label={<Title order={5}>Profile Image</Title>}
                                    placeholder="Profile image"
                                    leftSection={<IconUpload size={16} />}
                                    value={profileImage}
                                    onChange={(e) => setProfileImage(e)}
                                    accept=".png,.jpg,.jpeg"
                                />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <Controller
                                    name="languageIds"
                                    control={control}
                                    rules={{ required: "Languages are required" }}
                                    render={({ field }) => (
                                        <MultiSelect
                                            label="Languages"
                                            placeholder="Select languages"
                                            data={languageOptions} // Display language names and abbreviations
                                            value={field.value?.map((lang) => lang._id) || []} // Ensure value is an array of IDs
                                            onChange={(selectedIds) => {
                                                // Find the corresponding objects for the selected IDs
                                                const selectedLanguages = selectedIds.map(
                                                    (id) => languageOptions.find((option) => option.value === id) || {}
                                                );
                                                field.onChange(selectedLanguages); // Update the field value with selected objects
                                            }}
                                            error={errors.languageIds?.message}
                                        />
                                    )}
                                />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <Textarea
                                    label="About Yourself"
                                    placeholder="Tell us about your teaching profession"
                                    {...register("about", { required: "About is required" })}
                                    error={errors.about?.message}
                                    maxLength={500}
                                    autosize
                                    minRows={2}
                                    maxRows={10}
                                />
                            </Grid.Col>
                        </Grid>
                    </Stepper.Step>
                    <Stepper.Step label="Skills">
                        <Grid gutter="md">
                            <Grid.Col span={6}>
                                <TextInput
                                    label="Designation"
                                    placeholder="Enter your designation"
                                    {...register("designation", { required: "Designation is required" })}
                                    error={errors.designation?.message}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Controller
                                    name="experience"
                                    control={control}
                                    rules={{ required: "Experience is required" }}
                                    render={({ field }) => (
                                        <NumberInput
                                            label="Experience"
                                            placeholder="Years of experience"
                                            min={1}
                                            {...field} // Spread field properties to bind value and onChange
                                            error={errors.experience?.message}
                                        />
                                    )}
                                />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <TagsInput
                                    value={skills}
                                    onChange={setSkills}
                                    label="Skills"
                                    placeholder="Enter a skill and press Enter"
                                    error={skills.length === 0 ? "At least one skill is required" : undefined}
                                />
                            </Grid.Col>
                        </Grid>
                    </Stepper.Step>
                    <Stepper.Step label="Availability">
                        <Grid gutter="md">
                            <Grid.Col span={6}>
                                <TextInput
                                    label="Availability From"
                                    placeholder="Start time"
                                    type="time"
                                    {...register("from", { required: "Start time is required" })}
                                    error={errors.from?.message}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <TextInput
                                    label="Availability To"
                                    placeholder="End time"
                                    type="time"
                                    {...register("to", { required: "End time is required" })}
                                    error={errors.to?.message}
                                />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <TextInput
                                    label="Hourly Rate"
                                    placeholder="Enter your hourly rate"
                                    type="number"
                                    {...register("rate", { required: "Rate is required" })}
                                    error={errors.rate?.message}
                                />
                            </Grid.Col>
                        </Grid>
                    </Stepper.Step>
                </Stepper>

                <Group mt="xl">
                    <Button type="button" onClick={() => setActiveStep((prev) => Math.max(prev - 1, 0))}>
                        Back
                    </Button>
                    {activeStep < 2 ? (
                        <Button type="button"
                            onClick={() => setActiveStep((prev) => Math.min(prev + 1, 2))}
                        >
                            Next Step
                        </Button>
                    ) : (
                        <Button type="button" loading={loading} disabled={!isValid} onClick={handleSubmit(handleUpdate)} >
                            Save Changes
                        </Button>
                    )}
                </Group>
            </form>
        </Paper>
    );
};

export default EditTrainerProfileForm;
