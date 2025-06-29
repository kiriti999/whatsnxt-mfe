// components/Consulting/sections/ContactSection.tsx

import React from 'react';
import {
    Container,
    Title,
    Text,
    Card,
    Group,
    Stack,
    Grid,
    Badge,
    Box,
    Button,
    ThemeIcon,
    Divider
} from '@mantine/core';

interface Contact {
    icon: any;
    label: string;
    value: string;
}

interface ContactSectionProps {
    contacts: Contact[];
}

export function ContactSection({ contacts }: ContactSectionProps) {
    return (
        <Box className="contact-section" py={80}>
            <Container size="xl">
                <Grid>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Stack gap="xl">
                            <div>
                                <Badge
                                    size="lg"
                                    variant="light"
                                    color="blue"
                                    mb="md"
                                    className="section-badge"
                                >
                                    Get In Touch
                                </Badge>
                                <Title
                                    order={2}
                                    size="2.5rem"
                                    fw={600}
                                    c="white"
                                    mb="md"
                                >
                                    Ready to Get Started?
                                </Title>
                                <Text size="lg" c="dimmed">
                                    Let's discuss your technical challenges and explore how our consulting
                                    services can help your organization achieve its goals.
                                </Text>
                            </div>

                            <Stack gap="md">
                                {contacts.map((contact, index) => (
                                    <Group key={index}>
                                        <ThemeIcon size="lg" color="blue" variant="light">
                                            <contact.icon size={20} />
                                        </ThemeIcon>
                                        <div>
                                            <Text fw={500} c="white">{contact.label}</Text>
                                            <Text c="dimmed">{contact.value}</Text>
                                        </div>
                                    </Group>
                                ))}
                            </Stack>
                        </Stack>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Card
                            shadow="xl"
                            radius="lg"
                            p="xl"
                            className="contact-card"
                        >
                            <Stack gap="md">
                                <Title order={3} ta="center" mb="md" c="white">
                                    Start Your Project
                                </Title>
                                <Text ta="center" c="dimmed" mb="lg">
                                    Fill out the form below and we'll get back to you within 24 hours.
                                </Text>
                                <Button
                                    size="lg"
                                    fullWidth
                                    mb="md"
                                    variant="gradient"
                                    gradient={{ from: 'blue', to: 'grape' }}
                                    className="cta-button"
                                >
                                    Contact Us
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    fullWidth
                                    color="white"
                                    className="outline-button"
                                >
                                    Schedule Call
                                </Button>
                                <Divider
                                    label="or"
                                    labelPosition="center"
                                    my="md"
                                    color="dark.4"
                                    styles={{
                                        label: { color: 'rgba(255, 255, 255, 0.6)' }
                                    }}
                                />
                                <Text ta="center" size="sm" c="dimmed">
                                    Download our service brochure to learn more about our offerings
                                </Text>
                                <Button
                                    variant="subtle"
                                    size="sm"
                                    fullWidth
                                    color="gray"
                                    className="subtle-button"
                                >
                                    Download Brochure
                                </Button>
                            </Stack>
                        </Card>
                    </Grid.Col>
                </Grid>
            </Container>
        </Box>
    );
}