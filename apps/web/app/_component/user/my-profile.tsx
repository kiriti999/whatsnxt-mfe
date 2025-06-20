"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Skeleton, LoadingOverlay, Box } from '@mantine/core';
import Profile from '../../../components/Profile/Profile';
import useAuth from '../../../hooks/Authentication/useAuth';
import TrainerProfile from '../trainer/trainer-profile';
import { MantineLoader } from '@whatsnxt/core-ui';
import { ProfileAPI } from '../../../apis/v1/profile/profile';

const MyProfile = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(undefined);

  const { isFetching, data } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await ProfileAPI.getProfile(token);
      return response.data.profile || null;
    },
  });

  useEffect(() => {
    if (!isFetching) setProfile(data);
  }, [isFetching, data]);

  return (
    <Box>
      {/* Loading Overlay */}
      <LoadingOverlay visible={isFetching} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      <div style={{ position: 'relative', padding: '10px', minHeight: '50vh' }}>
        {!profile && !isFetching && (
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

        {/* Placeholder Skeleton when fetching */}
        {isFetching && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <Skeleton height={100} width={100} />
          </div>
        )}
      </div>
    </Box>
  );
};

export default MyProfile;
