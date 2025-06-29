// components/Consulting/sections/ServicesSection.tsx

import React from 'react';
import {
    Container,
    Title,
    Text,
    Card,
    Stack,
    Badge,
    Box,
    List,
    Divider,
    SimpleGrid
} from '@mantine/core';

interface Service {
    icon: any;
    title: string;
    description: string;
    features: string[];
    color: string;
}

interface ServicesSectionProps {
    services: Service[];
}

export function ServicesSection({ services }: ServicesSectionProps) {
    return (
        <Box className="services-section" py={80}>
            <Container size="xl">
                <Stack align="center" mb={60}>
                    <Badge
                        size="lg"
                        variant="light"
                        color="blue"
                        className="section-badge"
                    >
                        Our Services
                    </Badge>
                    <Title
                        order={2}
                        size="3rem"
                        ta="center"
                        fw={700}
                        className="section-title"
                    >
                        Comprehensive Technical Solutions
                    </Title>
                    <Text size="xl" ta="center" c="dimmed" maw={600}>
                        We provide end-to-end consulting services to help organizations build robust software solutions
                        and develop high-performing technical teams.
                    </Text>
                </Stack>

                <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
                    {services.map((service, index) => (
                        <Card
                            key={index}
                            shadow="xl"
                            padding="xl"
                            radius="lg"
                            className="service-card"
                        >
                            <Stack gap="md">

                                <Title order={3} size="1.5rem" fw={600} c="white">
                                    {service.title}
                                </Title>
                                <Text c="dimmed" style={{ flex: 1 }}>
                                    {service.description}
                                </Text>
                                <Divider color="dark.4" />
                                <List
                                    spacing="xs"
                                    size="sm"
                                >
                                    {service.features.map((feature, idx) => (
                                        <List.Item key={idx} style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                            {feature}
                                        </List.Item>
                                    ))}
                                </List>
                            </Stack>
                        </Card>
                    ))}
                </SimpleGrid>
            </Container>
        </Box>
    );
}