import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LabsPage from '../../app/labs/page';
import labApi from '../../app/apis/lab.api';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';

// Mock API calls
vi.mock('../../app/apis/lab.api', () => ({
  default: {
    getLabs: vi.fn(() => Promise.resolve([
      { id: '1', name: 'Existing Lab 1', status: 'draft', instructorId: 'inst1' },
    ])),
    createLab: vi.fn((data) => Promise.resolve({ ...data, id: 'new-lab-id', status: 'draft' })),
  },
}));

// Mock Mantine notifications
vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));

// Mock Next.js useRouter
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

describe('LabsPage and LabCreator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the LabsPage and display existing labs', async () => {
    render(<LabsPage />);
    expect(screen.getByText('Loading labs...')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('My Labs')).toBeInTheDocument());
    expect(screen.getByText('Existing Lab 1')).toBeInTheDocument();
  });

  it('should create a new lab successfully', async () => {
    render(<LabsPage />);
    await waitFor(() => expect(screen.getByText('Create New Lab')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText('Lab Name'), { target: { value: 'My New Lab' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'This is a description' } });
    fireEvent.click(screen.getByText('Create Lab'));

    await waitFor(() => expect(labApi.createLab).toHaveBeenCalledWith({
      name: 'My New Lab',
      description: 'This is a description',
      instructorId: 'mock-instructor-id',
    }));
    await waitFor(() => expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Success',
      message: 'Lab "My New Lab" created successfully!',
    })));
    await waitFor(() => expect(screen.getByText('My New Lab')).toBeInTheDocument());
  });

  it('should show error notification if lab creation fails', async () => {
    (labApi.createLab as vi.Mock).mockRejectedValueOnce(new Error('Failed to create'));

    render(<LabsPage />);
    await waitFor(() => expect(screen.getByText('Create New Lab')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText('Lab Name'), { target: { value: 'Failing Lab' } });
    fireEvent.click(screen.getByText('Create Lab'));

    await waitFor(() => expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Error',
      message: 'Failed to create lab.',
    })));
  });
});
