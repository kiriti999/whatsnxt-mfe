import React, { FC, useState } from 'react';
import ReactPlayer from 'react-player';
import { useDisclosure } from '@mantine/hooks';
import { Modal, Group, Paper, Text, Button, Accordion, Title } from '@mantine/core';
import { HireTrainerModal } from '../HireTrainerModal';
import styles from '../Courses/Course.module.css';
import VideosPanel from './VideosPanel';

type CourseCurriculumProps = {
  courseId: string;
  userId: string;
  videos: Array<any>;
  sections: Array<any>;
  duration: string;
  totalVideos: any;
  author: any;
  slug: string;
  isPurchased: boolean;
  isCourseReviewMode: boolean
};

const CourseCurriculum: FC<CourseCurriculumProps> = ({ courseId, userId, videos, sections, duration, totalVideos, author, slug, isPurchased, isCourseReviewMode }) => {

  const [opened, { open, close }] = useDisclosure(false);
  const [showModal, setShowModal] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(0);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const showHireBtn = isPurchased && (currentVideo >= 2 || videos[currentVideo].isPreview);

  const openVideoModal = (videoUrl: string, index: number) => {
    setCurrentVideoUrl(videoUrl);  // Set the video URL for ReactPlayer
    setCurrentVideo(index);        // Set the current video index
    open();                        // Open the video modal
  };

  const handleBookTrainerClick = () => {
    close();          // Close the video modal
    setShowModal(true);  // Open the HireTrainerModal
  };

  // Check if course content is empty (all values are 0 or falsy)
  const isEmptyCourse = (!sections || sections.length === 0) &&
    (!totalVideos || totalVideos === 0) &&
    (!duration || duration === '0 sec' || duration === '0');

  console.log(' isEmptyCourse:', isEmptyCourse)

  return (
    <>
      <div>
        {sections && sections.length > 0 ? (
          <>
            <Title
              order={4}
              size="h5"
              fw={600}
              mb="md"
            >
              Syllabus
            </Title>

            <Paper
              p="md"
              radius="md"
              withBorder
              mb="xl"
              style={{
                borderColor: 'var(--mantine-color-gray-3)'
              }}
            >
              <Text size="sm" fw={600} mb="md" c="dimmed">
                {isEmptyCourse ? (
                  <Text size="sm" fw={500} c="dimmed">
                    Coming soon
                  </Text>
                ) : (
                  `Contains ${sections.length} sections, ${totalVideos} lectures with total duration of ${duration}`
                )}
              </Text>

              <Accordion
                multiple
                defaultValue={[sections[0]?.sectionTitle]}
                styles={{
                  item: {
                    borderBottom: '1px solid var(--mantine-color-gray-3)',
                    '&:last-of-type': {
                      borderBottom: 'none'
                    }
                  },
                  control: {
                    padding: '0.75rem 0',
                    '&:hover': {
                      backgroundColor: 'transparent'
                    }
                  },
                  label: {
                    fontWeight: 500,
                    fontSize: '0.95rem'
                  },
                  content: {
                    padding: '0.5rem 0'
                  }
                }}
              >
                {sections.map((section, i) => (
                  <Accordion.Item key={i} value={section.sectionTitle}>
                    <Accordion.Control>
                      {section.sectionTitle}
                    </Accordion.Control>
                    <Accordion.Panel>
                      <VideosPanel
                        courseId={courseId}
                        userId={userId}
                        section={section}
                        openVideoModal={openVideoModal}
                        isCourseReviewMode={isCourseReviewMode}
                      />
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Paper>
          </>
        ) : (
          <>
            <Title
              order={4}
              size="h5"
              fw={600}
              mb="md"
            >
              Syllabus
            </Title>
            <Paper
              p="md"
              radius="md"
              withBorder
              mb="xl"
              style={{
                borderColor: 'var(--mantine-color-gray-3)'
              }}
            >
              <Text size="sm" fw={500} c="dimmed">
                Coming soon
              </Text>
            </Paper>
          </>
        )}

        {/* Button to Book a Trainer */}
        {(false && !isCourseReviewMode) && (
          <div className='book-a-trainer'>
            <Button onClick={handleBookTrainerClick} size='sm' mt="md">
              Still have questions? Book a trainer
            </Button>
          </div>
        )}
      </div>

      {/* Modal for Video Player */}
      <Modal
        opened={opened}
        onClose={close}
        title={videos?.[currentVideo]?.name || 'Course Video'}  // Dynamic modal title based on the current video
        size="55rem"
        centered
      >
        {currentVideoUrl ? (
          <ReactPlayer
            url={currentVideoUrl}
            autoPlay
            width="100%"
            height="500px"
            controls={true}
          />
        ) : (
          <Text>No video selected</Text>
        )}
      </Modal>

      {/* HireTrainerModal */}
      <HireTrainerModal
        onClose={() => setShowModal(false)}  // Close the HireTrainerModal
        author={author}
        slug={slug}
        trainerId={''}
        opened={showModal}  // Open the HireTrainerModal when showModal is true
      />
    </>
  );
};

export default CourseCurriculum;