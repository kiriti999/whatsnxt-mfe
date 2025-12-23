import { Badge, Group, Text, Title, Grid, Stack, Paper, Anchor } from "@mantine/core";

const Profile = ({ about, skills, languages, certification }) => {

    return (
        <Stack gap="lg">
            {/* Overview Section */}
            <Paper p="md" radius="md" withBorder>
                <Title order={4} size="h5" fw={600} mb="sm" c="dimmed">
                    Overview
                </Title>
                <Text size="sm" c="dark" style={{ lineHeight: 1.6 }}>
                    {about}
                </Text>
            </Paper>

            {/* Certifications Section */}
            {certification && (certification.name || certification.link) && (
                <Paper p="md" radius="md" withBorder>
                    <Title order={4} size="h5" fw={600} mb="md" c="dimmed">
                        Certifications
                    </Title>
                    <Stack gap="sm">
                        {certification.name && (
                            <Group gap="xs" wrap="nowrap">
                                <Text size="sm" fw={600} c="dimmed" style={{ minWidth: '140px' }}>
                                    Certificate Name:
                                </Text>
                                <Text size="sm" fw={500}>
                                    {certification.name}
                                </Text>
                            </Group>
                        )}
                        {certification.link && (
                            <Group gap="xs" wrap="nowrap">
                                <Text size="sm" fw={600} c="dimmed" style={{ minWidth: '140px' }}>
                                    Certificate Link:
                                </Text>
                                <Anchor
                                    href={certification.link}
                                    target="_blank"
                                    size="sm"
                                    fw={500}
                                    style={{
                                        wordBreak: 'break-all',
                                        textDecoration: 'none'
                                    }}
                                >
                                    {certification.link}
                                </Anchor>
                            </Group>
                        )}
                    </Stack>
                </Paper>
            )}

            {/* Skills Section */}
            {skills && skills.length > 0 && (
                <Paper p="md" radius="md" withBorder>
                    <Title order={4} size="h5" fw={600} mb="md" c="dimmed">
                        Skills
                    </Title>
                    <Group gap="xs">
                        {skills.map((skill) => (
                            <Badge
                                key={skill}
                                color="blue"
                                variant="light"
                                size="md"
                                radius="sm"
                                style={{
                                    textTransform: 'none',
                                    fontWeight: 500
                                }}
                            >
                                {skill}
                            </Badge>
                        ))}
                    </Group>
                </Paper>
            )}

            {/* Languages Section */}
            {languages && languages.length > 0 && (
                <Paper p="md" radius="md" withBorder>
                    <Title order={4} size="h5" fw={600} mb="md" c="dimmed">
                        Languages Spoken
                    </Title>
                    <Stack gap="xs">
                        {languages.map((language: any) => (
                            <Text key={language._id} size="sm" fw={500}>
                                • {language.name}
                            </Text>
                        ))}
                    </Stack>
                </Paper>
            )}
        </Stack>
    )
}

export default Profile;
