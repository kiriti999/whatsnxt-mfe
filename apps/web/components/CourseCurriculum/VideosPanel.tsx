'use client';
import { Accordion, ActionIcon, Anchor, Group, Text, Tooltip } from "@mantine/core";
import { IconFile, IconLink, IconPlayerPlay } from "@tabler/icons-react";
import useAuth from "../../hooks/Authentication/useAuth";
import Link from 'next/link';
import { useIsEnrolled } from "../../hooks/useIsEnrolled";

const VideosPanel = ({ courseId, userId, section, openVideoModal, isCourseReviewMode }) => {
    const { user } = useAuth();
    const { isEnrolled } = useIsEnrolled(courseId)
    const isAuthor = user?._id === userId;
    const isAdmin = user?.role === 'admin';

    return (
        <Accordion.Panel>
            {section.videos && section.videos.length > 0 ? (
                section.videos.filter(video => video.isPublish || isCourseReviewMode).length > 0 ? (
                    section.videos.filter(video => video.isPublish || isCourseReviewMode).map((item, index) => (
                        <Group
                            key={index}
                            py="xs"
                            px="0"
                            style={{
                                justifyContent: 'space-between',
                                borderBottom: index < section.videos.filter(video => video.isPublish || isCourseReviewMode).length - 1
                                    ? '1px solid var(--mantine-color-gray-2)'
                                    : 'none'
                            }}
                        >
                            <Group gap="sm" style={{ flex: 1 }}>
                                <IconPlayerPlay size={18} color="var(--mantine-color-indigo-6)" />
                                {item.videoUrl && (isEnrolled || isAuthor || isAdmin) ? (
                                    <Anchor
                                        size='sm'
                                        component="button"
                                        onClick={() => openVideoModal(item.videoUrl, index)}
                                        c="indigo"
                                        fw={500}
                                        style={{
                                            textDecoration: 'none',
                                            '&:hover': {
                                                textDecoration: 'underline'
                                            }
                                        }}
                                    >
                                        {item.name}
                                    </Anchor>
                                ) : (
                                    <Text size="sm" fw={500} c="dark">{item.name}</Text>
                                )}
                            </Group>

                            <Group gap="xs" wrap="nowrap">
                                {item.lectureLinks.map((link, linkIndex) => (
                                    <Tooltip label='Article link' key={linkIndex}>
                                        <ActionIcon
                                            size='sm'
                                            variant='subtle'
                                            color="gray"
                                            component={Link}
                                            href={link.link}
                                        >
                                            <IconLink size={16} stroke={1.5} />
                                        </ActionIcon>
                                    </Tooltip>
                                ))}

                                {item?.docUrl && (
                                    <Tooltip label='Course file'>
                                        <ActionIcon
                                            size='sm'
                                            variant='subtle'
                                            color="gray"
                                            component={Link}
                                            href={item.docUrl}
                                        >
                                            <IconFile size={16} stroke={1.5} />
                                        </ActionIcon>
                                    </Tooltip>
                                )}

                                {item.isPreview && (
                                    <Anchor
                                        size='xs'
                                        component="button"
                                        c="indigo"
                                        fw={600}
                                        onClick={() => openVideoModal(item.videoUrl, index)}
                                        style={{
                                            textDecoration: 'none',
                                            '&:hover': {
                                                textDecoration: 'underline'
                                            }
                                        }}
                                    >
                                        Preview
                                    </Anchor>
                                )}

                                <Text size='sm' c="dimmed" fw={500} style={{ minWidth: '70px', textAlign: 'right' }}>
                                    &lt; {Math.floor(item.videoDuration / 60) || '1'} Min(s)
                                </Text>
                            </Group>
                        </Group>
                    ))
                ) : (
                    <Text size="sm" c="dimmed">No videos available</Text>
                )
            ) : (
                <Text size="sm" c="dimmed">No videos available</Text>
            )}
        </Accordion.Panel>
    )
}

export default VideosPanel;
