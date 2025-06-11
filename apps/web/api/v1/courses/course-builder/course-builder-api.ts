import { bffApiClient } from '@whatsnxt/core-util';

export const CourseBuilderAPI = {
  getCourse: async function (id) {
    const response = await bffApiClient.get(`/courses/course-builder/${id}`);
    console.log("🚀 ~ getCourse: ~ response:", response.data);
    return response;
  },

  deleteCourse: async function (id) {
    const response = await bffApiClient.delete(`/courses/course-builder/${id}`);
    console.log("🚀 ~ getCourse: ~ response:", response.data);
    return response;
  },

  updateCourseType: async function (id, payload) {
    const response = await bffApiClient.patch(`/courses/course-builder/${id}/update-course-type`, payload);
    return response.data;
  },

  updateCourseName: async function ({ courseId, newCourseName }) {
    const response = await bffApiClient.patch(`/courses/course-builder/${courseId}/update-course-name`, { courseName: newCourseName });
    return response.data;
  },

  updateTitle: async function ({ courseId, sectionId, videoId = null, newTitle }) {
    console.log("videoId", videoId);
    const response = await bffApiClient.patch(`/courses/course-builder/${courseId}/update-title`, { sectionId, videoId, newTitle });
    return response.data;
  },

  // updateOverview: async function ({ courseId, overview }) {
  //   const response = await bffApiClient.patch(`/courses/course-builder/${courseId}/update-overview`, { overview });
  //   return response.data;
  // },

  // updateDescription: async function ({ courseId, description }) {
  //   const response = await bffApiClient.patch(`/courses/course-builder/${courseId}/update-description`, { description });
  //   return response.data;
  // },

  addSection: async function ({ courseId, sectionTitle }) {
    const response = await bffApiClient.post(`/courses/course-builder/${courseId}/add-section`, { sectionTitle });
    return response.data;
  },

  addLecture: async function ({ courseId, sectionId, lectureName }) {
    const response = await bffApiClient.post(`/courses/course-builder/${courseId}/sections/${sectionId}/add-lecture`, { name: lectureName });
    return response.data;
  },

  addLectureVideo: async function ({
    courseId,
    sectionId,
    lectureId,
    videoUrl,
    videoDuration,
    isPreview = false,
    public_id,
    resource_type = ''
  }) {
    const response = await bffApiClient.patch(`/courses/course-builder/${courseId}/sections/${sectionId}/lectures/${lectureId}/add-video`, { videoUrl, videoDuration, isPreview, public_id, resource_type });
    return response.data;
  },

  addLectureLink: async function ({
    courseId,
    sectionId,
    lectureId,
    link
  }) {
    const response = await bffApiClient.patch(`/courses/course-builder/${courseId}/sections/${sectionId}/lectures/${lectureId}/add-lecture-link`, { link });
    return response.data;
  },

  updateLectureLink: async function ({
    courseId,
    sectionId,
    lectureId,
    linkId,
    link
  }) {
    const response = await bffApiClient.patch(`/courses/course-builder/${courseId}/sections/${sectionId}/lectures/${lectureId}/links/${linkId}/update-lecture-link`, { link });
    return response.data;
  },

  deleteLectureLink: async function ({
    courseId,
    sectionId,
    lectureId,
    linkId
  }) {
    const response = await bffApiClient.delete(`/courses/course-builder/${courseId}/sections/${sectionId}/lectures/${lectureId}/links/${linkId}/delete-lecture-link`);
    return response.data;
  },

  updateLectureVideoPreview: async function ({
    courseId,
    sectionId,
    lectureId,
    isPreview = false,
  }) {
    const response = await bffApiClient.patch(`/courses/course-builder/${courseId}/sections/${sectionId}/lectures/${lectureId}/update-video-preview`, { isPreview });
    return response.data;
  },

  addLectureDoc: async function ({ courseId, sectionId, lectureId, docUrl, public_id, resource_type }) {
    const response = await bffApiClient.patch(`/courses/course-builder/${courseId}/sections/${sectionId}/lectures/${lectureId}/add-doc`, { docUrl, public_id, resource_type });
    return response.data;
  },

  deleteLectureVideo: async function ({ courseId, sectionId, lectureId }) {
    const response = await bffApiClient.delete(`/courses/course-builder/${courseId}/sections/${sectionId}/lectures/${lectureId}/delete-video`);
    return response.data;
  },

  deleteLectureDoc: async function ({ courseId, sectionId, lectureId }) {
    const response = await bffApiClient.delete(`/courses/course-builder/${courseId}/sections/${sectionId}/lectures/${lectureId}/delete-doc`);
    return response.data;
  },

  deleteSection: async function ({ courseId, sectionId }) {
    const response = await bffApiClient.delete(`/courses/course-builder/${courseId}/delete-section`, { sectionId });
    return response.data;
  },

  deleteVideo: async function ({ courseId, sectionId, videoId }) {
    const response = await bffApiClient.delete(`/courses/course-builder/${courseId}/delete-video`, { sectionId, videoId });
    return response.data;
  },

  updateCoursePricing: async function (courseId, data) {
    const response = await bffApiClient.patch(`/courses/course-builder/${courseId}/update-pricing`, data);
    return response.data;
  },

  updateCourseLandingPageDetails: async function (courseId, data) {
    const response = await bffApiClient.patch(`/courses/course-builder/${courseId}/update-details`, data);
    return response.data;
  },

  reorderVideos: async function ({ sectionId, oldOrder, newOrder }) {
    const response = await bffApiClient.patch(`/courses/course-builder/sections/${sectionId}/reorder-video`, { oldOrder, newOrder });
    return response.data;
  },

  reorderSections: async function ({ courseId, oldOrder, newOrder }) {
    const response = await bffApiClient.patch(`/courses/course-builder/${courseId}/sections/reorder-section`, { oldOrder, newOrder });
    return response.data;
  },

  updateCourseStatusReview: async function (courseId) {
    const response = await bffApiClient.patch(`/courses/course-builder/${courseId}/submit-for-review`, {});
    return response.data;
  },

  updateCourseStatusApproved: async function (courseId) {
    const response = await bffApiClient.patch(`/courses/course-builder/${courseId}/approve-course`, {});
    return response.data;
  },

  updateCourseStatusRejected: async function (courseId, rejectReason = "") {
    const response = await bffApiClient.patch(`/courses/course-builder/${courseId}/reject-course`, { reason: rejectReason });
    return response.data;
  },
};