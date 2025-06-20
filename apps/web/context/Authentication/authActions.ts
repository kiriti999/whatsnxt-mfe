import { AuthAPI } from '../../apis/v1/auth';
import { notifications } from '@mantine/notifications';
import { removeCookie } from '../../utils/commonHelper';
import { resetCart } from '../../store/slices/cartSlice';

export const handleLogin = async (
  user,
  setUser,
  router,
  searchParams,
  isToastMessage = true
) => {
  // Set user in state and cookie
  setUser(user);

  if (isToastMessage) {
    notifications.show({
      position: 'bottom-right',
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
    // Clear user state immediately
    setUser(null);

    // Clear Redux state
    dispatch({ type: 'LOGOUT' });
    dispatch(resetCart());

    // Clear localStorage
    localStorage.removeItem('cart');

    // Then call API logout
    await AuthAPI.logout();

    // Navigate to authentication page
    router.replace('/authentication');
  } catch (e) {
    // Ensure cleanup even if API fails
    setUser(null);
    removeCookie(process.env.NEXT_PUBLIC_COOKIES_USER_INFO);
    removeCookie(process.env.NEXT_PUBLIC_COOKIES_ACCESS_TOKEN);

    // Clear Redux state
    dispatch({ type: 'LOGOUT' });
    dispatch(resetCart());

    // Clear localStorage
    // localStorage.removeItem('cart');

    // Still redirect to authentication
    router.replace('/authentication');
  }
};