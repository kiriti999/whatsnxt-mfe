'use client';
import { Accordion, ActionIcon, Anchor, Group, Text, Tooltip } from "@mantine/core";
import { IconFile, IconLink, IconVideo } from "@tabler/icons-react";
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
                        <Group key={index} style={{ marginBottom: '1rem', justifyContent: 'space-between' }}>
                            <Group>
                                <IconVideo size={18} />
                                {item.videoUrl && (isEnrolled || isAuthor || isAdmin) ? (
                                    <Anchor size='md'
                                        component="button"
                                        onClick={() => openVideoModal(item.videoUrl, index)}
                                        c="indigo"
                                    >
                                        {item.name}
                                    </Anchor>
                                ) : (
                                    <Text>{item.name}</Text>
                                )}
                            </Group>
                            <Group>
                                {item.lectureLinks.map((link, index) => {
                                    return (
                                        <Tooltip label='Article link' key={index}>
                                            <ActionIcon size='xs' variant='subtle' component={Link} href={link.link}>
                                                <IconLink stroke={2} />
                                            </ActionIcon>
                                        </Tooltip>
                                    )
                                })}
                                {item?.docUrl && <Group>
                                    <Tooltip label='Course file'>
                                        <ActionIcon size='xs' variant='subtle' component={Link} href={item.docUrl}>
                                            <IconFile stroke={2} />
                                        </ActionIcon>
                                    </Tooltip>
                                </Group>}
                                <Group>
                                    {item.isPreview && (
                                        <Anchor size='md'
                                            component="button"
                                            c="indigo"
                                            onClick={() => openVideoModal(item.videoUrl, index)}
                                        >
                                            Preview
                                        </Anchor>
                                    )}
                                    {/* Display the video duration */}
                                    <Text size='md'>{Math.floor(item.videoDuration / 60) || '< 1'} Min(s)</Text>
                                </Group>
                            </Group>
                        </Group>
                    ))
                ) : (
                    <Text>No videos available</Text>
                )
            ) : (
                <Text>No videos available</Text>
            )}
        </Accordion.Panel>
    )
}

export default VideosPanel;
