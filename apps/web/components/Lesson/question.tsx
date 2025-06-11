'use client';
import React, { FC } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconArrowBack, IconArrowRight } from "@tabler/icons-react";
import { Box, Button, Card, Flex, Text } from "@mantine/core";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import useAuth from "../../hooks/Authentication/useAuth";
import styles from './question.module.css'

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

    const isAdmin = user?.role === "admin";

    return (
        <>
            <Card radius="md" p={0}>
                <Flex direction="row" wrap="wrap" gap="sm">
                    <Text size='md' fw={700} style={{ textAlign: "justify" }}>
                        {(isAdmin && questionUpdated) ? questionUpdated : question}
                    </Text>
                </Flex>
                <Box
                    className={styles['answer-wrapper']}
                >
                    <Text lineClamp={showFullInfo ? 0 : 3}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {(isAdmin && answerUpdated) ? answerUpdated : answer}
                        </ReactMarkdown>
                    </Text>
                    {!showFullInfo && (
                        <Link href={`/interview/${slug}`}>
                            <Text size='sm'>See complete answer</Text>
                        </Link>
                    )}
                </Box>
                {showFullInfo && (
                    <Flex mt={'sm'} align={'center'}>
                        {isAuth ? (
                            <Button onClick={() => router.back()} size='xs' variant='transparent'>
                                <Text size={'0.93rem'}>
                                    <IconArrowBack size={16} style={{ marginRight: '0.5rem' }} />
                                    Back to lessons page</Text>
                            </Button>
                        ) : (
                            <Link href={`/courses/${courseSlug}` || ''}>
                                <Text ml={'0.6rem'} size={'0.93rem'}>
                                    <IconArrowRight size={16} style={{ marginRight: '0.5rem' }} />
                                    Check out the full course</Text>
                            </Link>
                        )}
                    </Flex>
                )
                }
            </Card>

        </>
    )
}

export default Question;
