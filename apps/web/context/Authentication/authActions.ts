import { AuthAPI } from '../../apis/v1/auth';
import { notifications } from '@mantine/notifications';
import { removeCookie } from '../../utils/commonHelper';
import { resetCart } from '../../store/slices/cartSlice';
import { logout } from '../../store/slices/userSlice';

export const handleLogin = async (
  user,
  setUser,
  router,
  searchParams,
  isToastMessage = true
) => {
  console.log('handleLogin called with user:', user);

  // Ensure user has isAuthenticated set to true
  const authenticatedUser = {
    ...user,
    isAuthenticated: true
  };

  // Set user in state (cookie setting is handled server-side)
  setUser(authenticatedUser);

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

    // Call API logout to clear server-side session/cookies
    try {
      await AuthAPI.logout();
      dispatch(logout());
      setUser(null);
      dispatch(resetCart());
    } catch (error) {
      console.log(' handleLogout :: error:', error)
    }

    // Navigate to authentication page
    router.replace('/authentication');

    // Show logout success notification
    notifications.show({
      position: 'bottom-right',
      title: 'Logged Out',
      message: 'You have been successfully logged out',
      color: 'blue',
    });
  } catch (e) {
    console.error('Logout error:', e);

    // Ensure cleanup even if API fails
    setUser(null);

    // Fallback: manually clear cookies if API logout fails
    removeCookie(process.env.NEXT_PUBLIC_COOKIES_USER_INFO);
    removeCookie(process.env.NEXT_PUBLIC_COOKIES_ACCESS_TOKEN);

    // Clear Redux state
    dispatch(logout());
    dispatch(resetCart());

    // Still redirect to authentication
    router.replace('/authentication');

    // Show error notification
    notifications.show({
      position: 'bottom-right',
      title: 'Logout Error',
      message: 'Logout completed locally due to server error',
      color: 'orange',
    });
  }
};