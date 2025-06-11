"use client"

import { Anchor } from '@mantine/core';
import { PageBanner } from '@whatsnxt/core-ui';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import styles from '../../../components/Courses/Course.module.css';

const SingleCourses = ({ videos }) => {
  const [videoId, setVideoId] = React.useState(
    videos.length ? videos[0].videoUrl : '',
  );

  return (
    <div>
      <PageBanner
        pageTitle={videos.length ? videos[0].course.title : 'No Videos'}
        homePageUrl="/my-courses"
        homePageText="My Courses"
        activePageText={videos.length ? videos[0].course.title : 'No Videos'}
      />

      <div className="ptb-100">
        <div className="container">
          <div className="row">
            <div className="col-lg-3">
              <div className={styles['course-video-list']}>
                {videos.length ? (
                  videos.map((video) => (
                    <div key={video.id}>
                      <Anchor component={Link}
                        href="/my-courses/[videos]/[id]"
                        as={`/my-courses/${video.course._id}/${video.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setVideoId(video.videoUrl);
                        }}
                      >
                        <Image
                          width={500}
                          height={500}
                          src={video.course.courseImageUrl}
                          alt={video.course.title}
                        />
                        <h4>{video.name}</h4>
                      </Anchor>
                    </div>
                  ))
                ) : (
                  <h3>No Videos</h3>
                )}
              </div>
            </div>

            <div className="col-lg-9">
              <div className={styles['course-video-iframe']}>
                <video key={videoId} controls>
                  <source src={videoId} type="video/mp4" />
                  <source src="/images/courses/courses5.jpg" type="video/ogg" />
                </video>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleCourses;
