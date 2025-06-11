import { AuthAPI } from './../../api/v1/auth/auth';
import { notifications } from '@mantine/notifications';
import { removeCookie } from '../../utils/Utils';

export const handleLogin = async (
  user,
  setUser,
  router,
  searchParams,
  isToastMessage = true
) => {
  setUser(user);
  
  if (isToastMessage) {
    notifications.show({
      position: 'bottom-left',
      title: 'Authentication Success',
      message: 'User logged in successfully',
      color: 'green',
    });
  }

  const returnto = searchParams.get('returnto');
  const returnUrl = returnto ? `${returnto}` : '/';
  router.push(returnUrl);
};

export const handleLogout = async (setUser, router, dispatch) => {
  try {
    dispatch({ type: 'UPDATE_CART', data: { cartItems: [], discount: 0 } });
    await AuthAPI.logout();
    setUser(null);
    router.replace('/authentication');
  } catch (e) {
    // if api fails, then will manually remove cookies 
    removeCookie(process.env.NEXT_PUBLIC_COOKIES_ACCESS_TOKEN);
  }
};