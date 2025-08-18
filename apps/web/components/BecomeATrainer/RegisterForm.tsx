"use client";
import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
  Button,
  Text,
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
  Radio,
  Flex,
  Alert,
  Loader,
  Box,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { UserAPI } from "../../apis/v1/user/apply";
import { LanguageAPI } from "../../apis/v1/language";
import { IconUpload, IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { revalidate } from "../../server-actions";
import TrainingConfirmationModal from "./TrainingConfirmationModal";
import { uploadImage } from '../Blog/Form/util';
import { ControllerTextInput, RegisterTextarea, RegisterTextInput } from "../hoc/TextInputHoc";
import { useImageSafety } from "../../hooks/useImageSafety";
import { validateFile, formatFileSize, DEFAULT_VALIDATION_OPTIONS } from '../../utils/imageValidation';

type RegisterFormValues = {
  name: string;
  email: string;
  number: string;
  designation: string;
  experience: number;
  skills: string[];
  from: string;
  to: string;
  rate: string;
  about: string;
  languages: Array<string>;
  linkedin: string;
  github: string;
  as_trainer_apply: boolean;
  profile_photo: string;
  certificate_name: string;
  certificate_link: string;
  highestQualification: string;
  revealTrainerInfo: string;
};

const RegisterForm = ({ user }: { user: any }) => {
  const [skills, setSkills] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationSuccess, setValidationSuccess] = useState<string | null>(null);

  const router = useRouter();

  // Image safety hook
  const {
    scanImageClientSide,
    preloadModel,
    isScanning,
    isModelLoading,
    error: scanError,
    clearError
  } = useImageSafety();

  // Preload AI model on component mount for better UX
  useEffect(() => {
    preloadModel().catch(console.warn);
  }, [preloadModel]);

  const {
    register,
    handleSubmit,
    formState,
    reset,
    watch,
    control,
    setValue,
    formState: { errors, isValid },
  } = useForm<RegisterFormValues>({
    mode: "onChange",
    defaultValues: {
      name: "",
      email: user?.email || "",
      number: "",
      designation: "",
      experience: null,
      skills: [],
      from: "",
      to: "",
      rate: "",
      about: "",
      languages: [],
      linkedin: "",
      github: "",
      profile_photo: "",
      certificate_name: "",
      certificate_link: "",
      highestQualification: "",
      revealTrainerInfo: "",
    },
  });

  const { data: languagesData } = useQuery({
    queryKey: ["languages"],
    queryFn: async () => {
      const { data } = await LanguageAPI.getAll();
      return data || [];
    },
  });

  const handleImageChange = async (file: File | null) => {
    // Clear previous states
    setValidationError(null);
    setValidationSuccess(null);
    clearError();

    if (!file) {
      setProfileImage(null);
      setImagePreview(null);
      return;
    }

    try {
      console.log('🔍 Starting validation and safety scan for profile image:', file.name);

      // Step 1: Basic file validation
      const validationOptions = {
        ...DEFAULT_VALIDATION_OPTIONS.BLOG_TUTORIAL,
        setValidationError // Add the setValidationError function to options
      };

      const isValid = await validateFile(file, validationOptions);
      if (!isValid) {
        return; // Error already set by validateFile
      }

      // Step 2: Safety scanning
      console.log('🔍 Running AI safety scan...');
      const safetyResult = await scanImageClientSide(file);

      if (!safetyResult.safe) {
        setValidationError(
          `Profile image blocked by AI safety scan: ${safetyResult.blockedReasons.join(', ')}`
        );
        console.error('❌ Profile image failed safety check:', safetyResult);
        return;
      }

      // Step 3: All checks passed - set the image
      console.log('✅ Profile image passed all validation checks');
      setProfileImage(file);
      setValidationSuccess(`Profile image validated successfully (${formatFileSize(file.size)})`);

      // Step 4: Create preview
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      fileReader.readAsDataURL(file);

    } catch (error) {
      console.error('❌ Profile image validation failed:', error);
      setValidationError(
        `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const handleRadioChange = (value: string) => {
    setValue("revealTrainerInfo", value);
    if (value === "yes") setModalOpened(true);
  };

  const handleModalConfirm = (isShareable: string) => {
    setValue("revealTrainerInfo", isShareable, { shouldValidate: true }); // Trigger validation
    setModalOpened(false); // Close modal
  };

  const validationOptions = (revealTrainerInfo: string | null) => ({
    name: { required: "Name is required" },
    email: { required: "Email is required" },
    number: { required: "Number is required" },
    designation: { required: "Designation is required" },
    experience: { required: "Experience is required" },
    qualification: { required: false },
    from: {
      required: revealTrainerInfo === "yes" ? "Availability from time is required" : false,
    },
    to: {
      required: revealTrainerInfo === "yes" ? "Availability end time is required" : false,
    },
    rate: {
      required: revealTrainerInfo === "yes" ? "Hourly rate is required" : false,
    },
    about: { required: "About is required" },
    languages: { required: false },
    revealTrainerInfo: { required: "This field is required" },
    skills: { validate: (value: string[]) => value.length > 0 || "At least one skill is required" },
  });

  const handleApply: SubmitHandler<RegisterFormValues> = async (payload: any) => {
    try {
      setLoading(true);
      payload.skills = skills;

      // Handle profile image upload using the new uploadImage function
      if (profileImage) {
        try {
          const bffApiUrl = process.env.NEXT_PUBLIC_BFF_HOST_IMAGEKIT_API;
          const { secure_url, updatedAssets } = await uploadImage(
            profileImage,
            [], // No existing cloudinary assets for profile photo
            `users/${user?.email}/profile`, // folder path
            true, // addToLocalStorage - adjust based on your needs
            bffApiUrl
          );

          if (secure_url) {
            payload.trainerProfilePhoto = secure_url.replace(/^http:\/\//i, "https://");
          }
        } catch (uploadError) {
          console.error('Profile image upload failed:', uploadError);
          throw new Error('Failed to upload profile image. Please try again.');
        }
      }

      const response = await UserAPI.apply(payload);

      notifications.show({
        position: "bottom-right",
        title: "Applied Successfully",
        message: response,
        color: "green",
      });

      await revalidate("/trainer/courses");
      router.push("/trainer/courses");

    } catch (error: any) {
      console.error('Application error:', error);
      notifications.show({
        position: "bottom-right",
        title: "Registration Failed",
        message: error?.message || "Failed to apply",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const formValues = watch();
  const revealTrainerInfo = watch("revealTrainerInfo");
  const rules = validationOptions(revealTrainerInfo);

  const isStep1Complete = Boolean(
    formValues.name && formValues.email && formValues.number && formValues.about
  );

  const isStep2Complete = Boolean(
    formValues.experience > 0 && skills.length > 0
  );

  const isStep3Complete =
    revealTrainerInfo === "yes"
      ? Boolean(formValues.from && formValues.to && formValues.rate)
      : Boolean(revealTrainerInfo);

  const nextStep = () => {
    if (activeStep < 2) setActiveStep(activeStep + 1);
  };

  const prevStep = () => {
    if (activeStep > 0) setActiveStep(activeStep - 1);
  };

  return (
    <Paper shadow="xs" p="xl" withBorder>
      <Title order={2} mb="sm">
        Register to become an instructor
      </Title>
      <Text mb="sm">Your email address will not be published.</Text>
      <Text mb="lg">Required fields are marked *</Text>

      <form onSubmit={handleSubmit(handleApply)}>
        <Stepper active={activeStep} onStepClick={setActiveStep}>
          <Stepper.Step label="Basic Info">
            <Grid gutter="md">
              <Grid.Col span={6}>
                <TextInput
                  label="Your Name"
                  placeholder="Your Name"
                  {...register("name", rules.name)}
                  required
                  error={errors.name?.message}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Your Email"
                  placeholder="Your email address"
                  readOnly={!!user?.email}
                  disabled
                  {...register("email", rules.email)}
                  error={errors.email?.message}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Controller
                  name='number'
                  control={control}
                  rules={rules.number}
                  render={({ field }) => (
                    <TextInput
                      label="Your Phone Number"
                      placeholder="Your phone number"
                      error={errors.number?.message}
                      required
                      {...field}
                    />
                  )}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <RegisterTextarea
                  register={register}
                  errors={errors}
                  name="about"
                  label="About Yourself"
                  placeholder="Tell us about your teaching profession"
                  required={true}
                  rules={rules.about}
                  maxLength={500}
                  allowNumbers={false}
                  allowSpecialChars={true}
                />
              </Grid.Col>

              {/* Profile Image Upload with Safety Scanning */}
              <Grid.Col span={12}>
                <div>
                  <FileInput
                    clearable
                    label={<Text size='0.9rem'>Profile Image (Optional)</Text>}
                    placeholder={
                      isScanning ? "🔍 Scanning image..." :
                        isModelLoading ? "🤖 Loading AI model..." :
                          "Select profile image"
                    }
                    leftSection={
                      isScanning || isModelLoading ? (
                        <Loader size={16} />
                      ) : (
                        <IconUpload size={16} />
                      )
                    }
                    value={profileImage}
                    {...register("profile_photo")}
                    onChange={(e) => {
                      handleImageChange(e);
                    }}
                    accept=".png,.jpg,.jpeg"
                    disabled={isScanning || isModelLoading}
                  />

                  {/* Status messages */}
                  {(validationError || scanError) && (
                    <Alert
                      icon={<IconAlertCircle size={16} />}
                      color="red"
                      mt="xs"
                      variant="light"
                    >
                      {validationError || scanError}
                    </Alert>
                  )}

                  {validationSuccess && !validationError && !scanError && (
                    <Alert
                      icon={<IconCheck size={16} />}
                      color="green"
                      mt="xs"
                      variant="light"
                    >
                      {validationSuccess}
                    </Alert>
                  )}

                  {/* Scanning status */}
                  {isScanning && (
                    <Group gap="xs" mt="xs">
                      <Loader size="xs" />
                      <Text size="xs" c="blue">
                        Running AI safety scan...
                      </Text>
                    </Group>
                  )}

                  {/* Model loading status */}
                  {isModelLoading && (
                    <Group gap="xs" mt="xs">
                      <Loader size="xs" />
                      <Text size="xs" c="gray">
                        Loading AI model in browser...
                      </Text>
                    </Group>
                  )}

                  {/* Profile Image Requirements */}
                  <Box mt="sm">
                    <Text size="xs" c="dimmed">
                      <strong>Requirements:</strong> PNG, JPEG • Max size: 3MB • Min dimensions: 150×150px • Max dimensions: 2048×2048px
                    </Text>
                    <Text size="xs" c="blue">
                      <strong>AI Safety:</strong> All images are automatically scanned for inappropriate content.
                    </Text>
                  </Box>

                  {/* Image Preview */}
                  {imagePreview && !validationError && !scanError && (
                    <Box mt="md">
                      <Text size="sm" fw={500} mb="xs">Profile Image Preview:</Text>
                      <img
                        src={imagePreview}
                        alt="Profile Preview"
                        style={{
                          width: '120px',
                          height: '120px',
                          objectFit: 'cover',
                          borderRadius: '50%',
                          border: '2px solid #e9ecef'
                        }}
                      />
                    </Box>
                  )}
                </div>
              </Grid.Col>

              {languagesData?.length > 0 && (
                <Grid.Col span={12}>
                  <Controller
                    name="languages"
                    control={control}
                    rules={rules.languages}
                    render={({ field }) => (
                      <MultiSelect
                        label="Select languages (Optional)"
                        placeholder="Select languages you are going to use in courses"
                        data={[
                          ...languagesData.map(({ abbr, name }) => ({ value: abbr, label: name }))
                        ]}
                        error={errors.languages?.message}
                        {...field}
                      />
                    )}
                  />
                </Grid.Col>
              )}

            </Grid>
          </Stepper.Step>

          <Stepper.Step label="Skills">
            <Grid gutter="md">
              <Grid.Col span={12}>
                <Controller
                  name="designation"
                  control={control}
                  rules={{
                    required: 'Designation is required',
                    minLength: { value: 2, message: 'Designation must be at least 2 characters' }
                  }}
                  render={({ field }) => (
                    <ControllerTextInput
                      {...field}
                      errors={errors}
                      name="designation"
                      label="Your Designation"
                      placeholder="Enter your designation"
                      required={true}
                      allowNumbers={false}
                      allowSpecialChars={true} // Allow spaces, hyphens for job titles
                      maxLength={50}
                    />
                  )}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Controller
                  name="experience"
                  control={control}
                  rules={rules.experience}
                  render={({ field }) => (
                    <NumberInput
                      {...field}
                      label="Your experience in years"
                      placeholder="Enter your experience in years"
                      error={errors.experience?.message}
                      min={1}
                      max={99}
                      maxLength={2}
                      required
                    />
                  )}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <TagsInput
                  value={skills}
                  label="Skills"
                  placeholder="Enter a skill and press Enter"
                  error={skills.length === 0 ? "At least one skill is required" : undefined}
                  required
                  onKeyDown={(e) => {
                    // Prevent numbers from being typed
                    if (/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(newTags) => {
                    // Filter out numbers from all tags
                    const filteredTags = newTags.map(tag => tag.replace(/[0-9]/g, ''));
                    setSkills(filteredTags);
                  }}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <RegisterTextInput
                  register={register}
                  name="certificate_name"
                  label="Certification Name (Optional)"
                  placeholder="Enter certification name"
                  errors={errors}
                  allowNumbers={false}
                  allowSpecialChars={true}
                  maxLength={100}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <RegisterTextInput
                  register={register}
                  label="Certification Link (Optional)"
                  placeholder="Enter certification link"
                  errors={errors}
                  allowNumbers={true}
                  allowSpecialChars={true}
                  name="certificate_link"
                  maxLength={200}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <RegisterTextInput
                  register={register}
                  label="Highest Qualification (Optional)"
                  placeholder="Enter your highest qualification"
                  errors={errors}
                  name="highestQualification"
                  allowNumbers={true}
                  allowSpecialChars={true}
                  maxLength={200}
                />
              </Grid.Col>

              <Grid.Col span={12}>
                <RegisterTextInput
                  register={register}
                  errors={errors}
                  name="linkedin"
                  label="LinkedIn Profile (Optional)"
                  placeholder="Enter your LinkedIn profile URL"
                  allowNumbers={false}
                  allowSpecialChars={true}
                  maxLength={350}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <RegisterTextInput
                  register={register}
                  errors={errors}
                  name="github"
                  label="GitHub Profile (Optional)"
                  placeholder="Enter your GitHub profile URL"
                  allowNumbers={true}
                  allowSpecialChars={true}
                  maxLength={350}
                />
              </Grid.Col>
            </Grid>
          </Stepper.Step>

          <Stepper.Step label="Availability">
            <Grid gutter="md">

              <Grid.Col span={12}>
                <Text size="md">Would you like to provide live training session to students?</Text>
                <Controller
                  name="revealTrainerInfo"
                  control={control}
                  render={({ field }) => (
                    <Flex gap={"lg"} align={"center"}>
                      <Radio.Group
                        value={field.value || null}
                        onChange={handleRadioChange}
                      >
                        <Flex justify={"center"} align={"center"} gap={"xl"}>
                          <Radio value="yes" label="Yes" />
                          <Radio value="no" label="No" />
                        </Flex>
                      </Radio.Group>
                    </Flex>
                  )}
                />
                {errors.revealTrainerInfo && (
                  <Text c="red" size="sm">
                    {errors.revealTrainerInfo.message}
                  </Text>
                )}
              </Grid.Col>

              {watch("revealTrainerInfo") === "yes" && (
                <>
                  <Grid.Col span={6}>
                    <Controller
                      name="from"
                      control={control}
                      rules={rules.from}
                      render={({ field }) => (
                        <TextInput
                          label="Availability From"
                          placeholder="Start time"
                          type="time"
                          {...field}
                          required
                          error={errors.from?.message}
                        />
                      )}
                    />
                  </Grid.Col>

                  <Grid.Col span={6}>
                    <Controller
                      name="to"
                      control={control}
                      rules={rules.to}
                      render={({ field }) => (
                        <TextInput
                          label="Availability To"
                          placeholder="End time"
                          type="time"
                          {...field}
                          required
                          error={errors.to?.message}
                        />
                      )}
                    />
                  </Grid.Col>

                  <Grid.Col span={12}>
                    <Controller
                      name="rate"
                      control={control}
                      rules={{
                        required: watch("revealTrainerInfo") === "yes" ? "Hourly rate is required" : false,
                      }}
                      render={({ field }) => (
                        <TextInput
                          label="Hourly Rate"
                          placeholder="Enter your hourly rate"
                          type="number"
                          max={99999}
                          maxLength={5}
                          {...field}
                          required
                          error={errors.rate?.message}
                        />
                      )}
                    />
                  </Grid.Col>
                </>)}

            </Grid>
          </Stepper.Step>
        </Stepper>

        <Group mt="xl">
          <Button onClick={prevStep} disabled={activeStep === 0}>
            Back
          </Button>
          {activeStep < 2 ? (
            <Button
              onClick={nextStep}
              disabled={
                (activeStep === 0 && !isStep1Complete) ||
                (activeStep === 1 && !isStep2Complete)
              }
            >
              Next Step
            </Button>
          ) : (
            <>
              <Button
                type="submit"
                loading={loading}
                disabled={
                  !isStep3Complete ||
                  !isValid ||
                  isScanning ||
                  isModelLoading ||
                  (validationError !== null) ||
                  (scanError !== null)
                }
              >
                Submit
              </Button>

            </>

          )}
        </Group>
      </form>

      {/* Modal */}
      <TrainingConfirmationModal
        onConfirm={handleModalConfirm}
        opened={modalOpened} // Controls whether the modal is open
        setOpened={setModalOpened} // Callback to toggle modal state
      />

    </Paper>
  );
};

export default RegisterForm;