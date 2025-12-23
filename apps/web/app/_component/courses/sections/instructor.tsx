import { Text, Title, Box, Group, Stack, Paper } from '@mantine/core';

const Instructor = ({ name, designation, about }) => {
    return (
        <Paper
            p="md"
            radius="md"
            withBorder
            mb="xl"
            style={{
                borderColor: 'var(--mantine-color-gray-3)'
            }}
        >
            <Title
                order={4}
                size="h5"
                fw={600}
                mb="md"
                c="dimmed"
            >
                Instructor
            </Title>
            <Group align="flex-start">
                <Stack gap="xs" style={{ flex: 1 }}>
                    <Title order={5} fw={600}>{name}</Title>
                    <Text size="sm" c="dimmed" fw={500}>
                        {designation}
                    </Text>
                    <Text size="sm" c="dimmed" lineClamp={5}>
                        {about}
                    </Text>
                </Stack>
            </Group>
        </Paper>
    );
};

export default Instructor;