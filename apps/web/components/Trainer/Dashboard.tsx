'use client';

import React from 'react';
import Link from 'next/link';
import { Button, Stack, Text, Title, Timeline } from '@mantine/core';
import { usePathname } from 'next/navigation';
import { IconCheck, IconCircle } from '@tabler/icons-react';
import { useDashboardContext } from '../../context/DashboardContext';
import { CourseBuilderAPI } from '../../apis/v1/courses/course-builder/course-builder-api';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { mailAPI } from '../../apis/v1/mail';


const COURSE_TYPE_PATH = `/trainer/course/course-type-information`;
const PRICING_INFO_PATH = `/trainer/course/pricing-information`;
const CURRICULUM_PATH = `/trainer/course/course-builder`;
const COURSE_CONTENT_PATH = `/trainer/course/course-content`;
const LANDING_PAGE_PATH = `/trainer/course/course-landing-page`;
const COURSE_INTERVIEW_PATH = `/trainer/course/course-interview-page`;

const COURSE_TYPE_TITLE = 'Your course type';
const PRICING_INFO_TITLE = 'Pricing information';
const CURRICULUM_TITLE = 'Curriculum';
const COURSE_CONTENT_TITLE = 'Course Content';
const LANDING_PAGE_TITLE = 'Course landing page';
const COURSE_INTERVIEW_TITLE = 'Course Interview page';

const COURSE_SECTIONS = [
  {
    path: COURSE_TYPE_PATH,
    title: COURSE_TYPE_TITLE,
  },
  {
    path: PRICING_INFO_PATH,
    title: PRICING_INFO_TITLE,
  },
  {
    path: CURRICULUM_PATH,
    title: CURRICULUM_TITLE,
  },
  {
    path: COURSE_CONTENT_PATH,
    title: COURSE_CONTENT_TITLE,
  },
  {
    path: LANDING_PAGE_PATH,
    title: LANDING_PAGE_TITLE,
  },
  {
    path: COURSE_INTERVIEW_PATH,
    title: COURSE_INTERVIEW_TITLE
  }
]

type Props = {
  id?: string;
  open: () => void;
  close?: () => void;
  courseName?: string;
  teacherName?: string;
}

function Dashboard({ id, open, close, courseName = '', teacherName = '' }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { enabledSections, enabledReview } = useDashboardContext();

  const submitToReview = async () => {
    open();
    try {
      const response = await CourseBuilderAPI.updateCourseStatusReview(id);
      if (response.course.status == "pending_review") {
        notifications.show({
          position: 'bottom-right',
          title: 'Course status changed',
          message: 'Course sent for review',
          color: 'green',
        });
        // Send email with timeout - don't block navigation for more than 5 seconds
        try {
          await Promise.race([
            mailAPI.sendCourseReviewMail({ courseName, teacherName }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Email timeout')), 5000))
          ]);
        } catch (emailError) {
          console.warn('Email send issue (non-blocking):', emailError);
        }
        router.push("/trainer/courses")
      }
    } catch (error) {
      notifications.show({
        position: 'bottom-right',
        title: 'Course cannot be reviewed',
        message: 'Unable to send course for review',
        color: 'red',
      });
      close();
    }
  }

  function activeItem() {
    switch (true) {
      case pathname.includes(COURSE_TYPE_PATH):
        return 0;
      case pathname.includes(PRICING_INFO_PATH):
        return 1;
      case pathname.includes(CURRICULUM_PATH):
        return 2;
      case pathname.includes(COURSE_CONTENT_PATH):
        return 3;
      case pathname.includes(LANDING_PAGE_PATH):
        return 4;
      case pathname.includes(COURSE_INTERVIEW_PATH):
        return 5;
      default:
        return -1;
    }
  }

  return (
    <>
      <Title order={3} mb={'xl'}>Plan your course</Title>
      <Stack style={{ width: '100%' }}>
        <Timeline
          active={activeItem()}
          bulletSize={24}
          lineWidth={2}
        >
          {COURSE_SECTIONS.map((item, i) => {
            const isCurrentTab = pathname.includes(item.path);
            const enabledSection = enabledSections.has(i)

            return (
              <Timeline.Item
                key={`${item.path}-${i}`}
                bullet={isCurrentTab ? <IconCheck size={14} /> : <IconCircle size={12} />}
              >
                <Link
                  href={enabledSection && !isCurrentTab ? `${item.path}/${id}` : '#'}
                  passHref
                >
                  <Button
                    component="a"
                    fullWidth
                    variant="subtle"
                    color="blue"
                    size="lg"
                    onClick={enabledSection && !isCurrentTab ? open : undefined}
                    disabled={!enabledSection || isCurrentTab}
                    styles={{
                      root: {
                        backgroundColor: isCurrentTab ? '#ff4d4f' : undefined,
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'none',
                          backgroundColor: isCurrentTab ? '#ff4d4f' : undefined,
                        },
                      },
                    }}
                  >
                    <Text fw={500} c={isCurrentTab ? 'white' : undefined}>{item.title}</Text>
                  </Button>
                </Link>

              </Timeline.Item>
            )
          })}
        </Timeline>

        <Button
          variant="filled"
          fullWidth
          size="lg"
          mt="md"
          radius="xs"
          color="blue"
          styles={{ root: { fontWeight: 500 } }}
          onClick={submitToReview}
          disabled={!enabledReview}
        >
          Submit for review
        </Button>
      </Stack>
    </>
  );
}

export default Dashboard;
