'use client';

import React from 'react';
import { Box, TextInput, Select, Textarea, Button, Group, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { Question, QuestionType } from '@whatsnxt/core-types';

interface QuestionEditorProps {
  initialQuestion?: Partial<Question>;
  onSave: (question: Partial<Question>) => void;
  onCancel: () => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ initialQuestion, onSave, onCancel }) => {
  const form = useForm({
    initialValues: {
      type: initialQuestion?.type || 'Text',
      questionText: initialQuestion?.questionText || '',
      options: initialQuestion?.options || [''], // For MCQ
      correctAnswer: initialQuestion?.correctAnswer || '',
    },
    validate: {
      questionText: (value) => (value ? null : 'Question text is required'),
      options: (value, values) => (values.type === 'Multiple Choice' && value?.some(opt => !opt) ? 'All options must be filled' : null),
      correctAnswer: (value, values) => (values.type === 'Multiple Choice' && !value ? 'Correct answer is required' : null),
    },
  });

  const handleAddOption = () => {
    form.setFieldValue('options', [...form.values.options, '']);
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = [...form.values.options];
    newOptions.splice(index, 1);
    form.setFieldValue('options', newOptions);
  };

  const handleSubmit = (values: typeof form.values) => {
    try {
      onSave(values);
      notifications.show({
        title: 'Success',
        message: 'Question saved successfully!',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save question.',
        color: 'red',
      });
      console.error('Failed to save question:', error);
    }
  };

  return (
    <Box maw={800} mx="auto">
      <Title order={3} mb="md">{initialQuestion?.id ? 'Edit Question' : 'Add New Question'}</Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Select
          label="Question Type"
          placeholder="Select type"
          data={['Multiple Choice', 'Text']}
          {...form.getInputProps('type')}
          mb="md"
        />

        <Textarea
          label="Question Text"
          placeholder="Enter your question here..."
          {...form.getInputProps('questionText')}
          mb="md"
          required
        />

        {form.values.type === 'Multiple Choice' && (
          <Box mb="md">
            <Title order={4} size="sm">Options</Title>
            {form.values.options.map((option, index) => (
              <Group key={index} mb="xs">
                <TextInput
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(event) => {
                    const newOptions = [...form.values.options];
                    newOptions[index] = event.currentTarget.value;
                    form.setFieldValue('options', newOptions);
                  }}
                  style={{ flexGrow: 1 }}
                />
                {form.values.options.length > 1 && (
                  <Button variant="outline" color="red" onClick={() => handleRemoveOption(index)}>
                    Remove
                  </Button>
                )}
              </Group>
            ))}
            <Button onClick={handleAddOption} mt="sm">Add Option</Button>
            <TextInput
              label="Correct Answer (Enter exact option text)"
              placeholder="e.g., Option A"
              {...form.getInputProps('correctAnswer')}
              mt="md"
              required
            />
          </Box>
        )}

        {form.values.type === 'Text' && (
          <TextInput
            label="Correct Answer"
            placeholder="Enter the correct answer"
            {...form.getInputProps('correctAnswer')}
            mt="md"
          />
        )}

        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Save Question</Button>
        </Group>
      </form>
    </Box>
  );
};

export default QuestionEditor;
