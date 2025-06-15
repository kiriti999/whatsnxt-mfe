export type OgImage = {
  title: string;
  description: string;
  contentType: string;
  url: string;
  width: number;
  height: number;
};

export type PageSeoProps = {
  metaTitle: string;
  metaDesc: string;
  ogTitle: string;
  ogDesc: string;
  ogImage?: OgImage;
};

export type CourseType = {
  id: string;
  _id: string;
  discount: number | null;
  courseName: string;
  overview: string;
  topics: string;
  price: number | null;
  paidType: 'video' | 'live',
  purchaseCount: number;
  courseType: String;
  rating: number;
  published: boolean;
  courseImageUrl: string;
  course_preview_video: string;
  duration: string;
  lessons: string;
  access: string | null;
  categoryName: string;
  userId: any;
  createdAt: string;
  updatedAt: string;
  objectID: string;
  popularity?: number;
  slug: string | null;
  videos: any[] | null;
  sections: any[] | null;
  _highlightResult: {
    title: {
      value: string;
      matchLevel: string;
      fullyHighlighted: boolean;
      matchedWords: string[];
    };
  };
  PageSeoProps?: PageSeoProps;
  isPurchased?: any;
  interviewQuestions?: InterviewQuestionsProps[]
};
export type InterviewQuestionsProps = {
  question: string;
  answer: string;
  courseId: string;
  status: string;
};

export type CourseListResponse = {
  courses: CourseType[];
  total: number;
};