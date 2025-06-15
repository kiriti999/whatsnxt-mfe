"use client";
import React, { useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
  Button,
  Text,
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
  Radio,
  Flex,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { UserAPI } from "../../api/v1/user/apply";
import { LanguageAPI } from "../../api/v1/language";
import { IconUpload } from "@tabler/icons-react";
import { uploadToCloudinary } from "../../utils/image-upload";
import { revalidate } from "../../server-actions";
import TrainingConfirmationModal from "./TrainingConfirmationModal";

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

  const router = useRouter();

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

      if (profileImage) {
        const cloudinary = await uploadToCloudinary(
          profileImage,
          `users/${user?.email}/profile`
        );
        payload.trainerProfilePhoto = cloudinary?.secure_url.replace(
          /^http:\/\//i,
          "https://"
        );
      }

      console.log('🚀 ~ consthandleApply:SubmitHandler<RegisterFormValues>= ~ payload:', payload)
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
                <Textarea
                  label="About Yourself"
                  placeholder="Tell us about your teaching profession"
                  {...register("about", rules.about)}
                  error={errors.about?.message}
                  maxLength={500}
                  autosize
                  minRows={2}
                  maxRows={10}
                  required
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <FileInput
                  clearable
                  label={<Text size='0.9rem'>Profile Image (Optional)</Text>}
                  placeholder="Profile image"
                  leftSection={<IconUpload size={16} />}
                  value={profileImage}
                  {...register("profile_photo")}
                  onChange={(e) => {
                    setProfileImage(e)
                  }}
                  accept=".png,.jpg,.jpeg"
                />
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
                  rules={rules.designation}
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      label="Your designation"
                      placeholder="Enter your designation"
                      error={errors.designation?.message}
                      required
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
                      required
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
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Certification Name (Optional)"
                  placeholder="Enter certification name"
                  {...register("certificate_name")}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Certification Link (Optional)"
                  placeholder="Enter certification link"
                  {...register("certificate_link")}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <TextInput
                  label="Highest Qualification (Optional)"
                  placeholder="Enter your highest qualification"
                  error={errors.highestQualification?.message}
                  {...register(
                    "highestQualification",
                    rules.qualification
                  )}
                />
              </Grid.Col>

              <Grid.Col span={12}>
                <TextInput
                  label="LinkedIn Profile (Optional)"
                  placeholder="Enter your LinkedIn profile URL"
                  {...register("linkedin")}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <TextInput
                  label="GitHub Profile (Optional)"
                  placeholder="Enter your GitHub profile URL"
                  {...register("github")}
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
                disabled={!isStep3Complete || !isValid}
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
