import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import {
  TextInput,
  Textarea,
  Select,
  Button,
  Group,
  Stack,
  Title,
  Paper,
  ActionIcon,
  NumberInput,
  Switch,
  Box,
  Divider,
  Container,
} from '@mantine/core';
import { IconTrash, IconPlus } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { Lab, QuestionType, LabType } from '../../types/lab';
import { useRouter } from 'next/navigation';

export const LabForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, register, handleSubmit, watch, setValue } = useForm<Lab>({
    defaultValues: {
      title: '',
      description: '',
      type: 'programming',
      language: '',
      questions: [],
      practiceTest: {
        enabled: false,
        timeLimitMinutes: 30,
        passingScorePercentage: 70,
        shuffleQuestions: false,
      },
      kubernetesConfig: {
        clusterVersion: '1.27',
        nodes: 1,
        tools: ['kubectl'],
      },
      cloudConfig: {
        platform: 'aws',
      },
      frameworkConfig: {
        framework: 'nextjs',
      },
      architectureConfig: {
        type: 'fullstack',
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  const labType = watch('type');
  const cloudPlatform = watch('cloudConfig.platform');
  const practiceTestEnabled = watch('practiceTest.enabled');
  const questions = watch('questions');

  const onSubmit = async (data: Lab) => {
    setIsSubmitting(true);
    try {
      // Transform data to match backend schema
      // 1. Remove frontend-only 'id' from questions
      // 2. Map 'text' to 'question' as expected by backend
      const formattedData = {
        ...data,
        questions: data.questions.map(({ id, text, options, ...rest }) => ({
          ...rest,
          question: text,
          options: options ? options.filter(o => o.trim() !== '') : [],
        })),
      };

      const response = await fetch('/api/lab/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        throw new Error('Failed to create lab');
      }

      notifications.show({
        title: 'Success',
        message: 'Lab created successfully',
        color: 'green',
      });

      // Reset or redirect
      router.push('/labs');
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to create lab',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container size="lg" py="xl">
      <Paper shadow="xs" p="md">
        <Title order={2} mb="lg">Create New Lab</Title>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Lab Title"
              placeholder="Enter lab title"
              required
              {...register('title', { required: true })}
            />

            <Textarea
              label="Description"
              placeholder="Enter lab description"
              minRows={3}
              required
              {...register('description', { required: true })}
            />

            <Group grow>
              <Controller
                name="type"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    label="Lab Type"
                    placeholder="Select lab type"
                    data={[
                      { value: 'programming', label: 'Programming Language' },
                      { value: 'cloud', label: 'Cloud' },
                      { value: 'framework', label: 'Programming Framework' },
                      { value: 'architecture', label: 'Architecture' },
                    ]}
                    required
                    {...field}
                  />
                )}
              />

              {labType === 'programming' && (
                <Controller
                  name="language"
                  control={control}
                  rules={{ required: labType === 'programming' }}
                  render={({ field }) => (
                    <Select
                      label="Programming Language"
                      placeholder="Select language"
                      data={[
                        { value: 'javascript', label: 'JavaScript' },
                        { value: 'python', label: 'Python' },
                        { value: 'java', label: 'Java' },
                        { value: 'go', label: 'Go' },
                        { value: 'rust', label: 'Rust' },
                      ]}
                      required
                      {...field}
                    />
                  )}
                />
              )}

              {labType === 'cloud' && (
                <Controller
                  name="cloudConfig.platform"
                  control={control}
                  rules={{ required: labType === 'cloud' }}
                  render={({ field }) => (
                    <Select
                      label="Cloud Platform"
                      placeholder="Select platform"
                      data={[
                        { value: 'aws', label: 'AWS' },
                        { value: 'docker', label: 'Docker' },
                        { value: 'kubernetes', label: 'Kubernetes' },
                      ]}
                      required
                      {...field}
                    />
                  )}
                />
              )}

              {labType === 'framework' && (
                <Controller
                  name="frameworkConfig.framework"
                  control={control}
                  rules={{ required: labType === 'framework' }}
                  render={({ field }) => (
                    <Select
                      label="Framework"
                      placeholder="Select framework"
                      data={[
                        { value: 'motia', label: 'Motia' },
                        { value: 'nextjs', label: 'Next.js' },
                        { value: 'monorepo', label: 'Monorepo' },
                      ]}
                      required
                      {...field}
                    />
                  )}
                />
              )}

              {labType === 'architecture' && (
                <Controller
                  name="architectureConfig.type"
                  control={control}
                  rules={{ required: labType === 'architecture' }}
                  render={({ field }) => (
                    <Select
                      label="Architecture Type"
                      placeholder="Select type"
                      data={[
                        { value: 'fullstack', label: 'Fullstack Architecture' },
                      ]}
                      required
                      {...field}
                    />
                  )}
                />
              )}
            </Group>

            {labType === 'cloud' && cloudPlatform === 'kubernetes' && (
              <Paper withBorder p="md" mt="sm">
                <Title order={4} mb="sm">Kubernetes Configuration</Title>
                <Group grow>
                  <TextInput
                    label="Cluster Version"
                    placeholder="e.g., 1.27"
                    {...register('kubernetesConfig.clusterVersion')}
                  />
                  <NumberInput
                    label="Number of Nodes"
                    min={1}
                    max={5}
                    defaultValue={1}
                    onChange={(val) => setValue('kubernetesConfig.nodes', Number(val))}
                  />
                </Group>
                <TextInput
                  label="Tools (comma separated)"
                  placeholder="kubectl, helm"
                  mt="sm"
                  description="Tools available in the lab environment"
                  onChange={(e) => setValue('kubernetesConfig.tools', e.target.value.split(',').map(s => s.trim()))}
                />
              </Paper>
            )}

            {labType === 'cloud' && cloudPlatform !== 'kubernetes' && (
              <Paper withBorder p="md" mt="sm">
                <Title order={4} mb="sm">Cloud Configuration</Title>
                <Group grow>
                  <TextInput
                    label="Region"
                    placeholder="e.g., us-east-1"
                    {...register('cloudConfig.region')}
                  />
                  <TextInput
                    label="Services (comma separated)"
                    placeholder="EC2, S3"
                    onChange={(e) => setValue('cloudConfig.services', e.target.value.split(',').map(s => s.trim()))}
                  />
                </Group>
              </Paper>
            )}

            <Divider my="sm" label="Questions" labelPosition="center" />

            {fields.map((field, index) => (
              <Paper key={field.id} withBorder p="md" mb="sm" pos="relative">
                <ActionIcon
                  color="red"
                  variant="subtle"
                  pos="absolute"
                  top={10}
                  right={10}
                  onClick={() => remove(index)}
                >
                  <IconTrash size={16} />
                </ActionIcon>

                <Stack gap="sm">
                  <TextInput
                    label={`Question ${index + 1}`}
                    placeholder="Enter question text"
                    required
                    {...register(`questions.${index}.text`, { required: true })}
                  />

                  <Controller
                    name={`questions.${index}.type`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        label="Question Type"
                        data={[
                          { value: 'multiple-choice', label: 'Multiple Choice' },
                          { value: 'coding', label: 'Coding' },
                          { value: 'text', label: 'Text' },
                        ]}
                        {...field}
                      />
                    )}
                  />

                  {questions?.[index]?.type === 'multiple-choice' && (
                    <Controller
                      name={`questions.${index}.options`}
                      control={control}
                      render={({ field: { value, onChange, ...field } }) => (
                        <TextInput
                          label="Options (comma separated)"
                          placeholder="Option 1, Option 2, Option 3"
                          description="Enter options separated by commas"
                          value={Array.isArray(value) ? value.join(', ') : ''}
                          onChange={(e) => onChange(e.target.value.split(',').map(s => s.trim()))}
                          {...field}
                        />
                      )}
                    />
                  )}

                  {/* Add more fields based on question type if needed */}
                  <TextInput
                    label="Correct Answer / Solution"
                    placeholder="Enter correct answer"
                    {...register(`questions.${index}.correctAnswer`)}
                  />
                </Stack>
              </Paper>
            ))}

            <Button
              variant="outline"
              leftSection={<IconPlus size={16} />}
              onClick={() => append({
                id: Math.random().toString(),
                text: '',
                type: 'multiple-choice',
                options: []
              })}
            >
              Add Question
            </Button>

            <Divider my="sm" label="Practice Test Configuration" labelPosition="center" />

            <Group>
              <Controller
                name="practiceTest.enabled"
                control={control}
                render={({ field: { value, onChange, ...field } }) => (
                  <Switch
                    label="Enable Practice Test"
                    checked={value}
                    onChange={(event) => onChange(event.currentTarget.checked)}
                    {...field}
                  />
                )}
              />
            </Group>

            {practiceTestEnabled && (
              <Group grow mt="sm">
                <NumberInput
                  label="Time Limit (minutes)"
                  min={5}
                  defaultValue={30}
                  onChange={(val) => setValue('practiceTest.timeLimitMinutes', Number(val))}
                />
                <NumberInput
                  label="Passing Score (%)"
                  min={0}
                  max={100}
                  defaultValue={70}
                  onChange={(val) => setValue('practiceTest.passingScorePercentage', Number(val))}
                />
                <Controller
                  name="practiceTest.shuffleQuestions"
                  control={control}
                  render={({ field: { value, onChange, ...field } }) => (
                    <Switch
                      label="Shuffle Questions"
                      checked={value}
                      onChange={(event) => onChange(event.currentTarget.checked)}
                      mt="xl"
                      {...field}
                    />
                  )}
                />
              </Group>
            )}

            <Button type="submit" loading={isSubmitting} mt="xl" size="md">
              Create Lab
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};
