"use client"

import { MainBanner } from '@whatsnxt/core-ui'
import React from 'react'
import dynamic from 'next/dynamic'
import PartyTownScripts from '../../../components/PartyTownScripts'

const DynamicComponent = dynamic(() =>
  import('../../../components/MicroFrontEnd').then((mfe) => mfe)
)

interface HomeProps {
  data: {
    courses: any[];
    total: number;
  };
  articles: [];
  tutorialsData: {
    tutorials: any[];
    total: number;
  };
}

function Home({ data, articles, tutorialsData }: HomeProps) {
  return (
    <div>
      <MainBanner />
      <DynamicComponent
        courses={data?.courses || []}
        total={data?.total || 0}
        articles={articles || []} // Access the articles array properly
        totalArticles={articles?.length || 0} // Match the prop name
        tutorials={tutorialsData?.tutorials || []}
        totalTutorials={tutorialsData?.total || 0}
      />
    </div>
  )
}

export default Home