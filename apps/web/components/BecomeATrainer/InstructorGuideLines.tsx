"use client"

import React from 'react';
import { Paper, Tabs, Title, Text } from '@mantine/core';
import styles from './InstructorGuideLines.module.css';
import Image from 'next/image';

const InstructorGuideLines = () => {
  return (
    <Paper shadow="xs" p="xl" withBorder>
      <Title order={2} mb="sm">Apply As Instructor</Title>
      <Image width={418} height={500} src="/images/static/teacher.png" alt="image" />

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
            <Title order={3}>Course Description</Title>
            <Text>
              Apply as trainer and join our family. Train awesome courses to
              students around the world.
            </Text>
            <Title order={3}>Certification</Title>
            <Text>Get certificate as a trainer!</Text>
          </Tabs.Panel>
          <Tabs.Panel value="instructor-rules" className={styles['react-tabs__tab-panel']}>
            <Title order={3}>Course Description</Title>
            <Text>Must be clear and easy to understand.</Text>
            <Text>Adhere to the standards</Text>
          </Tabs.Panel>
          <Tabs.Panel value="start-with-courses" className={styles['react-tabs__tab-panel']}>
            <Title order={3}>Course Description</Title>
            <Text>Start with any simple of choice and language</Text>
            <Text>
              We will guide you with quality practices and tips to get you up to
              the speed
            </Text>
          </Tabs.Panel>
        </Tabs>
      </div>
    </Paper>
  );
};

export default InstructorGuideLines;
