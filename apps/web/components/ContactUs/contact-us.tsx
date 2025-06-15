import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Paper, SimpleGrid, TextInput, Textarea, Group, Button, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import ContactIconsList from '../../app/_component/contact-us/ContactIcons';
import classes from './ContactUs.module.css';
import { mailAPI } from '../../api/v1/mail';

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
        console.log('Form Data:', data);

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
            console.log('🚀 ~ onSubmit ~ result:', result)

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
        <div className="ptb-30 container d-flex flex-column align-items-center">
            <Paper shadow="xl" radius="lg" w="100%" maw={1000}>
                <div className={classes.wrapper}>
                    <div className={classes.contacts} style={{ background: '#228be6' }}>
                        <Text fz={22} className={classes.title} c={'white'}>
                            Information
                        </Text>

                        <ContactIconsList />
                    </div>

                    <form className={classes.form} onSubmit={handleSubmit(onSubmit)}>
                        <Text fz="lg" fw={700} className={classes.title}>
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
                                        minRows={3}
                                        {...field}
                                        error={errors.message?.message}
                                    />
                                )}
                                rules={{ required: 'Message is required' }}
                            />

                            <Group justify="flex-end" mt="md">
                                <Button type="submit" className={classes.control}>
                                    Send message
                                </Button>
                            </Group>
                        </div>
                    </form>
                </div>
            </Paper>
        </div>
    );
};

export default ContactUsForm;
