"use client"

import { MainBanner } from '@whatsnxt/core-ui'
import React from 'react'
import dynamic from 'next/dynamic'
import PartyTownScripts from '../../../components/PartyTownScripts'

const DynamicCoursesComponent = dynamic(() =>
  import('../../../components/CoursesMicroFrontEnd').then((courseMfe) => courseMfe)
)

function Home({ data }: { data: any }) {
  return (
    <div>
      <PartyTownScripts />
      <MainBanner />
      <DynamicCoursesComponent courses={data?.courses} total={data?.total} />
    </div>
  )
}

export default Home