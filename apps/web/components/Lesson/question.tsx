'use client';
import React, { FC, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconArrowBack, IconArrowRight, IconBulb, IconChevronRight } from "@tabler/icons-react";
import { Box, Button, Card, Flex, Loader, Text, ThemeIcon, useMantineColorScheme } from "@mantine/core";
import useAuth from "../../hooks/Authentication/useAuth";
import styles from './question.module.css'

const LexicalEditor = lazy(() =>
  import('../StructuredTutorial/Editor/LexicalEditor').then(mod => ({
    default: mod.LexicalEditor
  }))
);

type QuestionProps = {
    showFullInfo?: boolean;
    slug: string;
    questionUpdated?: string;
    question: string;
    answerUpdated?: string;
    answer: string;
    courseSlug: string;
}

const Question: FC<QuestionProps> = ({
    showFullInfo,
    slug,
    questionUpdated,
    question,
    answerUpdated,
    answer,
    courseSlug,
}) => {
    const { user, isAuthenticated: isAuth } = useAuth();
    const router = useRouter();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const isAdmin = user?.role === "admin";

    return (
        <Card
            radius="lg"
            p="lg"
            withBorder
            className={styles.questionCard}
            style={{
                background: isDark
                    ? 'linear-gradient(135deg, var(--mantine-color-dark-6) 0%, var(--mantine-color-dark-7) 100%)'
                    : 'linear-gradient(135deg, var(--mantine-color-white) 0%, var(--mantine-color-gray-0) 100%)',
                borderColor: isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-2)',
                transition: 'all 0.3s ease',
            }}
        >
            {/* Question Header */}
            <Flex gap="md" align="flex-start">
                <ThemeIcon
                    size={44}
                    radius="xl"
                    variant="light"
                    color="blue"
                    style={{
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                    }}
                >
                    <IconBulb size={22} stroke={1.5} />
                </ThemeIcon>
                <Box style={{ flex: 1 }}>
                    <Text
                        size="lg"
                        fw={700}
                        c={isDark ? 'white' : 'dark.8'}
                        style={{ lineHeight: 1.4 }}
                    >
                        {(isAdmin && questionUpdated) ? questionUpdated : question}
                    </Text>
                </Box>
            </Flex>

            {/* Answer Section */}
            <Box
                className={styles.answerWrapper}
                mt="md"
                p="md"
                style={{
                    background: isDark ? 'var(--mantine-color-dark-7)' : 'var(--mantine-color-gray-0)',
                    borderRadius: '12px',
                    border: `1px solid ${isDark ? 'var(--mantine-color-dark-5)' : 'var(--mantine-color-gray-2)'}`,
                    borderLeft: `4px solid var(--mantine-color-blue-5)`,
                }}
            >
                <Box style={!showFullInfo ? { maxHeight: '150px', overflow: 'hidden' } : undefined}>
                    <Suspense fallback={<Loader size="sm" />}>
                        <LexicalEditor
                            value={(isAdmin && answerUpdated) ? answerUpdated : answer}
                            readOnly
                        />
                    </Suspense>
                </Box>

                {!showFullInfo && (
                    <Link href={`/interview/${slug}`} style={{ textDecoration: 'none' }}>
                        <Flex
                            align="center"
                            gap="xs"
                            mt="md"
                            pt="md"
                            style={{
                                borderTop: `1px solid ${isDark ? 'var(--mantine-color-dark-5)' : 'var(--mantine-color-gray-2)'}`,
                            }}
                        >
                            <Text
                                size="sm"
                                fw={600}
                                c="blue"
                                style={{ transition: 'all 0.2s ease' }}
                            >
                                See complete answer
                            </Text>
                            <IconChevronRight size={16} color="var(--mantine-color-blue-5)" />
                        </Flex>
                    </Link>
                )}
            </Box>

            {/* Back/Course Link */}
            {showFullInfo && (
                <Flex mt="lg" align="center">
                    {isAuth ? (
                        <Button
                            onClick={() => router.back()}
                            size="sm"
                            variant="subtle"
                            leftSection={<IconArrowBack size={16} />}
                            radius="xl"
                        >
                            Back to lessons
                        </Button>
                    ) : (
                        <Link href={`/courses/${courseSlug}` || ''} style={{ textDecoration: 'none' }}>
                            <Button
                                variant="light"
                                size="sm"
                                rightSection={<IconArrowRight size={16} />}
                                radius="xl"
                            >
                                Check out the full course
                            </Button>
                        </Link>
                    )}
                </Flex>
            )}
        </Card>
    );
}

export default Question;
