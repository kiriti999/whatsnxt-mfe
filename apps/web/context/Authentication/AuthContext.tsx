import { createContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { fetchUser } from '../../utils/Utils';
import { useSearchParams } from 'next/navigation'
import { useDispatch } from 'react-redux';
import { handleLogin, handleLogout } from './authActions';

type User = {
  about: string;
  active: boolean;
  agreedTerms: boolean;
  as_trainer_apply: boolean;
  availability: string;
  createdAt: string;
  email: string;
  emailConfirmed: boolean;
  emailResetToken: string;
  enrolled_courses: any[];
  name: string;
  phone: string;
  rate: number;
  skills: string[];
  updatedAt: string;
  _id: string;
};

// ** Types
export interface AuthContextType {
  user: any;
  loading: boolean;
  isAuthenticated: boolean;
  setUser: (user: any) => void;
  setLoading: (loading: boolean) => void;
  login: (
    user: User,
    isToastMessage?: boolean
  ) => Promise<void>;
  logout: () => Promise<void>;
  profileApi: () => Promise<void>;
  token: string
}

// ** Defaults
const defaultProvider: AuthContextType = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => null,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  profileApi: () => Promise.resolve(),
  isAuthenticated: false,
  token: ''
};

const AuthContext = createContext<AuthContextType>(defaultProvider);

const AuthProvider = ({ children, userData }) => {
  const userCookie = Cookies.get(process.env.NEXT_PUBLIC_COOKIES_USER_INFO);
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [user, setUser] = useState(
    userCookie ? JSON.parse(userCookie) : null
  );
  const [loading, setLoading] = useState<boolean>(defaultProvider.loading);
  const token = Cookies.get(process.env.NEXT_PUBLIC_COOKIES_ACCESS_TOKEN);

  useEffect(() => {
    setLoading(true);
    if (userData) setUser(userData);
    setLoading(false);
  }, [userData]);

  const profileApiCall = async () => {
    try {
      const userObject = await fetchUser(Cookies.get(process.env.NEXT_PUBLIC_COOKIES_USER_PROFILE));
      if (userObject) {
        setUser({ ...userObject });
      }
    } catch (error) {
      console.log('profileApiCall ~ error:', error);
    }
  };

  // Create wrapper functions that pass the required arguments
  const login = async (user: User, isToastMessage = true) => {
    return handleLogin(user, setUser, router, searchParams, isToastMessage);
  };

  const logout = async () => {
    return handleLogout(setUser, router, dispatch);
  };

  const values: AuthContextType = {
    isAuthenticated: !!userCookie && !!token,
    user,
    loading,
    setUser,
    setLoading,
    login,
    logout,
    profileApi: profileApiCall,
    token
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };