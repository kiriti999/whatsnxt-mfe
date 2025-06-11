import React from "react";
import { Modal, Text, Radio, Flex, Button, Grid } from "@mantine/core";

interface TrainingConfirmationModalProps {
    onConfirm: (isShareable: string) => void; // Pass "yes" or "no" as a string
    opened: boolean;
    setOpened: (value: boolean) => void;
}

const TrainingConfirmationModal: React.FC<TrainingConfirmationModalProps> = ({
    onConfirm,
    opened,
    setOpened,
}) => {
    const [selectedOption, setSelectedOption] = React.useState<string>("");

    const handleSubmit = () => {
        onConfirm(selectedOption); // Pass "yes" or "no" directly
        setOpened(false);
    };

    return (
        <Modal opened={opened} onClose={() => setOpened(false)} title="Confirmation" centered>
            <Grid>
                <Grid.Col span={12}>
                    <Text size="md">
                        To facilitate the training, your contact details will be shared with students. Do you agree?
                    </Text>
                    <Flex gap="lg" align="center" mt="md">
                        <Radio.Group
                            value={selectedOption}
                            onChange={setSelectedOption}
                            name="confirmation"
                        >
                            <Flex justify={'center'} align={'center'} gap={'xl'}>
                                <Radio value="yes" label="Yes" size='sm' />
                                <Radio value="no" label="No" size='sm' />
                            </Flex>
                        </Radio.Group>
                    </Flex>
                </Grid.Col>
                <Grid.Col span={12} mt="lg">
                    <Flex justify="flex-end" gap="md">
                        <Button variant="default" onClick={() => setOpened(false)}>
                            Cancel
                        </Button>
                        <Button disabled={!selectedOption} onClick={handleSubmit}>
                            Confirm
                        </Button>
                    </Flex>
                </Grid.Col>
            </Grid>
        </Modal>
    );
};

export default TrainingConfirmationModal;
