import React from 'react';
import Link from 'next/link';
import { Anchor, Box, Text, Title } from '@mantine/core';
import styles from './Features.module.css';
import { IconBrain, IconDeviceDesktop, IconShield, IconWorld } from '@tabler/icons-react';

const Features = () => {
  // Array containing feature details
  const features = [
    {
      icon: <IconBrain size={75} />,
      title: 'Learn the Latest Top Skills',
      description: 'Learning top skills can bring an extraordinary outcome in a career.',
    },
    {
      icon: <IconDeviceDesktop size={75} />,
      title: 'Learn in Your Own Pace',
      description: 'Everyone prefers to enjoy learning at their own pace & that gives a great result.',
    },
    {
      icon: <IconShield size={75} />,
      title: 'Learn From Industry Experts',
      description: 'Experienced trainers can assist in learning faster with their best approaches!',
    },
    {
      icon: <IconWorld size={75}/>,
      title: 'Enjoy Learning From Anywhere',
      description: 'We are delighted to give you options to enjoy learning from anywhere in the world.',
    },
  ];

  return (
    <div className={`${styles['features-area']} pb-70`}>
      <div className="container">
        <Box maw={720} mx={"auto"} mb={55} ta={"center"}>
          <Text size='sm' c={"#fe4a55"} mb={14} fw={600} tt={"uppercase"}>Education for everyone</Text>
          <Title maw={615} mb={0} mx={'auto'} size={"xl"} fw={800} order={2}>Affordable Online Courses and Learning Opportunities</Title>
          <Text mt={12} maw={615} mx={'auto'}>
            Finding your own space and utilize better learning options can result in faster than the traditional ways.
            Enjoy the beauty of eLearning!
          </Text>
        </Box>

        <div className="row">
          {/* Map over the features array */}
          {features.map((feature, index) => (
            <div key={index} className="col-lg-3 col-sm-6 col-md-6">
              <div className={styles['single-features-box']}>
                <div className={styles['icon']}>
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <Anchor component={Link} className={styles['link-btn']} href="/courses">Start Now!</Anchor>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
