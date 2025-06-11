'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Accordion, ActionIcon, Box, Button, Card, Group, Stack, TextInput, Title, Tooltip } from "@mantine/core";
import { IconDeviceFloppy, IconEdit, IconPlus, IconTrash, IconX } from "@tabler/icons-react";
import { CurriculumSection } from "../CurriculumSection/CurriculumSection";
import {
	addLectureToSection,
	addSection,
	createSection,
	deleteCourse,
	deleteLecture,
	deleteSection,
	handleCourseNameSave,
	saveLectureTitle,
	updateLectureTitle,
	updateSectionTitle,
	getVideoAndDocActions
} from "./actions";
import { deleteAssetWebWorker } from "../LectureItem/assetUploader";
import { CourseBuilderAPI } from "../../../../api/v1/courses/course-builder/course-builder-api";
import { useDashboardContext } from "../../../../context/DashboardContext";

const Curriculum = ({ courseId, courseWithSections }) => {
	const [isEditingCourseName, setIsEditingCourseName] = useState(false);
	const [newCourseName, setNewCourseName] = useState(
		courseWithSections?.courseName || ""
	);
	const [isConfirmingSection, setIsConfirmingSection] = useState(false);
	const [sections, setSections] = useState(courseWithSections?.sections || []);
	const router = useRouter();
	const { enabledSections, setEnabledSections } = useDashboardContext();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { onVideoUpload, onDocUpload, onRemoveVideo, onRemoveDoc, onLectureLinksUpdated } = getVideoAndDocActions(setSections)

	const reorderLectureOrder = async (
		sectionIndex: number,
		oldOrder: number,
		newOrder: number,
		cb: () => void
	) => {
		const updatedSections = [...sections];
		const section = updatedSections[sectionIndex];
		try {
			const savedLecture = await CourseBuilderAPI.reorderVideos({
				sectionId: section._id,
				oldOrder,
				newOrder,
			});

			// Update lecture with new ID and remove unsaved flagS
			section.videos = savedLecture;
			setSections(updatedSections);
			cb();
			console.log("Lecture reordered successfully", savedLecture);
		} catch (error) {
			console.error("Error reordering lecture :", error);
		}
	};

	const reorderSectionOrder = async (
		oldOrder: number,
		newOrder: number,
		cb: () => void
	) => {
		try {
			const savedSections = await CourseBuilderAPI.reorderSections({
				courseId,
				oldOrder,
				newOrder,
			});
			setSections(savedSections);
			cb();
		} catch (error) {
			console.error("Error reordering sections :", error);
		}
	};

	const handleDeleteCourse = async () => {
		deleteCourse({ courseWithSections, sections, courseId, router });
	}

	useEffect(() => {
		// check if there is atleast 1 lesson, enable all timeline sections up to next one
		// else enable just previous one
		if (sections[0]?.videos.length > 0) {
			setEnabledSections(prev => {
				const temp = new Set(prev);
				if (!temp.has(3)) {
					temp.add(1);
					temp.add(2);
					temp.add(3);

				}
				return temp;
			})
		} else {
			setEnabledSections(prev => {
				const temp = new Set(prev);
				temp.add(1)
				if (temp.has(3)) {
					temp.delete(3)
				}
				return temp;
			})
		}
	}, [sections[0]?.videos])

	return (
		<Card shadow="sm" padding="lg" radius="md" withBorder>
			<Accordion defaultValue="lecture">
				<Accordion.Item value="lecture">
					<Accordion.Control>
						<Title order={3}>Curriculum</Title>

						{/* Editable Course Name */}
						<Group align="center">
							{isEditingCourseName ? (
								<>
									<TextInput
										value={newCourseName}
										onClick={(e) => e.stopPropagation()}
										onChange={(e) => setNewCourseName(e.target.value)}
										placeholder="Course Name"
									/>
									<Tooltip label="Save course name">
										<ActionIcon
											onClick={(e) => {
												e.stopPropagation();
												handleCourseNameSave({ courseId, newCourseName, setIsEditingCourseName });
											}}
											size="md"
											aria-label="Save course name"
										>
											<IconDeviceFloppy size={26} />
										</ActionIcon>
									</Tooltip>

									<Tooltip label="Cancel">
										<ActionIcon
											variant='outline'
											color="red"
											onClick={(e) => {
												e.stopPropagation();
												setIsEditingCourseName(false);
											}}
											size="md"
											aria-label="cancel save lecture"
										>
											<IconX size={20} />
										</ActionIcon>
									</Tooltip>
								</>
							) : (
								<Group align="center" onClick={(e) => {
									e.stopPropagation();
								}} >
									<Box>
										<Title
											order={4}
											style={{ display: "flex", alignItems: "center" }}
										>
											{newCourseName}
										</Title>
									</Box>

									<Tooltip label="Edit Course Name">
										<ActionIcon
											variant="outline"
											onClick={(e) => {
												e.stopPropagation();
												setIsEditingCourseName(true);
											}}
											size="md"
											aria-label="edit course name"
										>
											<IconEdit size={16} />
										</ActionIcon>
									</Tooltip>
									<Tooltip label="Delete Course">
										<ActionIcon
											variant="outline"
											onClick={(e) => {
												e.stopPropagation();
												handleDeleteCourse();
											}}
											size="md"
											aria-label="delete course"
										>
											<IconTrash size={16} />
										</ActionIcon>
									</Tooltip>
								</Group>
							)}
						</Group>
					</Accordion.Control>
					<Accordion.Panel>
						<Stack>
							{sections.map((section, index) => (
								<CurriculumSection
									reorderSectionOrder={reorderSectionOrder}
									sectionOrder={section.order}
									totalSections={sections.length}
									courseId={courseId}
									sectionId={section._id}
									key={index}
									title={section.sectionTitle}
									lectures={section.videos}
									onVideoUpload={onVideoUpload}
									onDocUpload={onDocUpload}
									onRemoveVideo={onRemoveVideo}
									onRemoveDoc={onRemoveDoc}
									onAddLecture={() => addLectureToSection({ index, sections, setSections, courseId })}
									onSaveLectureTitle={(lectureIndex, newTitle) =>
										saveLectureTitle({ sectionIndex: index, lectureIndex, sections, setSections, courseId })
									}
									onUpdateTitle={(newTitle) =>
										updateSectionTitle({ index, newTitle, sections, setSections, courseId, isConfirmingSection })
									}
									reorderLectureOrder={(oldOrder, newOrder, cb) => {
										reorderLectureOrder(index, oldOrder, newOrder, cb);
									}}
									onDelete={() => deleteSection({ index, sections, setSections, courseId, isConfirmingSection })}
									onUpdateLectureTitle={(lectureIndex, newTitle) =>
										updateLectureTitle({ sectionIndex: index, lectureIndex, newTitle, sections, setSections, courseId, isConfirmingSection })
									}
									onDeleteLecture={(lectureIndex) =>
										deleteLecture({ sectionIndex: index, lectureIndex, courseId, sections, setSections, isConfirmingSection })
									}
									isConfirmingSection={section.isConfirming}
									courseType={courseWithSections.courseType}
									onLectureLinksUpdated={onLectureLinksUpdated}
								/>
							))}
							<Card shadow="sm" padding="md" radius="md" withBorder>
								<Group>
									<Button
										variant="outline"
										disabled={sections.some(
											(section) => section.isConfirming
										)}
										leftSection={<IconPlus size={16} />}
										onClick={() => addSection({ sections, setSections })}
									>
										Section
									</Button>
									{sections.some((section) => section.isConfirming) && (
										<Button
											variant="filled"
											onClick={() => createSection({ index: sections.length - 1, sections, setSections, courseId })}
										>
											Save Section
										</Button>
									)}
								</Group>
							</Card>
						</Stack>
					</Accordion.Panel>
				</Accordion.Item>
			</Accordion>
		</Card>
	)
}

export default Curriculum
