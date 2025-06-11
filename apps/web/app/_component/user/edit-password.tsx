"use client"

import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  PasswordInput,
  Button,
  Stack
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconChevronRight, IconLock } from '@tabler/icons-react';
import { LoadingSpinner } from '@whatsnxt/core-ui';
import { ProfileAPI } from '../../../api/v1/profile/profile';

const EditPassword = () => {
  const [user, setUser] = React.useState({
    password: '',
    newPassword: ''
  });
  const [disabled, setDisabled] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const isUser = Object.values(user).every((el) => Boolean(el));
    isUser ? setDisabled(false) : setDisabled(true);
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = { ...user };
      const response = await ProfileAPI.editPassword(payload)
      console.log('pages:: edit-password:: response.data: ', response);
    } catch (error) {
      console.log('error ', error);
      notifications.show({
        position: 'bottom-left',
        title: 'Edit Password Error',
        message: 'Something went error!',
        color: 'red'
      });
    } finally {
      setLoading(false);
      notifications.show({
        position: 'bottom-left',
        title: 'Edit Password Updated',
        message: 'Password updated!',
        color: 'green'
      });
      setUser((prev) => ({ ...prev, newPassword: '', password: '' }));
    }
  };

  return (
    <Box>
      {loading && <LoadingSpinner />}
      <Box py="xl">
        <Container size="sm">
          <Paper p="md" withBorder radius="md">
            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <PasswordInput
                  label="New Password"
                  placeholder="Enter your new password"
                  name="password"
                  value={user.password}
                  onChange={handleChange}
                  leftSection={<IconLock size={16} />}
                />

                <PasswordInput
                  label="Confirm New Password"
                  placeholder="Confirm your new password"
                  name="newPassword"
                  value={user.newPassword}
                  onChange={handleChange}
                  leftSection={<IconLock size={16} />}
                />

                <Button
                  type="submit"
                  color="red"
                  rightSection={<IconChevronRight size={16} />}
                  mt="sm"
                  disabled={disabled}
                >
                  Update
                </Button>
              </Stack>
            </form>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default EditPassword;