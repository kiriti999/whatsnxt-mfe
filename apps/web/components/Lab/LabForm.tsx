'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import {
  TextInput,
  Textarea,
  Select,
  MultiSelect,
  Button,
  Group,
  Stack,
  Title,
  Paper,
  ActionIcon,
  NumberInput,
  Switch,
  Divider,
  Container,
  Text,
} from '@mantine/core';
import { IconTrash, IconPlus } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { Lab } from '../../types/lab';
import { useRouter } from 'next/navigation';
import DiagramEditor from '../architecture-lab/DiagramEditor';
import { getAvailableArchitectures, getArchitectureMetadata } from '../../utils/shape-libraries';

export const LabForm = ({ initialData }: { initialData?: Lab }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [architectureDropdownOpened, setArchitectureDropdownOpened] = useState(false);

  const { control, register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Lab>({
    defaultValues: initialData ? {
      title: initialData.title || '',
      description: initialData.description || '',
      type: initialData.type || 'programming',
      language: initialData.language || '',
      questions: initialData.questions?.map(q => ({
        ...q,
        text: (q as any).question || q.text || '',
        id: q.id || (q as any)._id,
      })) || [],
      practiceTest: {
        enabled: initialData.practiceTest?.enabled || false,
        timeLimitMinutes: initialData.practiceTest?.timeLimitMinutes || 30,
        passingScorePercentage: initialData.practiceTest?.passingScorePercentage || 70,
        shuffleQuestions: initialData.practiceTest?.shuffleQuestions || false,
      },
      kubernetesConfig: {
        clusterVersion: initialData.kubernetesConfig?.clusterVersion || '1.27',
        nodes: initialData.kubernetesConfig?.nodes || 1,
        tools: initialData.kubernetesConfig?.tools || ['kubectl'],
      },
      cloudConfig: {
        platform: initialData.cloudConfig?.platform || 'aws',
        region: initialData.cloudConfig?.region || '',
        services: initialData.cloudConfig?.services || [],
      },
      frameworkConfig: {
        framework: initialData.frameworkConfig?.framework || 'nextjs',
        version: initialData.frameworkConfig?.version || '',
      },
      architectureConfig: {
        type: initialData.architectureConfig?.type || 'fullstack',
        diagram: initialData.architectureConfig?.diagram || '',
      },
      architectureTypes: initialData.architectureTypes || (initialData.architectureConfig?.type ? [initialData.architectureConfig.type] : []),
      masterGraph: initialData.masterGraph || null,
      id: initialData.id,
      createdBy: initialData.createdBy,
      status: initialData.status || 'DRAFT',
    } : {
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
      architectureTypes: [],
      masterGraph: null,
      status: 'DRAFT',
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
  const architectureTypes = watch('architectureTypes') || [];

  const onSubmit = async (data: Lab, status: 'DRAFT' | 'PUBLISHED') => {
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
        status,
      };

      const url = initialData?.id ? `/api/lab/${initialData.id}` : '/api/lab/create';
      const method = initialData?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${initialData ? 'update' : 'create'} lab`);
      }

      notifications.show({
        title: 'Success',
        message: `Lab ${initialData ? 'updated' : 'created'} successfully`,
        color: 'green',
      });

      // Reset or redirect
      router.push('/labs');
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: `Failed to ${initialData ? 'update' : 'create'} lab`,
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveDraft = handleSubmit((data) => onSubmit(data, 'DRAFT'));
  const publishLab = handleSubmit((data) => onSubmit(data, 'PUBLISHED'));

  const handleDelete = async () => {
    if (!initialData?.id || !confirm('Are you sure you want to delete this lab?')) return;
    setIsSubmitting(true);
    try {
      await fetch(`/api/lab/${initialData.id}`, { method: 'DELETE' });
      notifications.show({ title: 'Success', message: 'Lab deleted', color: 'green' });
      router.push('/labs');
    } catch (error) {
      notifications.show({ title: 'Error', message: 'Failed to delete lab', color: 'red' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container size="lg" py="xl">
      <Paper shadow="xs" p="md">
        <Group justify="space-between" mb="lg">
          <Title order={2}>{initialData ? 'Edit Lab' : 'Create New Lab'}</Title>
          <Group>
            {initialData?.status === 'PUBLISHED' ? (
              <>
                <Button
                  variant="default"
                  loading={isSubmitting}
                  onClick={saveDraft}
                >
                  Unpublish
                </Button>
                <Button
                  color="green"
                  loading={isSubmitting}
                  onClick={publishLab}
                >
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="default"
                  loading={isSubmitting}
                  onClick={saveDraft}
                >
                  Save Draft
                </Button>
                <Button
                  color="green"
                  loading={isSubmitting}
                  onClick={publishLab}
                >
                  Publish Lab
                </Button>
              </>
            )}
          </Group>
        </Group>
        <form onSubmit={saveDraft}>
          <Stack gap="md">
            <TextInput
              label="Lab Title"
              placeholder="Enter lab title"
              required
              {...register('title', { required: 'Title is required' })}
              error={errors.title?.message}
            />

            <Textarea
              label="Description"
              placeholder="Enter lab description"
              minRows={3}
              required
              {...register('description', { required: 'Description is required' })}
              error={errors.description?.message}
            />

            <Group grow>
              <Controller
                name="type"
                control={control}
                rules={{ required: 'Lab Type is required' }}
                render={({ field, fieldState: { error } }) => (
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
                    error={error?.message}
                    {...field}
                  />
                )}
              />

              {labType === 'programming' && (
                <Controller
                  name="language"
                  control={control}
                  rules={{ required: 'Language is required' }}
                  render={({ field, fieldState: { error } }) => (
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
                      error={error?.message}
                      {...field}
                    />
                  )}
                />
              )}

              {labType === 'cloud' && (
                <Controller
                  name="cloudConfig.platform"
                  control={control}
                  rules={{ required: 'Platform is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <Select
                      label="Cloud Platform"
                      placeholder="Select platform"
                      data={[
                        { value: 'aws', label: 'AWS' },
                        { value: 'docker', label: 'Docker' },
                        { value: 'kubernetes', label: 'Kubernetes' },
                      ]}
                      required
                      error={error?.message}
                      {...field}
                    />
                  )}
                />
              )}

              {labType === 'framework' && (
                <Controller
                  name="frameworkConfig.framework"
                  control={control}
                  rules={{ required: 'Framework is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <Select
                      label="Framework"
                      placeholder="Select framework"
                      data={[
                        { value: 'motia', label: 'Motia' },
                        { value: 'nextjs', label: 'Next.js' },
                        { value: 'monorepo', label: 'Monorepo' },
                      ]}
                      required
                      error={error?.message}
                      {...field}
                    />
                  )}
                />
              )}

              {labType === 'architecture' && (
                <Controller
                  name="architectureTypes"
                  control={control}
                  rules={{ required: 'At least one architecture type is required' }}
                  render={({ field: { value, onChange, onBlur, ref }, fieldState: { error } }) => (
                    <MultiSelect
                      label="Architecture Types"
                      placeholder="Select one or more architecture types"
                      description="Select multiple architecture types to mix shapes from different architectures in your diagram"
                      data={getAvailableArchitectures().map(arch => ({
                        value: arch,
                        label: getArchitectureMetadata(arch).name
                      }))}
                      value={value || []}
                      onChange={(val) => {
                        onChange(val);
                        setArchitectureDropdownOpened(true);
                      }}
                      onBlur={onBlur}
                      ref={ref}
                      searchable
                      clearable
                      required
                      error={error?.message}
                      hidePickedOptions={false}
                      withCheckIcon
                      comboboxProps={{
                        withinPortal: false
                      }}
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
                <Controller
                  name="kubernetesConfig.tools"
                  control={control}
                  render={({ field: { value, onChange, ...field } }) => (
                    <TextInput
                      label="Tools (comma separated)"
                      placeholder="kubectl, helm"
                      mt="sm"
                      description="Tools available in the lab environment"
                      value={Array.isArray(value) ? value.join(', ') : ''}
                      onChange={(e) => onChange(e.target.value.split(',').map(s => s.trim()))}
                      {...field}
                    />
                  )}
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
                  <Controller
                    name="cloudConfig.services"
                    control={control}
                    render={({ field: { value, onChange, ...field } }) => (
                      <TextInput
                        label="Services (comma separated)"
                        placeholder="EC2, S3"
                        value={Array.isArray(value) ? value.join(', ') : ''}
                        onChange={(e) => onChange(e.target.value.split(',').map(s => s.trim()))}
                        {...field}
                      />
                    )}
                  />
                </Group>
              </Paper>
            )}

            {labType === 'architecture' && (
              <Paper withBorder p="md" mt="sm">
                <Title order={4} mb="sm">Architecture Diagram Design</Title>
                <Text size="sm" c="dimmed" mb="md">
                  Drag and drop components to create the master architecture for this lab.
                  Students will receive a jumbled version of this diagram to solve.
                </Text>
                <DiagramEditor
                  mode="instructor"
                  initialGraph={initialData?.masterGraph}
                  architectureTypes={architectureTypes}
                  onGraphChange={(json) => {
                    setValue('masterGraph', json);
                  }}
                />
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
                    {...register(`questions.${index}.text`, { required: 'Question text is required' })}
                    error={errors.questions?.[index]?.text?.message}
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
                <Controller
                  name="practiceTest.timeLimitMinutes"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      label="Time Limit (minutes)"
                      min={5}
                      {...field}
                      onChange={(val) => field.onChange(Number(val))}
                    />
                  )}
                />
                <Controller
                  name="practiceTest.passingScorePercentage"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      label="Passing Score (%)"
                      min={0}
                      max={100}
                      {...field}
                      onChange={(val) => field.onChange(Number(val))}
                    />
                  )}
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

            <Group justify="space-between" mt="xl">
              {initialData?.id && (
                <Button color="red" variant="subtle" onClick={handleDelete} loading={isSubmitting}>
                  Delete Lab
                </Button>
              )}
              <Group>
                {initialData?.status === 'PUBLISHED' ? (
                  <>
                    <Button
                      variant="default"
                      type="button"
                      loading={isSubmitting}
                      onClick={saveDraft}
                    >
                      Unpublish
                    </Button>
                    <Button
                      color="green"
                      type="button"
                      loading={isSubmitting}
                      onClick={publishLab}
                    >
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="default"
                      type="button"
                      loading={isSubmitting}
                      onClick={saveDraft}
                    >
                      Save Draft
                    </Button>
                    <Button
                      color="green"
                      type="button"
                      loading={isSubmitting}
                      onClick={publishLab}
                    >
                      Publish Lab
                    </Button>
                  </>
                )}
              </Group>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};
