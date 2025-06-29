

import React from 'react';
import {
    Container,
    Title,
    Text,
    Grid,
    Card,
    Group,
    Button,
    Stack,
    ThemeIcon,
    List,
    Box,
    Divider,
    Badge,
    Paper,
    Anchor,
    Center
} from '@mantine/core';
import {
    IconCode,
    IconBuildingSkyscraper,
    IconBulb,
    IconUsers,
    IconRocket,
    IconTarget,
    IconChartLine,
    IconShieldCheck,
    IconMail,
    IconPhone,
    IconMapPin,
    IconCheck
} from '@tabler/icons-react';

export default function ConsultingPage() {
    const services = [
        {
            icon: IconCode,
            title: 'Technical Consulting',
            description: 'Expert guidance on technology stack selection, code architecture, and best practices for modern software development.',
            features: ['Technology Stack Assessment', 'Code Review & Optimization', 'Performance Tuning', 'Security Best Practices']
        },
        {
            icon: IconBuildingSkyscraper,
            title: 'Architectural Services',
            description: 'Design scalable, maintainable systems with our architectural expertise in microservices, cloud, and distributed systems.',
            features: ['System Design & Planning', 'Microservices Architecture', 'Cloud Migration Strategy', 'API Design & Integration']
        },
        {
            icon: IconBulb,
            title: 'Skill Selection Advisory',
            description: 'Strategic guidance on building the right technical teams and identifying key skills for your projects.',
            features: ['Team Composition Analysis', 'Skill Gap Assessment', 'Hiring Strategy', 'Technical Interview Support']
        },
        {
            icon: IconUsers,
            title: 'Corporate Training',
            description: 'Comprehensive training programs to upskill your development teams in cutting-edge technologies and methodologies.',
            features: ['Custom Training Programs', 'Workshops & Bootcamps', 'Mentorship Programs', 'Certification Preparation']
        }
    ];

    const benefits = [
        { icon: IconRocket, text: 'Accelerate project delivery with expert guidance' },
        { icon: IconTarget, text: 'Reduce technical debt and improve code quality' },
        { icon: IconChartLine, text: 'Scale your applications with confidence' },
        { icon: IconShieldCheck, text: 'Implement industry best practices and standards' }
    ];

    return (
        <Box style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            {/* Hero Section */}
            <Container size="lg" py="xl">
                <Stack gap="xl" align="center" mb={60}>
                    <Title order={1} ta="center" style={{ maxWidth: 800 }}>
                        Software Engineering Consulting Services
                    </Title>
                    <Text size="xl" c="dimmed" ta="center" style={{ maxWidth: 600 }}>
                        Empowering businesses with expert technical guidance, architectural excellence, and comprehensive training solutions
                    </Text>
                    <Group mt="lg">
                        <Button size="lg" radius="md" color="blue">
                            Schedule Consultation
                        </Button>
                        <Button size="lg" radius="md" variant="outline" color="blue">
                            View Our Work
                        </Button>
                    </Group>
                </Stack>

                {/* Services Section */}
                <Stack gap={50} mb={60}>
                    <div>
                        <Title order={2} ta="center" mb="xl">
                            Our Services
                        </Title>
                        <Grid gutter="lg">
                            {services.map((service, index) => (
                                <Grid.Col key={index} span={{ base: 12, sm: 6 }}>
                                    <Card shadow="sm" padding="lg" radius="md" h="100%">
                                        <ThemeIcon size={50} radius="md" variant="light" color="blue" mb="md">
                                            <service.icon size={30} />
                                        </ThemeIcon>
                                        <Title order={3} size="h4" mb="sm">
                                            {service.title}
                                        </Title>
                                        <Text size="sm" c="dimmed" mb="md">
                                            {service.description}
                                        </Text>
                                        <List
                                            spacing="xs"
                                            size="sm"
                                            icon={
                                                <ThemeIcon color="teal" size={20} radius="xl">
                                                    <IconCheck size={12} />
                                                </ThemeIcon>
                                            }
                                        >
                                            {service.features.map((feature, idx) => (
                                                <List.Item key={idx}>{feature}</List.Item>
                                            ))}
                                        </List>
                                    </Card>
                                </Grid.Col>
                            ))}
                        </Grid>
                    </div>
                </Stack>

                {/* Benefits Section */}
                <Paper shadow="xs" radius="md" p="xl" mb={60}>
                    <Title order={2} ta="center" mb="xl">
                        Why Choose Our Consulting Services
                    </Title>
                    <Grid gutter="md">
                        {benefits.map((benefit, index) => (
                            <Grid.Col key={index} span={{ base: 12, sm: 6 }}>
                                <Group wrap="nowrap">
                                    <ThemeIcon size={40} radius="md" variant="light" color="indigo">
                                        <benefit.icon size={24} />
                                    </ThemeIcon>
                                    <Text size="md">{benefit.text}</Text>
                                </Group>
                            </Grid.Col>
                        ))}
                    </Grid>
                </Paper>

                {/* Process Section */}
                <Stack gap="xl" mb={60}>
                    <Title order={2} ta="center">
                        Our Consulting Process
                    </Title>
                    <Grid gutter="lg">
                        <Grid.Col span={{ base: 12, md: 4 }}>
                            <Card padding="lg" radius="md" withBorder>
                                <Badge size="xl" radius="xl" variant="filled" mb="md">1</Badge>
                                <Title order={4} mb="xs">Discovery & Analysis</Title>
                                <Text size="sm" c="dimmed">
                                    We begin by understanding your current challenges, goals, and technical landscape through comprehensive assessment.
                                </Text>
                            </Card>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 4 }}>
                            <Card padding="lg" radius="md" withBorder>
                                <Badge size="xl" radius="xl" variant="filled" mb="md">2</Badge>
                                <Title order={4} mb="xs">Strategic Planning</Title>
                                <Text size="sm" c="dimmed">
                                    Our experts develop tailored solutions and roadmaps aligned with your business objectives and technical requirements.
                                </Text>
                            </Card>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 4 }}>
                            <Card padding="lg" radius="md" withBorder>
                                <Badge size="xl" radius="xl" variant="filled" mb="md">3</Badge>
                                <Title order={4} mb="xs">Implementation Support</Title>
                                <Text size="sm" c="dimmed">
                                    We provide hands-on guidance and support throughout the implementation phase to ensure successful outcomes.
                                </Text>
                            </Card>
                        </Grid.Col>
                    </Grid>
                </Stack>

                {/* CTA Section */}
                <Center>
                    <Paper shadow="md" radius="lg" p="xl" style={{ maxWidth: 600, width: '100%' }}>
                        <Stack align="center" gap="md">
                            <Title order={3} ta="center">
                                Ready to Transform Your Software Development?
                            </Title>
                            <Text size="md" c="dimmed" ta="center">
                                Let's discuss how our consulting services can help you achieve your technical goals.
                            </Text>
                            <Button size="lg" radius="md" color="blue" fullWidth style={{ maxWidth: 300 }}>
                                Get Started Today
                            </Button>
                        </Stack>
                    </Paper>
                </Center>

                <Divider my={60} />

                {/* Contact Section */}
                <Grid gutter="lg">
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Group>
                            <ThemeIcon size={40} radius="md" variant="light">
                                <IconMail size={24} />
                            </ThemeIcon>
                            <div>
                                <Text size="sm" c="dimmed">Email</Text>
                                <Anchor href="mailto:info@whatsnxt.in" size="md">
                                    info@whatsnxt.in
                                </Anchor>
                            </div>
                        </Group>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Group>
                            <ThemeIcon size={40} radius="md" variant="light">
                                <IconPhone size={24} />
                            </ThemeIcon>
                            <div>
                                <Text size="sm" c="dimmed">Phone</Text>
                                <Text size="md">+91 6300711966</Text>
                            </div>
                        </Group>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Group>
                            <ThemeIcon size={40} radius="md" variant="light">
                                <IconMapPin size={24} />
                            </ThemeIcon>
                            <div>
                                <Text size="sm" c="dimmed">Location</Text>
                                <Text size="md">Global Services</Text>
                            </div>
                        </Group>
                    </Grid.Col>
                </Grid>
            </Container>
        </Box>
    );
}