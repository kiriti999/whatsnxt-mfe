import styles from './Profile.module.css';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { IconUserCircle } from '@tabler/icons-react';
import { Anchor, Button, rem, Text } from '@mantine/core';
import useAuth from '../../hooks/Authentication/useAuth';

function Profile({ user }) {
  const dispatch = useDispatch();
  const { logout: handleLogout } = useAuth()

  const logoutUser = (e) => {
    e.preventDefault();
    dispatch({
      type: 'UPDATE_USER_INFO',
      data: null,
    });
    dispatch({
      type: 'UPDATE_CART',
      data: { cartItems: [], discount: 0 },
    });
    localStorage.removeItem('cart');
    handleLogout();
  };
  return (
    <div className={styles.container}>
      <IconUserCircle style={{ width: rem(80), height: rem(80) }} />
      <div className={styles.name}>{user.name}</div>
      <div className={styles.email}>{user.email}</div>
      <div className={styles.link}>
        <Anchor component={Link} href={'/my-courses'}>
          <Text size='lg'>View your courses</Text>
        </Anchor>
      </div>
      <div className={styles.btns}>
        <Button component={Link} href={'/user/edit-profile'} c='white'>Edit Profile</Button>
        <Button onClick={logoutUser}>Logout</Button>
      </div>
    </div>
  );
}

export default Profile;
