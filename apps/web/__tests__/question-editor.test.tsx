import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { notifications } from '@mantine/notifications';
import QuestionEditor from '@/components/QuestionEditor';

// Mock Mantine notifications
vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));

describe('QuestionEditor', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render and save a text question', async () => {
    render(<QuestionEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText('Question Text'), {
      target: { value: 'What is your name?' },
    });
    fireEvent.change(screen.getByLabelText('Correct Answer'), { target: { value: 'Gemini' } });
    fireEvent.click(screen.getByText('Save Question'));

    await waitFor(() =>
      expect(mockOnSave).toHaveBeenCalledWith({
        type: 'Text',
        questionText: 'What is your name?',
        options: [''],
        correctAnswer: 'Gemini',
      })
    );
    await waitFor(() =>
      expect(notifications.show).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Success',
          message: 'Question saved successfully!',
        })
      )
    );
  });

  it('should render and save a multiple choice question', async () => {
    render(<QuestionEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText('Question Type'), {
      target: { value: 'Multiple Choice' },
    });
    await waitFor(() =>
      expect(screen.getByLabelText('Question Type')).toHaveValue('Multiple Choice')
    );

    fireEvent.change(screen.getByLabelText('Question Text'), {
      target: { value: 'Which color is blue?' },
    });
    fireEvent.change(screen.getByPlaceholderText('Option 1'), { target: { value: 'Red' } });
    fireEvent.click(screen.getByText('Add Option'));
    fireEvent.change(screen.getByPlaceholderText('Option 2'), { target: { value: 'Blue' } });
    fireEvent.change(screen.getByLabelText('Correct Answer (Enter exact option text)'), {
      target: { value: 'Blue' },
    });
    fireEvent.click(screen.getByText('Save Question'));

    await waitFor(() =>
      expect(mockOnSave).toHaveBeenCalledWith({
        type: 'Multiple Choice',
        questionText: 'Which color is blue?',
        options: ['Red', 'Blue'],
        correctAnswer: 'Blue',
      })
    );
  });

  it('should show validation errors for missing question text', async () => {
    render(<QuestionEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByText('Save Question'));

    await waitFor(() => expect(screen.getByText('Question text is required')).toBeInTheDocument());
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(<QuestionEditor onSave={mockOnSave} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});
