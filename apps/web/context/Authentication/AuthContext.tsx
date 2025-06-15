import { createContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
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
  token: string;
}

// ** Defaults
const defaultProvider: AuthContextType = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => null,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  isAuthenticated: false,
  token: ''
};

const AuthContext = createContext<AuthContextType>(defaultProvider);

interface AuthProviderProps {
  children: React.ReactNode;
  userData?: any;
}

const AuthProvider = ({ children, userData }: AuthProviderProps) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize user state from userData or cookies
  const [user, setUser] = useState(() => {
    if (userData) return userData;

    try {
      const userCookie = Cookies.get(process.env.NEXT_PUBLIC_COOKIES_USER_INFO);
      return userCookie ? JSON.parse(userCookie) : null;
    } catch (error) {
      console.error('Error parsing user cookie:', error);
      return null;
    }
  });

  const [loading, setLoading] = useState<boolean>(false);

  // Get current token from cookies (computed each time)
  const token = useMemo(() => {
    return Cookies.get(process.env.NEXT_PUBLIC_COOKIES_ACCESS_TOKEN) || '';
  }, []);

  // Simple setUser function (no cookie management - backend handles it)
  const setUserOnly = useCallback((newUser: any) => {
    console.log('Setting user:', newUser);
    setUser(newUser);
  }, []);

  // Only sync with userData prop changes
  useEffect(() => {
    if (userData && (!user || JSON.stringify(userData) !== JSON.stringify(user))) {
      console.log('Updating user from userData prop');
      setUserOnly(userData);
    }
  }, [userData, setUserOnly]);


  // Memoize functions to prevent unnecessary re-renders
  const login = useMemo(() =>
    async (user: User, isToastMessage = true) => {
      return handleLogin(user, setUserOnly, router, searchParams, isToastMessage);
    },
    [router, searchParams, setUserOnly]
  );

  const logout = useMemo(() =>
    async () => {
      return handleLogout(setUserOnly, router, dispatch);
    },
    [router, dispatch, setUserOnly]
  );

  // Memoize context value to prevent unnecessary re-renders
  const values: AuthContextType = useMemo(() => ({
    isAuthenticated: !!user,
    user,
    loading,
    setUser: setUserOnly,
    setLoading,
    login,
    logout,
    token
  }), [user, loading, token, login, logout, setUserOnly]);

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };