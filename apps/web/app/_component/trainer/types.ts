export type Video = {
    name: string;
    _id?: string;
    videoUrl?: string;
    docUrl?: string;
    docPublicId?: string;
    videoPublicId?: string;
    docResourceType?: string;
    videoResourceType?: string;
    videoDuration?: any;
    order?: number;
    isPreview: boolean;
    isUnsaved?: boolean;
};

export type Section = {
    _id?: string;
    sectionTitle: string;
    description?: string;
    order?: number;
    videos?: Video[];
    temp?: boolean;
    isConfirming?: boolean;
};

export type CourseWithSections = {
    _id?: string;
    courseName: string;
    overview: string;
    topics: string;
    published: boolean;
    categoryName: string;
    userId: string;
    sections: Section[];
    courseType: string;
};

export type CourseBuilderProps = {
    id?: string;
    courseData?: {
        courseWithSections: CourseWithSections;
    };
};

export type VideoData = {
    videoUrl: string;
    videoDuration?: number;
    videoPublicId?: string;
    videoResourceType?: string;
};

export type DocData = {
    docUrl: string;
    docPublicId: string;
    docResourceType: string;
};

type LectureLinksProps = {
    _id?: String;
    link: String
    id?: String;
    isNewLink?:Boolean;
    isEditing?:Boolean;
};

export type LectureItemProps = {
    name: string;
    videoUrl?: string;
    onUpdateTitle: (newTitle: string) => void;
    onDelete: () => void;
    onVideoUpload: (sectionId: string, lectureId: string, videoData: VideoData) => void;
    onDocUpload: (sectionId: string, lectureId: string, docData: DocData) => void;
    onRemoveVideo: (sectionId, lectureId) => void;
    onRemoveDoc: (sectionId, lectureId) => void;
    onLectureLinksUpdated: (sectionId: string, lectureId: string, linkAr: any) => void;
    courseId?: string;
    sectionId?: string;
    lectureId?: string;
    courseType?: string;
    docUrl?: string;
    docPublicId: string;
    videoPublicId: string;
    docResourceType: string;
    videoResourceType: string;
    order: number;
    reorderLectureOrder: (
        oldOrder: number,
        newOrder: number,
        cb: () => void
    ) => void;
    totalCount: number;
    isVideoPreview: boolean;
    lectureLinks: LectureLinksProps[];
};

export type CurriculumSectionProps = {
    courseId?: string;
    sectionId?: string;
    title: string;
    sectionOrder: number;
    totalSections: number;
    lectures: {
        name: string;
        isUnsaved?: boolean;
        _id?: string;
        videoUrl?: string;
        docUrl?: string;
        docPublicId?: string;
        videoPublicId?: string;
        docResourceType?: string;
        videoResourceType?: string;
        order?: number;
        isPreview: boolean;
        lectureLinks?: LectureLinksProps[];
    }[];
    onAddLecture: () => void;
    onVideoUpload: (sectionId: string, lectureId: string, videoData: VideoData) => void;
    onDocUpload: (sectionId: string, lectureId: string, docData: DocData) => void;
    onRemoveVideo: (sectionId, lectureId) => void;
    onRemoveDoc: (sectionId, lectureId) => void;
    onSaveLectureTitle: (lectureIndex: number, newTitle: string) => void;
    onUpdateTitle: (newTitle: string) => void;
    onDelete: () => void;
    onUpdateLectureTitle: (lectureIndex: number, newTitle: string) => void;
    onDeleteLecture: (lectureIndex: number) => void;
    onLectureLinksUpdated: (sectionId: string, lectureId: string, linkAr: any) => void;
    reorderSectionOrder: (
        oldOrder: number,
        newOrder: number,
        cb: () => void
    ) => void;
    isConfirmingSection: boolean; // Indicates if this section is being confirmed
    courseType: string;
    reorderLectureOrder: (
        oldOrder: number,
        newOrder: number,
        cb: () => void
    ) => void;
};

export type assetType = {
    secure_url: string,
    public_id: string,
    resource_type: string,
    duration: any
}