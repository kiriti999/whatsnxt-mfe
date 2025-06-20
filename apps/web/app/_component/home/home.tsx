"use client"

import { MainBanner } from '@whatsnxt/core-ui'
import React from 'react'
import dynamic from 'next/dynamic'

const DynamicCoursesComponent = dynamic(() =>
  import('../../../components/CoursesMicroFrontEnd').then((courseMfe) => courseMfe)
)

interface HomeProps {
  data: {
    courses: any[];
    total: number;
  };
  articles: []
}

function Home({ data, articles }: HomeProps) {
  return (
    <div>
      <MainBanner />
      <DynamicCoursesComponent
        courses={data?.courses || []}
        total={data?.total || 0}
        articles={articles || []} // Access the articles array properly
        totalArticles={articles?.length || 0} // Match the prop name
      />
    </div>
  )
}

export default Home