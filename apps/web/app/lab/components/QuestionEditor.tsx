'use client';

import { Button, Group, Textarea, Select, TagsInput } from '@mantine/core';
import { useForm } from '@mantine/form';

function QuestionEditor() {
  const form = useForm({
    initialValues: {
      questionText: '',
      type: 'MCQ',
      options: [],
      correctAnswer: [],
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => console.log(values))}>
      <Textarea
        label="Question Text"
        placeholder="Enter your question"
        {...form.getInputProps('questionText')}
        required
      />
      <Select
        label="Question Type"
        data={['MCQ', 'Text']}
        {...form.getInputProps('type')}
        required
      />
      {form.values.type === 'MCQ' && (
        <TagsInput
          label="Options"
          data={[]}
          placeholder="Enter options and press Enter"
          {...form.getInputProps('options')}
        />
      )}
      <Group justify="flex-end" mt="md">
        <Button type="submit">Add Question</Button>
      </Group>
    </form>
  );
}

export default QuestionEditor;