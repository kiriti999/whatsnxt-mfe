import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DiagramTestEditor from '../../apps/web/components/DiagramTestEditor';
import labApi from '../../app/apis/lab.api';
import { notifications } from '@mantine/notifications';

// Mock API calls
vi.mock('../../app/apis/lab.api', () => ({
  default: {
    getDiagramShapes: vi.fn((architectureType?: string) => {
      const allShapes = [
        { id: '1', name: 'EC2', type: 'compute', architectureType: 'AWS', svgPath: '', metadata: {} },
        { id: '2', name: 'VPC', type: 'network', architectureType: 'AWS', svgPath: '', metadata: {} },
        { id: '3', name: 'VM', type: 'compute', architectureType: 'Azure', svgPath: '', metadata: {} },
      ];
      if (architectureType) {
        return Promise.resolve(allShapes.filter(s => s.architectureType === architectureType));
      }
      return Promise.resolve(allShapes);
    }),
  },
}));

// Mock Mantine notifications
vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));

describe('DiagramTestEditor', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render and display available shapes', async () => {
    render(<DiagramTestEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

    await waitFor(() => expect(labApi.getDiagramShapes).toHaveBeenCalledWith('Common'));
    expect(screen.getByText('Available Shapes (Common)')).toBeInTheDocument();
  });

  it('should filter shapes by architecture type', async () => {
    render(<DiagramTestEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

    // Initial load will be 'Common', then change to 'AWS'
    fireEvent.change(screen.getByLabelText('Architecture Type'), { target: { value: 'AWS' } });
    await waitFor(() => expect(labApi.getDiagramShapes).toHaveBeenCalledWith('AWS'));
    expect(screen.getByText('Available Shapes (AWS)')).toBeInTheDocument();
  });

  it('should save diagram test successfully', async () => {
    render(<DiagramTestEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText('Prompt for Diagram Test'), { target: { value: 'Draw a VPC' } });
    fireEvent.change(screen.getByLabelText('Architecture Type'), { target: { value: 'AWS' } });
    fireEvent.click(screen.getByText('Save Diagram Test'));

    await waitFor(() => expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      prompt: 'Draw a VPC',
      architectureType: 'AWS',
    })));
    await waitFor(() => expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Success',
      message: 'Diagram test saved successfully!',
    })));
  });

  it('should show validation error if prompt is missing', async () => {
    render(<DiagramTestEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByText('Save Diagram Test'));

    await waitFor(() => expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Validation Error',
      message: 'Prompt and Architecture Type are required.',
    })));
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(<DiagramTestEditor onSave={mockOnSave} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});
