"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { Box } from '@mantine/core';
import Profile from '../../../components/Profile/Profile';
import useAuth from '../../../hooks/Authentication/useAuth';
import TrainerProfile from '../trainer/trainer-profile';
import { MantineLoader } from '@whatsnxt/core-ui';

const MyProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(user);

  return (
    <Box>
      <div style={{ position: 'relative', padding: '10px', minHeight: '50vh' }}>
        {!profile && (
          <div className="text-center">
            <Link
              href={'/authentication?returnto=user/my-profile'}
              style={{ fontSize: '22px' }}
            >
              Login to view profile
            </Link>
          </div>
        )}

        {profile && (
          <Suspense fallback={<MantineLoader />}>
            {user?.role === 'student' ? (
              <Profile user={profile} />
            ) : (
              <TrainerProfile profile={profile} />
            )}
          </Suspense>
        )}
      </div>
    </Box>
  );
};

export default MyProfile;
