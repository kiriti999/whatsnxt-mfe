'use client';
import Link from 'next/link';
import { Accordion, Title, Text, Tooltip, Flex, Stack } from '@mantine/core';
import { IconFileInfo, IconStarFilled, IconVideo } from '@tabler/icons-react';
import styles from './lesson.module.css';

const Syllabus = ({ sections, courseSlug }) => {

    if (!sections || sections.length === 0) {
        return <Text>No syllabus available.</Text>;
    }

    return (
        <div className={styles.syllabus}>
            <Title order={3}>Syllabus</Title>
            <Accordion>
                {sections.map(({ sectionTitle, videos, _id: sectionId }, i) => {
                    if (!videos || videos.length === 0) {
                        return (
                            <Accordion.Item key={sectionId} value={sectionTitle}>
                                <Accordion.Control icon={`0${i + 1}`}>{sectionTitle}</Accordion.Control>
                                <Accordion.Panel>
                                    <Text>No videos found in this section.</Text>
                                </Accordion.Panel>
                            </Accordion.Item>
                        );
                    }

                    return (
                        <Accordion.Item key={sectionId} value={sectionTitle}>
                            <Accordion.Control icon={`0${i + 1}`}>{sectionTitle}</Accordion.Control>
                            <Accordion.Panel>
                                <ul className={styles['videos-container']}>
                                    {videos.map((video) => (
                                        <li key={video._id}>
                                            <Stack>
                                                <Flex align={'center'} gap={'sm'}>
                                                    <IconVideo size={18} />
                                                    <Link href={`/courses/${courseSlug}/section/${sectionId}/lesson/${video._id}`} passHref>
                                                        <Text lineClamp={1}>{video.name}</Text>
                                                    </Link>
                                                </Flex>

                                                {video?.docUrl && (
                                                    <Flex align={'center'} gap={'sm'}>
                                                        <Tooltip label={'Download'}>
                                                            <IconFileInfo size={18} />
                                                        </Tooltip>
                                                        <Link href={video.docUrl} passHref>
                                                            <Text lineClamp={1}>Resources</Text>
                                                        </Link>
                                                    </Flex>
                                                )}
                                            </Stack>
                                        </li>
                                    ))}
                                </ul>
                            </Accordion.Panel>
                        </Accordion.Item>
                    );
                })}

                {sections.length > 0 && (
                    <Accordion.Item key={"review"} value={"rating-review"}>
                        <Accordion.Control icon={(sections.length + 1).toString().padStart(2, "0")}>
                            User feedback section
                        </Accordion.Control>
                        <Accordion.Panel>
                            <ul className={styles['videos-container']}>
                                <li>
                                    <Flex align={'center'} gap={'sm'}>
                                        <IconStarFilled size={18} />
                                        <Link href={`/courses/${courseSlug}/section/${sections[0]._id}/lesson/review`} passHref>
                                            <Text>Review and Rating</Text>
                                        </Link>
                                    </Flex>
                                </li>
                            </ul>
                        </Accordion.Panel>
                    </Accordion.Item>
                )}
            </Accordion>
        </div>
    );
};

export default Syllabus;
