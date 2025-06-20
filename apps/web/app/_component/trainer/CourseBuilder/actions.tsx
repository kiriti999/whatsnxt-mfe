import { notifications } from "@mantine/notifications";
import { Text } from "@mantine/core";
import { CourseBuilderAPI } from "../../../../apis/v1/courses/course-builder/course-builder-api";
import type { Section } from "../types";
import { deleteIndex } from "@whatsnxt/core-util";
import { modals } from '@mantine/modals';
import { unifiedDeleteWebWorker } from '../../../../utils/worker/assetManager';

export const handleCourseNameSave = async ({ courseId, newCourseName, setIsEditingCourseName }) => {
    try {
        await CourseBuilderAPI.updateCourseName({ courseId, newCourseName });
        setIsEditingCourseName(false);
    } catch (error) {
        console.error("handleCourseNameSave:: Error updating course name:", error);
    }
};

export const addSection = ({ sections, setSections }) => {
    const newSection: Section = {
        sectionTitle: `Section ${sections.length + 1}`,
        videos: [],
        temp: true,
        order: sections.length + 1,
        isConfirming: true, // Set confirming stateS for this new section
    };
    setSections([...sections, newSection]);
};

export const createSection = async ({ index, sections, setSections, courseId }) => {
    const newSectionTitle = `Section ${sections.filter((section: { temp: any; }) => !section.temp).length + 1}`;

    try {
        const savedSection = await CourseBuilderAPI.addSection({
            courseId,
            sectionTitle: newSectionTitle,
        });

        setSections((prevSections: any) => {
            const updatedSections = [...prevSections];
            updatedSections[index] = {
                ...updatedSections[index],
                _id: savedSection._id,
                sectionTitle: newSectionTitle,
                temp: false,
                isConfirming: false, // Remove confirming state after saving
            };
            return updatedSections;
        });
    } catch (error) {
        console.error("Error adding new section:", error);
    }
};

export const updateSectionTitle = async ({ index, newTitle, sections, setSections, courseId, isConfirmingSection }) => {
    // Update the section title in the database
    const updatedSections = [...sections];
    updatedSections[index].sectionTitle = newTitle;
    setSections(updatedSections);
    try {
        if (!isConfirmingSection) {
            await CourseBuilderAPI.updateTitle({
                courseId,
                sectionId: updatedSections[index]._id,
                newTitle,
            });
            console.log("Section title updated successfully");
        }
    } catch (error) {
        console.error("Error updating section title:", error);
    }
};

export const deleteSection = async ({ index, sections, setSections, courseId, isConfirmingSection }) => {
    const sectionId = sections[index]._id;

    if (sections[index].videos.length > 0) {
        notifications.show({
            position: 'bottom-right',
            color: 'red',
            title: 'Unable to delete section',
            message: 'Please delete the lectures first to continue',
        })
        return;
    }

    // Remove section locally
    setSections(sections.filter((_: any, i: any) => i !== index));

    // Call API to delete section in database
    try {
        if (!isConfirmingSection) {
            await CourseBuilderAPI.deleteSection({ courseId, sectionId });
            console.log("Section deleted successfully");
        }
    } catch (error) {
        console.error("Error deleting section:", error);
    }
};

export const addLectureToSection = async ({ index, sections, setSections, courseId }) => {
    const updatedSections = [...sections];
    const section = updatedSections[index];

    // Check if there is an unsaved lecture title
    const hasUnsavedLectureTitle = section.videos.some(
        (lecture: { isUnsaved: any; }) => lecture.isUnsaved
    );

    if (hasUnsavedLectureTitle) {
        return; // Exit if there’s an unsaved lecture title
    }

    if (section.videos.length === 0) {
        // Create and save the lecture directly to the database
        const newLecture: any = { name: `Lecture ${section.videos.length + 1}` };
        try {
            const savedLecture = await CourseBuilderAPI.addLecture({
                courseId,
                sectionId: section._id,
                lectureName: newLecture.name,
            });
            newLecture._id = savedLecture._id;
            section.videos.push(newLecture);
            setSections(updatedSections);
            console.log(
                "First lecture added and saved successfully:",
                savedLecture
            );
        } catch (error) {
            console.error("Error adding first lecture:", error);
        }
    } else {
        // For subsequent lectures, add as unsaved
        section.videos.push({
            name: `Lecture ${section.videos.length + 1}`,
            isUnsaved: true,
            isPreview: false,
        });
        setSections(updatedSections);
    }
};

export const saveLectureTitle = async ({ sectionIndex, lectureIndex, sections, setSections, courseId }) => {
    const updatedSections = [...sections];
    const lecture = updatedSections[sectionIndex].videos[lectureIndex];

    try {
        const savedLecture = await CourseBuilderAPI.addLecture({
            courseId,
            sectionId: updatedSections[sectionIndex]._id,
            lectureName: lecture.name,
        });

        // Update lecture with new ID and remove unsaved flag
        lecture._id = savedLecture._id;
        lecture.isUnsaved = false;
        lecture.order = lectureIndex + 1;
        setSections(updatedSections);
        console.log("Lecture title saved successfully:", savedLecture);
    } catch (error) {
        console.error("Error saving lecture title:", error);
    }
};

export const updateLectureTitle = async ({
    sectionIndex,
    lectureIndex,
    newTitle,
    sections,
    setSections,
    courseId,
    isConfirmingSection
}) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].videos[lectureIndex].name = newTitle;
    setSections(updatedSections);

    // Update the video title in the database
    try {
        if (!isConfirmingSection) {
            const payload = {
                courseId,
                sectionId: updatedSections[sectionIndex]._id,
                videoId: updatedSections[sectionIndex].videos[lectureIndex]._id,
                newTitle,
            };
            await CourseBuilderAPI.updateTitle(payload);
            console.log("Video (lecture) title updated successfully");
        }
    } catch (error) {
        console.error("Error updating video title:", error);
    }
};

export const deleteLecture = async ({ sectionIndex, lectureIndex, sections, setSections, courseId, isConfirmingSection }) => {
    const sectionId = sections[sectionIndex]._id;
    const videoId = sections[sectionIndex].videos[lectureIndex]._id;

    if (sections[sectionIndex].videos[lectureIndex]?.videoUrl || sections[sectionIndex].videos[lectureIndex]?.docUrl) {
        notifications.show({
            position: 'bottom-right',
            color: 'red',
            title: 'Unable to delete lecture',
            message: 'Please remove the video and documents attached to proceed',
        })
        return;
    }

    // Remove lecture locally
    const updatedSections = [...sections];
    updatedSections[sectionIndex].videos = updatedSections[
        sectionIndex
    ].videos.filter((_: any, i: any) => i !== lectureIndex);
    setSections(updatedSections);

    // Call API to delete video in database
    try {
        if (!isConfirmingSection) {
            await CourseBuilderAPI.deleteVideo({
                courseId,
                sectionId,
                videoId,
            });
            console.log("Video (lecture) deleted successfully");
        }
    } catch (error) {
        console.error("Error deleting video:", error);
    }
};

export const deleteCourse = async ({ courseWithSections, sections, courseId, router }) => {
    const hasAnyVideos = sections.some((section: { videos: string | any[]; }) => section.videos && section.videos.length > 0);
    if (hasAnyVideos) {
        notifications.show({
            position: 'bottom-right',
            color: 'red',
            title: 'Unable to delete course',
            message: 'Please delete the sections first to continue',
        })
        return;
    }
    //Call API to delete course and section in database
    modals.openConfirmModal({
        title: 'Confirm Course Deletion',
        children: (
            <Text size="sm">
                Are you sure you want to delete this course? This action is irreversible, and all associated data including interviews will be removed.
            </Text>
        ),
        labels: { confirm: 'Delete', cancel: 'Cancel' },
        confirmProps: { color: 'red' },
        onCancel: () => {
            notifications.show({
                position: 'bottom-right',
                title: 'Action Cancelled',
                message: 'Course deletion was cancelled.',
                color: 'yellow',
            });
        },
        onConfirm: async () => {
            try {
                const { success } = await unifiedDeleteWebWorker({
                    assetsList: [{ public_id: courseWithSections?.courseImagePublicId, resource_type: 'image' }],
                    clearLocalStorage: true
                });
                if (success) {
                    await CourseBuilderAPI.deleteCourse(courseId);
                    // TODO: Delete cart Id when course is deleted
                    // const response = await CartAPI.deleteCartItem(id);
                    // console.log('Cart item deleted successfully:', response);
                    // TODO: When logged in as Student, if cart is deleted on the backend then front end should sync accordingly and should not break
                    await deleteIndex(courseId, 'course');
                    notifications.show({
                        position: 'bottom-right',
                        color: 'green',
                        title: 'Course delete succesfully',
                        message: 'Course delete done',
                    })
                    router.push('/trainer/courses');
                } else {
                    notifications.show({
                        position: 'bottom-right',
                        title: 'Remove course image from cloudinary',
                        message: 'Failed to remove course image from cloudinary',
                        color: 'red',
                    })
                }
            } catch (error) {
                notifications.show({
                    position: 'bottom-right',
                    color: 'red',
                    title: 'Course delete failed',
                    message: `${error.message} because one student already enrolled into this course`,
                    autoClose: 5000
                })
                console.error("Error deleting course:", error);
            }
        },
    });
}

export const getVideoAndDocActions = (setSections: { (value: any): void; (arg0: { (prevSections: any): any; (prevSections: any): any; (prevSections: any): any; (prevSections: any): any; (prevSections: any): any; }): void; }) => {
    const onVideoUpload = (
        sectionId: string,
        lectureId: string,
        videoData: { videoUrl: string; videoDuration?: number; videoPublicId?: string; videoResourceType?: string }
    ) => {
        setSections((prevSections: any[]) =>
            prevSections.map((section: { _id: string; videos: any[]; }) => {
                if (section._id === sectionId) {
                    const updatedVideos = section.videos.map((video: { _id: string; }) => {
                        if (video._id === lectureId) {
                            return { ...video, ...videoData }; // Update lecture with new video data
                        }
                        return video;
                    });
                    return { ...section, videos: updatedVideos };
                }
                return section;
            })
        );
    };

    const onRemoveVideo = (sectionId: string, lectureId: string) => {
        setSections((prevSections: any[]) =>
            prevSections.map((section: { _id: string; videos: any[]; }) => {
                if (section._id === sectionId) {
                    // Update the specific lecture within the section
                    const updatedVideos = section.videos.map((video: { [x: string]: any; _id?: any; videoUrl?: any; videoPublicId?: any; videoResourceType?: any; videoDuration?: any; }) => {
                        if (video._id === lectureId) {
                            // Remove specific fields from the video object
                            const { videoUrl, videoPublicId, videoResourceType, videoDuration, ...remainingFields } = video;
                            return remainingFields;
                        }
                        return video; // Return other videos unchanged
                    });
                    return { ...section, videos: updatedVideos };
                }
                return section; // Return other sections unchanged
            })
        );
    };

    const onDocUpload = (
        sectionId: string,
        lectureId: string,
        docData: { docUrl: string; docPublicId: string; docResourceType: string }
    ) => {
        setSections((prevSections: any[]) =>
            prevSections.map((section: { _id: string; videos: any[]; }) => {
                if (section._id === sectionId) {
                    const updatedVideos = section.videos.map((video: { _id: string; }) => {
                        if (video._id === lectureId) {
                            return { ...video, ...docData }; // Update lecture with new document data
                        }
                        return video;
                    });
                    return { ...section, videos: updatedVideos };
                }
                return section;
            })
        );
    };

    const onRemoveDoc = (sectionId: string, lectureId: string) => {
        setSections((prevSections: any[]) =>
            prevSections.map((section: { _id: string; videos: any[]; }) => {
                if (section._id === sectionId) {
                    // Update the specific lecture within the section
                    const updatedVideos = section.videos.map((video: { [x: string]: any; _id?: any; docUrl?: any; docPublicId?: any; docResourceType?: any; }) => {
                        if (video._id === lectureId) {
                            // Remove specific fields from the video object
                            const { docUrl, docPublicId, docResourceType, ...remainingFields } = video;
                            return remainingFields;
                        }
                        return video; // Return other videos unchanged
                    });
                    return { ...section, videos: updatedVideos };
                }
                return section; // Return other sections unchanged
            })
        );
    };

    const onLectureLinksUpdated = (
        sectionId: string,
        lectureId: string,
        linkAr: any,
    ) => {
        setSections((prevSections: any[]) =>
            prevSections.map((section: { _id: string; videos: any[]; }) => {
                if (section._id === sectionId) {
                    const updatedVideos = section.videos.map((video: { _id: string; lectureLinks: any; }) => {
                        if (video._id === lectureId) {
                            video.lectureLinks = linkAr
                        }
                        return video;
                    });
                    return { ...section, videos: updatedVideos };
                }
                return section;
            })
        );
    };

    return { onVideoUpload, onRemoveVideo, onDocUpload, onRemoveDoc, onLectureLinksUpdated }
};
