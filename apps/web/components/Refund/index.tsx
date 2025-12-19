import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, Checkbox, Flex, Group, Input, Text, Title } from "@mantine/core";
import styles from './styles.module.css';

const options = [
    {
        value: 'CRI',
        label: 'Content-Related Issues',
        desc: `Course Content Not as Described: The course may not match the advertised syllabus or promotional materials.
               Outdated Content: Lessons might be based on obsolete technologies or outdated practices.
               Insufficient Depth: The course might lack in-depth coverage of topics, making it unsuitable for the learner’s needs.
               Poor Quality: Content might be unstructured, poorly explained, or riddled with errors.` },
    {
        value: 'DI',
        label: 'Delivery Issues',
        desc: `Technical Problems: Learners face issues accessing the course platform, materials, or videos.
               Incomplete Delivery: Promised modules, resources, or live sessions are missing.
               Unqualified Instructors: The instructor’s expertise may not align with the course subject.`
    },
    {
        value: 'MIE',
        label: 'Mismatch in Expectations',
        desc: `Skill Level Misalignment: The course might be too advanced or too basic for the learner.
               Wrong Course Selection: The course may not align with the learner’s career goals or learning requirements.
               Lack of Customization: The course may not address specific learner needs (e.g., tailored industry skills).`
    },
    {
        value: 'FR',
        label: 'Financial Reasons',
        desc: `High Cost vs. Value: Learners might feel the course is not worth the price paid.
               Change in Financial Situation: Personal financial constraints might`,
    },
];

const renderCards = () => options.map((item) => (
    <Checkbox.Card radius="md" value={item.label} key={item.value} className={styles.root}>
        <Group wrap="nowrap" align="flex-start">
            <Checkbox.Indicator />
            <div>
                <Text className={styles.label}>{item.label}</Text>
                <Text className={styles.description}>{item.desc}</Text>
            </div>
        </Group>
    </Checkbox.Card>
));

interface RefundProps {
    handleRefund: (reasons: string[], message: string) => void;
    isRefundLoading: boolean;
    refundWindowText?: string;
}

const Refund = ({ handleRefund, isRefundLoading, refundWindowText = "You have 7 days to make a refund after purchase" }: RefundProps) => {
    const [isDisabled, setIsDisabled] = useState(false);

    const {
        watch,
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm({
        mode: "onChange", // Ensures validation is real-time
        defaultValues: {
            reasons: [],
            message: "",
        },
    });
    const reasonsField = watch('reasons');
    console.log(reasonsField, 'reasonsField');

    useEffect(() => {
        if (isRefundLoading || reasonsField.length === 0) {
            setIsDisabled(true);
        } else {
            setIsDisabled(false);
        }
    }, [isRefundLoading, reasonsField.length])

    console.log(errors, 'errors');

    return (
        <>
            <Title order={5}>{refundWindowText}</Title>
            <form onSubmit={handleSubmit(({ reasons, message }) => handleRefund(reasons, message))}>
                <Flex gap='sm' mt={8} direction='column'>
                    <Group gap="sm">
                        <Controller
                            name='reasons'
                            control={control}
                            rules={{ required: 'Choose at least one reason!' }}
                            render={({ field }) => (
                                <Checkbox.Group
                                    label="Select reason"
                                    withAsterisk
                                    {...field}
                                    error={errors.reasons?.message}
                                >
                                    <Flex mt="xs" direction='column' gap='md'>
                                        {renderCards()}
                                    </Flex>
                                </Checkbox.Group>
                            )}
                        />
                    </Group>
                    <Input
                        {...register('message')}
                        placeholder='message (optional)'
                        disabled={isRefundLoading}
                    />
                    <Button type="submit" size='sm' disabled={isDisabled}>
                        {isRefundLoading ? 'Loading...' : 'Refund'}
                    </Button>
                </Flex>
            </form>
        </>
    )
}

export default Refund;
