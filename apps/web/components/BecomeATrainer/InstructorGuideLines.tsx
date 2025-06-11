"use client"

import React from 'react';
import { Tabs } from '@mantine/core';
import styles from './InstructorGuideLines.module.css';
import Image from 'next/image';

const InstructorGuideLines = () => {
  return (
    <div className={`${styles['apply-instructor-area']} pt-5`}>
      <div className={styles['apply-instructor-image']}>
        <h2>Apply As Instructor</h2>
        <Image width={500} height={500} src="https://res.cloudinary.com/cloudinary999/image/upload/v1718432539/whatsnxt/project-images/trainer.png" alt="image" />
      </div>

      <div className={styles['apply-instructor-content']}>
        <Tabs unstyled={true} defaultValue="become-instructor" className={styles['react-tabs__tab--selected']}>
          <Tabs.List className={styles['react-tabs__tab-list']}>
            <Tabs.Tab value="become-instructor" className={styles['react-tabs__tab']}>
              Become an Instructor
            </Tabs.Tab>
            <Tabs.Tab value="instructor-rules" className={styles['react-tabs__tab']}>
              Instructor Rules
            </Tabs.Tab>
            <Tabs.Tab value="start-with-courses" className={styles['react-tabs__tab']}>
              Start with Courses
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="become-instructor" className={styles['react-tabs__tab-panel']}>
            <h3>Course Description</h3>
            <p>
              Apply as trainer and join our family. Train awesome courses to
              students around the world.
            </p>
            <h3>Certification</h3>
            <p>Get certificate as a trainer!</p>
          </Tabs.Panel>
          <Tabs.Panel value="instructor-rules" className={styles['react-tabs__tab-panel']}>
            <h3>Course Description</h3>
            <p>Must be clear and easy to understand.</p>
            <p>Adhere to the standards</p>
          </Tabs.Panel>
          <Tabs.Panel value="start-with-courses" className={styles['react-tabs__tab-panel']}>
            <h3>Course Description</h3>
            <p>Start with any simple of choice and language</p>
            <p>
              We will guide you with quality practices and tips to get you up to
              the speed
            </p>
          </Tabs.Panel>
        </Tabs>
      </div>
    </div>
  );
};

export default InstructorGuideLines;
