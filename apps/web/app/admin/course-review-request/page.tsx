
import React from 'react';
import dynamic from 'next/dynamic';

const CourseReviewRequests = dynamic(() =>
  import('../../../components/Admin/CourseReviewRequests').then((component) => component)
)

const Page = () => (
  <>
    <CourseReviewRequests />
  </>
)

export default Page;