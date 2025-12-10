import { Text, Title, Box, Group, Stack } from '@mantine/core';
import styles from '../../../../components/Courses/Course.module.css';

const Instructor = ({ name, designation, about }) => {
    return (
        <div className={styles['instructor-box']}>
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
        </div>
    );
};

export default Instructor;