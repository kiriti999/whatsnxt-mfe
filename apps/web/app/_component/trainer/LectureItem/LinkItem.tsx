import React, { useEffect, useState } from 'react';
import { ActionIcon, Flex, Group, TextInput, Tooltip, Text, Box, Button } from '@mantine/core';
import { IconDeviceFloppy, IconEdit, IconLink, IconTrash, IconX } from "@tabler/icons-react";

const LinkItem = ({ link, isNewLink = false, onSaveLectureLink, onLectureLinkUpdate, onLectureLinkDelete, onEditClick }) => {
    const [editingLink, setEditingLink] = useState(isNewLink)
    const [lectureLink, setLectureLink] = useState("");
    const [lectureTempLink, setLectureTempLink] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // to handle save button click if link is temprorary it will update or else it will call function to add neew link
    const handleSaveLink = async () => {
        if (link?._id) {
            onLectureLinkUpdate(link._id, lectureTempLink)
        } else {
            onSaveLectureLink(lectureTempLink);
        }

        setLectureLink(lectureTempLink);
        setEditingLink(false)
        handleEditState(false)
    }

    // to handle delete button click
    const handleDeleteLink = async () => {
        if (isNewLink) {
            onLectureLinkDelete(link?.id, isNewLink)
        } else {
            onLectureLinkDelete(link?._id, isNewLink)
        }
    }


    // to manage edit state of link
    const handleEditState = (status) => {
        if (link?._id) {
            onEditClick(link?._id, isNewLink, status);
        } else {
            onEditClick(link?.id, isNewLink, status);
        }
    }

    // to handle edit button click
    const handleEditClick = async (editStatus) => {
        setEditingLink(editStatus);
        if (editStatus === false) {
            if (lectureLink !== '') {
                handleEditState(editStatus);
            }
        } else {
            setLectureTempLink(lectureLink)
            handleEditState(editStatus);
        }
    }

    // if link is changed it will update the link text
    useEffect(() => {
        if (link?.link) {
            setLectureLink(link?.link)
            setLectureTempLink(link?.link)
        }
    }, [link])

    return (
        <Group mb="sm">
            {editingLink ? (
                <Flex align="center" onClick={(e) => e.stopPropagation()} gap="xs">
                    <TextInput
                        placeholder="Enter Lecture Link URL"
                        value={lectureTempLink || ""}
                        onChange={(e) => setLectureTempLink(e.target.value)}
                    />

                    <Tooltip label="Save">
                        <ActionIcon
                            loading={isLoading}
                            loaderProps={{ type: 'dots' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSaveLink();
                            }}
                            size="md"
                            aria-label="save lecture url"
                        >
                            <IconDeviceFloppy size={16} />
                        </ActionIcon>
                    </Tooltip>

                    <Tooltip label="Cancel">
                        <ActionIcon
                            color="red"
                            variant="outline"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(false);
                            }}
                            size="md"
                            aria-label="cancel order index"
                        >
                            <IconX size={20} />
                        </ActionIcon>
                    </Tooltip>
                </Flex>
            ) : (
                <Group align="center">
                    {lectureLink ? (
                        <Text
                            component="a"
                            href={lectureLink}
                            target="_blank"
                            style={{
                                color: "blue",
                                fontSize: "14px",
                                fontWeight: 500,
                            }}
                        >
                            <IconLink size={16} style={{ marginRight: 5 }} /> View
                            link
                        </Text>
                    ) : (
                        <Box>
                            <Text c="dimmed">No Lecture Link provided</Text>
                        </Box>
                    )}
                    <Button
                        variant="subtle"
                        onClick={() => handleEditClick(true)}
                    >
                        <IconEdit size={16} />
                    </Button>
                    <Tooltip label="Remove Link">
                        <ActionIcon
                            variant="outline"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLink();
                            }}
                            size="md"
                            aria-label="delete link"
                        >
                            <IconTrash size={16} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            )}

        </Group>
    );
};

export default LinkItem;
