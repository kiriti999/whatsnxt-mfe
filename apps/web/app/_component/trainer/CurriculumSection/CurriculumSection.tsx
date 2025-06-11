import React, { FC, useState } from "react";
import {
  Button,
  Card,
  Divider,
  Group,
  Tooltip,
  TextInput,
  Title,
  Accordion,
  ActionIcon,
  Stack,
} from "@mantine/core";
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconDeviceFloppy,
  IconX,
} from "@tabler/icons-react";
import { LectureItem } from "../LectureItem/LectureItem";
import { EditOrderIndex } from "../LectureItem/EditOrderIndex";
import { CurriculumSectionProps } from '../types';

export const CurriculumSection: FC<CurriculumSectionProps> = ({
  courseId,
  sectionId,
  title,
  lectures,
  onAddLecture,
  onSaveLectureTitle,
  onUpdateTitle,
  onDelete,
  onUpdateLectureTitle,
  onDeleteLecture,
  isConfirmingSection,
  courseType,
  reorderLectureOrder,
  sectionOrder,
  totalSections,
  reorderSectionOrder,
  onVideoUpload,
  onDocUpload,
  onRemoveVideo,
  onRemoveDoc,
  onLectureLinksUpdated
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [newOrder, setNewOrder] = useState(sectionOrder);
  const [isOrderEditing, setIsOrderEditing] = useState(false);
  const handleSaveSectionTitle = () => {
    onUpdateTitle(newTitle);
    setIsEditing(false);
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      {/* Section Title */}
      <Accordion defaultValue="lecture">
        <Accordion.Item value="lecture">
          <Accordion.Control>
            <Stack gap={"sm"}>
              <Group align="center">
                {isEditing ? (
                  <TextInput
                    value={newTitle}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Section Title"
                    size={"sm"}
                  />
                ) : (
                  <Title order={5} mb={0}>
                    Section: {title}
                  </Title>
                )}
                <Group align="center">
                  {isEditing ? (
                    <>
                      <Tooltip label="Save section">
                        <ActionIcon
                          ml="xl"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveSectionTitle()
                          }}
                          size="md"
                          aria-label="Save section"
                        >
                          <IconDeviceFloppy size={26} />
                        </ActionIcon>
                      </Tooltip>

                      <Tooltip label="Cancel">
                        <ActionIcon
                          color="red"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(false);
                          }}
                          size="md"
                          aria-label="Cancel section title edit"
                        >
                          <IconX size={20} />
                        </ActionIcon>
                      </Tooltip>
                    </>
                  ) : (
                    <Group align="center">
                      <Tooltip label="Edit Section">
                        <ActionIcon
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(true);
                          }}
                          size="md"
                          aria-label="edit section name"
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>

                      <Tooltip label="Delete Section">
                        <ActionIcon
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete()
                          }}
                          size="md"
                          aria-label="delete section"
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  )}
                </Group>
              </Group>
              <EditOrderIndex
                placeholder="Index"
                order={sectionOrder}
                setIsEditing={setIsOrderEditing}
                isEditing={isOrderEditing}
                newOrder={newOrder}
                setNewOrder={setNewOrder}
                reorderLectureOrder={reorderSectionOrder}
                totalCount={totalSections}
              />
            </Stack>
          </Accordion.Control>

          <Accordion.Panel>
            {/* Lecture Items */}
            {lectures.map((lecture, index) => (
              <div key={index}>
                {lecture.isUnsaved ? (
                  <Group>
                    <TextInput
                      value={lecture.name}
                      onChange={(e) =>
                        onUpdateLectureTitle(index, e.target.value)
                      }
                      styles={{ input: { fontWeight: 500 } }}
                    />

                    <Tooltip label="Save lecture">
                      <ActionIcon
                        onClick={(e) => {
                          e.stopPropagation();
                          onSaveLectureTitle(index, lecture.name);
                        }}
                        size="lg"
                        aria-label="Save lecture"
                      >
                        <IconDeviceFloppy size={26} />
                      </ActionIcon>
                    </Tooltip>

                    <Tooltip label="Cancel">
                      <ActionIcon
                        color="red"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteLecture(index);
                        }}
                        size="md"
                        aria-label="cancel save lecture"
                      >
                        <IconX size={20} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                ) : (
                  <LectureItem
                    order={lecture.order}
                    isVideoPreview={lecture.isPreview}
                    totalCount={lectures.length}
                    name={lecture.name}
                    courseType={courseType}
                    docUrl={lecture.docUrl}
                    docPublicId={lecture.docPublicId}
                    videoPublicId={lecture.videoPublicId}
                    docResourceType={lecture.docResourceType}
                    videoResourceType={lecture.videoResourceType}
                    videoUrl={lecture.videoUrl}
                    onUpdateTitle={(newTitle) =>
                      onUpdateLectureTitle(index, newTitle)
                    }
                    reorderLectureOrder={reorderLectureOrder}
                    onDelete={() => onDeleteLecture(index)}
                    onDocUpload={onDocUpload}
                    onVideoUpload={onVideoUpload}
                    onRemoveVideo={onRemoveVideo}
                    onRemoveDoc={onRemoveDoc}
                    courseId={courseId}
                    sectionId={sectionId}
                    lectureId={lecture._id}
                    lectureLinks={lecture.lectureLinks}
                    onLectureLinksUpdated={onLectureLinksUpdated}
                  />
                )}
              </div>
            ))}

            <Divider my="md" />

            {/* Add Lecture Button */}
            <Button
              variant="outline"
              leftSection={<IconPlus size={16} />}
              onClick={onAddLecture}
              fullWidth
              disabled={
                lectures.some((lecture) => lecture.isUnsaved) ||
                isConfirmingSection
              } // Only disable if current section is confirming
            >
              Curriculum item
            </Button>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Card>
  );
};
