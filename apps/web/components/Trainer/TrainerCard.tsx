import React, { useState } from 'react';
import { Button, } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import styles from './TrainerCard.module.css';
import CourseCard from './CourseCard';
import { HireTrainerModal } from '../HireTrainerModal';
import { TrainerAPI } from '../../api/v1/courses/trainer/trainer';
import useAuth from '../../hooks/Authentication/useAuth';
import { useRouter } from 'next/navigation'; // Use useRouter from next/navigation
import { notifications } from '@mantine/notifications';
import TrainerInfoCard from './TrainerInfoCard';
import { LoadingSpinner } from '@whatsnxt/core-ui';

function TrainerCard({ trainer }) {
  const { user } = useAuth();
  const router = useRouter(); // Initialize router for navigation
  const [showCourses, setShowCourses] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [courses, setCourses] = useState([]);
  const [total, setTotal] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);

  const fetchCourses = async () => {
    if (total && courses.length === total) return setHasMore(false);
    try {
      setFetching(true);
      const { data } = await TrainerAPI.trainerCourses(page, trainer._id);
      setCourses([...courses, ...data.courses]);
      setTotal(data.total);
      setPage(page + 1);
      setFetching(false);
      if (data?.total > data.courses.length) setHasMore(true);
    } catch (error) {
      setFetching(false);
      console.log(error);
    }
  };

  const handleShowCourses = (e) => {
    e.preventDefault();
    setShowCourses(!showCourses);
    if (showCourses) return;
    fetchCourses();
  };

  const handleHireMeClick = () => {
    if (!user) {
      notifications.show({
        position: 'bottom-left',
        title: 'Hire Trainer',
        message: 'Please register first to hire a trainer',
        color: 'red',
        autoClose: 4000,
      });
      router.push('/authentication'); // Redirect to authentication page if no user
    } else {
      open(); // Open the Hire Trainer modal if the user is logged in
    }
  };

  return (
    <>
      <div className={styles.card_container}>
        <HireTrainerModal opened={opened} onClose={close} trainerId={trainer?._id} author={''} slug={''} />

        <TrainerInfoCard
          trainer={trainer}
          handleShowCourses={handleShowCourses}
          handleHireMeClick={handleHireMeClick}
          showCourses={showCourses}
          total={total}
        />

        {showCourses && (
          <div className={styles.courses_container + ' mt-4'}>
            <h3 className="text-center">Courses by "{trainer.name}"</h3>
            <hr className="p-2" />
            {!fetching && courses.length > 0 && (
              <div className={styles.courses}>
                {courses.map((course, i) => (
                  <CourseCard key={i} course={course} />
                ))}
              </div>
            )}
            {hasMore && (
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={fetchCourses}
                  disabled={fetching}
                >
                  Load More
                </Button>
              </div>
            )}
            {fetching && <LoadingSpinner />}
            {!fetching && courses.length === 0 && (
              <p className="text-center">No courses found</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default TrainerCard;
