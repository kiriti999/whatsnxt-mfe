"use client";

import { Box, Button, Group, Stepper, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import type { LabPage } from "@whatsnxt/core-types";
import type React from "react";
import { useState } from "react";
import labApi from "../apis/lab.api";

interface LabPageCreatorProps {
  labId: string;
  onPageCreated: (page: LabPage) => void;
}

const LabPageCreator: React.FC<LabPageCreatorProps> = ({
  labId,
  onPageCreated,
}) => {
  const [active, setActive] = useState(0);
  const nextStep = () =>
    setActive((current) => (current < 3 ? current + 1 : current));
  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

  const createPage = async () => {
    try {
      const result = await labApi.createLabPage(labId, {
        hasQuestion: false,
        hasDiagramTest: false,
      }); // Default to no content initially
      const newPage = result.data;
      notifications.show({
        title: "Success",
        message: `Page ${newPage.pageNumber} created for Lab ${labId}`,
        color: "green",
      });
      onPageCreated(newPage);
      nextStep();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to create lab page.",
        color: "red",
      });
      console.error("Failed to create lab page:", error);
    }
  };

  return (
    <Box maw={800} mx="auto">
      <Title order={2} mb="md">
        Create Lab Pages for Lab: {labId}
      </Title>
      <Stepper
        active={active}
        onStepClick={setActive}
        allowNextStepsSelect={false}
      >
        <Stepper.Step label="First step" description="Page Type">
          <Title order={4}>Select Page Content Type</Title>
          <Text>
            Here you would choose if this page has a question, a diagram test,
            or both.
          </Text>
          {/* Add controls for hasQuestion, hasDiagramTest */}
        </Stepper.Step>
        <Stepper.Step label="Second step" description="Content">
          <Title order={4}>Add Content to Page {active + 1}</Title>
          <Text>
            This section would contain QuestionEditor or DiagramTestEditor.
          </Text>
          {/* Placeholder for QuestionEditor / DiagramTestEditor */}
        </Stepper.Step>
        <Stepper.Step label="Final step" description="Review & Save">
          <Title order={4}>Review Page {active + 1}</Title>
          <Text>Review the content and save this page.</Text>
          <Button onClick={createPage}>Save Page {active + 1} as Draft</Button>
        </Stepper.Step>
      </Stepper>

      <Group justify="center" mt="xl">
        <Button variant="default" onClick={prevStep}>
          Back
        </Button>
        <Button onClick={nextStep}>Next step</Button>
      </Group>
    </Box>
  );
};

export default LabPageCreator;
