import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import QuestionEditor from '../QuestionEditor';
import { MantineProvider } from '@mantine/core';

// Mocking jest-dom assertions for vitest
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

describe('QuestionEditor', () => {
  it('renders the question editor form', () => {
    render(
      <MantineProvider>
        <QuestionEditor />
      </MantineProvider>
    );
    expect(screen.getByText('Question Text')).toBeInTheDocument();
    expect(screen.getByText('Question Type')).toBeInTheDocument();
  });
});
