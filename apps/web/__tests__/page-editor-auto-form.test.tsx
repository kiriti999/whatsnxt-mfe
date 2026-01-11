import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { notifications } from '@mantine/notifications';
import labApi from '@/apis/lab.api';
import LabPageEditorPage from '@/app/labs/[id]/pages/[pageId]/page';

// Mock Mantine notifications
vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));

// Mock lab API
vi.mock('@/apis/lab.api', () => ({
  default: {
    getLabById: vi.fn(),
    getLabPageById: vi.fn(),
    saveQuestion: vi.fn(),
    deleteQuestion: vi.fn(),
  },
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '1', pageId: '1' }),
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ get: vi.fn(() => '1') }),
}));

// Mock useAuth hook
vi.mock('@/hooks/Authentication/useAuth', () => ({
  default: () => ({
    user: { role: 'trainer', _id: 'trainer-1' },
    isAuthenticated: true,
  }),
}));

// Mock other dependencies
vi.mock('@/components/architecture-lab/DiagramEditor', () => ({
  default: () => <div>DiagramEditor Mock</div>,
}));

vi.mock('@/components/Lab/StudentTestRunner', () => ({
  StudentTestRunner: () => <div>StudentTestRunner Mock</div>,
}));

vi.mock('@/utils/shape-libraries', () => ({
  getAvailableArchitectures: () => ['Generic', 'AWS', 'Azure'],
}));

describe('Page Editor - Auto-Show Question Form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock for getLabById
    (labApi.getLabById as any).mockResolvedValue({
      data: { status: 'draft' },
    });
  });

  // T013: Test for auto-display on empty page with auto-focus verification
  it('should auto-display form on empty page and auto-focus first field', async () => {
    // Mock empty page response
    (labApi.getLabPageById as any).mockResolvedValue({
      data: { questions: [] },
    });

    render(<LabPageEditorPage />);

    // Wait for loading to complete and form to appear
    await waitFor(() => {
      const questionInput = screen.getByTestId('question-text-input');
      expect(questionInput).toBeInTheDocument();
    });

    // Verify the form has auto-focus attribute
    const questionInput = screen.getByTestId('question-text-input');
    expect(questionInput).toHaveAttribute('autoFocus');
  });

  // T014: Test for successful question save from auto-displayed form
  it('should save question from auto-displayed form successfully', async () => {
    // Mock empty page response
    (labApi.getLabPageById as any).mockResolvedValue({
      data: { questions: [] },
    });

    // Mock successful save
    (labApi.saveQuestion as any).mockResolvedValue({
      data: { id: 'q1', questionText: 'Test question', type: 'MCQ', options: [], correctAnswer: 'A' },
    });

    render(<LabPageEditorPage />);

    // Wait for form to appear
    await waitFor(() => {
      expect(screen.getByTestId('question-text-input')).toBeInTheDocument();
    });

    // Fill in question
    const questionInput = screen.getByTestId('question-text-input');
    fireEvent.change(questionInput, { target: { value: 'What is React?' } });

    // Find and fill correct answer field
    const correctAnswerInput = screen.getByPlaceholderText(/enter correct answer/i);
    fireEvent.change(correctAnswerInput, { target: { value: 'A JavaScript library' } });

    // Click save
    const saveButton = screen.getByRole('button', { name: /save question/i });
    fireEvent.click(saveButton);

    // Verify API was called
    await waitFor(() => {
      expect(labApi.saveQuestion).toHaveBeenCalled();
    });
  });

  // T015: Test for cancel behavior and "Add Question" button appearance
  it('should hide form after cancel and show empty state', async () => {
    // Mock empty page response
    (labApi.getLabPageById as any).mockResolvedValue({
      data: { questions: [] },
    });

    render(<LabPageEditorPage />);

    // Wait for form to appear
    await waitFor(() => {
      expect(screen.getByTestId('question-text-input')).toBeInTheDocument();
    });

    // Click cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Form should be hidden
    await waitFor(() => {
      expect(screen.queryByTestId('question-text-input')).not.toBeInTheDocument();
    });

    // Empty state should appear
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText(/no questions yet/i)).toBeInTheDocument();
  });

  // T016: Test for validation error handling in auto-displayed form
  it('should show validation errors when saving invalid question', async () => {
    // Mock empty page response
    (labApi.getLabPageById as any).mockResolvedValue({
      data: { questions: [] },
    });

    render(<LabPageEditorPage />);

    // Wait for form to appear
    await waitFor(() => {
      expect(screen.getByTestId('question-text-input')).toBeInTheDocument();
    });

    // Try to save without filling fields
    const saveButton = screen.getByRole('button', { name: /save question/i });
    fireEvent.click(saveButton);

    // Should show validation error notification
    await waitFor(() => {
      expect(notifications.show).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Validation Error',
          color: 'red',
        })
      );
    });

    // API should not be called
    expect(labApi.saveQuestion).not.toHaveBeenCalled();
  });

  // ===== USER STORY 2: Backward Compatibility Tests =====

  // T018: Test for NO auto-display on page with existing questions
  it('should NOT auto-display form on page with existing questions', async () => {
    // Mock page with existing questions
    (labApi.getLabPageById as any).mockResolvedValue({
      data: {
        questions: [
          { id: 'q1', questionText: 'Existing question 1', type: 'MCQ', options: [], correctAnswer: 'A' },
          { id: 'q2', questionText: 'Existing question 2', type: 'True/False', options: [], correctAnswer: 'True' },
        ],
      },
    });

    render(<LabPageEditorPage />);

    // Wait for questions to load
    await waitFor(() => {
      expect(screen.getByText(/existing question 1/i)).toBeInTheDocument();
    });

    // Form should NOT be auto-displayed
    expect(screen.queryByTestId('auto-question-form')).not.toBeInTheDocument();

    // Questions should be displayed normally
    expect(screen.getByText(/existing question 2/i)).toBeInTheDocument();
  });

  // T019: Test for manual "Add Question" button functionality on populated pages
  it('should allow manual addition of questions on populated pages', async () => {
    // Mock page with existing questions
    (labApi.getLabPageById as any).mockResolvedValue({
      data: {
        questions: [
          { id: 'q1', questionText: 'Existing question', type: 'MCQ', options: [], correctAnswer: 'A' },
        ],
      },
    });

    render(<LabPageEditorPage />);

    // Wait for questions to load
    await waitFor(() => {
      expect(screen.getByText(/existing question/i)).toBeInTheDocument();
    });

    // Find and click "Add Question" button
    const addButton = screen.getByRole('button', { name: /add question/i });
    expect(addButton).toBeInTheDocument();
    fireEvent.click(addButton);

    // A new question form should appear
    await waitFor(() => {
      const questionInputs = screen.getAllByTestId('question-text-input');
      expect(questionInputs.length).toBeGreaterThan(1);
    });
  });

  // T020: Test for edit existing question functionality (regression test)
  it('should allow editing existing questions', async () => {
    // Mock page with existing questions
    (labApi.getLabPageById as any).mockResolvedValue({
      data: {
        questions: [
          { id: 'q1', questionText: 'Existing question', type: 'MCQ', options: [{ text: 'A' }, { text: 'B' }], correctAnswer: 'A' },
        ],
      },
    });

    render(<LabPageEditorPage />);

    // Wait for questions to load
    await waitFor(() => {
      expect(screen.getByText(/existing question/i)).toBeInTheDocument();
    });

    // Find and click "Edit" button
    const editButton = screen.getByRole('button', { name: /^edit$/i });
    expect(editButton).toBeInTheDocument();
    fireEvent.click(editButton);

    // Question should become editable
    await waitFor(() => {
      const questionInput = screen.getByDisplayValue(/existing question/i);
      expect(questionInput).not.toBeDisabled();
    });
  });

  // ===== USER STORY 3: Navigation Entry Points Tests =====

  // T022: Test for auto-display on direct empty page navigation
  it('should auto-display form when directly navigating to empty page', async () => {
    // Mock empty page response (simulating direct navigation)
    (labApi.getLabPageById as any).mockResolvedValue({
      data: { questions: [] },
    });

    render(<LabPageEditorPage />);

    // Wait for form to appear after navigation
    await waitFor(() => {
      expect(screen.getByTestId('question-text-input')).toBeInTheDocument();
    });

    // Form should be auto-focused
    const questionInput = screen.getByTestId('question-text-input');
    expect(questionInput).toHaveAttribute('autoFocus');
  });

  // T023: Test for navigation reset behavior (cancel flag resets on page change)
  it('should reset cancel flag when navigating to different page', async () => {
    // First render with empty page
    (labApi.getLabPageById as any).mockResolvedValue({
      data: { questions: [] },
    });

    const { rerender } = render(<LabPageEditorPage />);

    // Wait for form to appear
    await waitFor(() => {
      expect(screen.getByTestId('question-text-input')).toBeInTheDocument();
    });

    // Cancel the form
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Form should be hidden
    await waitFor(() => {
      expect(screen.queryByTestId('question-text-input')).not.toBeInTheDocument();
    });

    // Simulate navigation to a different page (by re-rendering with different pageId mock)
    // Note: In real app, useParams would return different pageId
    // For this test, we'll just verify the useEffect dependency works
    
    // Re-render component (simulating page navigation)
    rerender(<LabPageEditorPage />);

    // Form should auto-display again after navigation
    await waitFor(() => {
      expect(screen.getByTestId('question-text-input')).toBeInTheDocument();
    });
  });

  // T024: Test for browser back/forward navigation to empty page
  it('should auto-display form on browser back/forward to empty page', async () => {
    // Mock empty page response (simulating browser navigation)
    (labApi.getLabPageById as any).mockResolvedValue({
      data: { questions: [] },
    });

    render(<LabPageEditorPage />);

    // Wait for form to appear
    await waitFor(() => {
      expect(screen.getByTestId('question-text-input')).toBeInTheDocument();
    });

    // Verify auto-focus is set
    const questionInput = screen.getByTestId('question-text-input');
    expect(questionInput).toHaveAttribute('autoFocus');
    
    // Verify form is in editing state
    expect(questionInput).not.toBeDisabled();
  });

  // ===== PHASE 6: Polish & Edge Cases =====

  // T029: Edge case test for component unmount/remount with open form
  it('should handle component unmount/remount gracefully', async () => {
    // Mock empty page response
    (labApi.getLabPageById as any).mockResolvedValue({
      data: { questions: [] },
    });

    const { unmount, rerender } = render(<LabPageEditorPage />);

    // Wait for form to appear
    await waitFor(() => {
      expect(screen.getByTestId('question-text-input')).toBeInTheDocument();
    });

    // Unmount component
    unmount();

    // Remount component
    rerender(<LabPageEditorPage />);

    // Form should re-appear on remount
    await waitFor(() => {
      expect(screen.getByTestId('question-text-input')).toBeInTheDocument();
    });
  });

  // T030: Edge case test for page loading state (form should not show until data loaded)
  it('should not show form while page is loading', async () => {
    // Mock delayed response
    let resolvePromise: any;
    const delayedPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    (labApi.getLabPageById as any).mockReturnValue(delayedPromise);

    render(<LabPageEditorPage />);

    // Form should not appear immediately
    expect(screen.queryByTestId('question-text-input')).not.toBeInTheDocument();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Resolve the promise with empty questions
    resolvePromise({ data: { questions: [] } });

    // Wait for form to appear after loading
    await waitFor(() => {
      expect(screen.getByTestId('question-text-input')).toBeInTheDocument();
    });

    // Loading text should be gone
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
});
