import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Paper, SimpleGrid, TextInput, Textarea, Group, Button, Text, Box, Title, Flex, Stack, Container } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconMail } from '@tabler/icons-react';
import ContactIconsList from '../../app/_component/contact-us/ContactIcons';
import classes from './ContactUs.module.css';
import { mailAPI } from '../../apis/v1/mail';

export const ContactUsForm = () => {
    const { handleSubmit, control, reset, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            email: '',
            number: '',
            subject: '',
            message: '',
        },
    });

    const onSubmit = async (data) => {
        console.log('ContactUsForm:: onSubmit:: data:', data);

        try {
            // Call the API
            const payload = {
                name: data.name,
                email: data.email,
                number: data.number,
                subject: data.subject,
                text: data.message,
            }
            const result = await mailAPI.sendContactUsMail(payload)

            if (result.status === 'success') {
                // Show success notification
                notifications.show({
                    position: 'bottom-right',
                    title: 'Message Sent',
                    message: 'Your message has been successfully sent!',
                    color: 'green',
                    autoClose: 3000,
                });

                // Clear the form after successful submission
                reset();
            }
        } catch (error) {
            console.error('Error sending contact us email:', error);

            // Show error notification
            notifications.show({
                position: 'bottom-right',
                title: 'Error',
                message: 'Failed to send your message. Please try again later.',
                color: 'red',
                autoClose: 3000,
            });
        }
    };

    return (
        <Container my="5rem">
            {/* Enhanced Header */}
            <Flex align="center" gap="md" mb="xl" justify="center">
                <Box
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--mantine-color-indigo-6), var(--mantine-color-cyan-5))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)'
                    }}
                >
                    <IconMail size={20} color="white" />
                </Box>
                <div>
                    <Title
                        order={4}
                        fw={800}
                        style={{
                            background: 'linear-gradient(135deg, var(--mantine-color-indigo-7) 0%, var(--mantine-color-cyan-6) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        Get in Touch
                    </Title>
                    <Text c="dimmed" size="sm">
                        We'd love to hear from you
                    </Text>
                </div>
            </Flex>

            <Paper
                shadow="lg"
                radius="lg"
                w="100%"
                maw={1000}
                style={{
                    overflow: 'hidden',
                    border: '1px solid var(--mantine-color-gray-2)'
                }}
            >
                <div className={classes.wrapper}>
                    {/* Enhanced Information Sidebar */}
                    <Box
                        className={classes.contacts}
                        style={{
                            background: 'linear-gradient(135deg, var(--mantine-color-indigo-6) 0%, var(--mantine-color-cyan-5) 100%)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Decorative circles */}
                        <Box
                            style={{
                                position: 'absolute',
                                top: -30,
                                right: -30,
                                width: 120,
                                height: 120,
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.1)',
                                pointerEvents: 'none'
                            }}
                        />
                        <Box
                            style={{
                                position: 'absolute',
                                bottom: -40,
                                left: -40,
                                width: 150,
                                height: 150,
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.08)',
                                pointerEvents: 'none'
                            }}
                        />

                        <Stack gap="lg" style={{ position: 'relative', zIndex: 1 }}>
                            <div>
                                <Text fz={24} fw={700} c="white" mb="xs">
                                    Information
                                </Text>
                                <Text fz={14} c="rgba(255, 255, 255, 0.8)">
                                    Reach out to us through any of these channels
                                </Text>
                            </div>

                            <ContactIconsList />
                        </Stack>
                    </Box>

                    {/* Enhanced Form */}
                    <form className={classes.form} onSubmit={handleSubmit(onSubmit)}>
                        <Text fz="xl" fw={700} className={classes.title} mb="md">
                            Contact us
                        </Text>

                        <div className={classes.fields}>
                            <SimpleGrid cols={{ base: 1, sm: 2 }}>
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field }) => (
                                        <TextInput
                                            label="Your name"
                                            placeholder="Your name"
                                            {...field}
                                            error={errors.name?.message}
                                            radius="md"
                                            styles={{
                                                input: {
                                                    '&:focus': {
                                                        borderColor: 'var(--mantine-color-indigo-5)'
                                                    }
                                                }
                                            }}
                                        />
                                    )}
                                    rules={{ required: 'Name is required' }}
                                />
                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
                                        <TextInput
                                            label="Your email"
                                            placeholder="hello@example.com"
                                            {...field}
                                            error={errors.email?.message}
                                            radius="md"
                                            styles={{
                                                input: {
                                                    '&:focus': {
                                                        borderColor: 'var(--mantine-color-indigo-5)'
                                                    }
                                                }
                                            }}
                                        />
                                    )}
                                    rules={{
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                            message: 'Please enter a valid email address',
                                        },
                                    }}
                                />
                            </SimpleGrid>

                            <Controller
                                name="number"
                                control={control}
                                render={({ field }) => (
                                    <TextInput
                                        mt="md"
                                        label="Your number"
                                        placeholder="+91 ..."
                                        {...field}
                                        error={errors.number?.message}
                                        radius="md"
                                        styles={{
                                            input: {
                                                '&:focus': {
                                                    borderColor: 'var(--mantine-color-indigo-5)'
                                                }
                                            }
                                        }}
                                    />
                                )}
                                rules={{ required: 'Phone number is required' }}
                            />
                            <Controller
                                name="subject"
                                control={control}
                                render={({ field }) => (
                                    <TextInput
                                        mt="md"
                                        label="Subject"
                                        placeholder="Subject"
                                        {...field}
                                        error={errors.subject?.message}
                                        radius="md"
                                        styles={{
                                            input: {
                                                '&:focus': {
                                                    borderColor: 'var(--mantine-color-indigo-5)'
                                                }
                                            }
                                        }}
                                    />
                                )}
                                rules={{ required: 'Subject is required' }}
                            />

                            <Controller
                                name="message"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        mt="md"
                                        label="Your message"
                                        placeholder="Please include all relevant information"
                                        minRows={4}
                                        {...field}
                                        error={errors.message?.message}
                                        radius="md"
                                        styles={{
                                            input: {
                                                '&:focus': {
                                                    borderColor: 'var(--mantine-color-indigo-5)'
                                                }
                                            }
                                        }}
                                    />
                                )}
                                rules={{ required: 'Message is required' }}
                            />

                            <Group justify="flex-end" mt="xl">
                                <Button
                                    type="submit"
                                    variant="gradient"
                                    gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
                                    size="sm"
                                    radius="xl"
                                    leftSection={<IconMail size={18} />}
                                >
                                    Send message →
                                </Button>
                            </Group>
                        </div>
                    </form>
                </div>
            </Paper>
        </Container>
    );
};

export default ContactUsForm;
