'use client';
import { Group, Modal, Stack, Text, Title } from "@mantine/core";

const ContactDetailsModal = ({
    contactDetailsOpened,
    setContactDetailsOpened,
    trainerName,
    trainerEmail,
    trainerPhone,
}) => {

    return (
        <Modal
            opened={contactDetailsOpened}
            onClose={() => setContactDetailsOpened(false)} // Close modal when clicking outside or on close button
            title={<Title order={4}>Trainer contact details</Title>}
            size='lg'
        >
            <Stack gap={'sm'} className="mb-4">
                <Group>
                    <Title order={5} style={{ minWidth: '30%' }}>
                        Trainer:
                    </Title>
                    <Text>{trainerName}</Text>
                </Group>
                <Group>
                    <Title order={5} style={{ minWidth: '30%' }}>
                        Email:
                    </Title>
                    <Text>{trainerEmail}</Text>
                </Group>
                <Group>
                    <Title order={5} style={{ minWidth: '30%' }}>
                        Contact:
                    </Title>
                    <Text>{trainerPhone}</Text>
                </Group>
            </Stack>
        </Modal>
    )
}

export default ContactDetailsModal;
