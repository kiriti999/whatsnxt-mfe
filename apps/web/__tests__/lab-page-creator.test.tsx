import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LabPageCreator from '../../apps/web/components/LabPageCreator';
import labApi from '../../app/apis/lab.api';
import { notifications } from '@mantine/notifications';

// Mock API calls
vi.mock('../../app/apis/lab.api', () => ({
  default: {
    createLabPage: vi.fn((labId, data) => Promise.resolve({
      id: 'new-page-id',
      labId,
      pageNumber: 1, // Simplified for mock
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  },
}));

// Mock Mantine notifications
vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));

describe('LabPageCreator', () => {
  const mockLabId = 'mock-lab-id';
  const mockOnPageCreated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the stepper and create a lab page', async () => {
    render(<LabPageCreator labId={mockLabId} onPageCreated={mockOnPageCreated} />);

    expect(screen.getByText(`Create Lab Pages for Lab: ${mockLabId}`)).toBeInTheDocument();
    expect(screen.getByText('Page Type')).toBeInTheDocument();

    // Click next step
    fireEvent.click(screen.getByText('Next step'));
    expect(screen.getByText('Content')).toBeInTheDocument();

    // Click next step to reach review & save
    fireEvent.click(screen.getByText('Next step'));
    expect(screen.getByText(/Review Page \d+/)).toBeInTheDocument();
    
    // Click save page as draft
    fireEvent.click(screen.getByText(/Save Page \d+ as Draft/));

    await waitFor(() => expect(labApi.createLabPage).toHaveBeenCalledWith(
      mockLabId,
      { hasQuestion: false, hasDiagramTest: false } // Initial state
    ));
    await waitFor(() => expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Success',
      message: expect.stringContaining('Page 1 created for Lab mock-lab-id'),
    })));
    await waitFor(() => expect(mockOnPageCreated).toHaveBeenCalledWith(expect.objectContaining({ id: 'new-page-id' })));
  });

  it('should show error notification if lab page creation fails', async () => {
    (labApi.createLabPage as vi.Mock).mockRejectedValueOnce(new Error('Failed to create page'));

    render(<LabPageCreator labId={mockLabId} onPageCreated={mockOnPageCreated} />);
    fireEvent.click(screen.getByText('Next step')); // Go to Content
    fireEvent.click(screen.getByText('Next step')); // Go to Review & Save
    fireEvent.click(screen.getByText(/Save Page \d+ as Draft/));

    await waitFor(() => expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Error',
      message: 'Failed to create lab page.',
    })));
    expect(mockOnPageCreated).not.toHaveBeenCalled();
  });
});
