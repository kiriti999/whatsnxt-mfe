
import React from 'react'
import { Metadata } from 'next';
import CourseLandingPage from '../../../_component/trainer/CourseLandingPage';

export const metadata: Metadata = {
    title: "Course builder"
}

function Page() {
    return (
        <CourseLandingPage />
    )
}

export default Page
