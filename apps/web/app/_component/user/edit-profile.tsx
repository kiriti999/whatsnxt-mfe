"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Button, TextInput, Container, Paper } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ProfileAPI } from '../../../api/v1/profile/profile';

type Profile = {
  name: string;
  email: string;
};

const defProfile: Profile = { name: '', email: '' };

const EditProfile = () => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Profile>({
    defaultValues: defProfile,
  });

  const { isFetching, data } = useQuery({
    queryKey: ['edit-profile'],
    queryFn: async (): Promise<Profile> => {
      const response = await ProfileAPI.getEditProfile();
      return response.data?.profile || defProfile;
    },
  });

  useEffect(() => {
    if (!isFetching && data) {
      setValue('name', data.name);
      setValue('email', data.email);
    }
  }, [isFetching, data, setValue]);

  const onSubmit = async (formData: Profile) => {
    try {
      const response = await ProfileAPI.editProfile(formData);
      if (response.status === 200) {
        notifications.show({
          position: 'bottom-left',
          title: 'Profile Updated',
          message: 'User data updated successfully',
          color: 'green',
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      notifications.show({
        position: 'bottom-left',
        title: 'Update Failed',
        message: 'An error occurred while updating the profile.',
        color: 'red',
      });
    }
  };

  return (
    <Container size="sm" style={{ paddingTop: '50px' }}>
      <Paper shadow="xs" p="md" radius="md" withBorder>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Name Input */}
          <TextInput
            label="Name"
            placeholder="Enter your name"
            {...register('name', { required: 'Name cannot be empty' })}
            error={errors.name?.message}
            required
          />

          {/* Email Input */}
          <TextInput
            label="Email address"
            placeholder="Enter your email"
            disabled
            readOnly
            {...register('email')}
            mt="md"
          />

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            mt="lg"
            disabled={isFetching}
          >
            Update
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default EditProfile;
