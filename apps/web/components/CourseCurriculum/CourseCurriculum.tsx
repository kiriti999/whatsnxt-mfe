import React, { FC, useState } from 'react';
import ReactPlayer from 'react-player';
import { useDisclosure } from '@mantine/hooks';
import { Modal, Group, Paper, Text, Button, Accordion, Title } from '@mantine/core';
import { HireTrainerModal } from '../HireTrainerModal';
import styles from './CourseCurriculum.module.css';
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

  return (
    <>
      <div className={styles['courses-curriculum']}>
        {sections ? (
          <>
            <Paper>
              <Title order={3} className='py-4'>Syllabus</Title>
            </Paper>

            <Paper p="md" shadow="md" withBorder>
              <Text size="md" fw={550} mb={'0.4rem'}>
                Contains {sections.length} sections, {totalVideos} lectures with total duration of {duration}
              </Text>
              {sections.length && sections.map((section, i) => (
                <Accordion key={i} multiple defaultValue={section.sectionTitle}>
                  <Accordion.Item value={section.sectionTitle}>
                    <Accordion.Control>
                      <Group style={{ marginBottom: '0.2rem', justifyContent: 'space-between' }}>
                        <Group>
                          {section.sectionTitle}
                        </Group>
                      </Group>
                    </Accordion.Control>
                    <VideosPanel courseId={courseId} userId={userId} section={section} openVideoModal={openVideoModal} isCourseReviewMode={isCourseReviewMode} />
                  </Accordion.Item>
                </Accordion>
              ))}
            </Paper>
          </>
        ) : (
          <h3>No Videos</h3>
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
