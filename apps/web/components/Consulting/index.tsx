import React, { useState, useEffect } from 'react';
import {
    Container,
    Title,
    Text,
    Button,
    Card,
    Group,
    Stack,
    Grid,
    Badge,
    Box,
    List,
    ThemeIcon,
    Divider,
    Paper,
    Center,
    Avatar,
    SimpleGrid,
    Progress,
} from '@mantine/core';
import {
    IconCode,
    IconBrain,
    IconSchool,
    IconCheck,
    IconArrowRight,
    IconRocket,
    IconMail,
    IconPhone,
    IconCalendar,
    IconTool,
    IconStar,
    IconMap,
    IconTarget,
    IconUsers,
    IconBuilding
} from '@tabler/icons-react';

export default function ConsultingPage() {

    const services = [
        {
            icon: IconCode,
            title: "Technical Architecture",
            description: "Design scalable, maintainable software architectures tailored to your business needs. From microservices to monoliths, we help you choose the right approach.",
            features: ["System Design", "Technology Stack Selection", "Performance Optimization", "Security Architecture"],
            color: "blue"
        },
        {
            icon: IconBrain,
            title: "Skill Development Strategy",
            description: "Strategic guidance on building technical capabilities within your organization. Identify skill gaps and create development roadmaps.",
            features: ["Skill Gap Analysis", "Learning Path Design", "Technology Adoption Planning", "Team Capability Assessment"],
            color: "grape"
        },
        {
            icon: IconSchool,
            title: "Corporate Training",
            description: "Comprehensive training programs to upskill your development teams with the latest technologies and best practices.",
            features: ["Custom Curriculum Design", "Hands-on Workshops", "Mentorship Programs", "Progress Tracking"],
            color: "teal"
        }
    ];

    const expertise = [
        { name: "Full-Stack Development", level: 95 },
        { name: "Cloud Architecture (AWS, Azure, GCP)", level: 90 },
        { name: "DevOps & CI/CD", level: 88 },
        { name: "Microservices Architecture", level: 92 },
        { name: "Database Design & Optimization", level: 87 },
        { name: "API Development & Integration", level: 94 },
        { name: "Security Best Practices", level: 85 },
        { name: "Agile Methodologies", level: 91 },
        { name: "Team Leadership", level: 89 },
        { name: "Technical Documentation", level: 86 }
    ];

    const trainingTopics = [
        { name: "Modern JavaScript & TypeScript", popularity: 98, icon: IconCode },
        { name: "React & Next.js Development", popularity: 95, icon: IconRocket },
        { name: "Node.js & Express", popularity: 87, icon: IconTool },
        { name: "Database Technologies", popularity: 82, icon: IconBuilding },
        { name: "Cloud Computing Fundamentals", popularity: 91, icon: IconMap },
        { name: "Container Technologies (Docker, Kubernetes)", popularity: 89, icon: IconTarget },
        { name: "Testing Strategies & Implementation", popularity: 78, icon: IconCheck },
        { name: "Code Quality & Best Practices", popularity: 85, icon: IconStar }
    ];

    const stats = [
        { number: "500+", label: "Projects Delivered", icon: IconRocket },
        { number: "98%", label: "Client Satisfaction", icon: IconStar },
        { number: "50+", label: "Expert Consultants", icon: IconUsers },
        { number: "10+", label: "Years Experience", icon: IconTarget }
    ];

    return (
        <Box style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1a1b23 0%, #2d1b69 50%, #11998e 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Animated Background Effects */}
            <Box>
                {/* Moving gradient orb following mouse */}
                <Box
                    style={{
                        position: 'absolute',
                        width: 400,
                        height: 400,
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
                        borderRadius: '50%',
                        transition: 'all 0.3s ease-out',
                        pointerEvents: 'none'
                    }}
                />

                {/* Floating particles */}
                {[...Array(15)].map((_, i) => (
                    <Box
                        key={i}
                        style={{
                            position: 'absolute',
                            width: 4,
                            height: 4,
                            background: 'rgba(255, 255, 255, 0.3)',
                            borderRadius: '50%',
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 3}s`
                        }}
                    />
                ))}
            </Box>

            {/* Hero Section */}
            <Box style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
                <Container size="xl" py={100}>
                    <Grid align="center" gutter={60}>
                        <Grid.Col span={{ base: 12, lg: 8 }}>
                            <Stack gap="xl">
                                <Box style={{ position: 'relative' }}>
                                    <Badge
                                        size="lg"
                                        variant="light"
                                        color="blue"
                                        style={{
                                            background: 'rgba(59, 130, 246, 0.2)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)'
                                        }}
                                    >
                                        🚀 Software Engineering Consulting
                                    </Badge>
                                </Box>

                                <Title
                                    order={1}
                                    size="4rem"
                                    fw={900}
                                    style={{
                                        background: 'linear-gradient(135deg, #ffffff 0%, #60a5fa 50%, #a855f7 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        lineHeight: 1.1
                                    }}
                                >
                                    Elevate Your Technical Excellence
                                </Title>

                                <Text
                                    size="xl"
                                    style={{
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        maxWidth: 600,
                                        lineHeight: 1.6
                                    }}
                                >
                                    Transform your development capabilities with expert consulting in
                                    <Text component="span" fw={600} c="blue.4"> software architecture</Text>,
                                    <Text component="span" fw={600} c="grape.4"> skill development</Text>, and
                                    <Text component="span" fw={600} c="teal.4"> corporate training</Text>.
                                </Text>

                                <Group gap="lg">
                                    <Button
                                        size="lg"
                                        variant="gradient"
                                        gradient={{ from: 'blue', to: 'grape' }}
                                        rightSection={<IconArrowRight size={18} />}
                                        style={{
                                            boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
                                            transition: 'all 0.3s ease'
                                        }}
                                        styles={{
                                            root: {
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)'
                                                }
                                            }
                                        }}
                                    >
                                        Get Started
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        color="white"
                                        style={{
                                            backdropFilter: 'blur(10px)',
                                            border: '2px solid rgba(255, 255, 255, 0.2)'
                                        }}
                                    >
                                        View Our Work
                                    </Button>
                                </Group>

                                {/* Stats */}
                                <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mt="xl">
                                    {stats.map((stat, index) => (
                                        <Paper
                                            key={index}
                                            p="md"
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                backdropFilter: 'blur(10px)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: 12,
                                                textAlign: 'center',
                                                transition: 'all 0.3s ease'
                                            }}
                                            styles={{
                                                root: {
                                                    '&:hover': {
                                                        background: 'rgba(255, 255, 255, 0.1)',
                                                        transform: 'translateY(-4px)'
                                                    }
                                                }
                                            }}
                                        >
                                            <ThemeIcon size="lg" variant="light" color="blue" mb="xs" mx="auto">
                                                <stat.icon size={20} />
                                            </ThemeIcon>
                                            <Text size="xl" fw={700} c="white">{stat.number}</Text>
                                            <Text size="sm" c="dimmed">{stat.label}</Text>
                                        </Paper>
                                    ))}
                                </SimpleGrid>
                            </Stack>
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, lg: 4 }}>
                            <Center>
                                <Box style={{ position: 'relative' }}>
                                    {/* Floating code elements */}
                                    {[...Array(6)].map((_, i) => (
                                        <Paper
                                            key={i}
                                            p="md"
                                            style={{
                                                position: 'absolute',
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                backdropFilter: 'blur(10px)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: 8,
                                                left: `${20 + (i % 3) * 80}px`,
                                                top: `${10 + Math.floor(i / 3) * 120}px`,
                                                animation: `float ${3 + (i % 3)}s ease-in-out infinite`,
                                                animationDelay: `${i * 0.5}s`
                                            }}
                                        >
                                            <IconCode size={20 + (i % 3) * 4} color="#60a5fa" />
                                        </Paper>
                                    ))}

                                    {/* Central avatar */}
                                    <Avatar
                                        size={250}
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(168, 85, 247, 0.3) 100%)',
                                            backdropFilter: 'blur(20px)',
                                            border: '3px solid rgba(255, 255, 255, 0.2)',
                                            boxShadow: '0 20px 60px rgba(59, 130, 246, 0.3)'
                                        }}
                                    >
                                        <IconCode size={120} color="white" />
                                    </Avatar>
                                </Box>
                            </Center>
                        </Grid.Col>
                    </Grid>
                </Container>
            </Box>

            {/* Services Section */}
            <Box style={{ position: 'relative', zIndex: 10 }} py={80}>
                <Container size="xl">
                    <Stack align="center" mb={60}>
                        <Badge
                            size="lg"
                            variant="light"
                            color="blue"
                            style={{
                                background: 'rgba(59, 130, 246, 0.2)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            Our Services
                        </Badge>
                        <Title
                            order={2}
                            size="3rem"
                            ta="center"
                            fw={700}
                            style={{
                                background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}
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
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    height: '100%',
                                    transition: 'all 0.3s ease'
                                }}
                                styles={{
                                    root: {
                                        '&:hover': {
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            transform: 'translateY(-8px)',
                                            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
                                        }
                                    }
                                }}
                            >
                                <Stack gap="md">
                                    <ThemeIcon
                                        size={60}
                                        radius="lg"
                                        variant="gradient"
                                        gradient={{ from: service.color, to: service.color === 'blue' ? 'cyan' : service.color === 'grape' ? 'pink' : 'teal' }}
                                        style={{
                                            boxShadow: `0 10px 30px rgba(59, 130, 246, 0.3)`
                                        }}
                                    >
                                        <service.icon size={30} />
                                    </ThemeIcon>
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
                                        icon={
                                            <ThemeIcon size={16} radius="xl" color="teal">
                                                <IconCheck size={12} />
                                            </ThemeIcon>
                                        }
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

            {/* Expertise Section */}
            <Box style={{ background: 'rgba(255, 255, 255, 0.02)', position: 'relative', zIndex: 10 }} py={80}>
                <Container size="xl">
                    <Grid>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Stack gap="xl">
                                <Badge
                                    size="lg"
                                    variant="light"
                                    color="grape"
                                    style={{
                                        background: 'rgba(168, 85, 247, 0.2)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)'
                                    }}
                                >
                                    Technical Expertise
                                </Badge>
                                <Title
                                    order={2}
                                    size="2.5rem"
                                    fw={600}
                                    style={{
                                        background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}
                                >
                                    Deep Technical Knowledge Across the Stack
                                </Title>
                                <Text size="lg" c="dimmed">
                                    Our consultants bring years of hands-on experience across modern technologies,
                                    architectures, and development practices.
                                </Text>

                                <Stack gap="md">
                                    {expertise.map((skill, index) => (
                                        <Paper
                                            key={index}
                                            p="md"
                                            radius="md"
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                backdropFilter: 'blur(10px)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)'
                                            }}
                                        >
                                            <Group justify="apart" mb="xs">
                                                <Text size="sm" fw={500} c="white">{skill.name}</Text>
                                                <Text size="sm" fw={700} c="blue.4">{skill.level}%</Text>
                                            </Group>
                                            <Progress
                                                value={skill.level}
                                                size="sm"
                                                radius="xl"
                                                style={{
                                                    background: 'rgba(255, 255, 255, 0.1)'
                                                }}
                                            />
                                        </Paper>
                                    ))}
                                </Stack>
                            </Stack>
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Card
                                shadow="xl"
                                radius="lg"
                                p="xl"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                }}
                            >
                                <Stack gap="xl">
                                    <Group>
                                        <ThemeIcon
                                            size={50}
                                            radius="lg"
                                            variant="gradient"
                                            gradient={{ from: 'blue', to: 'grape' }}
                                        >
                                            <IconRocket size={25} />
                                        </ThemeIcon>
                                        <div>
                                            <Title order={3} c="white">
                                                Ready to Transform?
                                            </Title>
                                            <Text c="dimmed">
                                                Let's discuss your technical challenges
                                            </Text>
                                        </div>
                                    </Group>
                                    <Text c="dimmed">
                                        Schedule a free consultation to explore how we can help accelerate
                                        your development capabilities and achieve your technical goals.
                                    </Text>
                                    <Button
                                        variant="gradient"
                                        gradient={{ from: 'blue', to: 'grape' }}
                                        size="md"
                                        fullWidth
                                        style={{
                                            boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
                                        }}
                                    >
                                        Schedule Consultation
                                    </Button>
                                </Stack>
                            </Card>
                        </Grid.Col>
                    </Grid>
                </Container>
            </Box>

            {/* Training Section */}
            <Box style={{ position: 'relative', zIndex: 10 }} py={80}>
                <Container size="xl">
                    <Grid>
                        <Grid.Col span={{ base: 12, md: 5 }}>
                            <Stack gap="xl">
                                <Badge
                                    size="lg"
                                    variant="light"
                                    color="orange"
                                    style={{
                                        background: 'rgba(251, 146, 60, 0.2)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)'
                                    }}
                                >
                                    Corporate Training
                                </Badge>
                                <Title
                                    order={2}
                                    size="2.5rem"
                                    fw={600}
                                    style={{
                                        background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}
                                >
                                    Empower Your Development Teams
                                </Title>
                                <Text size="lg" c="dimmed">
                                    Our comprehensive training programs are designed to upskill your development teams
                                    with the latest technologies and industry best practices.
                                </Text>

                                <Stack gap="sm">
                                    {[
                                        "Customized curriculum based on your tech stack",
                                        "Hands-on workshops and practical exercises",
                                        "Progress tracking and skill assessments",
                                        "Ongoing mentorship and support"
                                    ].map((benefit, index) => (
                                        <Group key={index} gap="sm">
                                            <ThemeIcon size="sm" color="green" variant="light">
                                                <IconCheck size={12} />
                                            </ThemeIcon>
                                            <Text c="white">{benefit}</Text>
                                        </Group>
                                    ))}
                                </Stack>
                            </Stack>
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, md: 7 }}>
                            <Card
                                shadow="lg"
                                radius="lg"
                                p="xl"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                }}
                            >
                                <Stack gap="lg">
                                    <Title order={3} ta="center" mb="md" c="white">
                                        Popular Training Topics
                                    </Title>
                                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                                        {trainingTopics.map((topic, index) => (
                                            <Paper
                                                key={index}
                                                p="lg"
                                                radius="md"
                                                style={{
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                styles={{
                                                    root: {
                                                        '&:hover': {
                                                            background: 'rgba(255, 255, 255, 0.1)',
                                                            transform: 'translateY(-4px)'
                                                        }
                                                    }
                                                }}
                                            >
                                                <Group mb="md">
                                                    <ThemeIcon size="lg" radius="md" color="blue" variant="light">
                                                        <topic.icon size={20} />
                                                    </ThemeIcon>
                                                    <Text fw={500} c="white" size="sm">{topic.name}</Text>
                                                </Group>
                                                <Group gap="xs">
                                                    <Progress
                                                        value={topic.popularity}
                                                        size="xs"
                                                        radius="xl"
                                                        style={{ flex: 1 }}
                                                    />
                                                    <Text size="xs" fw={600} c="blue.4">{topic.popularity}%</Text>
                                                </Group>
                                            </Paper>
                                        ))}
                                    </SimpleGrid>
                                </Stack>
                            </Card>
                        </Grid.Col>
                    </Grid>
                </Container>
            </Box>

            {/* Contact Section */}
            <Box style={{ background: 'rgba(0, 0, 0, 0.3)', position: 'relative', zIndex: 10 }} py={80}>
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
                                        style={{
                                            background: 'rgba(59, 130, 246, 0.2)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)'
                                        }}
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
                                    {[
                                        { icon: IconMail, label: "Email", value: "info@whatsnxt.in" },
                                        { icon: IconPhone, label: "Phone", value: "+91 6300711966" },
                                        { icon: IconCalendar, label: "Schedule", value: "Free 45-minute consultation" }
                                    ].map((contact, index) => (
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
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                }}
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
                                        style={{
                                            boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
                                        }}
                                        component='a'
                                        href='/contact-us'
                                    >
                                        Contact Us
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        fullWidth
                                        color="white"
                                        style={{
                                            border: '2px solid rgba(255, 255, 255, 0.2)',
                                            backdropFilter: 'blur(10px)'
                                        }}
                                        component='a'
                                        href='/contact-us'
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
                                        style={{
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            backdropFilter: 'blur(10px)'
                                        }}
                                    >
                                        Download Brochure
                                    </Button>
                                </Stack>
                            </Card>
                        </Grid.Col>
                    </Grid>
                </Container>
            </Box>

            <style>
                {`
                @keyframes float {
                    0%, 100% { 
                        transform: translateY(0px) rotate(0deg); 
                        opacity: 0.7;
                    }
                    50% { 
                        transform: translateY(-20px) rotate(10deg); 
                        opacity: 1;
                    }
                }
                `}
            </style>
        </Box>
    );
}