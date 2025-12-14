'use client';

import { useState, useEffect } from 'react';
import { Stepper, Button, Group, LoadingOverlay } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import QuestionEditor from '../components/QuestionEditor';
import DiagramCanvas from '../components/DiagramEditor/DiagramCanvas';
import ShapePalette from '../components/DiagramEditor/ShapePalette';
import http from '@whatsnxt/http-client';

function LabCreationPage() {
  const [active, setActive] = useState(0);
  const [labId, setLabId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createLab = async () => {
      try {
        console.log('Creating a new lab...');

        // Create lab with required fields
        const response = await http.post<{ message: string; data: { _id: string } }>('/labs', {
          name: 'New Lab',
          description: 'Lab description',
          labType: 'Cloud Computing',  // Required field
          architectureType: 'AWS',      // Required field
          instructorId: 'temp-instructor-id', // TODO: Get from auth context
        });

        // API returns { message: string, data: { _id: string, ... } }
        const labId = response.data?._id || (response as any)._id;
        setLabId(labId);
        console.log(`Created lab with ID: ${labId}`);
        setLoading(false);
      } catch (err) {
        console.error('Failed to create lab:', err);
        setError('Failed to create lab.');
        notifications.show({
          title: 'Error',
          message: err instanceof Error ? err.message : 'Could not create a new lab. Please try again later.',
          color: 'red',
        });
        setLoading(false);
      }
    };
    createLab();
  }, []);

  const saveData = async () => {
    if (!labId) return;
    try {
      console.log(`Saving data for lab ID: ${labId}, step: ${active}`);
      await http.put(`/labs/${labId}/pages/${active}`, { content: '...some data...' });
    } catch (err) {
      console.error('Failed to save', err);
    }
  };

  const nextStep = () => {
    saveData();
    setActive((current) => (current < 3 ? current + 1 : current));
  };

  const prevStep = () => {
    saveData();
    setActive((current) => (current > 0 ? current - 1 : current));
  };

  const handlePublish = async () => {
    if (!labId) return;
    try {
      console.log(`Publishing lab ID: ${labId}`);
      await http.post(`/labs/${labId}/publish`);
      notifications.show({
        title: 'Success',
        message: 'Lab published successfully!',
        color: 'green',
      });
    } catch (err) {
      console.error('Failed to publish', err);
      notifications.show({
        title: 'Error',
        message: 'Failed to publish lab.',
        color: 'red',
      });
    }
  };



  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} />
      <Stepper active={active} onStepClick={setActive}>
        <Stepper.Step label="First step" description="Lab Details">
          Step 1 content: Lab Details for Lab ID: {labId}
        </Stepper.Step>
        <Stepper.Step label="Second step" description="Add questions">
          <QuestionEditor />
        </Stepper.Step>
        <Stepper.Step label="Third step" description="Add diagram">
          <ShapePalette />
          <DiagramCanvas />
        </Stepper.Step>
        <Stepper.Completed>
          Completed, click back button to get to previous step
        </Stepper.Completed>
      </Stepper>

      <Group justify="center" mt="xl">
        <Button variant="default" onClick={prevStep}>Back</Button>
        {active === 3 ? (
          <Button color="blue" onClick={handlePublish}>Publish</Button>
        ) : (
          <Button onClick={nextStep}>Next step</Button>
        )}
      </Group>
    </div>
  );
}

export default LabCreationPage;