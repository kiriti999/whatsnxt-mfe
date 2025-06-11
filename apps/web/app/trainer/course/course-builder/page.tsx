
import React from 'react'
import { Metadata } from 'next';
import CourseBuilder from '../../../_component/trainer/CourseBuilder';

export const metadata: Metadata = {
    title: "Course builder"
}

function Page() {
    return (
        <CourseBuilder />
    )
}

export default Page
