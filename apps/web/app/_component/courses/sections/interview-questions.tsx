'use client';
import advStyles from '../../../../components/Common/CourseAdvisor.module.css';
import styles from '../../../../components/Courses/Course.module.css';
import { Title } from '@mantine/core';
import InterviewClient from '../../../../components/Lesson/InterviewClient';

const InterviewComponent = ({ course }) => {

    return (
        <div className={styles['courses-instructor']}>
            <div
                className={`${styles['single-advisor-box']} ${advStyles['single-advisor-box']}`}
            >
                <Title order={5} mt="md">Interviews</Title>
                <div className={`${styles['row']} ${advStyles['row']} align-items-center`}>
                    <InterviewClient course={course} pageLimit={5} />
                </div>
            </div>
        </div>
    )
}

export default InterviewComponent;
