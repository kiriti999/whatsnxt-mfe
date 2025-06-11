import { Text, Title, Box, Group, Stack } from '@mantine/core';

const Instructor = ({ name, designation, about }) => {
    return (
        <Box my="md">
            <Title order={3} mb="md">Instructor</Title>
            <Group align="flex-start">
                {/* <Avatar size="xl" radius="xl" /> */}
                <Stack gap={0}>
                    <Title order={5}>{name}</Title>
                    <Text size="sm" lineClamp={1} m={0}>
                        {designation}
                    </Text>
                    <Text size="sm" c="dimmed" m={0} lineClamp={5}>
                        {about}
                    </Text>
                </Stack>
            </Group>
        </Box>
    );
};

export default Instructor;