import React, { FC, useCallback, useEffect, useState } from "react";
import {
  Accordion,
  Button,
  Card,
  Group,
  Text,
  TextInput,
  FileInput,
  ActionIcon,
  Tooltip,
  Stack,
  Box,
  Flex,
  Grid,
  Anchor,
} from "@mantine/core";
import {
  IconEdit,
  IconLink,
  IconUpload,
  IconDeviceFloppy,
  IconX,
  IconVideo,
  IconFileInfo,
} from "@tabler/icons-react";
import styles from './LectureItem.module.css'
import { notifications } from "@mantine/notifications";
import { CourseBuilderAPI } from "../../../../api/v1/courses/course-builder/course-builder-api";
import EditTextGroup from "./EditTextGroup";
import { EditOrderIndex } from "./EditOrderIndex";
import PreviewToggle from './PreviewToggle';
import { unifiedDeleteWebWorker, unifiedUploadWebWorker } from '../../../../utils/worker/assetManager';
import LectureLinksComponent from './LectureLinks'
import { assetType, LectureItemProps } from '../types';
import { modals } from '@mantine/modals';


export const LectureItem: FC<LectureItemProps> = ({
  name,
  videoUrl: initialVideoUrl,
  docUrl: intialDocUrl,
  docPublicId,
  videoPublicId,
  docResourceType,
  videoResourceType,
  onUpdateTitle,
  onDelete,
  courseId,
  sectionId,
  lectureId,
  courseType,
  order,
  totalCount,
  reorderLectureOrder,
  isVideoPreview,
  lectureLinks,
  onVideoUpload,
  onDocUpload,
  onRemoveVideo,
  onRemoveDoc,
  onLectureLinksUpdated
}) => {
  const [progress, setProgress] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isOrderEditing, setIsOrderEditing] = useState(false);
  const [newName, setNewName] = useState(name);
  const [newOrder, setNewOrder] = useState(order);
  const [file, setFile] = useState<File | null>(null);
  const [doc, setDoc] = useState<File | null>(null);
  const [docUrl, setDocUrl] = useState(intialDocUrl);
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
  const [docId, setDocId] = useState(docPublicId);
  const [videoId, setVideoId] = useState<string | undefined>(videoPublicId);
  const [fileResourceType, setDocResourceType] = useState(docResourceType);
  const [mediaResourceType, setVideoResourceType] = useState<string | undefined>(videoResourceType);

  const [videoLoading, setVideoLoading] = useState(false);
  const [docLoading, setDocLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [youtubeUrl, setYoutubeUrl] = useState<string | undefined>(
    initialVideoUrl
  );
  const [isEditingYoutube, setIsEditingYoutube] = useState(false);
  const [isPreview, setIsPreview] = useState(isVideoPreview);

  const [isEditingLectureLink, setIsEditingLectureLink] = useState(false);
  const [lectureLinksAr, setLectureLinksAr] = useState(lectureLinks || [])

  // Synchronize local preview state with prop on initial load
  useEffect(() => {
    setIsPreview(isVideoPreview);
  }, [isVideoPreview]);

  // Function to toggle preview and mark it as changed
  const togglePreview = (previewState) => {
    setIsPreview(previewState);
  };

  const handleSave = () => {
    onUpdateTitle(newName);
    setIsEditing(false);
  };

  const handleVideoSelect = (selectedFile: File | null) => {
    if (!selectedFile) {
      setFile(null); // Set to null when cleared
      return;
    }

    if (selectedFile.size / 1024 / 1024 > 99) {
      notifications.show({
        position: 'bottom-right',
        title: "File Too Large",
        message: "File size exceeds 99MB.",
        color: "red",
      });
      return;
    }

    setFile(selectedFile);
  };

  const handleDocSelect = (selectedFile: File | null) => {
    if (!selectedFile) {
      setDoc(null); // Set to null when cleared
      return;
    }

    if (selectedFile.size / 1024 / 1024 > 99) {
      notifications.show({
        position: 'bottom-right',
        title: "File Too Large",
        message: "File size exceeds 99MB.",
        color: "red",
      });
      return;
    }

    setDoc(selectedFile);
  };

  const uploadAssetToCloud = async (file: File, lectureId, setProgress, resource_type): Promise<assetType> => {
    console.log(' uploadAssetToCloud :: resource_type:', resource_type)
    const data = new FormData();
    data.append("file", file);
    data.append("resource_type", resource_type);
    const result = await unifiedUploadWebWorker({ file, folder: lectureId, resource_type, setProgress })
    return result;
  };

  const handleVideoUpload = async () => {
    if (!file) {
      notifications.show({
        position: 'bottom-right',
        title: "No File Selected",
        message: "Please select a file to upload.",
        color: "red",
      });
      return;
    }

    setVideoLoading(true);
    setProgress(0);

    try {
      const { secure_url, duration: videoDuration, public_id, resource_type } = await uploadAssetToCloud(
        file, lectureId, setProgress, 'video'
      );

      await CourseBuilderAPI.addLectureVideo({
        courseId,
        sectionId,
        lectureId,
        videoUrl: secure_url,
        videoDuration,
        isPreview,
        public_id,
        resource_type
      });

      // Update the frontend state with the new video data
      onVideoUpload(sectionId, lectureId, {
        videoUrl: secure_url,
        videoDuration,
        videoPublicId: public_id,
        videoResourceType: resource_type,
      });

      setVideoUrl(secure_url);
      setVideoId(public_id)
      setVideoResourceType(resource_type)

      notifications.show({
        position: 'bottom-right',
        title: "Upload Successful",
        message: "Video uploaded successfully.",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        position: 'bottom-right',
        title: "Upload Error",
        message: "Error uploading video.",
        color: "red",
      });
      console.error("File upload error:", error);
    } finally {
      setVideoLoading(false);
      setFile(null);
      setProgress(0);
    }
  };

  const handlePreviewMode = async () => {
    try {
      setVideoLoading(true);

      await CourseBuilderAPI.updateLectureVideoPreview({
        courseId,
        sectionId,
        lectureId,
        isPreview,
      });

      notifications.show({
        position: 'bottom-right',
        title: "Changes Saved",
        message: "Preview saved successfully.",
        color: "green",
      });

    } catch (error) {
      notifications.show({
        position: 'bottom-right',
        title: "Preview Error",
        message: "Error saving preview",
        color: "red",
      });
      console.error("Preview save error:", error);
    } finally {
      setVideoLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!doc) {
      notifications.show({
        position: 'bottom-right',
        title: "No File Selected",
        message: "Please select a file to upload.",
        color: "red",
      });
      return;
    }

    if (doc.name.length > 110) {
      notifications.show({
        position: 'bottom-right',
        title: 'Filename Error',
        message: 'Filename is too long. It should be less than 111 chars',
        color: 'red'
      });
      return
    }

    setDocLoading(true);

    try {
      const typeMap: Record<string, string> = {
        'application/msword': 'raw',
        'application/pdf': 'image',
        'application/vnd.ms-powerpoint': 'raw',
        'text/csv': 'raw',
      };
      const type = typeMap[doc.type] || 'auto';

      // Upload file to cloud
      const uploadResult = await uploadAssetToCloud(
        doc, lectureId, setProgress, type
      );
      console.log(' handleFileUpload :: uploadResult:', uploadResult)
      console.log(' handleFileUpload :: doc:', doc)

      // Validate upload result
      if (!uploadResult || !uploadResult.secure_url || !uploadResult.public_id) {
        throw new Error('Invalid upload response');
      }

      const { secure_url, public_id, resource_type } = uploadResult;

      // Save file data to the backend
      const response = await CourseBuilderAPI.addLectureDoc({
        courseId,
        sectionId,
        lectureId,
        docUrl: secure_url,
        public_id,
        resource_type,
      });

      // Update component state
      setDocUrl(secure_url);
      setDocId(public_id);
      setDocResourceType(resource_type);

      // Update the frontend state
      onDocUpload(sectionId, lectureId, {
        docUrl: secure_url,
        docPublicId: public_id,
        docResourceType: resource_type,
      });

      notifications.show({
        position: 'bottom-right',
        title: "Upload Successful",
        message: "Document uploaded successfully.",
        color: "green",
      });

    } catch (error) {
      console.error("File upload error:", error);

      // Handle specific error types
      if (error.message.includes('File is required')) {
        notifications.show({
          position: 'bottom-right',
          title: 'File Error',
          message: 'Please select a valid file.',
          color: 'red'
        });
      } else {
        notifications.show({
          position: 'bottom-right',
          title: 'Upload Failed',
          message: error.message || 'Failed to upload file.',
          color: 'red'
        });
      }
    } finally {
      setDocLoading(false);
      setDoc(null);
    }
  };

  const handleSaveYoutubeUrl = async () => {
    try {
      setVideoLoading(true);
      await CourseBuilderAPI.addLectureVideo({
        courseId,
        sectionId,
        lectureId,
        videoUrl: youtubeUrl,
        videoDuration: "",
        isPreview: true, // Free videos are always visible
        public_id: '',
      });

      setVideoUrl(youtubeUrl);
      setIsEditingYoutube(false);

      // Update the frontend state with the new video data
      onVideoUpload(sectionId, lectureId, {
        videoUrl: youtubeUrl
      });

      notifications.show({
        position: 'bottom-right',
        title: "URL Saved",
        message: "YouTube URL saved successfully.",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        position: 'bottom-right',
        title: "Error",
        message: "Failed to save YouTube URL.",
        color: "red",
      });
      console.error("Error saving YouTube URL:", error);
    } finally {
      setVideoLoading(false);
    }
  };

  const handleDelete = async (
    e: any,
    resource_type: 'video' | 'doc',
    deleteLectureVideoAPI: () => Promise<void>,
    setAssetUrl: (url: string | undefined) => void,
    setAssetFile: (file: File | null) => void
  ) => {
    modals.openConfirmModal({
      title: `Confirm ${resource_type.charAt(0).toUpperCase() + resource_type.slice(1)} Deletion`,
      centered: true,
      children: (
        <p>Are you sure you want to remove this {resource_type}? This action cannot be undone.</p>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          setLoading(true);
          const resourceType = e.target.dataset.resourceType;

          const { success } = await unifiedDeleteWebWorker({
            assetsList: [{ public_id: e.target.id, resource_type: resourceType }],
            clearLocalStorage: true
          });

          if (success) {
            // removeAssetFromLocalStoragesList([e.target.id]);
            // Proceed with database deletion if cloud deletion succeeded
            const response: any = await deleteLectureVideoAPI();
            if (response.status === 200 && resource_type === 'video') {
              onRemoveVideo(sectionId, lectureId);
            }
            if (response.status === 200 && resource_type === 'doc') {
              onRemoveDoc(sectionId, lectureId);
            }
            setAssetUrl(undefined);
            setAssetFile(null);

            notifications.show({
              position: 'bottom-right',
              title: `${resource_type.charAt(0).toUpperCase() + resource_type.slice(1)} Removed`,
              message: `${resource_type.charAt(0).toUpperCase() + resource_type.slice(1)} removed successfully.`,
              color: "green",
            });
            console.log(`${resource_type.charAt(0).toUpperCase() + resource_type.slice(1)} deleted successfully from the database.`);
          } else {
            notifications.show({
              position: 'bottom-right',
              title: "Error",
              message: `Failed to remove ${resource_type}.`,
              color: "red",
            });
            console.error(`Failed to delete ${resource_type} from the cloud.`);
          }
        } catch (error) {
          notifications.show({
            position: 'bottom-right',
            title: "Error",
            message: `Failed to remove ${resource_type}.`,
            color: "red",
          });
          console.error(`Error deleting ${resource_type}:`, error);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Usage for handleDeleteVideo
  const handleDeleteVideo = (e) => {
    return handleDelete(e,
      'video',
      () => CourseBuilderAPI.deleteLectureVideo({ courseId, sectionId, lectureId }),
      setVideoUrl,
      setFile
    );
  }

  // Usage for handleDeleteDoc
  const handleDeleteDoc = (e) =>
    handleDelete(
      e,
      'doc',
      () => CourseBuilderAPI.deleteLectureDoc({ courseId, sectionId, lectureId }),
      setDocUrl,
      setDoc
    );

  // use to add new temporaray link to link array on add button click
  const handleAddLectureeLink = async () => {
    if (!isEditingLectureLink) {
      const newLink = { link: '', isNewLink: true, id: Math.random().toString(), isEditing: true };
      setLectureLinksAr([...lectureLinksAr, newLink]);
    }
  }

  // usage for save lecture links
  const handleSaveLectureLink = async (link) => {
    try {
      setLoading(true);
      const newLectureLinks = await CourseBuilderAPI.addLectureLink({
        courseId,
        sectionId,
        lectureId,
        link
      });
      setLectureLinksAr(newLectureLinks.data);

      notifications.show({
        position: 'bottom-right',
        title: "Link Saved",
        message: "Lecture Link saved successfully.",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        position: 'bottom-right',
        title: "Error",
        message: "Failed to add lecture link.",
        color: "red",
      });
      console.error("Error adding lecture link:", error);
    } finally {
      setLoading(false);
    }
  }

  // used to handle any link is being edited or not to disable add button
  const handleEditLectureClick = async (linkId, isNew, isEditing = true) => {
    const updatedLinks = lectureLinksAr.map((link) => {
      if (isNew) {
        if (link.id === linkId) {
          return { ...link, isEditing };
        }
      } else {
        if (link._id === linkId) {
          return { ...link, isEditing };
        }
      }
      return link;
    })
    setLectureLinksAr(updatedLinks)
  }

  // usage for updating lecture link
  const handleUpdateLectureLink = async (linkId, link) => {
    try {
      setLoading(true);
      const updatedData = await CourseBuilderAPI.updateLectureLink({
        courseId,
        sectionId,
        lectureId,
        linkId,
        link
      });
      setLectureLinksAr(updatedData.data);

      notifications.show({
        position: 'bottom-right',
        title: "Link Saved",
        message: "Lecture Link saved successfully.",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        position: 'bottom-right',
        title: "Error",
        message: "Failed to update lecture link.",
        color: "red",
      });
      console.error("Error updating lecture link:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleLectureLinkDelete = async (linkId, isNew) => {
    try {
      setLoading(true);
      await CourseBuilderAPI.deleteLectureLink({
        courseId,
        sectionId,
        lectureId,
        linkId,
      });

      const newLinkAr = lectureLinksAr.filter((item) => {
        if (isNew) {
          return !(item.id === linkId)
        } else {
          return !(item._id === linkId)
        }
      });
      setLectureLinksAr(newLinkAr);
      notifications.show({
        position: 'bottom-right',
        title: "Link Deleted",
        message: "Lecture Link deleted successfully.",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        position: 'bottom-right',
        title: "Error",
        message: "Failed to delete lecture link.",
        color: "red",
      });
      console.error("Error deleting lecture link:", error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // to check and update if any link is being updated then it will update add button disable state
    const isAnyEditing = lectureLinksAr.some(link => link.isEditing === true)
    setIsEditingLectureLink(isAnyEditing);

    //if lecture link array is changed it will get pushed to section
    onLectureLinksUpdated(sectionId, lectureId, lectureLinksAr);
  }, [lectureLinksAr])


  return (
    <Card shadow="xs" padding="md" radius="md" withBorder my="md">
      <Accordion defaultValue="lecture">
        <Accordion.Item value="lecture">
          <Accordion.Control>
            <EditTextGroup
              setIsEditing={setIsEditing}
              isEditing={isEditing}
              newName={newName}
              name={name}
              setNewName={setNewName}
              handleSave={handleSave}
              onDelete={onDelete}
            />
          </Accordion.Control>

          <Accordion.Panel>
            {courseType === "free" ? (
              <>
                {isEditingYoutube ? (
                  <Flex align="center" onClick={(e) => e.stopPropagation()} gap="xs">
                    <TextInput
                      placeholder="Enter YouTube URL"
                      value={youtubeUrl || ""}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                    />

                    <Tooltip label="Save">
                      <ActionIcon
                        loading={videoLoading}
                        loaderProps={{ type: 'dots' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveYoutubeUrl();
                        }}
                        size="md"
                        aria-label="save youtube url"
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
                          setIsEditingYoutube(false);
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
                    {videoUrl ? (
                      <Text
                        component="a"
                        href={videoUrl}
                        target="_blank"
                        style={{
                          color: "blue",
                          fontSize: "14px",
                          fontWeight: 500,
                        }}
                      >
                        <IconLink size={16} style={{ marginRight: 5 }} /> View
                        Video
                      </Text>
                    ) : (
                      <Box>
                        <Text c="dimmed">No YouTube URL provided</Text>
                      </Box>
                    )}
                    <Button
                      id={videoId || videoPublicId}
                      data-resource-type={mediaResourceType || videoResourceType}
                      variant="subtle"
                      onClick={() => setIsEditingYoutube(true)}
                    >
                      <IconEdit size={16} /> Edit URL
                    </Button>
                  </Group>
                )}
              </>
            ) : (
              <Card shadow="xs" padding="lg" radius="md" withBorder>
                <Stack mb={'sm'}>
                  {videoUrl ? (
                    <Grid gutter={0}>
                      <Grid.Col span={1}>
                        <Text>Video: </Text>
                      </Grid.Col>
                      <Grid.Col span={4}>
                        <Group align="flex-start" gap={'xl'}>
                          <Tooltip label={'View Video'}>
                            <Text
                              component="a"
                              href={videoUrl}
                              target="_blank"
                            >
                              <IconVideo size={18} />
                            </Text>
                          </Tooltip>
                          <Tooltip label={'Delete Video'}>
                            <Text className={styles.cursor}
                              onClick={(e) => { handleDeleteVideo(e) }}>
                              <IconX size={18} id={videoId}
                                data-resource-type={mediaResourceType} />
                            </Text>
                          </Tooltip>
                          <Anchor>
                            <PreviewToggle isPreview={isPreview} togglePreview={togglePreview} size={18} />
                          </Anchor>
                          <Tooltip label={'Update preview mode'}>
                            <ActionIcon
                              loading={videoLoading}
                              loaderProps={{ type: 'dots' }}
                              variant='subtle'
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreviewMode();
                              }}
                              size="md"
                              aria-label="Update preview mode"
                            >
                              <IconDeviceFloppy size={20} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Grid.Col>
                    </Grid>
                  ) : (
                    <Group>
                      <FileInput
                        clearable
                        placeholder="Select video file"
                        leftSection={<IconUpload size={16} />}
                        value={file}
                        onChange={handleVideoSelect}
                        accept="video/*"
                      />
                      <PreviewToggle isPreview={isPreview} togglePreview={togglePreview} size={22} />
                      <Tooltip label="Save video">
                        <ActionIcon
                          loading={videoLoading}
                          loaderProps={{ type: 'dots' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVideoUpload();
                          }}
                          size="lg"
                          aria-label="Upload video"
                        >
                          <IconDeviceFloppy size={22} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  )}

                  {docUrl ? (
                    <Grid mb={'md'}>
                      <Grid.Col span={1}>
                        <Text>Files: </Text>
                      </Grid.Col>
                      <Grid.Col span={4}>
                        <Group align="baseline" gap={'xl'}>
                          <Tooltip label={'View doc'}>
                            <Text
                              className={styles.cursor}
                              component="a"
                              href={docUrl}
                              target="_blank"
                            >
                              <IconFileInfo size={18} />
                            </Text>
                          </Tooltip>
                          <Tooltip label={'Remove doc'}>
                            <Text
                              onClick={(e) => { handleDeleteDoc(e) }}
                              className={styles.cursor}>
                              <IconX size={18} id={docId}
                                data-resource-type={fileResourceType} />
                            </Text>
                          </Tooltip>
                        </Group>
                      </Grid.Col>
                    </Grid>
                  ) : (
                    <Group>
                      <FileInput
                        clearable
                        placeholder="Select doc file"
                        leftSection={<IconUpload size={16} />}
                        value={doc}
                        onChange={handleDocSelect}
                        accept=".pdf,.csv,.ppt,.doc,.docx"
                      />
                      <Tooltip label="Save file">
                        <ActionIcon
                          loading={docLoading}
                          loaderProps={{ type: 'dots' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFileUpload();
                          }}
                          size="lg"
                          aria-label="Upload doc"
                        >
                          <IconDeviceFloppy size={22} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  )}
                </Stack>

                <EditOrderIndex
                  placeholder="Index"
                  order={order}
                  setIsEditing={setIsOrderEditing}
                  isEditing={isOrderEditing}
                  newOrder={newOrder}
                  setNewOrder={setNewOrder}
                  reorderLectureOrder={reorderLectureOrder}
                  totalCount={totalCount}
                />
              </Card>
            )}
            <LectureLinksComponent allLinks={lectureLinksAr} lectureId={lectureId} onSaveLectureLink={handleSaveLectureLink} onLectureLinkUpdate={handleUpdateLectureLink} isEditingLectureLink={isEditingLectureLink} onAddLectureClick={handleAddLectureeLink} onLectureLinkDelete={handleLectureLinkDelete} onEditClick={handleEditLectureClick} />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Card>
  );
};
